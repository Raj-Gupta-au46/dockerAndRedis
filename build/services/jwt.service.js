"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const accessSecretString = config_1.accessSecret;
class JwtService {
    accessTokenGenerator(userDetails) {
        return new Promise((resolve, reject) => {
            const payload = {
                name: "Your trust.",
                iss: "pmay.com",
            };
            jsonwebtoken_1.default.sign(payload, accessSecretString, {
                audience: userDetails,
            }, (err, token) => {
                if (err)
                    return reject(err);
                return resolve(token);
            });
        });
    }
    accessTokenVerify(token) {
        return jsonwebtoken_1.default.verify(token, accessSecretString, (err, payload) => {
            if (err)
                return {
                    error: err,
                };
            return payload;
        });
    }
}
exports.default = JwtService;
