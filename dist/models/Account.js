"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Invalid Email",
        ],
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        match: [
            /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/,
            'Password must be at least 8 characters, contain at least one uppercase letter, one special symbol, and one number.',
        ],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    picture: {
        type: String,
    },
});
exports.default = mongoose_1.default.model("Account", accountSchema);
