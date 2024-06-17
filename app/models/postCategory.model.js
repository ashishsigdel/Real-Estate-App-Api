import mongoose from "mongoose";

const postCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const PostCategory = mongoose.model("PostCategory", postCategorySchema);

export default PostCategory;
