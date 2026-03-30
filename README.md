Alter Ego
Meet the version of you that already succeeded.
Alter Ego is a high-performance habit-building application designed to bridge the gap between who you are and who you intend to become. By combining cutting-edge LLMs with physical accountability and behavioral gamification, it transforms your growth from an abstract concept into a daily, verified mission.
> [!IMPORTANT]
> API Key Required: To generate missions, engage in persona chats, and initialize your Alter Ego, you must provide your own Groq API Key by editing the files.
> 
🚀 Core Features
1. The AI "Future Self" Persona Engine
Converse directly with a manifestation of your future success, powered by Llama-3.3-70b.
 * Dual-Persona Logic: Choose your mentor’s vibe.
   * Aggressive: Brutalist and demanding. It triggers you to move by refusing to accept excuses.
   * Calm: Stoic and rational. It provides deep, steady encouragement based on logic.
2. Algorithmic Daily Missions
Stop wondering what to do next. The app uses Llama-3.1-8b to generate 7-Day Automatic Roadmaps.
 * Tailored Growth: 1 to 3 distinct physical missions daily, specific to your goal.
 * Time-Locked Progression: No skipping ahead. Missions are strictly locked to your system clock—Day 5 stays locked until the world catches up to Day 5.
3. Camera-Verified Proof of Work
Accountability is nothing without evidence.
 * No Cheating: To complete a mission, the app launches your native camera. You must upload photographic proof of the task to earn your verification.
4. Behavioral Gamification Dashboard
 * XP System: Earn Experience Points for every verified mission.
 * Tension Streaks (🔥): Tracks consecutive days of activity to build momentum.
 * Vector Completion: A mathematical graph representing your overall progress toward your ultimate vision.
5. Contextual Intelligence
 * Daily Tactical Push: A 2-sentence tactical briefing generated every morning based on your specific tasks for the day.
 * Custom Goal Quotes: Unique, AI-generated motivation focused specifically on the gap between your current status and your goal.
🛠️ Tech Stack
Frontend & Core
 * React Native (Expo): Cross-platform deployment for iOS and Android.
 * TypeScript: Full type safety across user profiles and mission data models.
 * Zustand: Ultra-lightweight state management with Persist Middleware for instant local loading and zero-database architecture.
Artificial Intelligence (Groq LPU™)
 * Llama-3.3-70b-versatile: Handles the heavy-lifting "Future Self" persona interactions.
 * Llama-3.1-8b-instant: Powers the lightning-fast generation of missions, quotes, and tactical advice.
Native Integration & UI
 * Expo Image Picker: Native camera access for proof-of-work verification.
 * React Navigation: Seamless routing between Dashboard, Missions, and Chat.
 * Lucide React Native: Minimalist vector iconography.
 * Confetti Cannon: Visual haptics/animation for mission completion.
📦 Installation & Setup
 * Clone the repository:
   git clone https://github.com/your-username/alter-ego.git
cd alter-ego

 * Install dependencies:
   npm install

 * Run the app:
   npx expo start

 * Accessing the App:
   * Download the Expo Go app on your mobile device.
   * Scan the QR code generated in your terminal to launch Alter Ego.
   * Input your Groq API Key in the setup screen to begin.
🛡️ Privacy & Persistence
Alter Ego values your data privacy. By utilizing Local Persistence, all chat histories, mission logs, and photos are stored directly on your device via Zustand. No remote database is used, meaning your "Future Self" conversations remain yours alone.
Ready to meet your better half?
