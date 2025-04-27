"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
class TopMiddleware {
    constructor(app) {
        app.use(express_1.default.json());
        app.use((0, express_fileupload_1.default)());
        console.log(path_1.default.join(__dirname, "../../uploaded-files"));
        app.use(express_1.default.static(path_1.default.join(__dirname, "../../uploaded-files")));
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use(this.allowCrossDomain);
        app.use(this.cacheClear);
        app.use((0, express_session_1.default)({
            secret: "your-secret-key",
            resave: false,
            saveUninitialized: false,
        }));
        app.use((0, cookie_parser_1.default)());
    }
    allowCrossDomain(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization");
        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
            return res.status(200).json({});
        }
        next();
    }
    cacheClear(req, res, next) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", "0");
        next();
    }
}
exports.default = TopMiddleware;
