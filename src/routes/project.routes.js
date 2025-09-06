// routes/project.routes.js
import express from "express";
import { createProject, rotateProjectToken } from "../controllers/project.controllers.js";
import authenticateJWT from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create Project (Developer only)
router.post("/", authenticateJWT, createProject);

// Rotate Token (Project Creator only)
router.post("/:id/token/rotate", authenticateJWT, rotateProjectToken);

const projectRouter=router;
export default projectRouter;
