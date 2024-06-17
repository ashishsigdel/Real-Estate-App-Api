import mongoose from "mongoose";
import FileStorageDirectory from "../enums/fileStorageDirectory.js";
import Country from "../models/country.model.js";
import Post from "../models/post.model.js";
import PostCategory from "../models/postCategory.model.js";
import { errorHandler } from "../utils/error.js";
import { getMediaTypeFromFileName } from "../utils/helper.js";
import {
  createMedia,
  deleteMediaById,
  generateFileUrl,
} from "./media.controller.js";
import Media from "../models/media.model.js";

export const createPost = async (req, res, next) => {
  const user = req.user;
  const mediaFiles = req.files;
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

  if (!title) {
    return next(errorHandler(401, "title is required."));
  }

  if (!description) {
    return next(errorHandler(401, "description is required."));
  }

  if (!city) {
    return next(errorHandler(401, "city is required."));
  }

  if (!address) {
    return next(errorHandler(401, "address is required."));
  }

  if (!category) {
    return next(errorHandler(401, "category is required."));
  }

  if (!country) {
    return next(errorHandler(401, "country is required."));
  }

  if (!price) {
    return next(errorHandler(401, "price is required."));
  }

  if (discountStatus && !discountPrice) {
    return next(errorHandler(401, "discountPrice is required."));
  }

  if (mediaFiles.length === 0) {
    return next(errorHandler(401, "At least one media file is required."));
  }

  // Validate category
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return next(errorHandler(400, "Invalid category format."));
  }

  // Validate country
  if (!mongoose.Types.ObjectId.isValid(country)) {
    return next(errorHandler(400, "Invalid country format."));
  }

  try {
    const categoryExists = await PostCategory.findOne({ _id: category });
    if (!categoryExists) {
      return next(errorHandler(404, "category does not exist."));
    }

    const countryExists = await Country.findOne({ _id: country });
    if (!countryExists) {
      return next(errorHandler(404, "country does not exist."));
    }

    // Upload media files
    const mediaIds = [];

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
      res.status(201).json({ post, message: "Post is saved to draft." });
    }
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;

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

  const mediaFiles = req.files;

  // Validate postId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(errorHandler(400, "This Post doesnot exists."));
  }

  try {
    const validatePost = await Post.findOne({ _id: postId });
    if (!validatePost) {
      return next(errorHandler(404, "Post not found."));
    }

    if (!validatePost.userId.equals(user._id)) {
      return next(
        errorHandler(403, "You are not authorized to update this post")
      );
    }

    // Upload media files
    const mediaIds = validatePost.featureImagesId || [];

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

    // Update post
    const updatedPostData = {
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
    };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: updatedPostData },
      { new: true }
    );

    if (status === "published") {
      await Post.findByIdAndUpdate(
        validatePost._id,
        {
          $set: { status: "published" },
        },
        { new: true }
      );
    }

    res.status(201).json({ post: updatedPost, message: "Post is updated." });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const user = req.user;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(errorHandler(400, "This Post doesnot exists."));
  }

  try {
    const validatePost = await Post.findOne({ _id: postId });
    if (!validatePost) {
      return next(errorHandler(404, "Post not found."));
    }

    if (!validatePost.userId.equals(user._id)) {
      return next(
        errorHandler(403, "You are not authorized to delete this post")
      );
    }

    // delete media from post
    if (Array.isArray(validatePost.featureImagesId)) {
      for (const mediaId of validatePost.featureImagesId) {
        await deleteMediaById(mediaId);
      }
    }
    await Post.findByIdAndDelete({ _id: postId });

    res.status(201).json({ message: "Product delete successfully." });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(errorHandler(400, "This Post doesnot exists."));
  }

  try {
    const validatePost = await Post.findOne({ _id: postId });
    if (!validatePost) {
      return next(errorHandler(404, "Post not found."));
    }

    if (validatePost.status !== "published") {
      if (!req.user || !validatePost.userId.equals(req.user._id)) {
        return next(
          errorHandler(403, "You are not authorized to view this post")
        );
      }
    }

    const mediaUrls = [];
    if (Array.isArray(validatePost.featureImagesId)) {
      for (const mediaId of validatePost.featureImagesId) {
        const media = await Media.findById(mediaId);
        if (media) {
          const mediaUrl = generateFileUrl({
            directory: media.path,
            fileName: media.fileName,
          });
          mediaUrls.push(mediaUrl);
        }
      }
    }

    res.status(200).json({ post: validatePost, mediaUrls: mediaUrls });
  } catch (error) {
    next(error);
  }
};

export const getAllPostsByCretor = async (req, res, next) => {
  const user = req.user;

  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const posts = await Post.find({ userId: user._id })
      .limit(limit)
      .skip(startIndex);

    const postsWithMediaUrls = [];

    for (const post of posts) {
      const mediaUrls = [];
      if (Array.isArray(post.featureImagesId)) {
        for (const mediaId of post.featureImagesId) {
          const media = await Media.findById(mediaId);
          if (media) {
            const mediaUrl = generateFileUrl({
              directory: media.path,
              fileName: media.fileName,
            });
            mediaUrls.push(mediaUrl);
          }
        }
      }

      postsWithMediaUrls.push({ post, mediaUrls });
    }

    res.status(200).json({ posts: postsWithMediaUrls });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let discountStatus = req.query.discountStatus;

    if (discountStatus === undefined || discountStatus === "false") {
      discountStatus = { $in: [false, true] };
    } else {
      discountStatus = discountStatus === "true";
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const countryId = req.query.countryId;
    const city = req.query.city;
    const address = req.query.address;
    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    const categoryId = req.query.categoryId;

    const query = {
      $and: [
        { status: "published" },
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { discountStatus },
      ],
    };

    if (countryId) {
      query.$and.push({ countryId: mongoose.Types.ObjectId(countryId) });
    }

    if (city) {
      query.$and.push({ city: { $regex: city, $options: "i" } });
    }

    if (address) {
      query.$and.push({ address: { $regex: address, $options: "i" } });
    }

    if (minPrice && !isNaN(minPrice)) {
      query.$and.push({ price: { $gte: minPrice } });
    }

    if (maxPrice && !isNaN(maxPrice)) {
      query.$and.push({ price: { $lte: maxPrice } });
    }

    if (categoryId) {
      query.$and.push({ categoryId: mongoose.Types.ObjectId(categoryId) });
    }

    const posts = await Post.find(query)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(startIndex);

    const postsWithMediaUrls = [];

    for (const post of posts) {
      const mediaUrls = [];
      if (Array.isArray(post.featureImagesId)) {
        for (const mediaId of post.featureImagesId) {
          const media = await Media.findById(mediaId);
          if (media) {
            const mediaUrl = generateFileUrl({
              directory: media.path,
              fileName: media.fileName,
            });
            mediaUrls.push(mediaUrl);
          }
        }
      }

      postsWithMediaUrls.push({ post, mediaUrls });
    }

    res.status(200).json({ posts: postsWithMediaUrls });
  } catch (error) {
    next(error);
  }
};
