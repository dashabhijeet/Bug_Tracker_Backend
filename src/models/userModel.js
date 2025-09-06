// src/models/userModel.js
import pool from "../db_config/db.js";

/**
 * Create a new user (Tester signup).
 * hashed_password is required only for email/password signup.
 */
export async function createUser({ name, email, hashed_password, role_global = "TESTER", github_id = null }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, hashed_password, role_global, github_id, created_at)
     VALUES ($1, $2, $3, $4,$5, NOW())
     RETURNING *`,
    [name, email, hashed_password, role_global, github_id]
  );
  return result.rows[0];
}

/**
 * Find a user by email (used in login).
 */
export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

/**
 * Find a user by GitHub ID (for OAuth login).
 */
export async function findUserByGithubId(github_id) {
  const result = await pool.query(
    `SELECT * FROM users WHERE github_id = $1`,
    [github_id]
  );
  return result.rows[0];
}

/**
 * Find a user by ID (for /me endpoint).
 */
export async function findUserById(id) {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}
