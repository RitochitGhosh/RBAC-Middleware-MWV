import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { AuthTokenPayload } from "../utils/types.js";
import { RateLimitError, UnauthorizedError } from "../utils/errors.js";
import { SetAuthCookies, ClearAuthCookies } from "../utils/cookie.js";
import { clearFailedLoginAttempts, isAccLocked, registerFailedLoginAttemp } from "../utils/helpers.js";
import { env } from "../utils/env.js";
import { REFRESH_COOKIE, SALT_ROUNDS } from "../utils/constants.js";



export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ name, email, password: hashed });

        SetAuthCookies(res, user._id.toString(), user.role);

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return next(new UnauthorizedError("Invalid credentials"));
        }

        if (isAccLocked(user)) {
            return next(new RateLimitError("Account locked due to too many failed attempts. Try again later."));
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            await registerFailedLoginAttemp(user);
            return next(new UnauthorizedError("Invalid credentials"));
        }

        await clearFailedLoginAttempts(user);
        SetAuthCookies(res, user._id.toString(), user.role);

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            return next(new UnauthorizedError("No refresh token provided"));
        }

        const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as AuthTokenPayload;
        if (decoded.type !== "refresh") {
            return next(new UnauthorizedError("Invalid token type"));
        }

        const user = await User.findById(decoded.userId).select("role");
        if (!user) {
            return next(new UnauthorizedError("User no longer exists"));
        }

        SetAuthCookies(res, user._id.toString(), user.role);
        res.json({ message: "Tokens refreshed" });
    } catch (error) {
        next(error);
    }
}

export async function logout(_req: Request, res: Response, next: NextFunction) {
    try {
        ClearAuthCookies(res);
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}
