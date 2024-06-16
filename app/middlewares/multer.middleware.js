import multer from "multer";
import { multerDiskStorage } from "../services/fileStorageService.js";
import { getMimeType } from "../utils/helper.js";
import { errorHandler } from "../utils/error.js";

export const uploadImageMiddleware = ({ directory, sizeInMb = 10 }) => {
  return multer({
    storage: multerDiskStorage(directory),
    limits: {
      fileSize: sizeInMb * 1024 * 1024, // default 10 MB
    },
    fileFilter: (req, file, cb) => {
      try {
        const mimeType = getMimeType(file.originalname);
        if (mimeType && mimeType.startsWith("image")) {
          // Accept image files
          cb(null, true);
        } else {
          cb(errorHandler(400, "Only image files are allowed."), false);
        }
      } catch (error) {
        console.error("File filter error:", error);
        cb(errorHandler(500, "Internal server error"), false);
      }
    },
  });
};
