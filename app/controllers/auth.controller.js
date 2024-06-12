import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
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
  const alreadyUsernameExist = await User.findOne({ username });
  if (alreadyUsernameExist) {
    const generatedUsername =
      fullName.split(" ").join("").toLowerCase() +
      Math.random().toString(36).slice(-4);
    username = generatedUsername;
  }

  const newUser = new User({
    fullName,
    username,
    email,
    phone,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(201).json("User created successfully..");
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

    const { password: pass, ...user } = validUser._doc;
    let responseData = {
      accessToken,
      user,
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

    let responseData = {
      accessToken,
      user,
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

export const signOut = (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
  }
};
