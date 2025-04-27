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
const redis_1 = require("redis");
class RedisService {
    constructor() {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        this.client = (0, redis_1.createClient)({ url: redisUrl });
        this.client.on("error", (err) => console.error("Redis Client Error:", err));
        this.client.on("connect", () => console.log("Redis connecting..."));
        this.client.on("ready", () => console.log("Redis connected!"));
        this.client.on("reconnecting", () => console.log("Redis reconnecting..."));
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen)
                return;
            yield this.client.connect();
        });
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stringValue = JSON.stringify(value);
                if (ttl) {
                    yield this.client.setEx(key, ttl, stringValue);
                }
                else {
                    yield this.client.set(key, stringValue);
                }
            }
            catch (error) {
                console.error("Redis set error:", error);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield this.client.get(key);
                return value ? JSON.parse(value) : null;
            }
            catch (error) {
                console.error("Redis get error:", error);
                return null;
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(key);
            }
            catch (error) {
                console.error("Redis del error:", error);
            }
        });
    }
    clearPattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield this.client.keys(pattern);
                if (keys.length) {
                    yield this.client.del(keys);
                }
            }
            catch (error) {
                console.error("Redis clearPattern error:", error);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen)
                return;
            yield this.client.quit();
        });
    }
}
exports.default = RedisService.getInstance();
