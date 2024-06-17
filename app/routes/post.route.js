import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as postController from "../controllers/post.controller.js";
import { uploadImageVideoMiddleware } from "../middlewares/multer.middleware.js";
import FileStorageDirectory from "../enums/fileStorageDirectory.js";

router.post(
  "/",
  authMiddleware,
  uploadImageVideoMiddleware({
    directory: FileStorageDirectory.POST,
  }).array("media", 10),
  postController.createPost
);

export default router;
