export type SkillLevel = 'Anfänger' | 'Fortgeschritten' | 'Profi';
export type Discipline = 'Einzel' | 'Doppel' | 'Beides';
export type FocusArea = 'Technik' | 'Ausdauer' | 'Beinarbeit' | 'Kraft' | 'Taktik' | 'Allround';

export interface GameResult {
  id: string;
  date: string;
  opponent: string;
  score: string;
  won: boolean;
  notes: string;
  discipline: Discipline;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface VideoAnalysis {
  id: string;
  date: string;
  videoUrl?: string;
  feedback: string;
  suggestedExercises: string[];
}

export interface PersonalDetails {
  favoritePlayer?: string;
  playingStyle?: string;
  racketModel?: string;
  clubName?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  level: SkillLevel;
  discipline: Discipline;
  goals: string[];
  xp: number;
  level_rank: number;
  completedWorkouts: number;
  context?: string;
  partnerName?: string;
  focusArea: FocusArea;
  gameResults: GameResult[];
  currentPlan?: TrainingPlan;
  badges: Badge[];
  unlockedRewards: string[]; // IDs of rewards like "custom_avatar", "pro_tips", etc.
  personalDetails?: PersonalDetails;
  videoAnalyses: VideoAnalysis[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  tips?: string;
  commonErrors?: string;
  duration: number; // in seconds
  reps?: number;
  xpReward: number;
  category: 'Technik' | 'Ausdauer' | 'Beinarbeit' | 'Kraft' | 'Taktik';
}

export interface TrainingPlan {
  id: string;
  title: string;
  exercises: Exercise[];
  totalDuration: number;
}

export type AppState = 'onboarding' | 'dashboard' | 'training' | 'summary' | 'duel';

export interface Duel {
  id: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  scores: { p1: number; p2: number }[];
  winnerId: string | null;
  status: 'pending' | 'active' | 'finished';
  createdAt: string;
}
