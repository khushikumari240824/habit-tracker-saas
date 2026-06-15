"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HeatmapEntry } from "@/types/habit";

interface ProgressChartProps {
  data: HeatmapEntry[];
  days?: number;
}

/**
 * Line chart showing daily completion counts over the last `days` days,
 * with a rolling 7-day average to smooth out noise ("progress velocity").
 */
export default function ProgressChart({ data, days = 30 }: ProgressChartProps) {
  const countsByDate = new Map(data.map((d) => [d.date, d.count]));

  const today = new Date();
  const series: { date: string; label: string; completions: number; average: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    series.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      completions: countsByDate.get(dateStr) ?? 0,
      average: 0,
    });
  }

  // Rolling 7-day average
  for (let i = 0; i < series.length; i++) {
    const windowStart = Math.max(0, i - 6);
    const windowSlice = series.slice(windowStart, i + 1);
    const sum = windowSlice.reduce((acc, item) => acc + item.completions, 0);
    series[i].average = Math.round((sum / windowSlice.length) * 10) / 10;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={Math.floor(days / 8)} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="completions"
            stroke="#9ca3af"
            strokeWidth={1.5}
            dot={false}
            name="Completions"
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="7-day avg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}