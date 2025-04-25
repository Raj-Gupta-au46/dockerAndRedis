import { model, Model, Schema } from "mongoose";
import { USER_TYPE } from "../types";

const userSchema = new Schema<USER_TYPE, Model<USER_TYPE>>(
  {
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
  },
  {
    timestamps: true,
  }
);

const UserSchema = model<USER_TYPE, Model<USER_TYPE>>("User", userSchema);
// UserSchema.syncIndexes();
export default UserSchema;
