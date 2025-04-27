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
exports.TaskControllerValidator = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = require("http-errors");
const mongoose_1 = require("mongoose");
const helper_1 = require("../helper");
const models_1 = require("../models");
class TaskController {
    createTask(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, status, deuDate, assignedTo } = req.body;
                const userId = (_a = req === null || req === void 0 ? void 0 : req.payload) === null || _a === void 0 ? void 0 : _a.userId;
                (0, helper_1.fieldValidateError)(req);
                const taskData = {
                    title,
                    description,
                    status,
                    userId,
                    deuDate: deuDate ? new Date(deuDate) : undefined,
                    assignedTo,
                };
                const newTask = yield models_1.TaskSchema.create(taskData);
                if (!newTask)
                    throw new http_errors_1.InternalServerError("Something went wrong, task not created.");
                res.status(201).json({
                    status: "SUCCESS",
                    success: {
                        message: "Task created successfully",
                        data: newTask,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTaskById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                (0, helper_1.fieldValidateError)(req);
                if (!(0, mongoose_1.isValidObjectId)(id)) {
                    throw new http_errors_1.BadRequest("Invalid task ID format");
                }
                const task = yield models_1.TaskSchema.findOne({ _id: id, isDeleted: false })
                    .populate("userId", "name email")
                    .populate("assignedTo", "name email");
                if (!task)
                    throw new http_errors_1.NotFound("Task not found");
                res.status(200).json({
                    status: "SUCCESS",
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllTasks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, dueDate, userId } = req.query;
                const filter = { isDeleted: false };
                (0, helper_1.fieldValidateError)(req);
                if (status) {
                    filter.status = status;
                }
                if (dueDate) {
                    filter.deuDate = { $lte: new Date(dueDate) };
                }
                if (userId && (0, mongoose_1.isValidObjectId)(userId)) {
                    filter.userId = userId;
                }
                const tasks = yield models_1.TaskSchema.find(filter)
                    .populate("userId", "name email")
                    .populate("assignedTo", "name email")
                    .sort({ createdAt: -1 });
                res.status(200).json({
                    status: "SUCCESS",
                    data: tasks,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                (0, helper_1.fieldValidateError)(req);
                if (!(0, mongoose_1.isValidObjectId)(id)) {
                    throw new http_errors_1.BadRequest("Invalid task ID format");
                }
                if (updateData.deuDate) {
                    updateData.deuDate = new Date(updateData.deuDate);
                }
                const task = yield models_1.TaskSchema.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true });
                if (!task)
                    throw new http_errors_1.NotFound("Task not found");
                res.status(200).json({
                    status: "SUCCESS",
                    message: "Task updated successfully",
                    data: task,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                (0, helper_1.fieldValidateError)(req);
                if (!(0, mongoose_1.isValidObjectId)(id)) {
                    throw new http_errors_1.BadRequest("Invalid task ID format");
                }
                const task = yield models_1.TaskSchema.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
                if (!task)
                    throw new http_errors_1.NotFound("Task not found");
                res.status(200).json({
                    status: "SUCCESS",
                    message: "Task deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.TaskControllerValidator = {
    createTask: [
        (0, express_validator_1.body)("title")
            .not()
            .isEmpty()
            .withMessage("Title is required")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Title must be at least 3 characters long.")
            .isLength({ max: 100 })
            .withMessage("Title must be at most 100 characters long."),
        (0, express_validator_1.body)("description")
            .not()
            .isEmpty()
            .withMessage("Description is required")
            .trim()
            .isLength({ min: 5 })
            .withMessage("Description must be at least 5 characters long."),
        (0, express_validator_1.body)("status")
            .optional()
            .isIn(["IN-PROGRESS", "DONE"])
            .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
        (0, express_validator_1.body)("deuDate")
            .optional()
            .isISO8601()
            .withMessage("Due date must be a valid date format"),
        (0, express_validator_1.body)("assignedTo")
            .optional()
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid assignedTo user ID");
            }
            return true;
        }),
    ],
    getTaskById: [
        (0, express_validator_1.param)("id")
            .not()
            .isEmpty()
            .withMessage("Task ID is required")
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid task ID format");
            }
            return true;
        }),
    ],
    getAllTasks: [
        (0, express_validator_1.query)("status")
            .optional()
            .isIn(["IN-PROGRESS", "DONE"])
            .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
        (0, express_validator_1.query)("dueDate")
            .optional()
            .isISO8601()
            .withMessage("Due date must be a valid date format"),
        (0, express_validator_1.query)("userId")
            .optional()
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid user ID format");
            }
            return true;
        }),
    ],
    updateTask: [
        (0, express_validator_1.param)("id")
            .not()
            .isEmpty()
            .withMessage("Task ID is required")
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid task ID format");
            }
            return true;
        }),
        (0, express_validator_1.body)("title")
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage("Title must be at least 3 characters long.")
            .isLength({ max: 100 })
            .withMessage("Title must be at most 100 characters long."),
        (0, express_validator_1.body)("description")
            .optional()
            .trim()
            .isLength({ min: 5 })
            .withMessage("Description must be at least 5 characters long."),
        (0, express_validator_1.body)("status")
            .optional()
            .isIn(["IN-PROGRESS", "DONE"])
            .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
        (0, express_validator_1.body)("deuDate")
            .optional()
            .isISO8601()
            .withMessage("Due date must be a valid date format"),
        (0, express_validator_1.body)("assignedTo")
            .optional()
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid assignedTo user ID");
            }
            return true;
        }),
    ],
    deleteTask: [
        (0, express_validator_1.param)("id")
            .not()
            .isEmpty()
            .withMessage("Task ID is required")
            .custom((value) => {
            if (!(0, mongoose_1.isValidObjectId)(value)) {
                throw new Error("Invalid task ID format");
            }
            return true;
        }),
    ],
};
exports.default = TaskController;
