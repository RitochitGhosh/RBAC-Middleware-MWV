import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
    try {
        await mongoose.connect(env.MONGO_URI);
    } catch (error) {
        throw new Error("Failed to connect to database!");
    }
}