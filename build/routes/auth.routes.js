"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
class AuthRoutes {
    constructor() {
        this.path = "auth";
        this.router = (0, express_1.Router)();
        this.authController = new controllers_1.AuthController();
        this.routes();
    }
    routes() {
        this.router.post("/signUp", controllers_1.AuthControllerValidator.register, this.authController.register);
        this.router.post("/signIn", controllers_1.AuthControllerValidator.login, this.authController.login);
        this.router.get("/self", new middleware_1.ProtectedMiddleware().protected, this.authController.self);
    }
}
exports.default = AuthRoutes;
