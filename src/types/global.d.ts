import { Request } from "express";
import { ROLE } from "./user";

export interface MIDDLEWARE_REQUEST_TYPE extends Request {
  payload?: {
    role: ROLE;
    status: "ACTIVE" | "BLOCK";
    userId: string;
  };
}



export interface AuthRequest extends Request {
  currentUser?: MIDDLEWARE_REQUEST_TYPE;
  subscribeData?: SubscriptionDataType;
}
