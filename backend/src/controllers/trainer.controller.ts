import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAssignedMembers = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
      include: {
        assignedMembers: {
          include: {
            user: { select: { id: true, email: true, profile: true } }
          }
        }
      }
    });

    if (!trainer) {
      res.status(404).json({ error: 'Trainer profile not found' });
      return;
    }

    res.status(200).json(trainer.assignedMembers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assigned members' });
  }
};

export const getMemberProgress = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string; // member id
  
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: { user: { select: { id: true, missions: true } } }
    });
    
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    
    res.status(200).json({ progress: member.user.missions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch member progress' });
  }
};
