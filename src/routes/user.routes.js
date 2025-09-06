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

// routes/user.routes.js
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubAuthCallback
);

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
