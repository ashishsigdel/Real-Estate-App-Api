import mongoose from "mongoose";
import MediaType from "../enums/mediaType.js";
import { generateFileUrl } from "../controllers/media.controller.js";

const mediaSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      type: Object.values(MediaType),
      required: true,
    },
    fileName: {
      type: String,
      requierd: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      requierd: true,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;
