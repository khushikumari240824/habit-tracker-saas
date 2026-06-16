"use client";

import { HeatmapEntry } from "@/types/habit";

interface HeatmapCalendarProps {
  data: HeatmapEntry[];
  weeks?: number;
}

export default function HeatmapCalendar({ data, weeks = 52 }: HeatmapCalendarProps) {
  const countsByDate = new Map(data.map((d) => [d.date, d.count]));
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  // Build a list of dates: from (weeks * 7 - 1) days ago to today
  const today = new Date();
  const totalDays = weeks * 7;

  const days: { date: string; count: number }[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    days.push({ date: dateStr, count: countsByDate.get(dateStr) ?? 0 });
  }

  // Group into columns of 7 (weeks), padding the first column so it ends on today's weekday
  const firstDayOfWeek = new Date(days[0].date).getDay(); // 0 = Sunday
  const paddedDays: ({ date: string; count: number } | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...days,
  ];

  const columns: ({ date: string; count: number } | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    columns.push(paddedDays.slice(i, i + 7));
  }

  function getColor(count: number): string {
    if (count === 0) return "bg-slate-900 border border-slate-800/40 hover:border-slate-700/60";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-emerald-950/80 border border-emerald-900/40 hover:bg-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
    if (ratio <= 0.5) return "bg-emerald-800/80 border border-emerald-700/40 hover:bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    if (ratio <= 0.75) return "bg-emerald-600/90 border border-emerald-500/40 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
    return "bg-emerald-400 border border-emerald-300 hover:bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.45)]";
  }

  return (
    <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      <div className="flex gap-1.5 min-w-max p-1">
        {columns.map((column, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1.5">
            {column.map((cell, rowIdx) =>
              cell ? (
                <div
                  key={cell.date}
                  title={`${new Date(cell.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}: ${cell.count} habit${cell.count === 1 ? "" : "s"} completed`}
                  className={`h-3 w-3 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${getColor(cell.count)}`}
                />
              ) : (
                <div key={`empty-${colIdx}-${rowIdx}`} className="h-3 w-3" />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-slate-900 border border-slate-800/40" />
        <div className="h-3 w-3 rounded-sm bg-emerald-950/80 border border-emerald-900/40" />
        <div className="h-3 w-3 rounded-sm bg-emerald-800/80 border border-emerald-700/40" />
        <div className="h-3 w-3 rounded-sm bg-emerald-600/90 border border-emerald-500/40" />
        <div className="h-3 w-3 rounded-sm bg-emerald-400 border border-emerald-300" />
        <span>More</span>
      </div>
    </div>
  );
}