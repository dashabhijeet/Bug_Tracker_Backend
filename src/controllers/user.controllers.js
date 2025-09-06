import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken,generateRefreshToken } from "../utils/token.js";
import {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByGithubId,
  saveRefreshToken,
  clearRefreshToken
} from "../models/user.model.js";
import { signupSchema,loginSchema,githubCallbackSchema } from "../validators/user.validators.js";
/**
 * 🟢 Signup (Tester flow)
 */
export const signupUser = asyncHandler(async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const { name, email, password, github_id = null } = value;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  // check if user exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(400, "User already exists");

  // hash password
  const hashed_password = await bcrypt.hash(password, 10);

  // create user
  const user = await createUser({
    name,
    email,
    hashed_password,
    role_global: "DEVELOPER",
    github_id, // ✅ include GitHub ID
  });

  // remove sensitive field before sending response
  const { hashed_password: _, ...safeUser } = user;

  return res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User created successfully"));
});


/**
 * 🟢 Login (Tester flow)
 */
export const loginUser = asyncHandler(async (req, res) => {

    const{error,value}=loginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);


  const { email, password } = value;
  if (!email || !password) throw new ApiError(400, "Email and password required");

  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // Create tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token in DB
  await saveRefreshToken(user.id, refreshToken);

  // Store refresh token in httpOnly cookie
  res.
  cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }).
  cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15mins
  });

  // remove password before sending response
  const { hashed_password, ...safeUser } = user;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: safeUser,
        accessToken,
        refreshToken, // ✅ return explicitly, even though it's in cookie
      },
      "Login successful"
    )
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

  // Exclude sensitive fields
  const { hashed_password, refresh_token, ...safeUser } = user;

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Current user details"));
});


/**
 * 🟢 Logout
 */
// controllers/user.controllers.js
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // ✅ comes from auth middleware after verifying access token

  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }

  // clear refresh token in DB
  await clearRefreshToken(userId);

  // clear cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/**
 * 🟢 GitHub OAuth Callback
 */
export const githubAuthCallback = asyncHandler(async (req, res) => {
const { error } = githubCallbackSchema.validate(req.user || {});
// console.log("Error hun",error)
// console.log("USER",req.user);
if (error) throw new ApiError(400, "Invalid GitHub profile data");

  const githubProfile = req.user;
  if (!githubProfile) throw new ApiError(400, "Invalid GitHub profile data");

  let user = await findUserByGithubId(githubProfile.id);
  console.log("USER HUN BHAI",user)
  if (!user) {
    user = await createUser({
      name: githubProfile.displayName || "GitHub User",
      email: githubProfile.emails?.[0]?.value || `${githubProfile.id}@github.com`,
      hashed_password: null,
      role_global: "DEVELOPER",
      github_id: githubProfile.id,
    });
  }

  // Issue tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveRefreshToken(user.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

    // Optional: keep user safe info
  const { hashed_password, refresh_token, ...safeUser } = user;

  // Redirect to frontend with accessToken in query param
  // Frontend can then store it in localStorage or state
  const frontendURL = new URL("https://bug-tracker-one-eta.vercel.app");
  frontendURL.searchParams.set("accessToken", accessToken);
  frontendURL.searchParams.set("userName", safeUser.name);

  return res.redirect(frontendURL.toString());
});
