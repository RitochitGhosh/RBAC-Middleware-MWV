import type { CookieOptions, NextFunction, Response, Request } from "express";
import { env } from "./env.js";
import { createAccessToken, createCsrfToken, createRefreshToken } from "./jwt.js";
import { ACCESS_COOKIE, CSRF_COOKIE, REFRESH_COOKIE } from "./constants.js";


function createCookieOptions(maxAge: number): CookieOptions {
    return {
        httpOnly: true, // Prevents XSS attack
        secure: env.COOKIE_SECURE, // Prevents Man-in-the-middle attack
        sameSite: env.COOKIE_SAME_SITE,
        path: "/",
        maxAge
    }
}

function createCsrfCookieOptions(maxAge: number): CookieOptions {
    return {
        httpOnly: false,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        path: "/",
        maxAge
    }
}

export function SetAuthCookies(res: Response, userId: string, role: string) {
    const accessToken = createAccessToken(userId, role);
    const refreshToken = createRefreshToken(userId, role);
    const csrfToken = createCsrfToken();

    const accessMaxAge = 15 * 60 * 1000; // 15m
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; // 7d

    res.cookie(ACCESS_COOKIE, accessToken, createCookieOptions(accessMaxAge));
    res.cookie(REFRESH_COOKIE, refreshToken, createCookieOptions(refreshMaxAge));
    res.cookie(CSRF_COOKIE, csrfToken, createCsrfCookieOptions(refreshMaxAge));
}

export function ClearAuthCookies(res: Response) {
    const clearOptions: CookieOptions = {
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        path: "/"
    }

    res.clearCookie(ACCESS_COOKIE, clearOptions);
    res.clearCookie(REFRESH_COOKIE, clearOptions);
    res.clearCookie(CSRF_COOKIE, clearOptions);
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
    const csrfCookie = req.cookies?.[CSRF_COOKIE];
    const csrfHeader = req.header('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({
            message: "Invalid csrf Token!"
        });
    }

    next();
}