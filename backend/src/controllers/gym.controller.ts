import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createGym = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  const ownerId = (req as any).user?.userId;
  
  if (!name) {
    res.status(400).json({ error: 'Gym name is required' });
    return;
  }
  
  try {
    const gym = await prisma.gym.create({
      data: {
        name,
        ownerId,
        subscriptionTier: 'FREE'
      }
    });
    
    // Upgrade user to GYM_OWNER role
    await prisma.user.update({
      where: { id: ownerId },
      data: { role: 'GYM_OWNER' }
    });
    
    res.status(201).json(gym);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gym' });
  }
};

export const getGymById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const gym = await prisma.gym.findUnique({
      where: { id },
      include: { 
        members: { include: { user: { select: { id: true, email: true, profile: true } } } },
        trainers: { include: { user: { select: { id: true, email: true, profile: true } } } }
      }
    });
    if (!gym) {
      res.status(404).json({ error: 'Gym not found' });
      return;
    }
    res.status(200).json(gym);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gym' });
  }
};

export const updateGym = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name } = req.body;
  
  try {
    const gym = await prisma.gym.update({
      where: { id },
      data: { name }
    });
    res.status(200).json(gym);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gym' });
  }
};
