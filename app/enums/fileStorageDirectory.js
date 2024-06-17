/**
 * @description FileStorageDirectory
 * @enum {string}
 * @readonly
 * @example
 * import FileStorageDirectory from "./app/enums/fileStorageDirectory.js";
 * FileStorageDirectory.FILE_UPLOAD_PATH // "public"
 * @module fileStorageDirectory
 * @exports FileStorageDirectory
 */

const FileStorageDirectory = {
  FILE_UPLOAD_PATH: "public",
  TEMP: "temp",
  POST: "post",
  USER_IMAGES: "user-images",
  FEATURE_IMAGE: "feature-images",
};

export default FileStorageDirectory;
