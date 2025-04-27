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
exports.AuthControllerValidator = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = require("http-errors");
const helper_1 = require("../helper");
const models_1 = require("../models");
const services_1 = require("../services");
class AuthController {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req === null || req === void 0 ? void 0 : req.body;
                (0, helper_1.fieldValidateError)(req);
                const checkDuplicateUser = yield models_1.UserSchema.findOne({
                    email,
                });
                if (checkDuplicateUser)
                    throw new http_errors_1.Conflict("This email is already exit");
                const hashPassword = yield new services_1.PasswordHasServices().hash(password);
                const userData = {
                    role: "SUPER-ADMIN",
                    name,
                    email,
                    password: hashPassword,
                };
                const registerUser = yield models_1.UserSchema.create(userData);
                if (!registerUser)
                    throw new http_errors_1.InternalServerError("Something wrong, user not created.");
                const userResponse = registerUser.toObject();
                res.json({
                    status: "SUCCESS",
                    success: {
                        message: `You are register successfully `,
                        data: userResponse,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                (0, helper_1.fieldValidateError)(req);
                let user = yield models_1.UserSchema.findOne({ email }).select("password isVerified status isBlocked role");
                if (!user)
                    throw new http_errors_1.NotFound("User not found !");
                const isPasswordMatch = user.password
                    ? yield new services_1.PasswordHasServices().compare(password, user.password)
                    : undefined;
                if (!isPasswordMatch)
                    throw new http_errors_1.NotFound("Password is incorrect");
                const token = yield new services_1.JwtService().accessTokenGenerator(JSON.stringify({
                    userId: user._id,
                    role: user.role,
                }));
                if (!token)
                    throw new http_errors_1.Unauthorized("Token generate failed.");
                const userData = yield models_1.UserSchema.findOne({ email }).select("name email");
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
            }
            catch (error) {
                next(error);
            }
        });
    }
    self(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (_a = req === null || req === void 0 ? void 0 : req.payload) === null || _a === void 0 ? void 0 : _a.userId;
                const findUserData = yield models_1.UserSchema.findOne({ _id: userId }).select("-password -__v ");
                res.json({
                    status: "SUCCESS",
                    data: findUserData,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthControllerValidator = {
    register: [
        (0, express_validator_1.body)("name")
            .not()
            .isEmpty()
            .withMessage("name is required")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long.")
            .isLength({ max: 50 })
            .withMessage("Name must be at most 50 characters long."),
        (0, express_validator_1.body)("email")
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
        (0, express_validator_1.body)("password")
            .not()
            .isEmpty()
            .withMessage("password is required")
            .isLength({ min: 3 })
            .withMessage("password must be at least 3 characters long.")
            .isLength({ max: 50 })
            .withMessage("password must be at most 50 characters long."),
    ],
    login: [
        (0, express_validator_1.body)("password").not().isEmpty().withMessage("password is required."),
        (0, express_validator_1.body)("email")
            .not()
            .isEmpty()
            .withMessage("email is required.")
            .isEmail()
            .withMessage("email is not valid."),
    ],
};
exports.default = AuthController;
