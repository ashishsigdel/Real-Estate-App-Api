import PostCategory from "../models/postCategory.model.js";
import { errorHandler } from "../utils/error.js";

export const createPostCategory = async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(errorHandler(400, "Category name is required."));
  }

  try {
    const alreadyCategoryExists = await PostCategory.findOne({ name });
    if (alreadyCategoryExists) {
      return next(errorHandler(400, "Category Already Exists."));
    }

    const newCategory = await PostCategory.create({
      name: name,
    });

    res.status(201).json("Category Created Successfully.");
  } catch (error) {
    next(error);
  }
};

export const allPostCategory = async (req, res, next) => {
  try {
    const categories = await PostCategory.find();

    res.status(200).json({ data: categories });
  } catch (error) {
    next(error);
  }
};

export const getPostCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await PostCategory.findById(id);

    if (!category) return next(errorHandler(404, "Category not found!"));

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updatePostCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await PostCategory.findById(id);
    if (!category) return next(errorHandler(404, "Category not found!"));

    const updateCategory = await PostCategory.findByIdAndUpdate(
      id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );
    res
      .status(201)
      .json({ updateCategory, message: "Category updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deletePostCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await PostCategory.findById(id);
    if (!category) return next(errorHandler(404, "Category not found!"));

    await PostCategory.findByIdAndDelete({ _id: id });
    res.status(201).json("Category deleted successfully!");
  } catch (error) {
    next(error);
  }
};
