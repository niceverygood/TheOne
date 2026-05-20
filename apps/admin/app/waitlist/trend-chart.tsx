'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function TrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8956A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#B8956A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 10, fill: '#8B8378' }}
            tickLine={false}
            axisLine={{ stroke: '#EDE8DE' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#8B8378' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #EDE8DE', borderRadius: 2, fontSize: 12 }}
            labelStyle={{ color: '#1A1F2E' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#B8956A"
            strokeWidth={1.5}
            fill="url(#fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
