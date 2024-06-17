import mime from "mime-types";
import MediaType from "../enums/mediaType.js";

/**
 * @description Get mime type of a file
 * @param {string} fileName - File name
 * @returns {string} - Mime type of the file
 */
export const getMimeType = (fileName) => {
  return mime.lookup(fileName) || "application/octet-stream";
};

/**
 * @description Get media type from a file name
 * @param {string} fileName - File name
 * @returns {string} - Media type
 */
export const getMediaTypeFromFileName = (fileName) => {
  const mimeType = getMimeType(fileName);
  if (mimeType.startsWith("image")) {
    return MediaType.IMAGE;
  } else if (mimeType.startsWith("video")) {
    return MediaType.VIDEO;
  } else if (mimeType.startsWith("audio")) {
    return MediaType.AUDIO;
  } else if (mimeType.startsWith("application/pdf")) {
    return MediaType.DOCUMENT;
  } else {
    return MediaType.OTHER;
  }
};
