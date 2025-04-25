import { NextFunction, Request, Response } from "express";
import { body, param, query } from "express-validator";
import { BadRequest, InternalServerError, NotFound } from "http-errors";
import { isValidObjectId } from "mongoose";
import { fieldValidateError } from "../helper";
import { TaskSchema } from "../models";
import { MIDDLEWARE_REQUEST_TYPE } from "../types";

class TaskController {
  async createTask(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { title, description, status, deuDate, assignedTo } = req.body;
      const userId = req?.payload?.userId;

      fieldValidateError(req);

      const taskData = {
        title,
        description,
        status,
        userId,
        deuDate: deuDate ? new Date(deuDate) : undefined,
        assignedTo,
      };

      const newTask = await TaskSchema.create(taskData);

      if (!newTask)
        throw new InternalServerError(
          "Something went wrong, task not created."
        );

      res.status(201).json({
        status: "SUCCESS",
        success: {
          message: "Task created successfully",
          data: newTask,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      fieldValidateError(req);

      if (!isValidObjectId(id)) {
        throw new BadRequest("Invalid task ID format");
      }

      const task = await TaskSchema.findOne({ _id: id, isDeleted: false })
        .populate("userId", "name email")
        .populate("assignedTo", "name email");

      if (!task) throw new NotFound("Task not found");

      res.status(200).json({
        status: "SUCCESS",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, dueDate, userId } = req.query;
      const filter: any = { isDeleted: false };

      fieldValidateError(req);

      if (status) {
        filter.status = status;
      }

      if (dueDate) {
        filter.deuDate = { $lte: new Date(dueDate as string) };
      }

      if (userId && isValidObjectId(userId)) {
        filter.userId = userId;
      }

      const tasks = await TaskSchema.find(filter)
        .populate("userId", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: "SUCCESS",
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      fieldValidateError(req);

      if (!isValidObjectId(id)) {
        throw new BadRequest("Invalid task ID format");
      }

      // Convert date string to Date object if present
      if (updateData.deuDate) {
        updateData.deuDate = new Date(updateData.deuDate);
      }

      const task = await TaskSchema.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
      );

      if (!task) throw new NotFound("Task not found");

      res.status(200).json({
        status: "SUCCESS",
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      fieldValidateError(req);

      if (!isValidObjectId(id)) {
        throw new BadRequest("Invalid task ID format");
      }

      const task = await TaskSchema.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      if (!task) throw new NotFound("Task not found");

      res.status(200).json({
        status: "SUCCESS",
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const TaskControllerValidator = {
  createTask: [
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long.")
      .isLength({ max: 100 })
      .withMessage("Title must be at most 100 characters long."),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Description is required")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long."),
    body("status")
      .optional()
      .isIn(["IN-PROGRESS", "DONE"])
      .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
    body("deuDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date format"),
    body("assignedTo")
      .optional()
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid assignedTo user ID");
        }
        return true;
      }),
  ],

  getTaskById: [
    param("id")
      .not()
      .isEmpty()
      .withMessage("Task ID is required")
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid task ID format");
        }
        return true;
      }),
  ],

  getAllTasks: [
    query("status")
      .optional()
      .isIn(["IN-PROGRESS", "DONE"])
      .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
    query("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date format"),
    query("userId")
      .optional()
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid user ID format");
        }
        return true;
      }),
  ],

  updateTask: [
    param("id")
      .not()
      .isEmpty()
      .withMessage("Task ID is required")
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid task ID format");
        }
        return true;
      }),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long.")
      .isLength({ max: 100 })
      .withMessage("Title must be at most 100 characters long."),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long."),
    body("status")
      .optional()
      .isIn(["IN-PROGRESS", "DONE"])
      .withMessage("Status must be either 'IN-PROGRESS' or 'DONE'"),
    body("deuDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date format"),
    body("assignedTo")
      .optional()
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid assignedTo user ID");
        }
        return true;
      }),
  ],

  deleteTask: [
    param("id")
      .not()
      .isEmpty()
      .withMessage("Task ID is required")
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error("Invalid task ID format");
        }
        return true;
      }),
  ],
};

export default TaskController;
