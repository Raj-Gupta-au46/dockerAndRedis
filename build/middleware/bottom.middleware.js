"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
class BottomMiddleware {
    constructor(app) {
        app.use(this.routeNotFoundErrorHandler);
        app.use(this.fromRouteErrorHandler);
    }
    routeNotFoundErrorHandler(req, res, next) {
        next(new http_errors_1.NotFound("No route found, Please check your urls----."));
    }
    fromRouteErrorHandler(err, req, res, next) {
        var _a, _b;
        console.log({ err });
        res.status(err.status || 500);
        const errorMessage = err.errors
            ? Object.entries(err.errors)
                .map((error) => error[1].message)
                .join()
            : ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes("duplicate"))
                ? `${Object.entries(err.keyValue)[0][0]
                    .toString()
                    .split(/(?=[A-Z])/)
                    .join(" ")
                    .split(".")
                    .join(" ")
                    .replace(/^\w/, (c) => c.toUpperCase())} is already exist!`
                : (err === null || err === void 0 ? void 0 : err.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.description) || "Something went wrong";
        res.json({
            error: {
                message: errorMessage,
            },
        });
    }
}
exports.default = BottomMiddleware;
