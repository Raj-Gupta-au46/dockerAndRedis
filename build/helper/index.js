"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_INDENTS = exports.aggregationHelper = exports.sortTextCondition = exports.getData = exports.aggregationData = exports.fieldValidateError = void 0;
var fieldValidation_helper_1 = require("./fieldValidation.helper");
Object.defineProperty(exports, "fieldValidateError", { enumerable: true, get: function () { return fieldValidation_helper_1.fieldValidateError; } });
var paginationGetData_helper_1 = require("./paginationGetData.helper");
Object.defineProperty(exports, "aggregationData", { enumerable: true, get: function () { return paginationGetData_helper_1.aggregationData; } });
Object.defineProperty(exports, "getData", { enumerable: true, get: function () { return __importDefault(paginationGetData_helper_1).default; } });
var sortCondition_helper_1 = require("./sortCondition.helper");
Object.defineProperty(exports, "sortTextCondition", { enumerable: true, get: function () { return sortCondition_helper_1.sortTextCondition; } });
var aggPagination_helper_1 = require("./aggPagination.helper");
Object.defineProperty(exports, "aggregationHelper", { enumerable: true, get: function () { return aggPagination_helper_1.aggregationHelper; } });
exports.FILE_INDENTS = [
    "WEBM",
    "MKV",
    "AVCHD",
    "AVI",
    "WMV",
    "MOV",
    "MP4",
];
