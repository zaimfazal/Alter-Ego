import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import gymRoutes from './routes/gym.routes';
import missionRoutes from './routes/mission.routes';
import trainerRoutes from './routes/trainer.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Provide a basic rate limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests (can be narrowed down later)
app.use(apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/gyms', gymRoutes);
app.use('/missions', missionRoutes);
app.use('/trainers', trainerRoutes);
app.use('/uploads', uploadRoutes);
app.use('/users', userRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`Alter-Ego backend API running securely on port ${PORT}`);
});
