import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  repo_url: Joi.string().uri().optional(),
  deploy_url: Joi.string().uri().optional(),
});

export const rotateTokenSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid("DEVELOPER", "TESTER").default("TESTER"),
});
