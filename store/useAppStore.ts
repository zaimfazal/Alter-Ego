import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Mission, UserProfile } from '../types';
import { syncUserDataFromBackend, updateDailyStatsOnBackend, updateProfileOnBackend } from '../api/backend.sync';

export const useAppStore = create<AppState & { syncWithBackend: () => Promise<void> }>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      userProfile: {
        name: '',
        goals: [],
        currentStatus: '',
        durationDays: 30, // Default challenge
        aiMode: 'Aggressive',
      },
      customHabits: [],
      startDate: null,
      streak: 0,
      xpTotal: 0,
      daysCompleted: 0,
      lastActiveDate: null,
      missions: [],
      restTokens: 0,
      activeRestDays: [],
      perfectDaysCount: 0,

      syncWithBackend: async () => {
        const data = await syncUserDataFromBackend();
        if (data && data.profile) {
          set((state) => ({
            ...state,
            streak: data.profile.streak ?? state.streak,
            xpTotal: data.profile.xpTotal ?? state.xpTotal,
            restTokens: data.profile.restTokens ?? state.restTokens,
            perfectDaysCount: data.profile.perfectDaysCount ?? state.perfectDaysCount,
            activeRestDays: data.profile.activeRestDays ?? state.activeRestDays,
            lastActiveDate: data.profile.lastActiveDate ?? state.lastActiveDate,
            userProfile: {
              ...state.userProfile,
              name: data.profile.name ?? state.userProfile.name,
              goals: data.profile.goals ?? state.userProfile.goals,
              aiMode: data.profile.aiMode ?? state.userProfile.aiMode,
            },
            customHabits: data.profile.customHabits ?? state.customHabits,
          }));
        }
      },

      setUserProfile: (profile) => {
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } }));
        updateProfileOnBackend(profile); // Fire and forget quiet sync
      },
      
      addGoal: (goal) => 
        set((state) => {
          const newGoals = [...state.userProfile.goals, goal];
          updateProfileOnBackend({ goals: newGoals });
          return { userProfile: { ...state.userProfile, goals: newGoals } };
        }),
        
      removeGoal: (index) => 
        set((state) => {
          const newGoals = [...state.userProfile.goals];
          newGoals.splice(index, 1);
          updateProfileOnBackend({ goals: newGoals });
          return { userProfile: { ...state.userProfile, goals: newGoals } };
        }),

      addCustomHabit: (habit) => 
        set((state) => {
          const newHabits = [...state.customHabits, habit];
          updateProfileOnBackend({ customHabits: newHabits });
          return { customHabits: newHabits };
        }),

      removeCustomHabit: (index) => 
        set((state) => {
          const newHabits = [...state.customHabits];
          newHabits.splice(index, 1);
          updateProfileOnBackend({ customHabits: newHabits });
          return { customHabits: newHabits };
        }),

      completeOnboarding: () => 
        set(() => ({ 
          hasOnboarded: true, 
          startDate: new Date().toISOString(),
          lastActiveDate: new Date().toISOString()
        })),

      addMissions: (newMissions) => 
        set((state) => ({ missions: [...state.missions, ...newMissions] })),

      replaceMission: (missionId, newMission) =>
        set((state) => ({
          missions: state.missions.map(m => m.id === missionId ? newMission : m)
        })),

      updateMissionProgress: (missionId, increment, proofUri) => 
        set((state) => {
          const newMissions = state.missions.map(m => {
            if (m.id === missionId) {
              const newProgress = Math.min(m.progress + increment, m.totalSegments);
              const completed = newProgress >= m.totalSegments;
              return { 
                ...m, 
                progress: newProgress, 
                completed, 
                proofSubmitted: proofUri || m.proofSubmitted 
              };
            }
            return m;
          });

          // Check if completion grants XP
          const completedMission = newMissions.find(m => m.id === missionId && m.completed && !state.missions.find(old => old.id === missionId)?.completed);
          let addedXp = 0;
          if (completedMission) {
            addedXp = completedMission.xpValue;
          }

          return { 
            missions: newMissions,
            xpTotal: state.xpTotal + addedXp
          };
        }),

      useRestToken: (dateStr: string) => 
        set((state) => {
          if (state.restTokens > 0) {
            return {
              restTokens: state.restTokens - 1,
              activeRestDays: [...state.activeRestDays, dateStr]
            };
          }
          return state;
        }),

      updateStatsOnDailyLogin: async () => {
        const newProfile = await updateDailyStatsOnBackend();
        if (newProfile) {
          set((state) => ({
            ...state,
            streak: newProfile.streak ?? state.streak,
            xpTotal: newProfile.xpTotal ?? state.xpTotal,
            restTokens: newProfile.restTokens ?? state.restTokens,
            perfectDaysCount: newProfile.perfectDaysCount ?? state.perfectDaysCount,
            activeRestDays: newProfile.activeRestDays ?? state.activeRestDays,
            lastActiveDate: newProfile.lastActiveDate ?? state.lastActiveDate,
          }));
        }
      }
    }),
    {
      name: 'alter-ego-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
