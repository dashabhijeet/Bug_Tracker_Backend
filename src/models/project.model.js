// src/models/projectModel.js
import pool from "../db_config/db.js";
import crypto from "crypto";

/**
 * Create a new project with a unique token.
 * created_by → user ID of the developer creating the project.
 */
export async function createProject({ name, description, repo_url, deploy_url, created_by }) {
  // Generate a secure random token (hex string)
  const projectToken = crypto.randomBytes(16).toString("hex");

  const result = await pool.query(
    `INSERT INTO projects (name, description, repo_url, deploy_url, projectToken, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [name, description, repo_url, deploy_url, projectToken, created_by]
  );

  return result.rows[0];
}

/**
 * Rotate the project token (security).
 */
export async function rotateProjectToken(projectId) {
  const newToken = crypto.randomBytes(16).toString("hex");

  const result = await pool.query(
    `UPDATE projects
     SET token = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newToken, projectId]
  );

  return result.rows[0];
}

/**
 * Get a project by its ID.
 */
export async function findProjectById(projectId) {
  const result = await pool.query(
    `SELECT * FROM projects WHERE id = $1`,
    [projectId]
  );
  return result.rows[0];
}

/**
 * Get a project by its token (used for tester join flow).
 */
export async function findProjectByToken(token) {
  const result = await pool.query(
    `SELECT * FROM projects WHERE token = $1`,
    [token]
  );
  return result.rows[0];
}

/**
 * List all projects created by a specific developer.
 */
export async function listProjectsByDeveloper(developerId) {
  const result = await pool.query(
    `SELECT * FROM projects WHERE created_by = $1 ORDER BY created_at DESC`,
    [developerId]
  );
  return result.rows;
}