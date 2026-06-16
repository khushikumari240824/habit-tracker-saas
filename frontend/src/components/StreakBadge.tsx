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
          : "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400"
      }`}
    >
      {isActive ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 animate-pulse text-amber-500"
          aria-hidden="true"
        >
          <path d="M17.657 11.292c-.11-.22-.22-.44-.33-.66a9.04 9.04 0 00-1.89-2.67C13.887 6.4 12 4.192 12 2c0 1.65-.825 3.3-1.65 4.95-1.254 2.508-3.036 4.41-3.036 6.825 0 3.3 2.7 6.225 6 6.225s6-2.925 6-6.225c0-1.925-1.122-3.41-1.657-4.483z" />
        </svg>
      ) : (
        <span aria-hidden="true" className="text-slate-500 font-bold">-</span>
      )}
      <span>{streak} day streak</span>
    </div>
  );
}