import { Router } from "express";
import { TaskController, TaskControllerValidator } from "../controllers";
import { ProtectedMiddleware } from "../middleware";

export default class TaskRoutes {
  public router: Router;
  private taskController: TaskController;
  public path = "tasks";

  constructor() {
    this.router = Router();
    this.taskController = new TaskController();
    this.routes();
  }

  private routes() {
    // POST /tasks → Create a new task
    this.router.post(
      "/",
      new ProtectedMiddleware().protected,
      TaskControllerValidator.createTask,
      this.taskController.createTask
    );

    // GET /tasks/:id → Get task details
    this.router.get(
      "/:id",
      TaskControllerValidator.getTaskById,
      this.taskController.getTaskById
    );

    // GET /tasks → Get all tasks (with optional query filters)
    this.router.get(
      "/",
      TaskControllerValidator.getAllTasks,
      this.taskController.getAllTasks
    );

    // PUT /tasks/:id → Update task
    this.router.put(
      "/:id",
      new ProtectedMiddleware().protected,
      TaskControllerValidator.updateTask,
      this.taskController.updateTask
    );

    // DELETE /tasks/:id → Delete task
    this.router.delete(
      "/:id",
      new ProtectedMiddleware().isSuperAdmin,
      TaskControllerValidator.deleteTask,
      this.taskController.deleteTask
    );
  }
}
