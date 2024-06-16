import mongoose from "mongoose";
import MediaType from "../enums/mediaType.js";

const mediaSchema = mongoose.Schema(
  {
    userId: {
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

// Virtual for generating the file URL
mediaSchema.virtual("url").get(function () {
  return generateFileUrl({
    directory: this.path,
    fileName: this.fileName,
  });
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;
