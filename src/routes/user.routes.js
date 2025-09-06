// routes/user.routes.js
import express, { Router } from "express";
import passport from "passport"; // for GitHub OAuth
import {
  signupUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  githubAuth,
  githubAuthCallback,
} from "../controllers/user.controllers.js";
import  authenticateJWT  from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * 🟢 Tester signup
 * Body: { name, email, password }
 */
router.post("/signup", signupUser);

/**
 * 🟢 Tester login
 * Body: { email, password }
 */
router.post("/login", loginUser);

/**
 * 🟢 GitHub OAuth (Developer login)
 * Redirects user to GitHub for OAuth consent
 */
router.get("/github", githubAuth); 

/**
 * 🟢 GitHub OAuth Callback
 * GitHub redirects here with ?code=...
 */
router.get("/github/callback", githubAuthCallback);

/**
 * 🟢 Get current authenticated user
 * Requires valid JWT (sent via cookie or Authorization header)
 */
router.get("/me", authenticateJWT, getCurrentUser);

/**
 * 🟢 Logout user
 * Clears JWT cookie (if cookie-based auth)
 */
router.post("/logout", logoutUser);

const userRouter=router
export default userRouter;
