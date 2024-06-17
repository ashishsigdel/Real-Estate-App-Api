import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    featureImagesId: {
      type: Array,
      // required: true,
    },
    categoryId: {
      type: String,
      // required: true,
    },
    countryId: {
      type: String,
      // required: true,
      defalut: "Nepal",
    },
    city: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
      // required: true,
    },
    userId: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    discountStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    discountPrice: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
