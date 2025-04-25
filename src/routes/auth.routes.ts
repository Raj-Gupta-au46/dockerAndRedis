import { Router } from "express";
import { AuthController, AuthControllerValidator } from "../controllers";
import { ProtectedMiddleware } from "../middleware";

export default class AuthRoutes {
  public router: Router;
  private authController: AuthController;
  public path = "auth";

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/signUp",
      AuthControllerValidator.register,
      this.authController.register
    );

    this.router.post(
      "/signIn",
      AuthControllerValidator.login,
      this.authController.login
    );

    this.router.get(
      "/self",
      new ProtectedMiddleware().protected,
      this.authController.self
    );
  }
}
