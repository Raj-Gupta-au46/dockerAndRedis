"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
class TaskRoutes {
    constructor() {
        this.path = "tasks";
        this.router = (0, express_1.Router)();
        this.taskController = new controllers_1.TaskController();
        this.cacheMiddleware = new middleware_1.CacheMiddleware();
        this.routes();
    }
    routes() {
        this.router.post("/create", new middleware_1.ProtectedMiddleware().protected, this.cacheMiddleware.clearCache, controllers_1.TaskControllerValidator.createTask, this.taskController.createTask);
        this.router.get("/:id", this.cacheMiddleware.cache(300), controllers_1.TaskControllerValidator.getTaskById, this.taskController.getTaskById);
        this.router.get("/", this.cacheMiddleware.cache(60), controllers_1.TaskControllerValidator.getAllTasks, this.taskController.getAllTasks);
        this.router.put("/:id", new middleware_1.ProtectedMiddleware().protected, this.cacheMiddleware.clearCache, controllers_1.TaskControllerValidator.updateTask, this.taskController.updateTask);
        this.router.delete("/:id", new middleware_1.ProtectedMiddleware().isSuperAdmin, this.cacheMiddleware.clearCache, controllers_1.TaskControllerValidator.deleteTask, this.taskController.deleteTask);
    }
}
exports.default = TaskRoutes;
