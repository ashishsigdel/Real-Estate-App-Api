import express from "express";
const router = express.Router();
import * as postCategoryController from "../controllers/postCategory.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.post(
  "/create",
  authMiddleware,
  postCategoryController.createPostCategory
);

router.get("/", postCategoryController.allPostCategory);

router.get("/:id", postCategoryController.getPostCategory);

router.post(
  "/update/:id",
  authMiddleware,
  postCategoryController.updatePostCategory
);

router.delete(
  "/delete/:id",
  authMiddleware,
  postCategoryController.deletePostCategory
);

export default router;
