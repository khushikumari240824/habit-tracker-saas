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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-slate-400 mb-1.5">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.name} className="text-xs font-bold flex items-center gap-1.5" style={{ color: pld.color }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pld.color }} />
            {pld.name}: {pld.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
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
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} 
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            interval={Math.floor(days / 6)} 
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} 
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            allowDecimals={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="completions"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#818cf8" }}
            name="Daily Completions"
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            name="7-Day Average"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}