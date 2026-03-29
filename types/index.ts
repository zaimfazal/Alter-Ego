export interface UserProfile {
  name: string;
  goals: string[];
  currentStatus: string;
  durationDays: number;
  aiMode: 'Aggressive' | 'Calm';
}

export interface Mission {
  id: string;
  dayAssigned: number;
  title: string;
  description: string;
  xpValue: number;
  progress: number;
  totalSegments: number;
  completed: boolean;
  proofRequired: boolean;
  proofSubmitted?: string | null;
  isCustomHabit?: boolean; 
}

export interface AppState {
  hasOnboarded: boolean;
  userProfile: UserProfile;
  customHabits: string[];
  startDate: string | null;
  streak: number;
  xpTotal: number;
  daysCompleted: number;
  lastActiveDate: string | null;
  missions: Mission[];
  restTokens: number;
  activeRestDays: string[];
  perfectDaysCount: number; // tracks consecutively completed days for token drops
  
  // Actions
  setUserProfile: (profile: Partial<UserProfile>) => void;
  addGoal: (goal: string) => void;
  removeGoal: (index: number) => void;
  addCustomHabit: (habit: string) => void;
  removeCustomHabit: (index: number) => void;
  completeOnboarding: () => void;
  addMissions: (missions: Mission[]) => void;
  updateMissionProgress: (missionId: string, segmentIncrement: number, proofUri?: string) => void;
  updateStatsOnDailyLogin: () => void;
  useRestToken: (dateStr: string) => void;
  replaceMission: (missionId: string, newMission: Mission) => void;
}
