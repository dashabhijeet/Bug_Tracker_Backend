import jwt from "jsonwebtoken";

// Generate a project-scoped token
export function generateProjectToken(project, role = "TESTER") {
  return jwt.sign(
    {
      projectId: project.id,
      role,
    },
    project.secret, // project-specific secret
    { expiresIn: "7d" } // configurable
  );
}

// Verify project-scoped token
export function verifyProjectToken(token, projectSecret) {
  return jwt.verify(token, projectSecret);
}
