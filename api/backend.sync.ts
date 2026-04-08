import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`
  };
};

export async function syncUserDataFromBackend() {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.get(`${BACKEND_API_URL}/users/sync`, { headers });
    return res.data;
  } catch (error) {
    console.error('Failed to sync user data', error);
    return null;
  }
}

export async function updateDailyStatsOnBackend() {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(`${BACKEND_API_URL}/users/daily-checkin`, {}, { headers });
    return res.data.profile;
  } catch (error) {
    console.error('Failed to update stats on backend', error);
    return null;
  }
}

export async function updateProfileOnBackend(profileData: any) {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(`${BACKEND_API_URL}/users/profile`, { profile: profileData }, { headers });
    return res.data.profile;
  } catch (error) {
    console.error('Failed to update profile on backend', error);
    return null;
  }
}
