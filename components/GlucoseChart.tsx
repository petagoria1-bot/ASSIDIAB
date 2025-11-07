import React from 'react';
import { Patient, Mesure, Repas, Injection } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';

type ChartEvent = (Mesure | Repas | Injection) & { type: 'mesure' | 'repas' | 'injection' };

interface GlucoseChartProps {
  events: ChartEvent[];
  patient: Patient;
}

const MealIcon: React.FC<{x: number; y: number}> = ({x, y}) => (
    <g transform={`translate(${x - 8}, ${y - 8})`}>
        <path d="M7 21h10" stroke="#7c3aed" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 11h18" stroke="#7c3aed" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 11v10" stroke="#7c3aed" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6.6 11.2c.9-2.5 3.1-4.2 5.4-4.2s4.5 1.7 5.4 4.2" stroke="#a78bfa" fill="none" strokeWidth="2" strokeLinecap="round"/>
    </g>
);

const InjectionIcon: React.FC<{x: number; y: number}> = ({x, y}) => (
    <g transform={`translate(${x - 8}, ${y - 8})`}>
       <path d="m18 2 4 4" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
       <path d="m17 7 3-3" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
       <path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
);

const GlucoseChart: React.FC<GlucoseChartProps> = ({ events, patient }) => {
  const t = useTranslations();
  const isRTL = t.isRTL;

  const width = 500;
  const height = 250;
  const padding = { top: 20, right: isRTL ? 40 : 20, bottom: 50, left: isRTL ? 20 : 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const yMax = 4; // g/L

  const timeToX = (date: Date) => {
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (minutes / (24 * 60)) * chartWidth;
  };
  const glucoseToY = (gly: number) => chartHeight - (gly / yMax) * chartHeight;

  const mesures = events.filter(e => e.type === 'mesure') as Mesure[];
  const repas = events.filter(e => e.type === 'repas') as Repas[];
  const injections = events.filter(e => e.type === 'injection') as Injection[];

  const pathData = mesures
    .sort((a,b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    .map(m => `${timeToX(new Date(m.ts))},${glucoseToY(m.gly)}`)
    .join(' L');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Y-axis labels and grid lines */}
        {[1, 2, 3].map(val => (
            <g key={val}>
                <line x1={0} y1={glucoseToY(val)} x2={chartWidth} y2={glucoseToY(val)} stroke="#e2e8f0" strokeDasharray="2,3"/>
                <text x={isRTL ? chartWidth + 10 : -10} y={glucoseToY(val) + 4} textAnchor={isRTL ? "start" : "end"} fontSize="10" fill="#94a3b8">{val.toFixed(1)}</text>
            </g>
        ))}
        <text x={isRTL ? chartWidth + 10 : -10} y={-5} textAnchor={isRTL ? "start" : "end"} fontSize="10" fill="#94a3b8">{yMax.toFixed(1)} g/L</text>
        
        {/* Target Range */}
        <rect 
            x="0" 
            y={glucoseToY(patient.cibles.gly_max)}
            width={chartWidth}
            height={glucoseToY(patient.cibles.gly_min) - glucoseToY(patient.cibles.gly_max)}
            fill="#10b981"
            opacity="0.1"
        />

        {/* X-axis labels and grid lines */}
        {[0, 6, 12, 18, 24].map(hour => {
            const date = new Date(0);
            date.setHours(hour, 0, 0, 0);
            const xPos = timeToX(date);
            return (
             <g key={hour}>
                <line x1={xPos} y1={0} x2={xPos} y2={chartHeight} stroke="#e2e8f0" strokeDasharray="2,3"/>
                <text x={xPos} y={chartHeight + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">{String(hour).padStart(2, '0')}:00</text>
            </g>
        )})}
        
        {/* Glucose line and points */}
        {pathData && <path d={`M${pathData}`} fill="none" stroke="#10b981" strokeWidth="2" />}
        {mesures.map(m => (
            <circle key={m.id} cx={timeToX(new Date(m.ts))} cy={glucoseToY(m.gly)} r="3" fill="#10b981" />
        ))}

        {/* Repas Icons */}
        {repas.map(r => (
            <MealIcon key={r.id} x={timeToX(new Date(r.ts))} y={chartHeight + 35} />
        ))}

        {/* Injection Icons */}
        {injections.map(i => (
            <InjectionIcon key={i.id} x={timeToX(new Date(i.ts))} y={10} />
        ))}
      </g>
    </svg>
  );
};

export default GlucoseChart;