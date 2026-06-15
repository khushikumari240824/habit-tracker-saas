export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Habit {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  createdAt: string;
  completedToday: boolean;
}

export interface HabitLog {
  completedDate: string;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface SummaryStats {
  totalHabits: number;
  totalCompletions: number;
  averageCurrentStreak: number;
  longestStreakOverall: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}