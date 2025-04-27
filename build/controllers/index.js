"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskControllerValidator = exports.TaskController = exports.AuthControllerValidator = exports.AuthController = void 0;
var auth_controller_1 = require("./auth.controller");
Object.defineProperty(exports, "AuthController", { enumerable: true, get: function () { return __importDefault(auth_controller_1).default; } });
Object.defineProperty(exports, "AuthControllerValidator", { enumerable: true, get: function () { return auth_controller_1.AuthControllerValidator; } });
var task_controller_1 = require("./task.controller");
Object.defineProperty(exports, "TaskController", { enumerable: true, get: function () { return __importDefault(task_controller_1).default; } });
Object.defineProperty(exports, "TaskControllerValidator", { enumerable: true, get: function () { return task_controller_1.TaskControllerValidator; } });
