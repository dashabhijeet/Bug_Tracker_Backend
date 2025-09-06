import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(8).required(),
  role: Joi.string().valid("DEVELOPER", "TESTER").required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(8).required(),
});

export const githubCallbackSchema = Joi.object({
  id: Joi.string().required(),
  displayName: Joi.string().allow("", null),
  emails: Joi.array()
  .items(
    Joi.object({
      value: Joi.string().email().required(),
    })
  )
  .min(1)
  .optional()
  .allow(null),
}).unknown(true);
