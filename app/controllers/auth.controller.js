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
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const generatedUsername =
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4);
      const newUser = new User({
        username: generatedUsername,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
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
