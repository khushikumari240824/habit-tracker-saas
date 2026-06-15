interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${
        isActive
          ? "bg-orange-100 text-orange-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span aria-hidden="true">{isActive ? "🔥" : "—"}</span>
      <span>{streak}</span>
    </div>
  );
}