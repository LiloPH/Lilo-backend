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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
const not_found_1 = __importDefault(require("./middleware/not-found"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
require("express-async-errors");
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const db_url = process.env.DB_LOCAL_URI;
app.use(express_1.default.json());
app.use('/api/v1/auth', routes_1.authRoutes);
app.use(errorHandler_1.default);
app.use(not_found_1.default);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, utils_1.connectDB)(db_url);
    app.listen(port, () => {
        console.log(`Listening on port http://localhost:${port}/`);
    });
});
start();
