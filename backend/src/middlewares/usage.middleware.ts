import { Response, NextFunction } from 'express';
import redis from '../utils/redis';
import { AuthRequest } from './auth.middleware';

// 50 LLM calls per user per day by default
const DAILY_LLM_LIMIT = 50; 

export const enforceLlmQuota = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const redisKey = `llm_usage:${userId}:${dateStr}`;

  try {
    const currentUsage = await redis.get(redisKey);
    const count = currentUsage ? parseInt(currentUsage, 10) : 0;

    if (count >= DAILY_LLM_LIMIT) {
      res.status(429).json({ 
        error: 'Daily LLM quota exceeded (`50` calls/day). Please inform Gym Administration.' 
      });
      return;
    }

    // Record usage block
    await redis.incr(redisKey);
    // Set 24 hour expiry purely for GC
    if (count === 0) {
      await redis.expire(redisKey, 86400); 
    }

    next();
  } catch (err) {
    console.error('Redis quota error:', err);
    // Graceful fallback if Redis networking fails
    next();
  }
};
