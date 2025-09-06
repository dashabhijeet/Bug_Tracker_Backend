
import { Strategy as GitHubStrategy } from "passport-github2";

export const githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https%3A%2F%2Fbug-tracker-backend-zq9g.onrender.com%2Fapi%2Fv1%2Fusers%2Fgithub%2Fcallback",
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
