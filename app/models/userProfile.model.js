import mongoose from "mongoose";
import Gender from "../enums/gender.js";

const userProfileSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      requierd: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      // required: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    dob: {
      type: Date,
    },
    profilePictureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    isEmailVerified: {
      type: Boolean,
      // default: false,
      default: true,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;
