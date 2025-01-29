"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.alternatives().conditional(joi_1.default.object({ serverauth: joi_1.default.exist() }).unknown(), {
    then: joi_1.default.object({
        serverauth: joi_1.default.string().required().messages({
            'string.base': '"serverauth" should be a type of "text"',
            'string.empty': '"serverauth" cannot be empty',
            'any.required': '"serverauth" is a required field',
        }),
        email: joi_1.default.forbidden(),
        username: joi_1.default.forbidden(),
        password: joi_1.default.forbidden(),
    }),
    otherwise: joi_1.default.object({
        serverauth: joi_1.default.forbidden(),
        email: joi_1.default.string().email().optional().messages({
            'string.base': '"email" should be a type of "text"',
            'string.empty': '"email" cannot be empty',
            'any.required': '"email" is a required field',
        }),
        username: joi_1.default.string().optional().messages({
            'string.base': '"username" should be a type of "text"',
            'string.empty': '"username" cannot be empty',
            'any.required': '"username" is a required field',
        }),
        password: joi_1.default.string()
            .min(8)
            .pattern(/.*[A-Z].*/, 'uppercase letter') // At least 1 capital letter
            .pattern(/.*[!@#$%^&*(),.?":{}|<>].*/, 'special character') // At least 1 special symbol
            .pattern(/\d/, 'number') // At least 1 number
            .required()
            .messages({
            'string.base': '"password" should be a type of "text"',
            'string.empty': '"password" cannot be empty',
            'string.min': '"password" should have a minimum length of 8 characters',
            'string.pattern.base': '"password" must contain at least one uppercase letter, one special character, and one number',
            'any.required': '"password" is a required field',
        }),
    }).xor('email', 'username'), // Either email or username, but not both
});
exports.loginSchema = loginSchema;
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        'string.base': '"name" should be a type of "text"',
        'string.empty': '"name" cannot be empty',
        'string.min': '"name" should have a minimum length of 3 characters',
        'any.required': '"name" is a required field',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.base': '"email" should be a type of "text"',
        'string.empty': '"email" cannot be empty',
        'any.required': '"email" is a required field',
    }),
    username: joi_1.default.string().min(3).required().messages({
        'string.base': '"username" should be a type of "text"',
        'string.empty': '"username" cannot be empty',
        'string.min': '"username" should have a minimum length of 3 characters',
        'any.required': '"username" is a required field',
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(/.*[A-Z].*/, 'uppercase letter') // At least 1 capital letter
        .pattern(/.*[!@#$%^&*(),.?":{}|<>].*/, 'special character') // At least 1 special symbol
        .pattern(/\d/, 'number') // At least 1 number
        .required()
        .messages({
        'string.base': '"password" should be a type of "text"',
        'string.empty': '"password" cannot be empty',
        'string.min': '"password" should have a minimum length of 8 characters',
        'string.pattern.base': '"password" must contain at least one uppercase letter, one special character, and one number',
        'any.required': '"password" is a required field',
    }),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref('password'))
        .required()
        .messages({
        'any.only': '"confirmPassword" must match "password"',
        'any.required': '"confirmPassword" is a required field',
    }),
});
exports.registerSchema = registerSchema;
