import express from 'express';
import { login, Register, Logout } from '../controller/auth-controller';
import joiValidaiton from '../middleware/joiValidation';
import { loginSchema, registerSchema } from '../validation/auth-validation';
const router = express.Router();

router.post('/login', joiValidaiton(loginSchema), login);
router.post('/register', joiValidaiton(registerSchema), Register);
router.delete('/logout', Logout);

export default router
