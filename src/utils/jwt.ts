import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "./env.js";

export function createAccessToken (userId: string, role: string) {
    return jwt.sign(
        {
            userId, role, type: "access"
        },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

export function createRefreshToken (userId: string, role: string) {
    return jwt.sign(
        {
            userId, role, type: "refresh"
        },
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export function createCsrfToken() {
    return crypto.randomBytes(32).toString("hex");
}