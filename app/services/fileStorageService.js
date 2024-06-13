import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import appRootPath from "app-root-path";
import FileStorageDirectory from "../enums/fileStorageDirectory.js";

// get root directory path
export const rootDir = appRootPath.path;
// get uploads directory path
export const uploadsDir = path.join(
  rootDir,
  FileStorageDirectory.FILE_UPLOAD_PATH
);

/**
 * @function multerStorage
 * @description Multer storage
 * @param {string} directory - Directory name to store file
 * @returns {object} - Multer storage object
 */
export const multerDiskStorage = (directory) => {
  return multer.diskStorage({
    destination: async function (req, file, cb) {
      try {
        let fullPath = path.join(uploadsDir, directory);

        if (!fs.existsSync(fullPath)) {
          await fs.promises.mkdir(fullPath, { recursive: true });
        }
        cb(null, fullPath);
      } catch (err) {
        cb(err.message);
      }
    },
    filename: function (req, file, cb) {
      try {
        const fileName = uuidv4();
        cb(null, fileName + path.extname(file.originalname));
      } catch (err) {
        cb(err.message);
      }
    },
  });
};
