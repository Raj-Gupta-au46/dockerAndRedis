import "dotenv/config";
export const port = Number(process.env.PORT);
export const connectionDB = String(process.env.DATABASE_URL);
export const email = String(process.env.EMAIL);
export const password = String(process.env.PASSWORD);
export const host = String(process.env.HOST);
export const accessSecret = String(process.env.ACCESS_SECRET);

export const accessKey = String(process.env.ACCESS_KEY);
export const secretKey = String(process.env.SECRET_KEY);
export const bucketName = String(process.env.BUCKET_NAME);
export const region = String(process.env.REGION);
export const cloudFontDistribution = String(
  process.env.CLOUD_FRONT_DISTRIBUTION_ID
);
