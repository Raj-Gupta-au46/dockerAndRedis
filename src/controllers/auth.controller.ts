import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequest,
  Conflict,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "http-errors";
import { fieldValidateError } from "../helper";

import { UserSchema } from "../models";
import { EmailService, JwtService, PasswordHasServices } from "../services";
import { MIDDLEWARE_REQUEST_TYPE } from "../types";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        email,

        password,

        // country: { code, label, phone },
      } = req?.body;

      fieldValidateError(req);

      // if (password !== confirmPassword)
      //   throw new Conflict("password and confirmPassword should be same");
      const role1 = "USER";

      const checkDuplicateUser = await UserSchema.findOne({
        email,
        role: role1,
      });

      if (checkDuplicateUser) throw new Conflict("This email is already exit");

      const hashPassword = await new PasswordHasServices().hash(password);

      const emailVerificationToken = crypto.randomBytes(20).toString("hex");

      // Get the current timestamp using Date.now()
      // const timestamp = Date.now();

      const userData = {
        role: role1,
        name,
        email,

        password: hashPassword,
      };

      const registerUser = await UserSchema.create(userData);

      if (!registerUser)
        throw new InternalServerError("Something wrong, user not created.");

      res.json({
        status: "SUCCESS",
        success: {
          message: `You are register successfully as ${role1}. Check your EMAIL to verify your account.`,
          data: { ...registerUser, password: undefined },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      // console.log("email", email, "password", password);
      fieldValidateError(req);
      let user = await UserSchema.findOne({ email }).select(
        "password isVerified status isBlocked role"
      );
      // console.log(user);

      if (!user) throw new NotFound("User not found !");

      const isPasswordMatch = user.password
        ? await new PasswordHasServices().compare(password, user.password)
        : undefined;

      // console.log(isPasswordMatch);

      if (!isPasswordMatch) throw new NotFound("Password is incorrect");

      const token = await new JwtService().accessTokenGenerator(
        JSON.stringify({
          userId: user._id,
          role: user.role,
        })
      );
      // console.log("token", token);

      if (!token) throw new Unauthorized("Token generate failed.");

      const userData = await UserSchema.findOne({ email }).select("name email");

      user.password = "";
      res.json({
        status: "SUCCESS",
        message: `LOGIN SUCCESSFULLY`,
        data: {
          token,
          user,
          userData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async self(req: MIDDLEWARE_REQUEST_TYPE, res: Response, next: NextFunction) {
    try {
      const userId = req?.payload?.userId;
      const findUserData = await UserSchema.findOne({ _id: userId }).select(
        "-password -__v "
      );

      res.json({
        status: "SUCCESS",

        data: findUserData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const AuthControllerValidator = {
  register: [
    body("name")
      .not()
      .isEmpty()
      .withMessage("name is required")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long.")
      .isLength({ max: 50 })
      .withMessage("Name must be at most 50 characters long."),
    body("email")
      .not()
      .isEmpty()
      .withMessage("email, is required")
      .isEmail()
      .withMessage("Invalid mail id")
      .normalizeEmail()
      .isLength({ min: 3 })
      .withMessage("email must be at least 3 characters long.")
      .isLength({ max: 50 })
      .withMessage("email must be at most 50 characters long."),
    body("password")
      .not()
      .isEmpty()
      .withMessage("password is required")
      .isLength({ min: 3 })
      .withMessage("password must be at least 3 characters long.")
      .isLength({ max: 50 })
      .withMessage("password must be at most 50 characters long."),
  ],

  login: [
    body("password").not().isEmpty().withMessage("password is required."),
    body("email")
      .not()
      .isEmpty()
      .withMessage("email is required.")
      .isEmail()
      .withMessage("email is not valid."),
  ],
};

export default AuthController;
