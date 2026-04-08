import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getTodayMissions = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const missions = await prisma.mission.findMany({
      where: {
        userId,
        date: { gte: today, lt: tomorrow }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(missions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today missions' });
  }
};

export const getMissionHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  try {
    const missions = await prisma.mission.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50
    });
    res.status(200).json(missions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mission history' });
  }
};

export const createMission = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { description, date } = req.body;
  
  if (!description) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }
  
  try {
    const mission = await prisma.mission.create({
      data: {
        userId,
        description,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mission' });
  }
};

export const completeMission = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const userId = (req as any).user?.userId;
  
  // Later we'll integrate image handling here for proofImageUrl
  try {
    // Verify ownership
    const existing = await prisma.mission.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Mission not found or unauthorized' });
      return;
    }
    
    const mission = await prisma.mission.update({
      where: { id },
      data: { completed: true }
    });
    res.status(200).json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark mission complete' });
  }
};
