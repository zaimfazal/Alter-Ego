import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { syncUser, updateProfile, updateDailyStats } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/sync', syncUser);
router.post('/profile', updateProfile);
router.post('/daily-checkin', updateDailyStats);

export default router;
