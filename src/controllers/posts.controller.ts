import type { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/types.js";
import { NotFoundError } from "../utils/errors.js";
import { Post } from "../models/posts.schema.js";

export async function createPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const post = await Post.create({
            ...req.body,
            user: req.authUser!.userId,
        });
        res.status(201).json({ post });
    } catch (error) {
        next(error);
    }
}

export async function getPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const post = await Post.findById(req.params.id).populate("user", "name email");
        if (!post) {
            return next(new NotFoundError("Post not found"));
        }
        res.json({ post });
    } catch (error) {
        next(error);
    }
}

export async function updatePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ post });
    } catch (error) {
        next(error);
    }
}

export async function deletePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export async function listPosts(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const posts = await Post.find().populate("user", "name email").sort({ createdAt: -1 });
        res.json({ posts });
    } catch (error) {
        next(error);
    }
}
