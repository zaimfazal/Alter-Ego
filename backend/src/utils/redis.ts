import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully for session management.');
});

export default redis;
