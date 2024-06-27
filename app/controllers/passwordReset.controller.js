import PasswordReset from "../models/passwordReset.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";
import { sendEmail } from "../services/emailService.js";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../services/passwordService.js";
import { errorHandler } from "../utils/error.js";
import { getOtpTemplate } from "../utils/htmlTemplateUtils.js";
import { generateOTP } from "../utils/otpUtils.js";
import { v4 as uuidv4 } from "uuid";

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(errorHandler(400, "Email is required."));
  }

  //get user of email
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return next(errorHandler(404, "User not found."));
  }

  // Get total password resets request for the day
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const previousRequestCount = await PasswordReset.countDocuments({
    userId: user._id,
    createdAt: {
      $gte: twentyFourHoursAgo,
    },
  });

  // if previous request count is greater or equal to 5, throw error
  if (previousRequestCount >= 5) {
    return next(errorHandler(429, "Too many attempts. Please try again later"));
  }

  //get latest password reset
  const passwordReset = await PasswordReset.findOne({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .exec();

  // check if the latest password reset is less than 1 minute old
  if (
    passwordReset &&
    passwordReset.createdAt > new Date(now - 60 * 1000) // 1 minute
  ) {
    return next(
      errorHandler(429, "Please wait for 1 minute for another request.")
    );
  }

  //generate otp
  const otp = generateOTP(6);
  if (process.env.PUBLIC_NODE_ENV === "development") {
    console.log(otp);
  }

  // generate reset token
  const resetToken = uuidv4();

  //hash otp
  const otpHash = await hashPassword(otp);

  //set all previous password reset request as expired
  await PasswordReset.updateMany(
    {
      userId: user.id,
    },
    {
      $set: { isUsed: true },
    },
    { new: true }
  );

  //create new password reset request
  const newResetRequest = await PasswordReset.create({
    userId: user._id,
    resetToken,
    otp: otpHash,
    expiresIn: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes
  });

  //send otp to user email
  const userProfile = await UserProfile.findOne({ userId: user._id });
  try {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailContent = getOtpTemplate({
      date: `${formattedDate}`,
      name: `${userProfile.fullName}`,
      description:
        "Please use the One Time Password (OTP) provided below to reset your password:",
      otp: otp,
    });

    const data = {
      to: email,
      subject: "Reset Password",
      html: emailContent,
    };

    await sendEmail(data);
  } catch (error) {
    console.log(error);
  }

  //send response

  const responseData = {
    resetToken,
    message: "OTP sent successfully..",
  };
  res.status(201).json(responseData);
};

export const verifyOtp = async (req, res, next) => {
  const { resetToken, otp } = req.body;

  //get password reset request
  const passwordReset = await PasswordReset.findOne({
    resetToken,
  });

  //check if password reset request exists
  if (!passwordReset) {
    return next(errorHandler(404, "Invalid Attempts."));
  }

  // check password reset attempts
  if (passwordReset.attempts >= 5) {
    return next(
      errorHandler(429, "Too many attempts. Please try again later.")
    );
  }

  // check if otp is used
  if (passwordReset.isUsed) {
    return next(errorHandler(401, "OTP is already used!"));
  }

  // check if otp is expired
  if (passwordReset.expiresIn < new Date()) {
    return next(errorHandler(400, "OTP has expired."));
  }

  // increment attempts
  await PasswordReset.findByIdAndUpdate(
    passwordReset._id,
    {
      $inc: { attempts: 1 },
    },
    { new: true }
  );
  // compare otp
  const isMatch = await comparePassword(otp, passwordReset.otp);

  // if otp is not matched
  if (!isMatch) {
    return next(errorHandler(401, "Wrong OTP."));
  }

  //send response
  res.status(201).json("OTP verified..");
};

/**
 * @description     Reset password
 * /password-reset/reset-password
 *    body:
 *      {
 *          "resetToken": "f1b9a0e0-9b1e-4b5a-8b9a-0e09b1e4b5a8",
 *          "otp": "123456",
 *          "password": "123456",
 *          "confirmPassword": "123456"
 *     }
 */
export const resetPassword = async (req, res, next) => {
  const { resetToken, otp, password, confirmPassword } = req.body;

  if (!password) {
    return next(errorHandler(400, "Password is required."));
  }

  if (!confirmPassword) {
    return next(errorHandler(400, "Confirm password is required."));
  }

  //get password reset request
  const passwordReset = await PasswordReset.findOne({
    resetToken,
  });

  //check if password reset request exists
  if (!passwordReset) {
    return next(errorHandler(404, "Invalid Attempts."));
  }

  // check password reset attempts
  if (passwordReset.attempts >= 5) {
    return next(
      errorHandler(429, "Too many attempts. Please try again later.")
    );
  }

  // check if otp is used
  if (passwordReset.isUsed) {
    return next(errorHandler(401, "OTP is already used!"));
  }

  // check if otp is expired
  if (passwordReset.expiresIn < new Date()) {
    return next(errorHandler(400, "OTP has expired."));
  }

  //check password validity
  const isPasswordValid = validatePassword(password);
  if (!isPasswordValid) {
    return next(
      errorHandler(
        400,
        "Password Error. Minimum 6 chars, needs uppercase, lowercase, number & symbol."
      )
    );
  }

  //check password and confirm password
  if (password !== confirmPassword) {
    return next(errorHandler(400, "Password do not match."));
  }

  // increment attempts
  await PasswordReset.findByIdAndUpdate(
    passwordReset._id,
    {
      $inc: { attempts: 1 },
    },
    { new: true }
  );

  // compare otp
  const isMatch = await comparePassword(otp, passwordReset.otp);

  // if otp is not matched
  if (!isMatch) {
    return next(errorHandler(401, "Wrong OTP."));
  }

  // check if user exists
  const user = await User.findOne({
    _id: passwordReset.userId,
  });

  // if user does not exist
  if (!user) {
    return next(errorHandler(404, "User not found!"));
  }

  // check if password is same as previous password
  const isSamePassword = await comparePassword(password, user.password);

  // if password is same as previous password
  if (isSamePassword) {
    return next(
      errorHandler(400, "Password cannot be same as previous password")
    );
  }

  // hash password
  const passwordHash = await hashPassword(password);

  // update user password
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: passwordHash,
      },
    },
    { new: true }
  );

  // update password reset request
  passwordReset.isUsed = true;
  passwordReset.passwordChangedAt = new Date();
  await passwordReset.save();

  //delete all refresh tokens
  await RefreshToken.deleteMany({
    userId: user._id,
  });

  //send response
  res.status(200).json("Password reset successfully...");
};
