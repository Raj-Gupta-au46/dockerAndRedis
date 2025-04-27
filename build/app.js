"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const redis_server_1 = __importDefault(require("./services/redis.server"));
class App {
    constructor() {
        new db_1.Database();
        this.app = (0, express_1.default)();
        this.initializeRedis();
    }
    initializeRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield redis_server_1.default.connect();
                process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
                    yield redis_server_1.default.disconnect();
                    process.exit(0);
                }));
            }
            catch (error) {
                console.error("Failed to initialize Redis:", error);
            }
        });
    }
    listen(appInt) {
        const options = {};
        const server = (0, http_1.createServer)(options, this.app);
        server.listen(appInt.port, () => {
            this.printRequests();
            const middleware = fs_1.default.readdirSync(path_1.default.join(__dirname, "/middleware"));
            this.middleware(middleware, "top.");
            this.routes();
            this.middleware(middleware, "bottom.");
            console.log(`App listening on port ${appInt.port}`);
        });
    }
    middleware(middleware, st) {
        middleware.forEach((middle) => {
            var _a;
            if (middle.includes(st)) {
                (_a = path_1.default.join(__dirname + "/middleware/" + middle), Promise.resolve().then(() => __importStar(require(_a)))).then((middleReader) => {
                    new middleReader.default(this.app);
                });
            }
        });
    }
    routes() {
        const subRoutes = fs_1.default.readdirSync(path_1.default.join(__dirname, "/routes"));
        console.log("subRoutes", subRoutes);
        subRoutes.forEach((file) => {
            var _a;
            if (file.includes(".routes.")) {
                (_a = path_1.default.join(__dirname + "/routes/" + file), Promise.resolve().then(() => __importStar(require(_a)))).then((route) => {
                    const rootPath = `/api/v1/${new route.default().path}`;
                    this.app.use(rootPath, new route.default().router);
                });
            }
        });
    }
    printRequests() {
        this.app.use((req, res, next) => {
            console.table({
                METHOD: req.method,
                PATH: req.path,
                ip: req.ip,
                BROWSER: req.headers["user-agent"] || "Unknown Browser",
                TIME: new Date().toISOString(),
            });
            next();
        });
    }
}
exports.default = App;
