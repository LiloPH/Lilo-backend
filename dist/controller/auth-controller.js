"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logout = exports.Register = exports.login = void 0;
const errors_1 = require("../errors");
const models_1 = require("../models");
const utils_1 = require("../utils");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, serverauth } = req.body;
    if (serverauth) {
        const payload = yield (0, utils_1.validateServerAuth)(serverauth);
        if (!payload) {
            throw new errors_1.BadRequest("Invalid Credentials");
        }
        const account = yield models_1.Account.findOne({ email: payload.email });
        if (!account) {
            const newAccount = yield models_1.Account.create({ name: payload.name, email: payload.email, picture: payload.picture });
            return res.json({ email: newAccount.email, username: newAccount.username, name: newAccount.name });
        }
        return res.json({ email: account === null || account === void 0 ? void 0 : account.email, username: account === null || account === void 0 ? void 0 : account.username, name: account === null || account === void 0 ? void 0 : account.name });
    }
    let query = {};
    if (email) {
        query = { email };
    }
    if (username) {
        query = { username };
    }
    const account = yield models_1.Account.findOne(query);
    if (!account) {
        throw new errors_1.BadRequest("Account not found");
    }
    res.json({ email, username });
});
exports.login = login;
const Register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("Register route");
});
exports.Register = Register;
const Logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("Logout route");
});
exports.Logout = Logout;
