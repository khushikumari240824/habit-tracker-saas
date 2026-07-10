"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { clearAuth } from "@/lib/auth";
import {
  getNotificationPreferences as getServerNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api";
import {
  getNotificationPreferences as getLocalNotificationPreferences,
  requestBrowserNotificationPermission,
  setNotificationPreferences as setLocalNotificationPreferences,
} from "@/lib/notifications";
import {
  Settings,
  Bell,
  SunMoon,
  Database,
  Trash2,
  AlertTriangle,
  Mail,
  ShieldAlert,
  Check
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialTheme = (localStorage.getItem("theme_preference") as "dark" | "light") || "dark";
    setTheme(initialTheme);

    const loadPreferences = async () => {
      try {
        const response = await getServerNotificationPreferences();
        const preferences = response.notificationPreferences;
        setLocalNotificationPreferences(preferences);
        setNotifications({
          inAppAlerts: preferences.inAppAlerts,
          browserNotifications: preferences.browserNotifications,
          emailReminder: preferences.dailyReminders,
          weeklyReport: preferences.weeklyDigest,
          streakAlerts: preferences.streakAlerts,
          dailyReminders: preferences.dailyReminders,
        });
      } catch {
        const preferences = getLocalNotificationPreferences();
        setNotifications({
          inAppAlerts: preferences.inAppAlerts,
          browserNotifications: preferences.browserNotifications,
          emailReminder: preferences.dailyReminders,
          weeklyReport: preferences.weeklyDigest,
          streakAlerts: preferences.streakAlerts,
          dailyReminders: preferences.dailyReminders,
        });
      }
    };

    loadPreferences();
  }, []);

  const changeTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_preference", newTheme);
      if (newTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  };

  const [notifications, setNotifications] = useState({
    inAppAlerts: true,
    browserNotifications: false,
    emailReminder: true,
    weeklyReport: false,
    streakAlerts: true,
    dailyReminders: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };

      setLocalNotificationPreferences({
        inAppAlerts: next.inAppAlerts,
        browserNotifications: next.browserNotifications,
        streakAlerts: next.streakAlerts,
        dailyReminders: next.dailyReminders,
        weeklyDigest: next.weeklyReport,
      });

      return next;
    });
  }

  async function enableBrowserNotifications() {
    const permission = await requestBrowserNotificationPermission();
    if (permission === "granted") {
      setNotifications((prev) => {
        const next = { ...prev, browserNotifications: true };
        setLocalNotificationPreferences({
          inAppAlerts: next.inAppAlerts,
          browserNotifications: next.browserNotifications,
          streakAlerts: next.streakAlerts,
          dailyReminders: next.dailyReminders,
          weeklyDigest: next.weeklyReport,
        });
        return next;
      });
    }
  }

  async function handleSavePreferences() {
    try {
      await updateNotificationPreferences({
        inAppAlerts: notifications.inAppAlerts,
        browserNotifications: notifications.browserNotifications,
        streakAlerts: notifications.streakAlerts,
        dailyReminders: notifications.dailyReminders,
        weeklyDigest: notifications.weeklyReport,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveSuccess(false);
    }
  }

  function handleClearData() {
    if (confirm("Are you sure you want to clear your local habit tracker logs? This will reset all streaks, XP, and badge milestones.")) {
      localStorage.removeItem("mock_habits");
      localStorage.removeItem("mock_logs");
      localStorage.removeItem("mock_profile");
      alert("Local registry reset successfully. Reloading page...");
      window.location.reload();
    }
  }

  function handleDeleteAccount() {
    if (deleteConfirmText.toLowerCase() === "delete") {
      // Clear data & auth
      localStorage.clear();
      clearAuth();
      router.push("/");
      window.location.reload();
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Settings Header */}
        <div className="border-b border-slate-800/20 dark:border-slate-900/60 light:border-slate-200/80 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r dark:from-white dark:to-slate-300 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
                Account Settings
              </h1>
            </div>
            <p className="mt-1 text-sm theme-text-muted font-medium">
              Manage configuration, notification logs, and workspace parameters.
            </p>
          </div>

          <button
            onClick={handleSavePreferences}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-550 dark:bg-indigo-650 dark:hover:bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Saved!
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>

        {/* Theme customization */}
        <section className="rounded-2xl glass-card p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <SunMoon className="h-4 w-4 text-indigo-400" />
            Visual Interface Theme
          </h2>
          <div className="flex items-center justify-between border-t border-slate-800/10 dark:border-slate-900/60 light:border-slate-200/80 pt-4">
            <div>
              <p className="text-sm font-bold theme-text">Theme Selection</p>
              <p className="text-xs theme-text-muted font-semibold mt-0.5">Toggle between dark navy dashboard and light dashboard mode</p>
            </div>
            <div className="flex rounded-xl bg-slate-950/20 dark:bg-slate-950 p-1 border border-slate-800/30 dark:border-slate-900">
              <button
                onClick={() => changeTheme("dark")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === "dark" ? "bg-indigo-600/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Dark Navy
              </button>
              <button
                onClick={() => changeTheme("light")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  theme === "light" ? "bg-indigo-600/15 text-indigo-550 dark:text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </section>

        {/* Notifications toggles */}
        <section className="rounded-2xl glass-card p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            Reminders & Alerts
          </h2>
          <div className="space-y-4 border-t border-slate-800/10 dark:border-slate-900/60 light:border-slate-200/80 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold theme-text">In-app Notification Feed</p>
                <p className="text-xs theme-text-muted font-semibold mt-0.5">Show streak warnings and habit completions in the header panel</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.inAppAlerts}
                onChange={() => toggleNotification("inAppAlerts")}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/10 dark:border-slate-900/40 light:border-slate-200/60 pt-4">
              <div>
                <p className="text-sm font-bold theme-text">Browser Notifications</p>
                <p className="text-xs theme-text-muted font-semibold mt-0.5">Receive real-time desktop prompts for completions and at-risk streaks</p>
              </div>
              <button
                onClick={enableBrowserNotifications}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${notifications.browserNotifications ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}
              >
                {notifications.browserNotifications ? "Enabled" : "Enable"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold theme-text">Daily Reminder Window</p>
                <p className="text-xs theme-text-muted font-semibold mt-0.5">Show evening reminders when habits are still incomplete</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyReminders}
                onChange={() => toggleNotification("dailyReminders")}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/10 dark:border-slate-900/40 light:border-slate-200/60 pt-4">
              <div>
                <p className="text-sm font-bold theme-text">Weekly Summary Reports</p>
                <p className="text-xs theme-text-muted font-semibold mt-0.5">Receive detailed progress curves and streak breakdowns on Sunday evenings</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyReport}
                onChange={() => toggleNotification("weeklyReport")}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/10 dark:border-slate-900/40 light:border-slate-200/60 pt-4">
              <div>
                <p className="text-sm font-bold theme-text">Gamified Streak Multipliers Alerts</p>
                <p className="text-xs theme-text-muted font-semibold mt-0.5">Instant popup notifications upon achieving level milestones</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.streakAlerts}
                onChange={() => toggleNotification("streakAlerts")}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Database Clear Sandbox options */}
        <section className="rounded-2xl glass-card p-6 space-y-4">
          <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" />
            Sandbox Administration
          </h2>
          <div className="flex items-center justify-between border-t border-slate-800/10 dark:border-slate-900/60 light:border-slate-200/80 pt-4">
            <div>
              <p className="text-sm font-bold theme-text">Reset local logs</p>
              <p className="text-xs theme-text-muted font-semibold mt-0.5">Delete all habits, daily logs, level history, and local settings</p>
            </div>
            <button
              onClick={handleClearData}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-450 dark:text-amber-400 transition-all"
            >
              Reset Data
            </button>
          </div>
        </section>

        {/* DANGER: Delete account */}
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md space-y-4">
          <h2 className="text-xs font-extrabold text-red-500 dark:text-red-400 tracking-wider uppercase flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400" />
            Danger Zone
          </h2>
          <div className="flex items-center justify-between border-t border-red-500/10 pt-4">
            <div>
              <p className="text-sm font-bold theme-text">Delete Account permanently</p>
              <p className="text-xs theme-text-muted font-semibold mt-0.5">Irreversibly delete your profile credentials and statistics</p>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-xl bg-red-600 hover:bg-red-550 dark:bg-red-650 dark:hover:bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* DELETE MODAL DOUBLE CHECK */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl glass-card bg-slate-950 dark:bg-slate-950 light:bg-white p-6 shadow-2xl z-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 mb-4">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>

            <h3 className="text-lg font-bold theme-text">Are you absolutely sure?</h3>
            <p className="mt-2 text-xs theme-text-muted leading-relaxed font-semibold">
              This action cannot be undone. To proceed, please type <span className="text-red-500 font-bold">delete</span> in the input below:
            </p>

            <input
              type="text"
              placeholder='Type "delete"'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-xl glass-input px-4 py-3 mt-4 text-sm focus:outline-none text-center font-bold"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl glass-input py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                className="flex-1 rounded-xl bg-red-650 hover:bg-red-600 disabled:opacity-50 py-3 text-xs font-bold text-white transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
