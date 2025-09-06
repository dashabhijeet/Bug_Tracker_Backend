import jwt from "jsonwebtoken";

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role_global: user.role_global,
      github_id: user.github_id
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // 15 minutes
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role_global: user.role_global,
      github_id: user.github_id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // 7 days
  );
};
