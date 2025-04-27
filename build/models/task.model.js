"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
    },
    status: {
        type: String,
        enum: {
            values: ["IN-PROGRESS", "DONE"],
            message: "{VALUE} is not supported",
        },
        default: "IN-PROGRESS",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    deuDate: {
        type: Date,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const TaskSchema = (0, mongoose_1.model)("Task", taskSchema);
exports.default = TaskSchema;
