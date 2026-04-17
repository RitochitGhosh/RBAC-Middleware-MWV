import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { AppError, ValidationError } from "../utils/errors.js";

interface MongoServerError extends Error {
    code?: number;
    keyValue?: Record<string, unknown>;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    console.error(err);

    if (err instanceof AppError) {
        const body: Record<string, unknown> = { message: err.message };
        if (err instanceof ValidationError && err.errors.length > 0) {
            body.errors = err.errors;
        }
        return res.status(err.statusCode).json(body);
    }

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "CORS policy violation" });
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: `Invalid value for field: ${err.path}` });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: "Validation failed", errors });
    }


    const mongoErr = err as MongoServerError;
    if (mongoErr.code === 11000) {
        const field = Object.keys(mongoErr.keyValue ?? {})[0] ?? "field";
        return res.status(409).json({ message: `${field} already exists` });
    }

    res.status(500).json({ message: "Internal server error" });
}
