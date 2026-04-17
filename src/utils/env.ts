import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z.string().min(1, "MONGO_URI is required!"),
    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
    CORS_ALLOWED_ORIGINS: z.string().optional().transform((val) => val ? val.split(",") : []),
    COOKIE_SECURE: z.string().optional().transform((v) => v === "true"),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
    ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET must be at least 32 chars"),
    REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 chars"),
});

export type EnvType = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");
    process.exit(1);
}

export const env: EnvType = Object.freeze(parsed.data);