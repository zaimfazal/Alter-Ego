import { Router } from 'express';
import { createGym, getGymById, updateGym } from '../controllers/gym.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createGym);
router.get('/:id', getGymById);
// Only Admin or Gym Owner can update gym details
router.put('/:id', requireRole(['ADMIN', 'GYM_OWNER']), updateGym);

export default router;
