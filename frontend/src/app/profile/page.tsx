"use client";

import { useEffect, useState, FormEvent } from "react";
import AppLayout from "@/components/AppLayout";
import { getUser } from "@/lib/auth";
import { getMockProfile, updateProfile } from "@/lib/api";
import {
  User,
  Mail,
  Calendar,
  Zap,
  Award,
  Sparkles,
  CheckCircle2,
  Edit,
  Camera,
  Check
} from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeAvatar, setActiveAvatar] = useState("/avatars/avatar-1.png");
  
  const [profileStats, setProfileStats] = useState({
    xp: 150,
    level: 2,
    badges: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const defaultUser = getUser();

  // Preset avatar choices
  const avatarPresets = [
    { name: "Neon Blue", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Khushi" },
    { name: "Synthwave Purple", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Nico" },
    { name: "Teal Matrix", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Matrix" },
    { name: "Cyberpunk Pink", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Anya" },
    { name: "Galaxy Orange", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Vince" },
    { name: "Mint Spark", path: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Lumina" },
  ];

  useEffect(() => {
    if (defaultUser) {
      setName(defaultUser.name);
      setEmail(defaultUser.email);
    }

    const p = getMockProfile();
    if (p) {
      setProfileStats({
        xp: p.xp,
        level: p.level,
        badges: p.badges || [],
      });
      setActiveAvatar(p.avatar || avatarPresets[0].path);
    }
  }, []);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const result = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatar: activeAvatar,
      });
      
      // Update local storage auth user details
      localStorage.setItem("habit_tracker_user", JSON.stringify(result.user));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError("Failed to update profile data");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAvatar(avatarPath: string) {
    setActiveAvatar(avatarPath);
    setAvatarPickerOpen(false);
  }

  // Calculate cumulative stats
  const xpInCurrentLevel = profileStats.xp % 100;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 100) * 100));
  const joinedDate = defaultUser?.createdAt
    ? new Date(defaultUser.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "June 2026";

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="border-b border-slate-800/20 dark:border-slate-900/60 light:border-slate-200/80 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r dark:from-white dark:to-slate-300 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <p className="mt-1 text-sm theme-text-muted font-medium">
              Customize avatar parameters, credentials, and review gamified standings.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Avatar Upload Simulator + Score standings */}
          <div className="md:col-span-1 rounded-2xl glass-card p-6 text-center flex flex-col items-center justify-between">
            <div className="w-full flex flex-col items-center">
              {/* Profile image with edit overlay */}
              <div className="relative group cursor-pointer mb-5" onClick={() => setAvatarPickerOpen(true)}>
                <img
                  src={activeAvatar}
                  alt="User Avatar"
                  className="h-28 w-28 rounded-full border-2 border-indigo-500 bg-slate-900/10 dark:bg-slate-900 object-cover shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all group-hover:opacity-85"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = avatarPresets[0].path;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              <h2 className="text-lg font-bold theme-text">{name || "Khushi Kumari"}</h2>
              <p className="text-xs theme-text-muted font-semibold mt-0.5">{email || "khushi@example.com"}</p>
              
              <div className="flex items-center gap-1.5 justify-center mt-3 text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-widest">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                Member Since {joinedDate}
              </div>
            </div>

            {/* Level card overlay */}
            <div className="w-full mt-6 pt-5 border-t border-slate-800/20 dark:border-slate-900/80 light:border-slate-200/80 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-300 light:text-slate-700">
                <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-amber-500" /> Level {profileStats.level}</span>
                <span className="text-indigo-500 dark:text-indigo-400">{xpInCurrentLevel} / 100 XP</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900/20 dark:bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Profile edit details form */}
          <div className="md:col-span-2 rounded-2xl glass-card p-6">
            <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-5 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Profile Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 light:text-slate-600">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-600">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl glass-input pl-11 pr-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 light:text-slate-600">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-600">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl glass-input pl-11 pr-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !email.trim()}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2"
                >
                  {loading ? (
                    "Adjusting..."
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Adjustments Saved
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Unlocked badges list summary preview */}
        <div className="rounded-2xl glass-card p-6">
          <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-5 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-indigo-400" />
            Milestone Showcase ({profileStats.badges.length})
          </h2>

          {profileStats.badges.length === 0 ? (
            <p className="text-xs text-slate-500 font-semibold">Unlock milestone badges by completing habits consistently!</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profileStats.badges.map((badgeName) => (
                <div
                  key={badgeName}
                  className="flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  {badgeName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AVATAR CHOOSER POPUP MODAL */}
      {avatarPickerOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAvatarPickerOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl glass-card bg-slate-950 dark:bg-slate-950 light:bg-white p-6 shadow-2xl z-10">
            <h3 className="text-lg font-bold theme-text mb-2">Choose Avatar Profile</h3>
            <p className="text-xs theme-text-muted font-semibold mb-6">Select a preset to customize your visual identity</p>

            <div className="grid grid-cols-3 gap-4">
              {avatarPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectAvatar(preset.path)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    activeAvatar === preset.path
                      ? "border-indigo-500 bg-indigo-500/10 scale-105"
                      : "border-slate-800/20 dark:border-slate-800 hover:border-slate-700/55 hover:bg-slate-900/10 dark:hover:bg-slate-900/40"
                  }`}
                >
                  <img src={preset.path} alt={preset.name} className="h-12 w-12 rounded-full border border-slate-800 bg-slate-900/20 dark:bg-slate-900" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-2 text-center leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
