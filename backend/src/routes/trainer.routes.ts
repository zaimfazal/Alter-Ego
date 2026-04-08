import { Router } from 'express';
import { getAssignedMembers, getMemberProgress } from '../controllers/trainer.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['TRAINER', 'GYM_OWNER', 'ADMIN']));

router.get('/members', getAssignedMembers);
router.get('/members/:id/progress', getMemberProgress);

export default router;
