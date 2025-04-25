import { model, Model, Schema } from "mongoose";
import { TASK_TYPE } from "../types";

const taskSchema = new Schema<TASK_TYPE, Model<TASK_TYPE>>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deuDate: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const TaskSchema = model<TASK_TYPE, Model<TASK_TYPE>>("Task", taskSchema);

export default TaskSchema;
