import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { findUserByGithubId, createUser } from "../models/user.model.js";

export const githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://bug-tracker-backend-zq9g.onrender.com/api/v1/users/github/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Only forward GitHub profile
      done(null, profile);
    } catch (err) {
      done(err, null);
    }
  }
);
