import Joi from "joi";

const loginSchema = Joi.object({
  code: Joi.string().required().messages({
    "any.required": "code is required",
    "string.empty": "code cannot be empty",
  }),
});

export default { loginSchema };
