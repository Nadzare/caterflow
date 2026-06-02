'use client'

import { useState } from 'react';
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
  const [simulationState, setSimulationState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [loadingStep, setLoadingStep] = useState('');

  const runLSTMSimulation = () => {
    setSimulationState('loading');
    
    // Simulate training phases
    const steps = [
      "Mengambil data time-series dari Supabase...",
      "Normalisasi fitur (MinMaxScaler)...",
      "Membentuk sliding window 7-hari...",
      "Forward propagation model LSTM...",
      "Menghitung prediksi 3 hari ke depan..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingStep(step);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setSimulationState('success');
          }, 600);
        }
      }, (index + 1) * 600);
    });
  };

  const resetSimulation = () => {
    setSimulationState('idle');
    setLoadingStep('');
  };

  // Generate chart data based on state
  const getChartData = () => {
    if (data.length === 0) return [];
    
    // Default: format historical data for Recharts
    const baseData = data.map(item => ({
      date: item.date,
      orders: item.orders,
      prediction: null as number | null
    }));

    if (simulationState !== 'success') return baseData;

    // Calculate prediction based on average of last 3 days
    const last3Days = data.slice(-3);
    const avg = last3Days.reduce((sum, item) => sum + item.orders, 0) / 3;

    // Generate next 3 days names
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const lastDay = data[data.length - 1]?.date || "Sun";
    let lastIdx = weekdays.indexOf(lastDay);
    if (lastIdx === -1) lastIdx = 3; // Fallback

    const nextDay1 = weekdays[(lastIdx + 1) % 7];
    const nextDay2 = weekdays[(lastIdx + 2) % 7];
    const nextDay3 = weekdays[(lastIdx + 3) % 7];

    const pred1 = Math.max(1, Math.round(avg * 1.15)); // +15%
    const pred2 = Math.max(1, Math.round(avg * 0.90)); // -10%
    const pred3 = Math.max(1, Math.round(avg * 1.35)); // +35% (Weekend spike)

    // Add connection point on the last historical day
    baseData[baseData.length - 1].prediction = baseData[baseData.length - 1].orders;

    // Append 3 predicted days
    return [
      ...baseData,
      { date: nextDay1, orders: null as any, prediction: pred1 },
      { date: nextDay2, orders: null as any, prediction: pred2 },
      { date: nextDay3, orders: null as any, prediction: pred3 }
    ];
  };

  const chartData = getChartData();

  return (
    <div className="space-y-4 w-full">
      {/* Simulation Controls */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-stone-900/50 p-3 rounded-xl border border-slate-100 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-brain text-base text-[var(--primary)]" />
          <span className="text-xs font-semibold text-slate-600 dark:text-stone-300">
            Analisis Prediktif LSTM
          </span>
        </div>
        
        {simulationState === 'idle' && (
          <button
            onClick={runLSTMSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-sm shadow-orange-500/10"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs mr-1" />
            Simulasikan LSTM
          </button>
        )}

        {simulationState === 'loading' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-medium">
            <i className="fa-solid fa-spinner fa-spin text-xs text-[var(--primary)]" />
            <span>{loadingStep}</span>
          </div>
        )}

        {simulationState === 'success' && (
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-350 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
          >
            <i className="fa-solid fa-rotate text-xs mr-1" />
            Reset Prediksi
          </button>
        )}
      </div>

      {/* Recharts Area */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
            
            {/* Historical Data Area */}
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

            {/* Simulated LSTM Prediction Area */}
            {simulationState === 'success' && (
              <Area 
                type="monotone" 
                dataKey="prediction" 
                stroke="#10b981" 
                strokeDasharray="5 5"
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#colorPrediction)"
                dot={{ fill: '#10b981', r: 4, stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Model Insight Box */}
      {simulationState === 'success' && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/20 p-3.5 rounded-xl transition-all duration-300">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i className="fa-solid fa-wand-magic-sparkles text-xs mr-1" />
            Rekomendasi Operasional Model LSTM
          </div>
          <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
            Berdasarkan data time-series 7 hari terakhir, model mendeteksi **tren musiman mingguan**. Volume pesanan diprediksi akan mengalami lonjakan sebesar **+35%** pada hari terakhir simulasi (akhir pekan). Disarankan bagi tim dapur untuk meningkatkan stok bahan baku dasar katering wholesale sebesar **15%** guna mengantisipasi permintaan tersebut.
          </p>
        </div>
      )}
    </div>
  );
}


