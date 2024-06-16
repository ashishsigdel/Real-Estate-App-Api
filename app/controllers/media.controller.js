import { getMimeType } from "../utils/helper.js";
import { removeLocalFile } from "../services/fileStorageService.js";
import { v4 as uuidv4 } from "uuid";
import Media from "../models/media.model.js";

export const createMedia = async ({ directory, file, user, mediaType }) => {
  //upload new profile picture in media table
  const fileMedia = await Media.create({
    userId: user._id,
    mediaType: mediaType,
    fileName: file.filename,
    path: directory,
    mimeType: getMimeType(file.filename),
    size: file.size,
  });

  return fileMedia;
};

export const deleteMedia = async (media) => {
  removeLocalFile(media.path, media.fileName);

  //delete media from media table
  await media.deleteOne({
    _id: media._id,
  });
};

export const deleteMediaById = async (mediaId) => {
  const media = await Media.findById(mediaId);

  if (!media) {
    return;
  }

  await deleteMedia(media);
};

/**
 * @param {Object} currentMedia
 * @returns {Promise}
 * @description Copies the current media to a new file name
 */
export const updateMediaWithCopy = async ({ currentMedia }) => {
  const newFileName = `${uuidv4()}.${currentMedia.fileName.split(".").pop()}`;

  //update current media with new media details
  currentMedia.fileName = newFileName;
  await currentMedia.save();
};
