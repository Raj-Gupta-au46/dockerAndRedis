"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: {
            values: ["USER", "SUPER-ADMIN"],
        },
        default: "USER",
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
}, {
    timestamps: true,
});
const UserSchema = (0, mongoose_1.model)("User", userSchema);
exports.default = UserSchema;
