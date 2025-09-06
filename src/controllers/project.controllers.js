

import { ApiResponse, ApiError } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
// src/controllers/projectController.js
import {
  createProject,
  rotateProjectToken,
  findProjectById,
  listProjectsByDeveloper,
} from "../models/projectModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Create a new project
 * POST /api/projects
 */
export async function createProjectController(req, res, next) {
  try {
    const userId = req.user.id; // comes from JWT middleware

    if (req.user.role_global !== "DEVELOPER") {
      throw new ApiError(403, "Only developers can create projects");
    }

    const { name, description, repo_url, deploy_url } = req.body;

    if (!name || !repo_url) {
      throw new ApiError(400, "Project name and repo_url are required");
    }

    const project = await createProject({
      name,
      description,
      repo_url,
      deploy_url,
      created_by: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, project, "Project created successfully"));
  } catch (err) {
    next(err);
  }
}

/**
 * Rotate project token
 * POST /api/projects/:id/token/rotate
 */
export async function rotateTokenController(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Ensure project exists
    const project = await findProjectById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // Ensure only creator can rotate
    if (project.created_by !== userId) {
      throw new ApiError(403, "Not authorized to rotate this project's token");
    }

    const updatedProject = await rotateProjectToken(projectId);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedProject, "Project token rotated"));
  } catch (err) {
    next(err);
  }
}

/**
 * List projects by logged-in developer
 * GET /api/projects/my
 */
export async function listMyProjectsController(req, res, next) {
  try {
    const userId = req.user.id;

    if (req.user.role_global !== "DEVELOPER") {
      throw new ApiError(403, "Only developers can view their projects");
    }

    const projects = await listProjectsByDeveloper(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, projects, "Projects fetched successfully"));
  } catch (err) {
    next(err);
  }
}
