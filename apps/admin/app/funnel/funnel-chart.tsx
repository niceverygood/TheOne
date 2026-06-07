'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface FunnelDailyPoint {
  date: string;
  pageView: number;
  waitlistView: number;
  waitlistStart: number;
  waitlistSuccess: number;
}

const SERIES: { key: keyof FunnelDailyPoint; name: string; color: string }[] = [
  { key: 'pageView', name: '방문', color: '#8B8378' },
  { key: 'waitlistView', name: '폼 노출', color: '#B8956A' },
  { key: 'waitlistStart', name: '폼 시작', color: '#6B8E7F' },
  { key: 'waitlistSuccess', name: '가입', color: '#1A1F2E' },
];

export function FunnelChart({ data }: { data: FunnelDailyPoint[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#F5F1EA" vertical={false} />
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
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {SERIES.map((s) => (
          <span
            key={s.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#8B8378',
            }}
          >
            <span style={{ width: 10, height: 2, background: s.color, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
