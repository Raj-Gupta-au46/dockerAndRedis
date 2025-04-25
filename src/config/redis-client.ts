import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";
console.log("redis url: ", redisUrl);
const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err) => {
  console.error("redis url: ", redisUrl);
  console.error("Redis Client Error", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};

export { redisClient, connectRedis };
