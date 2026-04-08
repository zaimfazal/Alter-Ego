import { Router } from 'express';
import { chatWithPersona, getDailyQuote, getMissionAdvice, generateDynamicMissions, regenerateMission } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { enforceLlmQuota } from '../middlewares/usage.middleware';

const router = Router();

// Protect ALL AI routes with Auth and Quota rules
router.use(authenticate);
router.post('/chat', enforceLlmQuota, chatWithPersona);
router.get('/daily-quote', enforceLlmQuota, getDailyQuote);
router.post('/mission-advice', enforceLlmQuota, getMissionAdvice);
router.post('/dynamic-missions', enforceLlmQuota, generateDynamicMissions);
router.post('/regenerate-mission', enforceLlmQuota, regenerateMission);

export default router;
