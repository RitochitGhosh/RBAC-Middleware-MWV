import { Router } from "express";
import { requireAccessAuth, requirePermission, requireOwnership } from "../middleware/auth.js";
import { validateBody } from "../utils/helpers.js";
import { createPost as createPostSchema, updatePost as updatePostSchema } from "../utils/schema.js";
import { 
    createPost, 
    deletePost, 
    getPost, 
    listPosts, 
    updatePost 
} from "../controllers/posts.controller.js";

const router = Router();

router.use(requireAccessAuth);

router.get("/", requirePermission("listPosts"), listPosts);
router.post("/", requirePermission("createPost"), validateBody(createPostSchema), createPost);
router.get("/:id", requirePermission("viewPost"), getPost);
router.put("/:id", requirePermission("updatePost"), requireOwnership, validateBody(updatePostSchema), updatePost);
router.delete("/:id", requirePermission("deletePost"), requireOwnership, deletePost);

export default router;
