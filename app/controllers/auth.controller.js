import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../services/passwordService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getAuthToken,
  getCookieToken,
  verifyToken,
} from "../utils/jwtUtils.js";
import RefreshToken from "../models/refreshToken.model.js";
import EmailVerification from "../models/emailVerification.model.js";
import { generateOTP } from "../utils/otpUtils.js";
import UserProfile from "../models/userProfile.model.js";
import { getOtpTemplate } from "../utils/htmlTemplateUtils.js";
import { sendEmail } from "../services/emailService.js";
import Media from "../models/media.model.js";
import { deleteMediaById } from "./media.controller.js";

//signup
export const signup = async (req, res, next) => {
  const { email, password, fullName, phone, confirmPassword } = req.body;

  if (!fullName) {
    return next(errorHandler(400, "Name is required."));
  }

  if (!email) {
    return next(errorHandler(400, "Email is required."));
  }

  if (!phone) {
    return next(errorHandler(400, "Phone Number is required."));
  }

  if (!password) {
    return next(errorHandler(400, "Password is required."));
  }

  if (!confirmPassword) {
    return next(errorHandler(400, "Confirm password is required."));
  }

  const alreadyEmailExist = await User.findOne({ email });
  if (alreadyEmailExist) {
    return next(errorHandler(401, "Email already exists !"));
  }

  const isPasswordValid = validatePassword(password);
  if (!isPasswordValid) {
    return next(
      errorHandler(
        400,
        "Password Error. Minimum 6 chars, needs uppercase, lowercase, number & symbol."
      )
    );
  }

  if (password !== confirmPassword) {
    return next(errorHandler(400, "Password do not match."));
  }

  const hashedPassword = await hashPassword(password);

  let username = email.split("@")[0];
  const alreadyUsernameExist = await UserProfile.findOne({ username });
  if (alreadyUsernameExist) {
    const generatedUsername =
      fullName.split(" ").join("").toLowerCase() +
      Math.random().toString(36).slice(-4);
    username = generatedUsername;
  }

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  const newProfile = new UserProfile({
    userId: newUser._id,
    fullName,
    username,
    email,
    phone,
  });

  try {
    await newUser.save();
    await newProfile.save();
    res.status(200).json({ message: "User created successfully.." });
  } catch (error) {
    next(error);
  }
};

//signIn
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(errorHandler(400, "Email is required."));
  }
  if (!password) {
    return next(errorHandler(400, "Password is required."));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found !"));

    const validUserProfile = await UserProfile.findOne({ email });
    if (!validUserProfile)
      return next(errorHandler(404, "User profile not found !"));

    const validPassword = await comparePassword(password, validUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Password is incorrect!"));

    // generate refresh token
    const refreshToken = generateRefreshToken({
      userId: validUser._id,
    });

    // save refresh token
    const savedRefreshToken = await RefreshToken.create({
      token: refreshToken,
      userId: validUser._id,
      expiresIn: new Date(
        Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 60 * 1000
      ), // converts minutes to milliseconds and add to current date
    });

    // generate access token
    const accessToken = generateAccessToken({
      userId: validUser.id,
      refreshTokenId: savedRefreshToken._id,
    });

    let profilePictureUrl = null;
    if (validUserProfile.profilePictureId) {
      const media = await Media.findById(validUserProfile.profilePictureId);
      if (media) {
        profilePictureUrl = media.url;
      }
    }
    //append profilepicture url also inside userprofile object
    const userProfileData = validUserProfile.toObject();
    userProfileData.profilePicture = profilePictureUrl;

    let responseData = {
      accessToken,
      user: userProfileData,
    };

    res
      .cookie("accessToken", accessToken, { httpOnly: true })
      .status(200)
      .json(responseData);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // generate refresh token
      const refreshToken = generateRefreshToken({
        userId: validUser._id,
      });

      // save refresh token
      const savedRefreshToken = await RefreshToken.create({
        token: refreshToken,
        userId: validUser._id,
        expiresIn: new Date(
          Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 60 * 1000
        ), // converts minutes to milliseconds and add to current date
      });

      // generate access token
      const accessToken = generateAccessToken({
        userId: validUser.id,
        refreshTokenId: savedRefreshToken._id,
      });

      const { password: pass, ...user } = validUser._doc;
      let responseData = {
        accessToken,
        user,
      };

      res
        .cookie("accessToken", accessToken, { httpOnly: true })
        .status(200)
        .json(responseData);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = hashPassword(generatedPassword);

      const generatedUsername =
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4);
      const newUser = new User({
        username: generatedUsername,
        fullName: req.body.name,
        // phone: req.body.mobilenumber,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      await newUser.save();

      // generate refresh token
      const refreshToken = generateRefreshToken({
        userId: validUser._id,
      });

      // save refresh token
      const savedRefreshToken = await RefreshToken.create({
        token: refreshToken,
        userId: validUser._id,
        expiresIn: new Date(
          Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 60 * 1000
        ), // converts minutes to milliseconds and add to current date
      });

      // generate access token
      const accessToken = generateAccessToken({
        userId: validUser.id,
        refreshTokenId: savedRefreshToken._id,
      });

      const { password: pass, ...user } = validUser._doc;
      let responseData = {
        accessToken,
        user,
      };

      res
        .cookie("accessToken", accessToken, { httpOnly: true })
        .status(200)
        .json(responseData);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @example /auth/refresh-token
 *       body: {}
 *       headers:
 *          {
 *            "Authorization": "Bearer <expired_access_token>",
 *          }
 */
export const refreshAccessToken = async (req, res, next) => {
  const token = getCookieToken(req) || getAuthToken(req);

  if (!token) {
    return next(errorHandler(401, "Unauthorized."));
  }

  //verify token
  try {
    const decodedToken = verifyToken({
      token: token,
      ignoreExpiration: true,
    });

    //get refresh token from db
    const refreshToken = await RefreshToken.findOne({
      _id: decodedToken.rfId,
      userId: decodedToken.id,
    });

    if (!refreshToken) {
      return next(errorHandler(401, "Unauthorized."));
    }

    // verify refresh token
    verifyToken({
      token: refreshToken.token,
    });

    //get user from db
    const user = await User.findOne({ _id: decodedToken.id });

    if (!user) {
      return next(errorHandler(401, "Unauthorized."));
    }

    //generate access token
    const accessToken = generateAccessToken({
      userId: user._id,
      refreshTokenId: refreshToken._id,
    });

    const userProfile = await UserProfile.findOne({ userId: user._id });

    let responseData = {
      accessToken,
      user: userProfile,
      message: "Access token refreshed successfully",
    };

    res
      .cookie("accessToken", accessToken, { httpOnly: true })
      .status(200)
      .json(responseData);
  } catch (error) {
    next(error);
  }
};

//send email verification
export const sendEmailVerification = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  const userProfile = await UserProfile.findOne({ userId: user._id });
  if (!user) {
    return next(errorHandler(404, "User not found."));
  }

  //check if user email is verified
  if (user.isEmailVerified) {
    return next(errorHandler(400, "Email already verified."));
  }

  //check if user has exceeded max attempts
  const now = new Date();

  // get latest email verification record
  const emailVerification = await EmailVerification.findOne({
    userId: user._id,
    verifiedAt: null,
  })
    .sort({ createdAt: -1 })
    .exec();

  // check if the latest email verification is less than 1 minute old
  if (
    emailVerification &&
    emailVerification.createdAt > new Date(now - 60 * 1000) // 1 minute
  ) {
    return next(
      errorHandler(
        429,
        "Please wait for 1 minute before requesting another otp."
      )
    );
  }

  //generate otp
  const otp = generateOTP(6);
  if (process.env.PUBLIC_NODE_ENV === "development") {
    console.log(otp);
  }

  const hashedOtp = await hashPassword(otp);
  const currentDate = new Date();

  //set all previous otps to expired
  await EmailVerification.updateMany(
    { userId: user._id, verifiedAt: null },
    {
      $set: { verifiedAt: currentDate },
    },
    { new: true }
  );

  //save otp to db
  await EmailVerification.create({
    userId: user._id,
    otp: hashedOtp,
    expiresIn: new Date(Date.now() + 5 * 60 * 1000), //expires in 5 minutes
  });

  //send email verification
  try {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailContent = getOtpTemplate({
      date: formattedDate,
      name: userProfile.fullName,
      description:
        "Please use the One Time Password (OTP) provided below to verify your email address:",
      otp: otp,
    });

    const data = {
      to: email,
      subject: "Email verification",
      html: emailContent,
    };

    await sendEmail(data);
  } catch (error) {
    console.log(error);
  }

  //send response
  res.status(201).json("OTP sent successfully..");
};

export const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  //get user
  const user = await User.findOne({ email });

  if (!user) {
    return next(errorHandler(404, "User not found."));
  }

  const userProfile = await UserProfile.findOne({ userId: user._id });

  //check if user email is verified
  if (user.isEmailVerified) {
    return next(errorHandler(400, "Email already verified."));
  }

  // get latest email verification record
  const emailVerification = await EmailVerification.findOne({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!emailVerification) {
    return next(errorHandler(404, "Invalid OTP."));
  }

  // check if attempts is greater than 5
  if (emailVerification.attempts >= 5) {
    return next(
      errorHandler(429, "Too many attempts. Please try again later.")
    );
  }

  //increase attempts by 1
  await EmailVerification.findByIdAndUpdate(
    emailVerification._id,
    {
      $inc: { attempts: 1 },
    },
    { new: true }
  );

  //check if otp is already verified
  if (emailVerification.verifiedAt) {
    return next(errorHandler(401, "OTP Already Used."));
  }

  //check if otp is expired
  if (emailVerification.expiresAt < new Date()) {
    return next(errorHandler(400, "Invalid OTP."));
  }

  //check if otp is valid
  const isOtpValid = true;
  // const isOtpValid = await comparePassword(otp, emailVerification.otp);

  if (!isOtpValid) {
    return next(errorHandler(404, "Invalid OTP."));
  }

  //update otp verifiedAt
  await EmailVerification.findByIdAndUpdate(
    emailVerification._id,
    {
      $set: {
        verifiedAt: new Date(),
      },
    },
    { new: true }
  );

  //update user and userprofile isEmailVerified
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        isEmailVerified: true,
      },
    },
    { new: true }
  );

  await UserProfile.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        isEmailVerified: true,
      },
    },
    { new: true }
  );

  res.status(201).json("Email verified successfully..");
};

export const logout = async (req, res, next) => {
  const token = getCookieToken(req) || getAuthToken(req);

  if (!token) {
    return next(errorHandler(401, "Unauthorized."));
  }

  //verify token
  try {
    const decodedToken = verifyToken({
      token: token,
      ignoreExpiration: true,
    });

    //get refresh token from db
    const refreshToken = await RefreshToken.findOne({
      _id: decodedToken.rfId,
      userId: decodedToken.id,
    });

    if (!refreshToken) {
      return next(errorHandler(401, "Unauthorized."));
    }

    // verify refresh token
    verifyToken({
      token: refreshToken.token,
    });

    //delete refresh token
    await RefreshToken.findByIdAndDelete({ _id: refreshToken._id });

    //delete token from cookie
    res.clearCookie("accessToken");

    return next(errorHandler(201, "User logged out successfully."));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password, confirmText } = req.body;

    if (!password || !confirmText) {
      return next(errorHandler(400, "All field are required."));
    }

    if (confirmText !== "sudo delete my account") {
      return next(errorHandler(400, "Please match the text."));
    }

    const user = req.user;

    const validUser = await User.findOne({ _id: user._id });
    if (!validUser) return next(errorHandler(404, "User not found !"));

    const validPassword = await comparePassword(password, validUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Password is incorrect!"));

    const userProfile = await UserProfile.findOne({ userId: user._id });
    if (!userProfile) {
      return next(errorHandler(404, "User profile not found !"));
    }

    await deleteMediaById(userProfile.profilePictureId);

    await UserProfile.findOneAndDelete({ userId: user._id });
    await User.findOneAndDelete({ _id: user._id });

    await res.status(200).json("User deleted successfully.");
  } catch (error) {
    next(error);
  }
};
