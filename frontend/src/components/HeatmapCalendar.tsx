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
    if (count === 0) return "bg-gray-100";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-green-200";
    if (ratio <= 0.5) return "bg-green-400";
    if (ratio <= 0.75) return "bg-green-600";
    return "bg-green-800";
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {columns.map((column, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1">
            {column.map((cell, rowIdx) =>
              cell ? (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} habit${cell.count === 1 ? "" : "s"} completed`}
                  className={`h-3 w-3 rounded-sm ${getColor(cell.count)}`}
                />
              ) : (
                <div key={`empty-${colIdx}-${rowIdx}`} className="h-3 w-3" />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-gray-100" />
        <div className="h-3 w-3 rounded-sm bg-green-200" />
        <div className="h-3 w-3 rounded-sm bg-green-400" />
        <div className="h-3 w-3 rounded-sm bg-green-600" />
        <div className="h-3 w-3 rounded-sm bg-green-800" />
        <span>More</span>
      </div>
    </div>
  );
}