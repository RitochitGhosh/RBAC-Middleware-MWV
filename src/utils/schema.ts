import z from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name can't be empty").max(50),
    email:z.string().trim().min(1, "Email can't be empty").max(50),
    password: z.string().trim().min(6, "Passwords should be atleast of 6 characters").max(25, "Passwords can't be more than 25 characters"),
}).strict();

export const loginSchema = z.object({
    email:z.string().trim().min(1, "Email can't be empty").max(50),
    password: z.string().trim().min(6, "Passwords should be atleast of 6 characters").max(25, "Passwords can't be more than 25 characters"),
}).strict();

export const createPost = z.object({
    title: z.string().trim().min(5, "Title should be atleast of 5 characters"),
    description: z.string().trim().max(250)
}).strict();

export const updatePost = createPost.partial();

export const userIdParamsSchema = z.object({
    id: z.string(),
}).strict();

export const listUsersQuerySchema = z.object({
    role: z.enum(["user", "admin"]).optional(),
    email: z.string().trim().email().max(50).optional(),
    name: z.string().trim().min(2).max(50).optional()
}).strict();