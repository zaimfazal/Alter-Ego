import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Mission, UserProfile } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      userProfile: {
        name: '',
        goal: '',
        currentStatus: '',
        durationDays: 30,
        aiMode: 'Aggressive',
      },
      startDate: null,
      streak: 0,
      xpTotal: 0,
      daysCompleted: 0,
      lastActiveDate: null,
      missions: [],

      setUserProfile: (profile: Partial<UserProfile>) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      completeOnboarding: () =>
        set({ 
          hasOnboarded: true, 
          startDate: new Date().toISOString(),
          lastActiveDate: new Date().toISOString(),
          streak: 1, // Start with streak 1 on day 1
          xpTotal: 0,
          daysCompleted: 0,
        }),

      addMissions: (newMissions: Mission[]) =>
        set((state) => ({ missions: [...state.missions, ...newMissions] })),

      updateMissionProgress: (missionId: string, segmentIncrement: number, proofUri?: string) =>
        set((state) => {
          const updatedMissions = state.missions.map((m) => {
            if (m.id === missionId) {
              const newProgress = Math.min(m.progress + segmentIncrement, m.totalSegments);
              const isCompleted = newProgress >= m.totalSegments;
              if (isCompleted && proofUri) {
                 return { ...m, progress: newProgress, completed: true, proofSubmitted: proofUri };
              }
              return { ...m, progress: newProgress, completed: isCompleted };
            }
            return m;
          });
          
          // XP Calculations
          const missionJustCompleted = updatedMissions.find(m => m.id === missionId)?.completed;
          const wasAlreadyCompleted = state.missions.find(m => m.id === missionId)?.completed;
          
          let newXpTotal = state.xpTotal;
          if (missionJustCompleted && !wasAlreadyCompleted) {
            const xpVal = state.missions.find(m => m.id === missionId)?.xpValue || 100;
            newXpTotal += xpVal;
          }

          return { missions: updatedMissions, xpTotal: newXpTotal };
        }),

      updateStatsOnDailyLogin: () => 
        set((state) => {
          if (!state.lastActiveDate) return state;

          const today = new Date();
          const lastActive = new Date(state.lastActiveDate);
          
          today.setHours(0,0,0,0);
          lastActive.setHours(0,0,0,0);
          
          const diffTime = today.getTime() - lastActive.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          let newStreak = state.streak;
          
          if (diffDays === 1) {
             newStreak += 1;
          } else if (diffDays > 1) {
             newStreak = 0; // Broke streak
          }
          
          return {
             lastActiveDate: new Date().toISOString(),
             streak: newStreak
          };
        }),
        
      completeDay: () => 
        set((state) => ({ daysCompleted: state.daysCompleted + 1 }))
    }),
    {
      // Changed name so old persistence doesn't crash on type mismatches safely
      name: 'alter-ego-gamified',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
