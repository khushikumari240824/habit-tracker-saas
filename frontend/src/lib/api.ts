import { getToken, clearAuth } from "./auth";
import {
  AuthResponse,
  Habit,
  HabitLog,
  HeatmapEntry,
  SummaryStats,
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
  );
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