import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { PainEntry } from "@/lib/types";

export function PainTrendChart({ data }: { data: PainEntry[] }) {
  const formatted = data.map((d) => ({ ...d, week_label: `S${d.week}` }));
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 256)" vertical={false} />
          <XAxis dataKey="week_label" tick={{ fontSize: 11, fill: "oklch(0.55 0.04 257)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "oklch(0.55 0.04 257)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid oklch(0.92 0.012 256)",
              fontSize: 12,
            }}
            formatter={(v) => [`${Number(v ?? 0).toFixed(1)}`, "Dor média"]}
          />
          <Line
            type="monotone"
            dataKey="average_pain"
            stroke="oklch(0.65 0.22 27)"
            strokeWidth={2.5}
            dot={{ fill: "oklch(0.65 0.22 27)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}