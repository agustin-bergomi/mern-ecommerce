import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error('Missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN in .env');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});



// import Redis from "ioredis";
// import dotenv from "dotenv";

// dotenv.config();

// export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
