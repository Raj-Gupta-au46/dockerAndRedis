import { Request, Response, NextFunction } from "express";
import RedisService from "../services/redis.server";

class CacheMiddleware {
  public cache = (duration: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== "GET") return next();

      const key = `cache:${req.originalUrl}`;

      try {
        const cachedData = await RedisService.get(key);
        if (cachedData) {
          console.log("Serving from cache");
          return res.status(200).json({
            status: "SUCCESS",
            fromCache: true,
            data: cachedData,
          });
        }

        const originalJson = res.json;
        res.json = (body: any): Response => {
          RedisService.set(key, body, duration).catch((err: any) =>
            console.error("Cache set error:", err)
          );
          return originalJson.call(res, body);
        };

        next();
      } catch (error) {
        console.error("Cache middleware error:", error);
        next();
      }
    };
  };

  public clearCache = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      try {
        await RedisService.clearPattern("cache:*");
        console.log("Cache cleared due to data modification");
      } catch (error) {
        console.error("Cache clear error:", error);
      }
    }
    next();
  };
}

export default CacheMiddleware;
