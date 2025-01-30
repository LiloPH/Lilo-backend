import Joi from "joi";

const loginSchema = Joi.object({
  serverAuth: Joi.string().required().messages({
    "any.required": "serverAuth is required",
    "string.empty": "serverAuth cannot be empty",
  }),
});

export default { loginSchema };
