"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldValidateError = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = require("http-errors");
const fieldValidateError = (req) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new http_errors_1.BadRequest(errors
            .array()
            .map((errors) => errors.msg)
            .join()
            .replace(/[,]/g, " and "));
    }
};
exports.fieldValidateError = fieldValidateError;
