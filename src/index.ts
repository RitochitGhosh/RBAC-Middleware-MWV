import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import { connectDB } from "./utils/db.js";
import { env } from "./utils/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import postsRouter from "./routes/posts.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (env.CORS_ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by cors!"), false);
    },
    credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiLimiter);

app.use("/api/auth",  authRouter);
app.use("/api/posts", postsRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server start failed", error);
    process.exit(1);
  }
}

startServer();