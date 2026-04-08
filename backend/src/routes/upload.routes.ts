import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticate);
router.post('/', upload.single('image'), uploadImage);

export default router;
