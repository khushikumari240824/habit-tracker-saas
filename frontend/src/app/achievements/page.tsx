"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getMockProfile } from "@/lib/api";
import {
  Award,
  Lock,
  Unlock,
  Zap,
  Flame,
  CheckCircle,
  Trophy,
  Star,
  Sparkles
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  req: string;
  category: "streak" | "completion" | "daily";
  color: string;
}

export default function AchievementsPage() {
  const [profile, setProfile] = useState<{ xp: number; level: number; badges: string[] }>({
    xp: 0,
    level: 1,
    badges: [],
  });

  useEffect(() => {
    const p = getMockProfile();
    if (p) {
      setProfile({
        xp: p.xp,
        level: p.level,
        badges: p.badges || [],
      });
    }
  }, []);

  const badgeDefinitions: Badge[] = [
    {
      id: "First Step",
      name: "First Step",
      desc: "Complete your very first habit routine entry",
      icon: "🌱",
      req: "Log 1 completion",
      category: "completion",
      color: "from-blue-500 to-cyan-500 shadow-blue-500/20",
    },
    {
      id: "Streak Starter",
      name: "Streak Starter",
      desc: "Maintain a consecutive 3-day streak on any habit",
      icon: "🔥",
      req: "3-day streak",
      category: "streak",
      color: "from-amber-500 to-orange-500 shadow-orange-500/20",
    },
    {
      id: "Streak Master",
      name: "Streak Master",
      desc: "Maintain a consecutive 7-day streak on any habit",
      icon: "⚡",
      req: "7-day streak",
      category: "streak",
      color: "from-indigo-500 to-purple-500 shadow-purple-500/20",
    },
    {
      id: "Habit Guru",
      name: "Habit Guru",
      desc: "Achieve a consecutive 14-day streak on any habit",
      icon: "🧠",
      req: "14-day streak",
      category: "streak",
      color: "from-rose-500 to-pink-500 shadow-pink-500/20",
    },
    {
      id: "Super Consistent",
      name: "Super Consistent",
      desc: "Tick off at least 3 habits on the same calendar date",
      icon: "🎯",
      req: "3 completions in 1 day",
      category: "daily",
      color: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
    },
    {
      id: "Century Club",
      name: "Century Club",
      desc: "Achieve 50 total completed habit logs across all time",
      icon: "💯",
      req: "50 total completions",
      category: "completion",
      color: "from-violet-500 to-fuchsia-600 shadow-fuchsia-500/20",
    },
  ];

  const trophies = [
    { name: "XP Gladiator", desc: "Accumulate 500 total XP points", progress: Math.min(100, Math.round((profile.xp / 500) * 100)), target: "500 XP" },
    { name: "Double Level Up", desc: "Advance to Level 3", progress: Math.min(100, Math.round((profile.level / 3) * 100)), target: "Level 3" },
    { name: "Badge Collector", desc: "Unlock 4 milestone badges", progress: Math.min(100, Math.round((profile.badges.length / 4) * 100)), target: "4 Badges" },
  ];

  const unlockedCount = badgeDefinitions.filter(b => profile.badges.includes(b.id)).length;
  const totalXP = profile.xp;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Achievements Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Milestones & Badges
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              Gamify your routines. Complete habits to secure XP and level trophies.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl px-5 py-3 shadow-md">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Score</p>
              <p className="text-xl font-extrabold text-indigo-400 mt-0.5">{totalXP} XP</p>
            </div>
            <div className="h-8 w-px bg-slate-850" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase">Unlocked</p>
              <p className="text-xl font-extrabold text-amber-500 mt-0.5">{unlockedCount} / 6</p>
            </div>
          </div>
        </div>

        {/* Milestone Badges Grid */}
        <div>
          <h2 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-6 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Milestone Badges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {badgeDefinitions.map((badge) => {
              const isUnlocked = profile.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 ${
                    isUnlocked
                      ? `bg-slate-900/35 border-slate-800/80 hover:border-indigo-500/35 shadow-[0_4px_30px_-5px_rgba(99,102,241,0.08)]`
                      : "bg-slate-950/20 border-slate-900/80 opacity-55 hover:opacity-75"
                  }`}
                >
                  {/* Badge Circle graphic */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl border transition-all duration-300 shadow-md ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.color} border-slate-700/60 scale-105`
                        : "bg-slate-900 border-slate-850 text-slate-600 grayscale"
                    }`}>
                      {badge.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className={`text-sm font-bold tracking-tight ${isUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                        {badge.name}
                      </h3>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isUnlocked 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-slate-900 text-slate-600"
                      }`}>
                        {isUnlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed font-semibold ${isUnlocked ? "text-slate-400" : "text-slate-655"}`}>
                    {badge.desc}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="uppercase">Requirement</span>
                    <span className={isUnlocked ? "text-indigo-400" : "text-slate-600"}>{badge.req}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trophies & Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-indigo-400" />
              Trophy Room Progress
            </h2>

            <div className="space-y-4">
              {trophies.map((trophy, index) => (
                <div key={index} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-350 mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{trophy.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">{trophy.desc}</p>
                    </div>
                    <span className="text-indigo-400">{trophy.target}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500"
                      style={{ width: `${trophy.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level guidelines card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/35 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">How to earn XP?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-semibold">
                You obtain **+10 XP** for each habit checked off. If you level up (every 100 cumulative XP), you unlock special multipliers and new badges.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-900 space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex justify-between">
                <span>Current Level</span>
                <span className="text-slate-300">Level {profile.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining to Lvl {profile.level + 1}</span>
                <span className="text-indigo-400">{100 - (profile.xp % 100)} XP</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
