import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken,generateRefreshToken } from "../utils/token.js";
import {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByGithubId,
} from "../models/userModel.js";
import { signupSchema,loginSchema,githubCallbackSchema } from "../validators/user.validators.js";
/**
 * 🟢 Signup (Tester flow)
 */
export const signupUser = asyncHandler(async (req, res) => {

    const {error,value} =signupSchema.validate(req.body);
    if (error ) 
        throw new ApiError(400,error.details[0].message);

  const { name, email, password } = value;
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  // check if user exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(400, "User already exists");

  // hash password
  const hashed_password = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    hashed_password,
    role_global: "DEVELOPER",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

/**
 * 🟢 Login (Tester flow)
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { email, password } = value;

  // 1️⃣ Find user
  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  // 2️⃣ Validate password
  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // 3️⃣ Generate tokens
  const accessToken =generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 4️⃣ Store refresh token securely in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 5️⃣ Return access token in response
  return res.status(200).json(
    new ApiResponse(200, { user, accessToken }, "Login successful")
  );
});


// -------- Refresh Token --------
// export const refreshAccessToken = asyncHandler(async (req, res) => {
//     try {
//         const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
//         if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request.");

//         const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
//         const user = await User.findById(decodedToken?._id);
//         if (!user) throw new ApiError(401, "Invalid refresh token");
//         if (incomingRefreshToken !== user?.refreshToken)
//             throw new ApiError(401, "Refresh token is expired or used.");

//         const options = { httpOnly: true, secure: true };
//         const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"));
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh Token");
//     }
// });
/**
 * 🟢 Get Current Authenticated User
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user details"));
});

/**
 * 🟢 Logout
 */
// controllers/user.controllers.js
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out."));
});


/**
 * 🟢 GitHub OAuth Start
 */
export const githubAuth = asyncHandler(async (req, res, next) => {
  next();
});

/**
 * 🟢 GitHub OAuth Callback
 */
export const githubAuthCallback = asyncHandler(async (req, res) => {
  const { error } = githubCallbackSchema.validate(req.user || {});
  if (error) throw new ApiError(400, "Invalid GitHub profile data");

  const githubProfile = req.user;
  const githubId = githubProfile.id;

  let user = await findUserByGithubId(githubId);

  if (!user) {
    user = await createUser({
      name: githubProfile.displayName || "GitHub User",
      email: githubProfile.emails?.[0]?.value || `${githubId}@github.com`,
      hashed_password: null,
      role_global: "DEVELOPER",
      github_id: githubId,
    });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "GitHub login successful"));
});