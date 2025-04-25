import { Document } from "mongoose";
import USER_TYPE from "./user";

export default interface TASK_TYPE extends Document {
  title: string;
  description: string;
  status: "IN-PROGRESS" | "DONE";
  userId: USER_TYPE;
  deuDate: Date;
  assignedTo: USER_TYPE;
  isDeleted: boolean;
}
