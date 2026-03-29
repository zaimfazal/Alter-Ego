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

      setUserProfile: (profile) => 
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      
      addGoal: (goal) => 
        set((state) => ({ userProfile: { ...state.userProfile, goals: [...state.userProfile.goals, goal] } })),
        
      removeGoal: (index) => 
        set((state) => {
          const newGoals = [...state.userProfile.goals];
          newGoals.splice(index, 1);
          return { userProfile: { ...state.userProfile, goals: newGoals } };
        }),

      addCustomHabit: (habit) => 
        set((state) => ({ customHabits: [...state.customHabits, habit] })),

      removeCustomHabit: (index) => 
        set((state) => {
          const newHabits = [...state.customHabits];
          newHabits.splice(index, 1);
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
          let newXpTotal = state.xpTotal;
          let newRestTokens = state.restTokens;
          let newPerfectCount = state.perfectDaysCount;
          let newActiveRestDays = [...state.activeRestDays];
          
          if (diffDays === 1) {
             newStreak += 1;
             newPerfectCount += 1;
             if (newPerfectCount >= 7) {
                newRestTokens += 1;
                newPerfectCount = 0;
             }
          } else if (diffDays > 1) {
             const missedDays = diffDays - 1;
             
             // Check if we can auto-deploy rest tokens to save the streak
             if (newRestTokens >= missedDays) {
                newRestTokens -= missedDays;
                // Add missed days to activeRestDays tracking array
                for (let i = 1; i <= missedDays; i++) {
                   const missedDate = new Date(lastActive.getTime() + i * 24 * 60 * 60 * 1000);
                   newActiveRestDays.push(missedDate.toISOString().split('T')[0]);
                }
                newStreak += diffDays; // Streak maintained functionally
             } else {
                newStreak = 0; 
                newPerfectCount = 0;
                // Punishment Mechanic: Lose 50 XP per un-saved day missed
             	const penalty = missedDays * 50;
             	newXpTotal = Math.max(0, state.xpTotal - penalty);
             }
          }
          
          return {
             lastActiveDate: new Date().toISOString(),
             streak: newStreak,
             xpTotal: newXpTotal,
             restTokens: newRestTokens,
             perfectDaysCount: newPerfectCount,
             activeRestDays: newActiveRestDays
          };
        })
    }),
    {
      name: 'alter-ego-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
