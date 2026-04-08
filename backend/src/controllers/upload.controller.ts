import { Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image provided' });
    return;
  }
  
  try {
    const filename = `mission-proof-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const uploadDir = path.join(__dirname, '../../uploads');
    const outputPath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Compress using sharp to fit 10MB limit and standardize formats
    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
      
    res.status(200).json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Image compression error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
};
