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
  USER_IMAGES: "user-images",
  CHAPTER_COMITTEE_IMAGES: "chapter-comittee-images",
  EVENT_IMAGES: "event-images",
  CHAPTER_IMAGES: "chapter-images",
  NEWS_IMAGES: "news-images",
  INVOICES: "invoices",
  FEATURE_IMAGE: "feature-images",
  EVENT_DOCUMENTS: "event-documents",
  GALLERY: "gallery",
};

export default FileStorageDirectory;
