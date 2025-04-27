"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
class Database {
    constructor() {
        this.connect();
    }
    connect() {
        mongoose_1.default.set("strictQuery", true);
        mongoose_1.default
            .connect(config_1.connectionDB)
            .then(() => {
            console.log("Database connected");
        })
            .catch((err) => {
            console.log("Database connection error: ", err);
            process.exit(1);
        });
    }
}
exports.default = Database;
