'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface OrderChartProps {
  data: { date: string; orders: number }[];
}

export function OrderChart({ data }: OrderChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8C837C', fontSize: 11, fontWeight: 500 }} 
            dy={8}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8C837C', fontSize: 11, fontWeight: 500 }}
            dx={-8}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              fontSize: '12px',
              fontFamily: 'inherit',
              color: 'var(--foreground)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="orders" 
            stroke="var(--primary)" 
            strokeWidth={3} 
            fillOpacity={1}
            fill="url(#colorOrders)"
            dot={{ fill: 'var(--primary)', r: 4, stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

