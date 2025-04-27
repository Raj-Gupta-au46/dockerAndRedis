"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const app = new app_1.default();
console.log("redis: ", process.env.REDIS_URL);
app.listen({
    topMiddleware: [],
    bottomMiddleware: [],
    port: config_1.port,
});
