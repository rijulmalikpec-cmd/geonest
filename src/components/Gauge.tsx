import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  size?: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value, size = 200 }) => {
  const radius = size * 0.4;
  const stroke = size * 0.1;
  const normalizedValue = Math.min(100, Math.max(0, value));
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;

  const getColor = (v: number) => {
    if (v <= 20) return '#ef4444'; // Red
    if (v <= 40) return '#f97316'; // Orange
    if (v <= 60) return '#eab308'; // Yellow
    if (v <= 80) return '#3b82f6'; // Blue
    return '#22c55e'; // Green
  };

  const getLabel = (v: number) => {
    if (v <= 20) return 'EXTREME PRIORITY';
    if (v <= 40) return 'HIGH PRIORITY';
    if (v <= 60) return 'REQUIRES ATTENTION';
    if (v <= 80) return 'MODERATE';
    return 'GOOD';
  };

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(normalizedValue)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-mono font-bold">{normalizedValue}</span>
        <span className="text-[10px] font-mono font-bold mt-1 text-center px-4 leading-tight">
          {getLabel(normalizedValue)}
        </span>
      </div>
    </div>
  );
};
