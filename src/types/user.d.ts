import { Document } from "mongoose";

export type ROLE = "USER" | "SUPER-ADMIN";

export default interface USER_TYPE extends Document {
  role: ROLE;
  name: string;
  email: string;
  password: string;
}
