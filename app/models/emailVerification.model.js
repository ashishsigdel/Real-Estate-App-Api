import mongoose from "mongoose";

const emailVerificationSchema = mongoose.Schema(
  {
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
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);

export default EmailVerification;
