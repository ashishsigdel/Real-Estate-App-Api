/**
 * @typedef {Object} MediaType
 * @description Media type enum
 * @property {string} IMAGE - Image type
 * @property {string} VIDEO - Video type
 * ...
 * @example
 * import MediaType from "./app/enums/mediaType.js";
 * MediaType.IMAGE // for image
 * MediaType.VIDEO // for video
 * ...
 * @module MediaType
 * @exports MediaType
 */

const MediaType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
  OTHER: "other",
};

export default MediaType;
