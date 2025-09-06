import crypto from "crypto";
import pool from "../db.js";
import { generateProjectToken } from "../utils/projectToken.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create project
export const createProject = asyncHandler(async (req, res) => {
  const { name, repo_url, deploy_url } = req.body;
  const created_by = req.user.id;

  const secret = crypto.randomBytes(32).toString("hex"); //Generates token for the project

  const result = await pool.query(
    `INSERT INTO projects (name, repo_url, deploy_url, secret, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, repo_url || null, deploy_url || null, secret, created_by]
  );

  const project = result.rows[0];

  // generate JWT invite token (for DEV)
  const inviteToken = generateProjectToken(project, "DEVELOPER");

  return res
    .status(201)
    .json(new ApiResponse(201, { project, inviteToken }, "Project created successfully"));
});
