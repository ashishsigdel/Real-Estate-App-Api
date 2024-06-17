import express from "express";
const router = express.Router();
import {
  authCheckMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware.js";
import * as postController from "../controllers/post.controller.js";
import { uploadImageVideoMiddleware } from "../middlewares/multer.middleware.js";
import FileStorageDirectory from "../enums/fileStorageDirectory.js";

router.post(
  "/create",
  authMiddleware,
  uploadImageVideoMiddleware({
    directory: FileStorageDirectory.POST,
  }).array("media", 10),
  postController.createPost
);

router.put(
  "/update/:postId",
  authMiddleware,
  uploadImageVideoMiddleware({
    directory: FileStorageDirectory.POST,
  }).array("media", 10),
  postController.updatePost
);

router.delete("/delete/:postId", authMiddleware, postController.deletePost);

router.get("/admin-posts", authMiddleware, postController.getAllPostsByCretor);

router.get("/posts", postController.getAllPosts);

router.get("/:postId", authCheckMiddleware, postController.getPost);

export default router;
