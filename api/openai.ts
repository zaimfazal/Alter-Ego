import axios from 'axios';
import { Mission, UserProfile } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getPersonaPrompt = (user: UserProfile) => {
  if (user.aiMode === 'Calm') {
    return `You are a calm, stoic, logical operational assistant. The user's name is ${user.name}. Their objectives are to: ${user.goals.join(' and ')}. Focus on sustainable, rational action. Never use exclamation marks. Be brief. Keep advice under 8 words.`;
  }
  return `You are an aggressive, brutal, uncompromising military-style commander. The user's name is ${user.name}. Their objectives are to: ${user.goals.join(' and ')}. Your job is to force them to stop making excuses. Yell at them. Be harsh. Keep advice under 8 words. Use all caps optionally.`;
};

export async function generateDailyQuote(user: UserProfile, progress: number): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) return '"DISCIPLINE EQUALS FREEDOM." - JOCKO WILLINK';
  
  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant', // Fast, smaller model for repetitive tasks
        messages: [
          {
            role: 'system',
            content: `CRITICAL: YOUR OUTPUT MUST BE EXACTLY ONE SINGLE SENTENCE. MAXIMUM 10 WORDS TOTAL.\n\n${getPersonaPrompt(user)}\nProvide ONE short motivational phrase based on their goals "${user.goals.join(', ')}" and progress (${Math.round(progress)}%). Do not wrap in quotes.`
          }
        ],
        temperature: 0.7,
        max_tokens: 25
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    return 'NO CONNECTION. KEEP MOVING.';
  }
}

export async function generateMissionAdvice(user: UserProfile, todayMissions: Mission[]): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey || todayMissions.length === 0) return '';
  
  const missionTitles = todayMissions.map(m => m.title).join(', ');

  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `CRITICAL: YOUR OUTPUT MUST BE EXACTLY ONE SINGLE SENTENCE. MAXIMUM 15 WORDS TOTAL.\n\n${getPersonaPrompt(user)}\nThe user's active missions for today are: ${missionTitles}. Provide ONE extremely short tactical command targeting how to execute these missions.`
          }
        ],
        temperature: 0.7,
        max_tokens: 30
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    return 'EXECUTE YOUR MISSIONS.';
  }
}

export async function generateDynamicMissions(user: UserProfile, weekNumber: number): Promise<Mission[]> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) return [];
  
  const startDay = ((weekNumber - 1) * 7) + 1;
  const endDay = weekNumber * 7;
  
  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Based on the user's goals: "${user.goals.join(', ')}" and current status: "${user.currentStatus}".
Generate a mission roadmap for days ${startDay} through ${endDay} (A 7-day period).
You can assign 1 to 3 missions per day.
Output strictly as a JSON array of objects with these keys:
"dayAssigned" (number between ${startDay} and ${endDay}),
"title" (string), 
"description" (string, 1 sentence), 
"xpValue" (number 100-300), 
"proofRequired" (boolean - heavily rely on true requiring them to submit photo evidence).
No other text. Just JSON. Make sure to generate at least 1 mission per day up to ${endDay}.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    
    let content = res.data.choices[0].message.content;
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const data = JSON.parse(content);
    const missionsArray = Array.isArray(data) ? data : (data.missions || Object.values(data)[0]);
    
    return missionsArray.map((m: any) => ({
      id: m.id || Math.random().toString(),
      dayAssigned: m.dayAssigned || startDay,
      title: m.title ? m.title.toUpperCase() : "EXECUTE TASK",
      description: m.description,
      xpValue: m.xpValue || 100,
      totalSegments: 1, 
      progress: 0,
      completed: false,
      proofRequired: m.proofRequired ?? true
    }));
  } catch (error) {
    console.error('generateDynamicMissions error', error);
    return [];
  }
}

export async function regenerateSingleMission(user: UserProfile, oldMission: Mission): Promise<Partial<Mission> | null> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) return null;
  
  try {
    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `The user's objectives are: ${user.goals.join(', ')}. 
The user rejected the following mission for Day ${oldMission.dayAssigned}: "${oldMission.title}" (${oldMission.description}).
Generate exactly ONE alternative physical/mental mission to replace it. It must be of similar difficulty.
CRITICAL: You MUST strictly return a single JSON object. DO NOT wrap the output in any formatting. Return raw JSON only with keys: "title", "description", "xpValue" (between 10-100), "totalSegments" (integer > 0), "proofRequired" (boolean).`
          }
        ],
        temperature: 0.8
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );

    let content = res.data.choices[0].message.content.trim();
    if (content.startsWith('```json')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    else if (content.startsWith('```')) content = content.replace(/```/g, '').trim();

    const newObj = JSON.parse(content);
    return {
      title: newObj.title,
      description: newObj.description,
      xpValue: newObj.xpValue || 50,
      totalSegments: newObj.totalSegments || 1,
      proofRequired: newObj.proofRequired ?? true
    };
  } catch (error) {
    console.error('regenerateSingleMission error', error);
    return null;
  }
}

export async function chatWithAlterEgo(user: UserProfile, history: any[], newMessage: string, sysContext: string = ''): Promise<any> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) return { content: 'API KEY MISSING. SET EXPO_PUBLIC_GROQ_API_KEY.' };
  
  try {
    const systemPrompt = {
      role: 'system',
      content: `${getPersonaPrompt(user)}\nSYSTEM DATA: ${sysContext}\nFormat: Plain text. Do not use asterisks or emojis.`
    };

    const res = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Large intelligence model for Chat
        messages: [systemPrompt, ...history, { role: 'user', content: newMessage }],
        temperature: 0.8
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    
    // Return standard completion message shape
    return res.data.choices[0].message; 
  } catch (error) {
    console.error('chatWithAlterEgo error', error);
    return { content: 'TRANSMISSION FAILED. CONNECTION LOST.' };
  }
}
