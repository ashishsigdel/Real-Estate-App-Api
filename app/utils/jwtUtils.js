import jwt from "jsonwebtoken";

/**
 * @description Generate a JWT token
 */
export const generateToken = ({ payload, expiresIn }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn * 60, // convert minutes to seconds for expiresIn
  });

  return token;
};

/**
 * @description Verify a JWT token and return the payload
 */
export const verifyToken = ({ token, ignoreExpiration = false }) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    ignoreExpiration: ignoreExpiration,
  });
};

/**
 * @description Remove bearer from JWT token string
 */

export const removeBearer = (token) => {
  if (token && token.startsWith("Bearer ")) {
    return token.slice(7, token.length);
  }

  return token;
};

/**
 * @description Get JWT token from request header
 */
export const getAuthToken = (req) => {
  if (
    req &&
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

/**
 * @description Get JWT token from request cookie
 */
export const getCookieToken = (req) => {
  if (req && req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * @description Generate a refresh token
 */
export const generateRefreshToken = ({ userId }) => {
  return generateToken({
    payload: {
      id: userId,
    },
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * @description Generate an access token
 */
export const generateAccessToken = ({ userId, refreshTokenId }) => {
  return generateToken({
    payload: {
      id: userId,
      rfId: refreshTokenId,
    },
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
