"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const db = mysql_1.default.createPool({
    "connectionLimit": 10,
    "host": process.env.DB_HOST,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": "placeholder"
});
exports.default = db;
//# sourceMappingURL=db.js.map