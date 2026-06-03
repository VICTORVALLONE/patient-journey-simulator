import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { WeekFrequency } from "@/lib/types";

export function WeeklyFrequencyChart({ data }: { data: WeekFrequency[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 4, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 256)" vertical={false} />
          <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: "oklch(0.55 0.04 257)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.04 257)" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "oklch(0.96 0.03 256)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid oklch(0.92 0.012 256)",
              fontSize: 12,
            }}
            formatter={(v) => [`${v ?? 0} sessões`, "Concluídas"]}
          />
          <Bar dataKey="sessions_done" fill="oklch(0.54 0.21 263)" radius={[8, 8, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}