"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = exports.UserSchema = void 0;
var user_model_1 = require("./user.model");
Object.defineProperty(exports, "UserSchema", { enumerable: true, get: function () { return __importDefault(user_model_1).default; } });
var task_model_1 = require("./task.model");
Object.defineProperty(exports, "TaskSchema", { enumerable: true, get: function () { return __importDefault(task_model_1).default; } });
