import type { Request, Response, NextFunction } from "express";
import z from "zod";
import { ValidationError } from "./errors.js";
import { LOGIN_LOCK_TIMEOUT, LOGIN_MAX } from "./constants.js";


export function validateBody<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError("Invalid request body!", result.error.issues.map((i) => i.message)));
        }

        req.body = result.data;
        next();
    }
}

export async function registerFailedLoginAttemp(user: {
    loginAttempts: number;
    lockUntil?: Date | null;
    save: () => Promise<unknown>;
}) {
    const nextAttemps = user.loginAttempts + 1;

    if (nextAttemps >= LOGIN_MAX) {
        user.loginAttempts = 0;
        user.lockUntil = new Date(Date.now() + LOGIN_LOCK_TIMEOUT);
    } else {
        user.loginAttempts = nextAttemps;
    }

    await user.save();
}

export async function clearFailedLoginAttempts(user: {
    loginAttempts: number;
    lockUntil?: Date | null;
    save: () => Promise<unknown>;
}) {
    if (user.loginAttempts === 0 && !user.lockUntil) {
        return;
    }

    user.loginAttempts = 0;
    user.lockUntil = null; // clear lock
    await user.save();
}

export function isAccLocked(user: {
    lockUntil?: Date | null
}) {
    return Boolean(user.lockUntil && user.lockUntil.getTime() > Date.now());
}