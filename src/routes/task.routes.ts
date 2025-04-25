import { Router } from "express";
import { TaskController, TaskControllerValidator } from "../controllers";
import { ProtectedMiddleware, CacheMiddleware } from "../middleware";

export default class TaskRoutes {
  public router: Router;
  private taskController: TaskController;
  private cacheMiddleware: CacheMiddleware;
  public path = "tasks";

  constructor() {
    this.router = Router();
    this.taskController = new TaskController();
    this.cacheMiddleware = new CacheMiddleware();
    this.routes();
  }

  private routes() {
    // POST /tasks → Create a new task
    this.router.post(
      "/",
      new ProtectedMiddleware().protected,
      this.cacheMiddleware.clearCache, // Clear cache on creation
      TaskControllerValidator.createTask,
      this.taskController.createTask
    );

    // GET /tasks/:id → Get task details (cached for 5 minutes)
    this.router.get(
      "/:id",
      this.cacheMiddleware.cache(300), // Cache for 5 minutes (300 seconds)
      TaskControllerValidator.getTaskById,
      this.taskController.getTaskById
    );

    // GET /tasks → Get all tasks (with optional query filters, cached for 1 minute)
    this.router.get(
      "/",
      this.cacheMiddleware.cache(60), // Cache for 1 minute (60 seconds)
      TaskControllerValidator.getAllTasks,
      this.taskController.getAllTasks
    );

    // PUT /tasks/:id → Update task
    this.router.put(
      "/:id",
      new ProtectedMiddleware().protected,
      this.cacheMiddleware.clearCache, // Clear cache on update
      TaskControllerValidator.updateTask,
      this.taskController.updateTask
    );

    // DELETE /tasks/:id → Delete task
    this.router.delete(
      "/:id",
      new ProtectedMiddleware().isSuperAdmin,
      this.cacheMiddleware.clearCache, // Clear cache on delete
      TaskControllerValidator.deleteTask,
      this.taskController.deleteTask
    );
  }
}
