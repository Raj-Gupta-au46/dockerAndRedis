import { NextFunction, Response } from "express";
import { Locked, Unauthorized } from "http-errors";
import { UserSchema } from "../models";
import { JwtService } from "../services";
import { MIDDLEWARE_REQUEST_TYPE } from "../types";

export default class ProtectedMiddleware extends JwtService {
  public async protected(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers["authorization"]) throw new Unauthorized("Unauthorized");
      const token = req?.headers?.["authorization"].split(" ")[1];
      if (!token) throw new Unauthorized("Unauthorized");
      const payload = super.accessTokenVerify(token);

      if (!payload?.aud) throw new Unauthorized("Unauthorized");
      let objectCreate = JSON.parse(payload.aud);
      if (!objectCreate.userId) throw new Unauthorized("Unauthorized");

      const findUserStatus = await UserSchema.findById(
        objectCreate.userId
      ).select("status");
      if (!findUserStatus) throw new Unauthorized("Unauthorized");

      req.payload = objectCreate;

      next();
    } catch (error) {
      next(error);
    }
  }

  public async eitherProtectedOrNot(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers["authorization"]) throw new Unauthorized("Unauthorized");

      const token = req?.headers?.["authorization"].split(" ")[1];

      // const token = req?.cookies?.token;
      // if (!token) throw new Unauthorized("Unauthorized");
      const payload = token ? super.accessTokenVerify(token) : undefined;
      //   accessTokenVerify(token);

      if (payload?.aud) {
        let objectCreate = payload.aud ? JSON.parse(payload.aud) : undefined;
        if (!objectCreate.userId) next();
        const findUserStatus = await UserSchema.findById(
          objectCreate.userId
        ).select("status");
        if (!findUserStatus) next();

        req.payload = objectCreate;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  public async isUser(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers["authorization"]) throw new Unauthorized("Unauthorized");

      const token = req?.headers?.["authorization"].split(" ")[1];

      if (!token) throw new Unauthorized("Unauthorized");
      const payload = super.accessTokenVerify(token);
      if (!payload?.aud) throw new Unauthorized("Unauthorized");

      let objectCreate = JSON.parse(payload.aud);
      if (!objectCreate.userId) throw new Unauthorized("Unauthorized");

      const findUserStatus = await UserSchema.findById(
        objectCreate.userId
      ).select("status role");

      if (!findUserStatus) throw new Unauthorized("Unauthorized");
      if (findUserStatus?.role !== "USER")
        throw new Unauthorized(
          "You are not authorized to perform this action."
        );

      req.payload = objectCreate;
      next();
    } catch (error) {
      next(error);
    }
  }
  public async checkAuth(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req?.headers?.["authorization"]?.split(" ")[1];

      const payload = token && super.accessTokenVerify(token);

      let objectCreate = payload?.aud && JSON.parse(payload?.aud);

      req.payload = objectCreate;
      next();
    } catch (error) {
      next(error);
    }
  }

  public async isSuperAdmin(
    req: MIDDLEWARE_REQUEST_TYPE,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.headers["authorization"]) throw new Unauthorized("Unauthorized");

      const token = req?.headers?.["authorization"].split(" ")[1];

      if (!token) throw new Unauthorized("Unauthorized");
      const payload = super.accessTokenVerify(token);

      if (!payload?.aud) throw new Unauthorized("Unauthorized");
      let objectCreate = JSON.parse(payload.aud);
      if (!objectCreate.userId) throw new Unauthorized("Unauthorized");
      const findUserStatus = await UserSchema.findById(
        objectCreate.userId
      ).select("status role");
      if (!findUserStatus) throw new Unauthorized("Unauthorized");
      if (findUserStatus?.role !== "SUPER-ADMIN")
        throw new Unauthorized(
          "You are not authorized to perform this action."
        );
      req.payload = objectCreate;

      next();
    } catch (error) {
      next(error);
    }
  }
}
