interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 ${
        isActive
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
          : "border-slate-800 bg-slate-900/50 text-slate-500"
      }`}
    >
      {isActive ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5 animate-pulse text-amber-500"
          aria-hidden="true"
        >
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <span aria-hidden="true" className="text-slate-600">—</span>
      )}
      <span>{streak} day streak</span>
    </div>
  );
}