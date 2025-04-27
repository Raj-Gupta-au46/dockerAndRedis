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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_server_1 = __importDefault(require("../services/redis.server"));
class CacheMiddleware {
    constructor() {
        this.cache = (duration) => {
            return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                if (req.method !== "GET")
                    return next();
                const key = `cache:${req.originalUrl}`;
                try {
                    const cachedData = yield redis_server_1.default.get(key);
                    if (cachedData) {
                        console.log("Serving from cache");
                        return res.status(200).json({
                            status: "SUCCESS",
                            fromCache: true,
                            data: cachedData,
                        });
                    }
                    const originalJson = res.json;
                    res.json = (body) => {
                        redis_server_1.default.set(key, body, duration).catch((err) => console.error("Cache set error:", err));
                        return originalJson.call(res, body);
                    };
                    next();
                }
                catch (error) {
                    console.error("Cache middleware error:", error);
                    next();
                }
            });
        };
        this.clearCache = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
                try {
                    yield redis_server_1.default.clearPattern("cache:*");
                    console.log("Cache cleared due to data modification");
                }
                catch (error) {
                    console.error("Cache clear error:", error);
                }
            }
            next();
        });
    }
}
exports.default = CacheMiddleware;
