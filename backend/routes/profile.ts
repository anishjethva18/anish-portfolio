import { Router, Request, Response } from 'express';
import { githubService } from '../services/githubService';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Anish Jethva',
    title: 'Full Stack & AI Engineer',
    location: 'India',
    email: 'anish.jethva2006@gmail.com',
    website: 'https://anishjethva.dev',
    socials: {
      github: 'https://github.com/anishjethva18',
      instagram: 'https://www.instagram.com/anish_jethva18',
      linkedin: 'https://www.linkedin.com/in/anishjethva/',
      twitter: 'https://x.com/anish_jethva',
    },
    bio: 'Passionate Full Stack & AI Engineer with expertise in architecting high-performance web applications, cloud systems, and generative AI interfaces.',
    education: 'Bachelor of Technology in Computer Science & Engineering',
  });
});

// GET /api/profile/github
profileRouter.get('/github', async (req: Request, res: Response) => {
  const username = (req.query.username as string) || 'anishjethva18';
  try {
    const stats = await githubService.getProfileStats(username);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
