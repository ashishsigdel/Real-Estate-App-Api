import mongoose from "mongoose";

const passwordResetSchema = mongoose.Schema(
  {
    resetToken: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      required: true,
    },
    passwrodChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
