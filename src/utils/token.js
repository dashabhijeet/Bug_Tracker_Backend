import jwt from "jsonwebtoken";

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // 15 minutes
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // 7 days
  );
};
