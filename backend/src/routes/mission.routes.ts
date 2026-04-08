import { Router } from 'express';
import { getTodayMissions, getMissionHistory, createMission, completeMission } from '../controllers/mission.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/today', getTodayMissions);
router.get('/history', getMissionHistory);
router.post('/', createMission);
// For the POST /:id/complete step (later we will add multer for the image upload proof)
router.post('/:id/complete', completeMission);

export default router;
