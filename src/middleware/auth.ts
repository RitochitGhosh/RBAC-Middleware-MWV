import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthenticatedRequest, AuthTokenPayload } from "../utils/types.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { ACCESS_COOKIE, PERMISSIONS } from "../utils/constants.js";
import { env } from "../utils/env.js";
import { Post } from "../models/posts.schema.js";

// auth middleware | Checks authication 
export function requireAccessAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    try {
        const accessToken = req.cookies?.[ACCESS_COOKIE];

        if (!accessToken) {
            return next(new UnauthorizedError("Unauthorized!"));
        }

        const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as AuthTokenPayload;
        if (decoded.type !== "access") {
            return next(new UnauthorizedError("Unauthorized!"));
        }

        req.authUser = {
            userId: decoded.userId,
            role: decoded.role
        }

        next();
    } catch (error) {
        console.error("ERROR: REQUIRE_AUTH MIDDLEWARE: ", error);
        return next(new UnauthorizedError("Unauthenticated user: try login if you have an account"));
    }
}

// as per question: PERMISSION: Record<String, String[]> | Checks Authorization
export function requirePermission(action: string) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        const role = req.authUser?.role;
        if (!role || !PERMISSIONS[role]?.includes(action)) {
            return next(new ForbiddenError("Forbidden: insufficient permissions"));
        }
        next();
    }
}

// Checks Ownership
export async function requireOwnership(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(new NotFoundError("Post not found"));
        }

        const { userId, role } = req.authUser!;
        if (role === 'admin' || post.user.toString() === userId) {
            return next();
        }

        return next(new ForbiddenError("Forbidden: you don't own this resource"));
    } catch (error) {
        return next(error);
    }
}