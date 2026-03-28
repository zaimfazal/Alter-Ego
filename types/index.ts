export interface UserProfile {
  name: string;
  goal: string;
  currentStatus: string;
  durationDays: number;
  aiMode: 'Aggressive' | 'Calm';
}

export interface Mission {
  id: string;
  dayAssigned: number; // The day this mission unlocks relative to start date
  title: string;
  description: string;
  xpValue: number;
  progress: number;
  totalSegments: number;
  completed: boolean;
  proofRequired: boolean; // Whether the user NEEDS to use the camera
  proofSubmitted?: string | null; // URI of the local image file
}

export interface AppState {
  hasOnboarded: boolean;
  userProfile: UserProfile;
  startDate: string | null; // Tracks when the challenge started
  streak: number;
  xpTotal: number;
  daysCompleted: number; // How many days fully cleared
  lastActiveDate: string | null;
  missions: Mission[];
  
  // Actions
  setUserProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  addMissions: (missions: Mission[]) => void;
  updateMissionProgress: (missionId: string, segmentIncrement: number, proofUri?: string) => void;
  updateStatsOnDailyLogin: () => void;
  completeDay: () => void;
}
