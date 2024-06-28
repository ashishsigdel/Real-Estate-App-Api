import express from "express";
const router = express.Router();
import * as userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadImageMiddleware } from "../middlewares/multer.middleware.js";
import FileStorageDirectory from "../enums/fileStorageDirectory.js";

router.get("/profile/:username", userController.fetchProfile);

router.put(
  "/profile",
  authMiddleware,
  uploadImageMiddleware({
    directory: FileStorageDirectory.USER_IMAGES,
  }).single("profilePicture"),
  userController.updateProfile
);

router.get("/profile", authMiddleware, userController.fetchCurrentUser);

router.put("/change-password", authMiddleware, userController.updatePassword);

export default router;
