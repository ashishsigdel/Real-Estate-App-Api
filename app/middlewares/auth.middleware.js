import RefreshToken from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import {
  getAuthToken,
  getCookieToken,
  verifyToken,
} from "../utils/jwtUtils.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = getCookieToken(req) || getAuthToken(req);

    if (!accessToken) {
      return next(errorHandler(401, "Missing token."));
    }

    const decodedToken = verifyToken({
      token: accessToken,
    });

    const refreshToken = await RefreshToken.findOne({
      _id: decodedToken.rfId,
      userId: decodedToken.id,
    });

    if (!refreshToken) {
      return next(errorHandler(401, "Invalid token."));
    }

    // verify refresh token
    verifyToken({
      token: refreshToken.token,
    });

    //check if refresh token is revoked
    if (refreshToken.revoked) {
      return next(errorHandler(401, "Invalid token."));
    }

    // check if refresh token is expired
    if (refreshToken.expiresAt < Date.now()) {
      return next(errorHandler(401, "Invalid token."));
    }

    // check if user exists
    const user = await User.findOne({ _id: decodedToken.id })
      .select("-password -createdAt -updatedAt")
      .exec();

    if (!user) {
      return next(errorHandler(401, "Invalid token."));
    }

    if (!user.isEmailVerified) {
      return next(errorHandler(403, "Email is not verified."));
    }

    // set user in request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
