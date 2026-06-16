"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Award,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated, getUser, clearAuth } from "@/lib/auth";
import { getMockProfile } from "@/lib/api";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [xpData, setXpData] = useState({ xp: 150, level: 2 });
  const [avatar, setAvatar] = useState("/avatars/avatar-1.png");
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialTheme = (localStorage.getItem("theme_preference") as "dark" | "light") || "dark";
      setThemeState(initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_preference", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "🔥 Great job! You maintained your meditation streak today.", time: "1 hour ago", read: false },
    { id: 2, text: "🏆 Achievement Unlocked: Streak Starter!", time: "Yesterday", read: false },
    { id: 3, text: "⚡ Pro-Tip: Adding descriptions to habits increases follow-through by 40%.", time: "2 days ago", read: true },
  ]);

  const user = getUser();

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setLoading(false);

    // Load XP and Avatar info
    const profile = getMockProfile();
    if (profile) {
      setXpData({ xp: profile.xp, level: profile.level });
      setAvatar(profile.avatar || "/avatars/avatar-1.png");
    }

    // Set up a listener for profile updates (so if profile/xp changes, layout reacts)
    const handleStorageChange = () => {
      const p = getMockProfile();
      if (p) {
        setXpData({ xp: p.xp, level: p.level });
        setAvatar(p.avatar || "/avatars/avatar-1.png");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Poll to keep it reactive (since storage event doesn't fire on same tab in all browsers)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center theme-bg theme-text">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-10 w-10 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider">Syncing dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Achievements", href: "/achievements", icon: Award },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Calculate percentage of level progress (100XP per level)
  const xpInCurrentLevel = xpData.xp % 100;
  const xpNeededForNextLevel = 100;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex min-h-screen theme-bg theme-text antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r theme-sidebar backdrop-blur-xl p-6 shrink-0 relative">
        <div className="flex items-center gap-2.5 mb-10 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
            HabitFlow SaaS
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400 font-bold shadow-[0_4px_20px_-8px_rgba(99,102,241,0.2)]"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User summary */}
        <div className="border-t border-slate-800/30 dark:border-slate-900/80 light:border-slate-200/80 pt-6">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="Avatar"
              className="h-10 w-10 rounded-full border border-slate-800/80 dark:border-slate-800 light:border-slate-200 bg-slate-900/40 object-cover"
              onError={(e) => {
                // Fallback to placeholder avatar
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.name || "avatar"}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate">{user?.name || "Khushi Kumari"}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || "khushi@example.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-200/50 border border-slate-800 dark:border-slate-800 light:border-slate-200 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b theme-header backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-20">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl glass-input text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Level Tracker Progress bar */}
            <div className="flex items-center gap-2.5 glass-card rounded-xl px-4 py-1.5 shadow-sm max-w-xs sm:max-w-md">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 text-xs font-extrabold animate-pulse">
                ⚡
              </span>
              <div className="text-left shrink-0">
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-300 light:text-slate-700">Level {xpData.level}</span>
                <span className="text-[10px] text-slate-500 font-semibold ml-2">({xpInCurrentLevel}/100 XP)</span>
              </div>
              <div className="h-1.5 w-20 sm:w-28 rounded-full bg-slate-950 dark:bg-slate-950 light:bg-slate-200/80 overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions (Notifications + User profile avatar link) */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl glass-input text-slate-400 hover:text-slate-200 transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-400" />
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) markAllRead();
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl glass-input text-slate-400 hover:text-slate-205 transition-all duration-300"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800/80 dark:border-slate-800/85 light:border-slate-200 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white shadow-2xl p-4 backdrop-blur-xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/20 dark:border-slate-900/80 light:border-slate-200/80 pb-2 mb-3">
                      <span className="text-xs font-extrabold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wide">Notifications</span>
                      <span className="text-[10px] font-semibold text-slate-500">Real-time alerts</span>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            n.read 
                              ? "bg-slate-900/10 dark:bg-slate-900/10 light:bg-slate-100/40 border-transparent" 
                              : "bg-indigo-600/5 dark:bg-indigo-600/5 light:bg-indigo-500/5 border-indigo-500/20"
                          }`}
                        >
                          <p className="text-xs text-slate-350 dark:text-slate-300 light:text-slate-700 font-medium leading-normal">{n.text}</p>
                          <span className="text-[9px] text-slate-500 font-semibold mt-1 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Quicklink */}
            <Link
              href="/profile"
              className="flex items-center gap-2 border border-slate-800/20 dark:border-slate-800/80 light:border-slate-200/80 hover:border-indigo-500/30 rounded-xl p-1.5 pr-2.5 bg-slate-900/10 dark:bg-slate-900/20 light:bg-white/45 transition-all duration-300"
            >
              <img
                src={avatar}
                alt="Avatar"
                className="h-7 w-7 rounded-full bg-slate-900 object-cover border border-slate-800/40 dark:border-slate-800 light:border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.name || "avatar"}`;
                }}
              />
              <span className="hidden sm:inline text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 truncate max-w-[80px]">
                {user?.name.split(" ")[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar overlay sliding drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />

              {/* Slider panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 theme-sidebar border-r z-50 p-6 flex flex-col md:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <Zap className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-base font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      HabitFlow
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg glass-card text-slate-400 hover:text-slate-205"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex-1 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                          isActive
                            ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400 font-bold shadow-[0_4px_20px_-8px_rgba(99,102,241,0.2)]"
                            : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border-l-2 border-transparent"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile sidebar Footer */}
                <div className="border-t border-slate-800/35 dark:border-slate-900/80 light:border-slate-200/80 pt-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.name || "avatar"}`;
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate">{user?.name || "Khushi Kumari"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || "khushi@example.com"}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-200/50 border border-slate-800 dark:border-slate-800 light:border-slate-200 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Page Content Wrapped in Motion Transition */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
