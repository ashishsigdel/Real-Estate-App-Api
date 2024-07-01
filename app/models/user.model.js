import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      // default: false,
      default: true,
    },
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
