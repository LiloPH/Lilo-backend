"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServerAuth = exports.connectDB = void 0;
const connectDb_1 = __importDefault(require("./connectDb"));
exports.connectDB = connectDb_1.default;
const validateServerAuth_1 = __importDefault(require("./validateServerAuth"));
exports.validateServerAuth = validateServerAuth_1.default;
