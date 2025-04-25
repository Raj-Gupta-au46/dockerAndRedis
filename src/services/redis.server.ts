import { createClient } from "redis";

class RedisService {
  private client: ReturnType<typeof createClient>;
  private static instance: RedisService;

  private constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.client = createClient({ url: redisUrl });

    this.client.on("error", (err) => console.error("Redis Client Error:", err));
    this.client.on("connect", () => console.log("Redis connecting..."));
    this.client.on("ready", () => console.log("Redis connected!"));
    this.client.on("reconnecting", () => console.log("Redis reconnecting..."));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    if (this.client.isOpen) return;
    await this.client.connect();
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  public async get(key: string): Promise<any | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis del error:", error);
    }
  }

  public async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error("Redis clearPattern error:", error);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.client.isOpen) return;
    await this.client.quit();
  }
}

export default RedisService.getInstance();
