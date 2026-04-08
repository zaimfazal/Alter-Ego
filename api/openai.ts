import axios from 'axios';
import { Mission, UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, you will want this to point to your backend. 
// E.g. http://10.0.2.2:5000/api/ai for Android simulator or http://localhost:5000/api/ai for iOS
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`
  };
};

export async function generateDailyQuote(user: UserProfile, progress: number): Promise<string> {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.get(`${BACKEND_API_URL}/ai/daily-quote`, { headers });
    return res.data.quote;
  } catch (err) {
    return 'NO CONNECTION. KEEP MOVING.';
  }
}

export async function generateMissionAdvice(user: UserProfile, todayMissions: Mission[]): Promise<string> {
  if (todayMissions.length === 0) return '';
  const missionTitles = todayMissions.map(m => m.title);
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(`${BACKEND_API_URL}/ai/mission-advice`, 
      { missionTitles }, 
      { headers }
    );
    return res.data.advice;
  } catch (err) {
    return 'EXECUTE YOUR MISSIONS.';
  }
}

export async function generateDynamicMissions(user: UserProfile, weekNumber: number): Promise<Mission[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(`${BACKEND_API_URL}/ai/dynamic-missions`, 
      { weekNumber }, 
      { headers }
    );
    return res.data.missions.map((m: any) => ({
      ...m,
      id: m.id || Math.random().toString(),
      totalSegments: m.totalSegments || 1, 
      progress: m.progress || 0,
      completed: m.completed || false,
    }));
  } catch (error) {
    console.error('generateDynamicMissions error', error);
    return [];
  }
}

export async function regenerateSingleMission(user: UserProfile, oldMission: Mission): Promise<Partial<Mission> | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(`${BACKEND_API_URL}/ai/regenerate-mission`, 
      { oldMission }, 
      { headers }
    );
    const newObj = res.data.mission;
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
  try {
    const headers = await getAuthHeaders();
    // System context/prompt is automatically hydrated by the backend controller, so just passing the history array
    const messagesToSend = [...history, { role: 'user', content: newMessage }];
    const res = await axios.post(`${BACKEND_API_URL}/ai/chat`, 
      { messages: messagesToSend, personaType: user.aiMode }, 
      { headers }
    );
    
    // AI controller returns { choices: ... }
    return res.data.choices[0].message; 
  } catch (error) {
    console.error('chatWithAlterEgo error', error);
    return { content: 'TRANSMISSION FAILED. CONNECTION LOST.' };
  }
}

