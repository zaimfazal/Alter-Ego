import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import redis from '../utils/redis';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Set this in .env

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password_hash,
        role: (validatedData.role as any) || 'MEMBER',
      },
    });

    const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role });

    // Store refresh token in redis for 7 days
    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role });
    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token required' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const cachedToken = await redis.get(`refresh_token:${payload.userId}`);
    
    if (cachedToken !== refreshToken) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const tokens = generateTokens({ userId: payload.userId, role: payload.role });
    await redis.set(`refresh_token:${payload.userId}`, tokens.refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.status(200).json({ tokens });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Using explicit typing from the custom request type would usually provide user via middleware
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(400).json({ error: 'User identifier not found in request context' });
    return;
  }
  await redis.del(`refresh_token:${userId}`);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration
      res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redis.set(`reset_token:${resetToken}`, user.id, 'EX', 15 * 60); // 15 mins expiry

    // MOCK: In the future, send an email here using SendGrid or similar
    console.log(`[MOCK EMAIL] Password Reset Link: http://localhost:8081/reset-password?token=${resetToken}`);

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const userId = await redis.get(`reset_token:${token}`);
    
    if (!userId) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash }
    });

    await redis.del(`reset_token:${token}`);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      res.status(400).json({ error: 'Google idToken is required' });
      return;
    }

    // Google API validation
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token payload' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      // Auto-register via Google
      const salt = await bcrypt.genSalt(10);
      const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);
      user = await prisma.user.create({
        data: {
          email: payload.email,
          password_hash: randomPasswordHash,
          role: role || 'MEMBER',
        }
      });
    }

    const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role });
    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.status(200).json({
      message: 'Google login successful',
      user: { id: user.id, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken }
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
