import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      profile: user.profile || {},
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { profile } = req.body;
  
  try {
    // Merge new profile with existing one
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const updatedProfile = { 
       ...(user?.profile as any || {}), 
       ...profile 
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile: updatedProfile }
    });
    
    res.status(200).json({ profile: updatedUser.profile });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
};

export const updateDailyStats = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    let profile: any = user.profile || {
      streak: 0,
      xpTotal: 0,
      restTokens: 0,
      perfectDaysCount: 0,
      activeRestDays: [],
      lastActiveDate: null,
      customHabits: [],
    };
    
    // Server-side daily check logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    
    if (lastActive) {
       lastActive.setHours(0, 0, 0, 0);
       const diffTime = today.getTime() - lastActive.getTime();
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       
       if (diffDays === 1) {
          profile.streak = (profile.streak || 0) + 1;
          profile.perfectDaysCount = (profile.perfectDaysCount || 0) + 1;
          if (profile.perfectDaysCount >= 7) {
             profile.restTokens = (profile.restTokens || 0) + 1;
             profile.perfectDaysCount = 0;
          }
       } else if (diffDays > 1) {
          const missedDays = diffDays - 1;
          profile.restTokens = profile.restTokens || 0;
          
          if (profile.restTokens >= missedDays) {
             // Save streak
             profile.restTokens -= missedDays;
             profile.activeRestDays = profile.activeRestDays || [];
             for (let i = 1; i <= missedDays; i++) {
                const missedDate = new Date(lastActive.getTime() + i * 24 * 60 * 60 * 1000);
                profile.activeRestDays.push(missedDate.toISOString().split('T')[0]);
             }
             profile.streak = (profile.streak || 0) + diffDays;
          } else {
             // Reset sequence
             profile.streak = 0;
             profile.perfectDaysCount = 0;
             const penalty = missedDays * 50;
             profile.xpTotal = Math.max(0, (profile.xpTotal || 0) - penalty);
          }
       }
    } else {
       // First time setting active date
       profile.streak = profile.streak || 0;
    }
    
    // Always update last active to today if they logged in
    profile.lastActiveDate = new Date().toISOString();
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile }
    });

    res.status(200).json({ profile: updatedUser.profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stats update failed' });
  }
};
