import { Request, Response } from 'express';

import prisma from '../utils/prisma';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const getPersonaPrompt = (userProfile: any) => {
  const name = userProfile?.name || 'User';
  const goals = userProfile?.goals || ['improve themselves'];
  if (userProfile?.aiMode === 'Calm') {
    return `You are a calm, stoic, logical operational assistant. The user's name is ${name}. Their objectives are to: ${goals.join(' and ')}. Focus on sustainable, rational action. Never use exclamation marks. Be brief. Keep advice under 8 words.`;
  }
  return `You are an aggressive, brutal, uncompromising military-style commander. The user's name is ${name}. Their objectives are to: ${goals.join(' and ')}. Your job is to force them to stop making excuses. Yell at them. Be harsh. Keep advice under 8 words. Use all caps optionally.`;
};

const callGroq = async (systemContent: string, maxTokens: number = 25, returnJson: boolean = false) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemContent }],
      temperature: 0.7,
      max_tokens: maxTokens,
      ...(returnJson ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

export const chatWithPersona = async (req: Request, res: Response): Promise<void> => {
  const { messages, personaType } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages payload is required and must be an array' });
    return;
  }
  
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'AI capabilities are not configured correctly' });
    return;
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // or any other compatible Groq model
        messages: messages,
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Groq Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI provider' });
  }
};

export const getDailyQuote = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }});
  
  try {
    const quote = await callGroq(`CRITICAL: YOUR OUTPUT MUST BE EXACTLY ONE SINGLE SENTENCE. MAXIMUM 10 WORDS TOTAL.\n\n${getPersonaPrompt(user?.profile)}\nProvide ONE short motivational phrase based on their goals and progress. Do not wrap in quotes.`);
    res.status(200).json({ quote });
  } catch (err) {
    res.status(200).json({ quote: 'DISCIPLINE EQUALS FREEDOM.' });
  }
};

export const getMissionAdvice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { missionTitles } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId }});
  
  if (!missionTitles || missionTitles.length === 0) {
    res.status(200).json({ advice: 'EXECUTE YOUR MISSIONS.' });
    return;
  }

  try {
    const advice = await callGroq(`CRITICAL: YOUR OUTPUT MUST BE EXACTLY ONE SINGLE SENTENCE. MAXIMUM 15 WORDS TOTAL.\n\n${getPersonaPrompt(user?.profile)}\nThe user's active missions for today are: ${missionTitles.join(', ')}. Provide ONE extremely short tactical command targeting how to execute these missions.`, 30);
    res.status(200).json({ advice });
  } catch (err) {
    res.status(200).json({ advice: 'EXECUTE YOUR MISSIONS.' });
  }
};

export const generateDynamicMissions = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { weekNumber } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId }});
  
  const startDay = ((weekNumber || 1 - 1) * 7) + 1;
  const endDay = (weekNumber || 1) * 7;
  const goalsStr = (user?.profile as any)?.goals?.join(', ') || 'fitness';

  try {
    let content = await callGroq(`Based on the user's goals: "${goalsStr}".
Generate a mission roadmap for days ${startDay} through ${endDay} (A 7-day period).
You can assign 1 to 3 missions per day.
Output strictly as a JSON array of objects with these keys:
"dayAssigned" (number between ${startDay} and ${endDay}),
"title" (string), 
"description" (string, 1 sentence), 
"xpValue" (number 100-300), 
"proofRequired" (boolean - heavily rely on true requiring them to submit photo evidence).
No other text. Just JSON. Make sure to generate at least 1 mission per day up to ${endDay}.`, 1000, true);
    
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const data = JSON.parse(content);
    const missionsArray = Array.isArray(data) ? data : (data.missions || Object.values(data)[0]);
    res.status(200).json({ missions: missionsArray });
  } catch (err) {
    console.error('generateDynamicMissions error', err);
    res.status(500).json({ error: 'Failed to generate missions' });
  }
};

export const regenerateMission = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { oldMission } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId }});
  const goalsStr = (user?.profile as any)?.goals?.join(', ') || 'fitness';

  try {
    let content = await callGroq(`The user's objectives are: ${goalsStr}. 
The user rejected the following mission for Day ${oldMission?.dayAssigned || 1}: "${oldMission?.title}" (${oldMission?.description}).
Generate exactly ONE alternative physical/mental mission to replace it. It must be of similar difficulty.
CRITICAL: You MUST strictly return a single JSON object. DO NOT wrap the output in any formatting. Return raw JSON only with keys: "title", "description", "xpValue" (between 10-100), "totalSegments" (integer > 0), "proofRequired" (boolean).`, 300, true);

    if (content.startsWith('```json')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    else if (content.startsWith('```')) content = content.replace(/```/g, '').trim();

    const newObj = JSON.parse(content);
    res.status(200).json({ mission: newObj });
  } catch (err) {
    console.error('regenerateSingleMission error', err);
    res.status(500).json({ error: 'Failed to regenerate mission' });
  }
};
