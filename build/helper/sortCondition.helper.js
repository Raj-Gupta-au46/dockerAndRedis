"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortTextCondition = void 0;
const http_errors_1 = require("http-errors");
const conditionArray = ["A-Z", "Z-A"];
const sortTextCondition = (title, sortFormat) => {
    try {
        if (!conditionArray.includes(sortFormat.toUpperCase()))
            throw new http_errors_1.BadRequest("Invalid sort text format");
        const makeUpperCase = sortFormat.toUpperCase();
        return {
            [title]: makeUpperCase === "A-Z" ? 1 : -1,
        };
    }
    catch (error) {
        return error;
    }
};
exports.sortTextCondition = sortTextCondition;
