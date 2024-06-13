import mime from "mime-types";

/**
 * @description Get mime type of a file
 * @param {string} fileName - File name
 * @returns {string} - Mime type of the file
 */
export const getMimeType = (fileName) => {
  return mime.lookup(fileName) || "application/octet-stream";
};
