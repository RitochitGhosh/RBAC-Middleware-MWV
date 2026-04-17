import { Router } from "express";

import { validateBody } from "../utils/helpers.js";
import { loginSchema, registerSchema } from "../utils/schema.js";
import { requireAccessAuth } from "../middleware/auth.js";
import { requireCsrf } from "../utils/cookie.js";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", requireAccessAuth, requireCsrf, logout);

export default router;
