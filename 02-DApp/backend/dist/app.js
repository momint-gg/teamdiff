"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const statsController_1 = __importDefault(require("./controllers/statsController"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome to the  internal API!");
});
app.use("/stats", statsController_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map