import FileStorageDirectory from "../enums/fileStorageDirectory.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";
import { getMediaTypeFromFileName } from "../utils/helper.js";
import { createMedia } from "./media.controller.js";

export const createPost = async (req, res, next) => {
  const {
    title,
    description,
    city,
    address,
    category,
    country,
    price,
    discountStatus,
    discountPrice,
    status,
  } = req.body;

  const user = req.user;
  const mediaFiles = req.files;

  if (!title && (!mediaFiles || mediaFiles.length === 0)) {
    return next(errorHandler(400, "Title or post media is required."));
  }

  // Upload media files
  const mediaIds = [];

  try {
    if (mediaFiles) {
      for (const file of mediaFiles) {
        const media = await createMedia({
          directory: FileStorageDirectory.POST,
          file: file,
          user: user,
          mediaType: getMediaTypeFromFileName(file.filename),
        });

        mediaIds.push(media._id);
      }
    }

    const discountStatusBoolean = discountStatus === "true";

    if (discountStatusBoolean && !discountPrice) {
      return next(errorHandler(400, "Discount Price is required!"));
    }

    // Create post
    const post = await Post.create({
      title,
      description,
      featureImagesId: mediaIds,
      categoryId: category,
      countryId: country,
      city,
      address,
      userId: user._id,
      price,
      discountStatus: discountStatusBoolean,
      discountPrice,
    });

    if (status === "published") {
      if (
        post.title !== undefined &&
        post.description !== undefined &&
        post.featureImagesId.length !== 0 &&
        post.address !== undefined
      ) {
        const updatedPost = await Post.findByIdAndUpdate(
          post._id,
          {
            $set: { status: "published" },
          },
          { new: true }
        );
        res
          .status(201)
          .json({ post: updatedPost, message: "Post is published." });
      } else {
        res.status(201).json({
          post,
          message: "Unable to publish. Post is saved to draft.",
        });
      }
    } else {
      res.status(201).json({ post, message: "Post is saved to draft." });
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
