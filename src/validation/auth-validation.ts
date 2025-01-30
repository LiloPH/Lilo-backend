import Joi from "joi";

const loginSchema = Joi.alternatives().conditional(
  Joi.object({ serverauth: Joi.exist() }).unknown(),
  {
    then: Joi.object({
      serverauth: Joi.string().required().messages({
        "string.base": '"serverauth" should be a type of "text"',
        "string.empty": '"serverauth" cannot be empty',
        "any.required": '"serverauth" is a required field',
      }),
      email: Joi.forbidden(),
      username: Joi.forbidden(),
      password: Joi.forbidden(),
    }),
    otherwise: Joi.object({
      serverauth: Joi.forbidden(),
      email: Joi.string().email().optional().messages({
        "string.base": '"email" should be a type of "text"',
        "string.empty": '"email" cannot be empty',
        "any.required": '"email" is a required field',
      }),
      username: Joi.string().optional().messages({
        "string.base": '"username" should be a type of "text"',
        "string.empty": '"username" cannot be empty',
        "any.required": '"username" is a required field',
      }),
      password: Joi.string()
        .min(8)
        .pattern(/.*[A-Z].*/, "uppercase letter") // At least 1 capital letter
        .pattern(/.*[!@#$%^&*(),.?":{}|<>].*/, "special character") // At least 1 special symbol
        .pattern(/\d/, "number") // At least 1 number
        .required()
        .messages({
          "string.base": '"password" should be a type of "text"',
          "string.empty": '"password" cannot be empty',
          "string.min":
            '"password" should have a minimum length of 8 characters',
          "string.pattern.base":
            '"password" must contain at least one uppercase letter, one special character, and one number',
          "any.required": '"password" is a required field',
        }),
    }).xor("email", "username"), // Either email or username, but not both
  }
);

const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.base": '"name" should be a type of "text"',
    "string.empty": '"name" cannot be empty',
    "string.min": '"name" should have a minimum length of 3 characters',
    "any.required": '"name" is a required field',
  }),
  email: Joi.string().email().required().messages({
    "string.base": '"email" should be a type of "text"',
    "string.empty": '"email" cannot be empty',
    "any.required": '"email" is a required field',
  }),
  username: Joi.string().min(3).required().messages({
    "string.base": '"username" should be a type of "text"',
    "string.empty": '"username" cannot be empty',
    "string.min": '"username" should have a minimum length of 3 characters',
    "any.required": '"username" is a required field',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/.*[A-Z].*/, "uppercase letter") // At least 1 capital letter
    .pattern(/.*[!@#$%^&*(),.?":{}|<>].*/, "special character") // At least 1 special symbol
    .pattern(/\d/, "number") // At least 1 number
    .required()
    .messages({
      "string.base": '"password" should be a type of "text"',
      "string.empty": '"password" cannot be empty',
      "string.min": '"password" should have a minimum length of 8 characters',
      "string.pattern.base":
        '"password" must contain at least one uppercase letter, one special character, and one number',
      "any.required": '"password" is a required field',
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": '"confirmPassword" must match "password"',
    "any.required": '"confirmPassword" is a required field',
  }),
});

const newEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": '"email" should be a type of "text"',
    "string.empty": '"email" cannot be empty',
    "string.email": '"email" must be a valid email',
    "any.required": '"email" is a required field',
  }),
});

const confirmationEmailSchema = Joi.object({
  otp: Joi.string().min(6).max(6).required().messages({
    "string.base": '"otp" should be a type of "text"',
    "string.empty": '"otp" cannot be empty',
    "string.min": '"otp" should have a minimum length of 6 characters',
    "string.max": '"otp" should have a maximum length of 6 characters',
    "any.required": '"otp" is a required field',
  }),
});

export { loginSchema, registerSchema, newEmailSchema, confirmationEmailSchema };
