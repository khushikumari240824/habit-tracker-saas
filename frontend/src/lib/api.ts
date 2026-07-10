import { getToken, clearAuth, saveAuth, getUser } from "./auth";
import { recordCompletionNotification } from "./notifications";
import {
  AuthResponse,
  Habit,
  HabitLog,
  HeatmapEntry,
  SummaryStats,
  User,
} from "@/types/habit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
}

// ----------------------------------------------------
// MOCK DATABASE ENGINE (LocalStorage fallback)
// ----------------------------------------------------
const MOCK_USERS_KEY = "mock_users";
const MOCK_HABITS_KEY = "mock_habits";
const MOCK_LOGS_KEY = "mock_logs";
const MOCK_PROFILE_KEY = "mock_profile"; // For XP, Level, Badges, Avatar

// Helper to seed initial demo data so the app looks premium on first load
function seedMockData() {
  if (typeof window === "undefined") return;

  const users = localStorage.getItem(MOCK_USERS_KEY);
  if (!users) {
    // Seed initial user
    const defaultUser: User = {
      id: 999,
      name: "Khushi Kumari",
      email: "khushi@example.com",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    };
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([defaultUser]));

    // Seed mock profile values
    localStorage.setItem(
      MOCK_PROFILE_KEY,
      JSON.stringify({
        xp: 150,
        level: 2,
        badges: ["First Step", "Streak Starter"],
        avatar: "/avatars/avatar-1.png",
      })
    );

    // Seed initial habits
    const defaultHabits: Habit[] = [
      {
        id: 101,
        userId: 999,
        name: "Morning Meditation 🧘",
        description: "10 minutes of mindfulness to start the day aligned",
        currentStreak: 5,
        longestStreak: 12,
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        completedToday: false,
      },
      {
        id: 102,
        userId: 999,
        name: "Read Technical Articles 📚",
        description: "Keep up with system design and frontend tech",
        currentStreak: 3,
        longestStreak: 5,
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedToday: false,
      },
      {
        id: 103,
        userId: 999,
        name: "Drink 3L Water 💧",
        description: "Hydrate throughout the day",
        currentStreak: 0,
        longestStreak: 18,
        isActive: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        completedToday: false,
      },
      {
        id: 104,
        userId: 999,
        name: "Hit the Gym 💪",
        description: "Weight training or high-intensity cardio",
        currentStreak: 2,
        longestStreak: 2,
        isActive: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        completedToday: false,
      },
    ];
    localStorage.setItem(MOCK_HABITS_KEY, JSON.stringify(defaultHabits));

    // Seed completion logs for the last 10 days to make charts populated
    const logs: { id: number; habitId: number; completedDate: string }[] = [];
    const today = new Date();
    
    // Add logs for Meditation (id 101) for last 5 days
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      logs.push({
        id: Math.random(),
        habitId: 101,
        completedDate: d.toISOString().split("T")[0],
      });
    }
    // Add some random logs in the past to simulate historical activity
    for (let i = 8; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      logs.push({
        id: Math.random(),
        habitId: 101,
        completedDate: d.toISOString().split("T")[0],
      });
    }
    // Add logs for Reading (id 102) for last 3 days
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      logs.push({
        id: Math.random(),
        habitId: 102,
        completedDate: d.toISOString().split("T")[0],
      });
    }
    // Add logs for Water (id 103) historical
    for (let i = 2; i < 20; i++) {
      if (i !== 5 && i !== 12) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        logs.push({
          id: Math.random(),
          habitId: 103,
          completedDate: d.toISOString().split("T")[0],
        });
      }
    }
    // Add logs for Gym (id 104) for last 2 days
    for (let i = 0; i < 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      logs.push({
        id: Math.random(),
        habitId: 104,
        completedDate: d.toISOString().split("T")[0],
      });
    }

    localStorage.setItem(MOCK_LOGS_KEY, JSON.stringify(logs));
  }
}

// Run seeding in browser context
if (typeof window !== "undefined") {
  seedMockData();
}

// Helper to retrieve data safely from localStorage
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Gamified XP updates
export function getMockProfile() {
  return getLocalItem(MOCK_PROFILE_KEY, {
    xp: 0,
    level: 1,
    badges: [] as string[],
    avatar: "/avatars/avatar-1.png",
  });
}

function addXp(amount: number): { xp: number; level: number; leveledUp: boolean; newBadgeUnlocked: string | null } {
  const profile = getMockProfile();
  const oldLevel = profile.level;
  
  profile.xp += amount;
  // Calculate level based on 100XP increments
  profile.level = Math.floor(profile.xp / 100) + 1;
  const leveledUp = profile.level > oldLevel;

  // Badge logic check
  let newBadgeUnlocked: string | null = null;
  const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
  const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
  
  const totalCompletions = logs.length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak)) : 0;

  const checkAndAddBadge = (badgeName: string) => {
    if (!profile.badges.includes(badgeName)) {
      profile.badges.push(badgeName);
      newBadgeUnlocked = badgeName;
    }
  };

  if (totalCompletions >= 1) checkAndAddBadge("First Step");
  if (maxStreak >= 3) checkAndAddBadge("Streak Starter");
  if (maxStreak >= 7) checkAndAddBadge("Streak Master");
  if (maxStreak >= 14) checkAndAddBadge("Habit Guru");
  if (totalCompletions >= 50) checkAndAddBadge("Century Club");

  // Check if completed 3 habits today
  const todayStr = new Date().toISOString().split("T")[0];
  const completedTodayCount = logs.filter((l) => l.completedDate === todayStr).length;
  if (completedTodayCount >= 3) {
    checkAndAddBadge("Super Consistent");
  }

  setLocalItem(MOCK_PROFILE_KEY, profile);
  return { xp: profile.xp, level: profile.level, leveledUp, newBadgeUnlocked };
}

// Re-calculate streaks for a specific habit
function recalculateStreak(habitId: number): { currentStreak: number; longestStreak: number } {
  const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
  const habitLogs = logs
    .filter((l) => l.habitId === habitId)
    .map((l) => l.completedDate)
    .sort();

  if (habitLogs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDates = Array.from(new Set(habitLogs));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Calculate longest streak in historical logs
  let lastDate: Date | null = null;
  const sortedDates = uniqueDates.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

  for (const date of sortedDates) {
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(date.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    lastDate = date;
  }

  // Calculate current streak (ending today or yesterday)
  const hasCompletedToday = uniqueDates.includes(todayStr);
  const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasCompletedToday && !hasCompletedYesterday) {
    currentStreak = 0;
  } else {
    // Traverse backwards starting from today (or yesterday)
    let searchDate = hasCompletedToday ? new Date() : yesterday;
    let keepCounting = true;

    while (keepCounting) {
      const searchStr = searchDate.toISOString().split("T")[0];
      if (uniqueDates.includes(searchStr)) {
        currentStreak++;
        searchDate.setDate(searchDate.getDate() - 1);
      } else {
        keepCounting = false;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

// Simulates the backend routes
async function handleMockRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Add artificial network delay for native loading skeletons
  await new Promise((resolve) => setTimeout(resolve, 350));

  const cleanPath = path.split("?")[0];
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Register
  if (cleanPath === "/auth/register" && method === "POST") {
    const users = getLocalItem<User[]>(MOCK_USERS_KEY, []);
    const exists = users.find((u) => u.email === body.email);
    if (exists) {
      throw new ApiError("Email already in use", 400);
    }
    const newUser: User = {
      id: Math.floor(Math.random() * 10000),
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setLocalItem(MOCK_USERS_KEY, users);

    // Initialize custom profile
    setLocalItem(MOCK_PROFILE_KEY, {
      xp: 0,
      level: 1,
      badges: [] as string[],
      avatar: "/avatars/avatar-1.png",
    });

    const mockResponse: AuthResponse = {
      message: "Registered successfully",
      token: "mock-jwt-token-xyz",
      user: newUser,
    };
    return mockResponse as unknown as T;
  }

  // Auth: Login
  if (cleanPath === "/auth/login" && method === "POST") {
    const users = getLocalItem<User[]>(MOCK_USERS_KEY, []);
    const user = users.find((u) => u.email === body.email);
    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }
    // Simulate successful login
    const mockResponse: AuthResponse = {
      message: "Logged in successfully",
      token: "mock-jwt-token-xyz",
      user,
    };
    return mockResponse as unknown as T;
  }

  // Auth: Update Profile (Custom Endpoint)
  if (cleanPath === "/auth/profile" && method === "PATCH") {
    const user = getUser();
    if (!user) throw new ApiError("Unauthorized", 401);

    const users = getLocalItem<User[]>(MOCK_USERS_KEY, []);
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, name: body.name, email: body.email };
      }
      return u;
    });
    setLocalItem(MOCK_USERS_KEY, updatedUsers);

    // Save avatar choice
    const profile = getMockProfile();
    profile.avatar = body.avatar || profile.avatar;
    setLocalItem(MOCK_PROFILE_KEY, profile);

    const updatedUser = { ...user, name: body.name, email: body.email };
    return { user: updatedUser } as unknown as T;
  }

  // Habits: List
  if (cleanPath === "/habits" && method === "GET") {
    const queryParams = new URLSearchParams(path.split("?")[1] || "");
    const dateQuery = queryParams.get("date") || new Date().toISOString().split("T")[0];

    const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);

    // Filter completions on selected date
    const formattedHabits = habits.map((h) => {
      const isCompleted = logs.some(
        (l) => l.habitId === h.id && l.completedDate === dateQuery
      );
      return {
        ...h,
        completedToday: isCompleted,
      };
    });

    return { habits: formattedHabits } as unknown as T;
  }

  // Habits: Create
  if (cleanPath === "/habits" && method === "POST") {
    const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    const newHabit: Habit = {
      id: Math.floor(Math.random() * 10000),
      userId: 999, // default user
      name: body.name,
      description: body.description || null,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      completedToday: false,
    };
    habits.push(newHabit);
    setLocalItem(MOCK_HABITS_KEY, habits);
    return { habit: newHabit } as unknown as T;
  }

  // Habits: Update
  if (cleanPath.startsWith("/habits/") && method === "PATCH") {
    const habitId = parseInt(cleanPath.split("/")[2]);
    const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    const idx = habits.findIndex((h) => h.id === habitId);

    if (idx === -1) {
      throw new ApiError("Habit not found", 404);
    }

    const updatedHabit = {
      ...habits[idx],
      ...body,
    };
    habits[idx] = updatedHabit;
    setLocalItem(MOCK_HABITS_KEY, habits);

    return { habit: updatedHabit } as unknown as T;
  }

  // Habits: Delete
  if (cleanPath.startsWith("/habits/") && method === "DELETE") {
    const habitId = parseInt(cleanPath.split("/")[2]);
    let habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    habits = habits.filter((h) => h.id !== habitId);
    setLocalItem(MOCK_HABITS_KEY, habits);

    // Delete associated logs
    let logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
    logs = logs.filter((l) => l.habitId !== habitId);
    setLocalItem(MOCK_LOGS_KEY, logs);

    return { id: habitId } as unknown as T;
  }

  // Logs: Toggle Habit
  if (cleanPath.startsWith("/logs/") && cleanPath.endsWith("/toggle") && method === "POST") {
    const habitId = parseInt(cleanPath.split("/")[2]);
    const todayDate = body.date || new Date().toISOString().split("T")[0];

    let logs = getLocalItem<{ id: number; habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
    const existingIdx = logs.findIndex(
      (l) => l.habitId === habitId && l.completedDate === todayDate
    );

    let completed = false;
    if (existingIdx !== -1) {
      // Toggle off -> delete log
      logs.splice(existingIdx, 1);
    } else {
      // Toggle on -> create log
      logs.push({
        id: Math.random(),
        habitId,
        completedDate: todayDate,
      });
      completed = true;
      // Add XP +10
      addXp(10);
    }
    setLocalItem(MOCK_LOGS_KEY, logs);

    // Recalculate streak values
    const streakInfo = recalculateStreak(habitId);
    const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    const habitIdx = habits.findIndex((h) => h.id === habitId);
    
    if (habitIdx !== -1) {
      habits[habitIdx].currentStreak = streakInfo.currentStreak;
      habits[habitIdx].longestStreak = streakInfo.longestStreak;
      setLocalItem(MOCK_HABITS_KEY, habits);
    }

    return {
      habit: habits[habitIdx] || null,
      completed,
    } as unknown as T;
  }

  // Logs: Retrieve habit logs
  if (cleanPath.startsWith("/logs/") && method === "GET") {
    const habitId = parseInt(cleanPath.split("/")[2]);
    const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
    const habitLogs = logs.filter((l) => l.habitId === habitId);
    return { logs: habitLogs } as unknown as T;
  }

  // Analytics: Heatmap (counts per date)
  if (cleanPath === "/analytics/heatmap" && method === "GET") {
    const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);
    
    // Group logs by completedDate
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      counts[log.completedDate] = (counts[log.completedDate] || 0) + 1;
    });

    const heatmap: HeatmapEntry[] = Object.keys(counts).map((date) => ({
      date,
      count: counts[date],
    }));

    return { heatmap } as unknown as T;
  }

  // Analytics: Summary
  if (cleanPath === "/analytics/summary" && method === "GET") {
    const habits = getLocalItem<Habit[]>(MOCK_HABITS_KEY, []);
    const logs = getLocalItem<{ habitId: number; completedDate: string }[]>(MOCK_LOGS_KEY, []);

    const totalHabits = habits.length;
    const totalCompletions = logs.length;
    
    const totalStreaks = habits.reduce((acc, h) => acc + h.currentStreak, 0);
    const averageCurrentStreak = totalHabits > 0 ? Math.round((totalStreaks / totalHabits) * 10) / 10 : 0;
    const longestStreakOverall = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak)) : 0;

    const stats: SummaryStats = {
      totalHabits,
      totalCompletions,
      averageCurrentStreak,
      longestStreakOverall,
    };

    return { stats } as unknown as T;
  }

  throw new ApiError("Mock endpoint not found", 404);
}

// ----------------------------------------------------
// MAIN NETWORK REQUEST DISPATCHER (with transparent Mock Fallback)
// ----------------------------------------------------
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError("Unauthorized", 401);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || "Something went wrong",
        res.status,
        data.errors
      );
    }

    return data as T;
  } catch (err) {
    // Catch fetch/connection issues transparently
    if (
      err instanceof TypeError || 
      (err instanceof Error && (err.message.includes("Failed to fetch") || err.message.includes("fetch failed")))
    ) {
      console.warn("[API Fallback] Backend server is unreachable. Fetching from client localStorage sandbox...");
      return handleMockRequest<T>(path, options);
    }
    throw err;
  }
}

// ---------------- Auth ----------------

export function registerRequest(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginRequest(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProfile(input: {
  name: string;
  email: string;
  avatar: string;
}): Promise<{ user: User }> {
  return request<{ user: User }>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// ---------------- Habits ----------------

export function getHabits(date: string): Promise<{ habits: Habit[] }> {
  return request<{ habits: Habit[] }>(`/habits?date=${date}`);
}

export function createHabit(input: {
  name: string;
  description?: string;
}): Promise<{ habit: Habit }> {
  return request<{ habit: Habit }>("/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateHabit(
  id: number,
  input: Partial<{ name: string; description: string; isActive: boolean }>
): Promise<{ habit: Habit }> {
  return request<{ habit: Habit }>(`/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteHabit(id: number): Promise<{ id: number }> {
  return request<{ id: number }>(`/habits/${id}`, {
    method: "DELETE",
  });
}

// ---------------- Logs ----------------

export function toggleHabitLog(
  habitId: number,
  date: string
): Promise<{ habit: Habit; completed: boolean }> {
  return request<{ habit: Habit; completed: boolean }>(
    `/logs/${habitId}/toggle`,
    {
      method: "POST",
      body: JSON.stringify({ date }),
    }
  ).then((result) => {
    if (result.completed && result.habit) {
      recordCompletionNotification(result.habit, date);
    }

    return result;
  });
}

export function getHabitLogs(habitId: number): Promise<{ logs: HabitLog[] }> {
  return request<{ logs: HabitLog[] }>(`/logs/${habitId}`);
}

// ---------------- Analytics ----------------

export function getHeatmap(days: number = 365): Promise<{ heatmap: HeatmapEntry[] }> {
  return request<{ heatmap: HeatmapEntry[] }>(`/analytics/heatmap?days=${days}`);
}

export function getSummary(): Promise<{ stats: SummaryStats }> {
  return request<{ stats: SummaryStats }>("/analytics/summary");
}

export { ApiError };