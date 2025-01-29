"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth-controller");
const joiValidation_1 = __importDefault(require("../middleware/joiValidation"));
const auth_validation_1 = require("../validation/auth-validation");
const router = express_1.default.Router();
router.post('/login', (0, joiValidation_1.default)(auth_validation_1.loginSchema), auth_controller_1.login);
router.post('/register', (0, joiValidation_1.default)(auth_validation_1.registerSchema), auth_controller_1.Register);
router.delete('/logout', auth_controller_1.Logout);
exports.default = router;
