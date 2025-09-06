// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const authenticateJWT = (req, res, next) => {
  try {
    let accessToken = null;

    // 1️⃣ Try Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      accessToken = req.headers.authorization.split(" ")[1];
    } 
    // 2️⃣ Then check cookies
    else if (req.cookies && req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    if (!accessToken) {
      throw new ApiError(401, "Authentication token missing");
    }

    // 3️⃣ Verify JWT (use ACCESS_TOKEN_SECRET)
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // 4️⃣ Attach user info to req
    req.user = decoded;

    // 5️⃣ Continue
    next();
  } catch (err) {
    console.error("JWT auth error:", err.message);
    throw new ApiError(401, "Invalid or expired token");
  }
};

export default authenticateJWT;
