import React, { useState, useEffect } from 'react';
import { Pause, Play, Check, Clock, AlertTriangle, ArrowRight, Zap, Info } from 'lucide-react';
import { TimeEstimationResult, formatTimeElapsed } from '../utils/timeEstimator';
import { englishToBengaliDigits } from '../data/questions';

interface AnalogClockTimerProps {
  estimation: TimeEstimationResult;
  isPaused: boolean;
  onTogglePause: () => void;
  onFinishAndNext: () => void;
  elapsedSeconds: number;
}

export const AnalogClockTimer: React.FC<AnalogClockTimerProps> = ({
  estimation,
  isPaused,
  onTogglePause,
  onFinishAndNext,
  elapsedSeconds,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Target duration from intelligent estimation
  const targetSeconds = estimation.seconds;
  const isOvertime = elapsedSeconds > targetSeconds;
  const percentUsed = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  // Analog clock angles:
  // Standard clock: 60 seconds = 360 degrees (6 deg/sec)
  // Minute hand: 60 minutes = 360 degrees (0.1 deg/sec)
  // Hour hand: 12 hours = 360 degrees (0.0083 deg/sec)
  // For standard stopwatch feel, second hand rotates every 60s
  const secondHandAngle = (elapsedSeconds % 60) * 6; // 0 to 360 deg
  const minuteHandAngle = ((elapsedSeconds / 60) % 60) * 6; // 6 deg per minute
  const hourHandAngle = ((elapsedSeconds / 3600) % 12) * 30; // 30 deg per hour

  // Also calculate target indicator angle on 60s or total scale
  const targetMinuteHandAngle = ((targetSeconds / 60) % 60) * 6;

  // Arc calculation for circular progress bezel (SVG circle stroke-dasharray)
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, (elapsedSeconds / targetSeconds) * 100) / 100) * circumference;

  // Formatted times
  const elapsedFormatted = formatTimeElapsed(elapsedSeconds);
  const overtimeFormatted = isOvertime ? formatTimeElapsed(elapsedSeconds - targetSeconds) : null;

  // Ring color depending on pacing
  let ringColor = 'stroke-teal-500';
  let badgeColor = 'text-teal-700 bg-teal-50 border-teal-200';
  let ringBgTrack = 'stroke-teal-100';

  if (isOvertime) {
    ringColor = 'stroke-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse';
    ringBgTrack = 'stroke-rose-100';
  } else if (percentUsed >= 75) {
    ringColor = 'stroke-amber-500';
    badgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
    ringBgTrack = 'stroke-amber-100';
  }

  return (
    <div id="question-analog-timer" className="flex flex-col items-center bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
      
      {/* Top Header: Estimated Time & Complexity */}
      <div className="w-full flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>স্মার্ট টাইমার</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
            {estimation.reasonBengali}
          </span>
        </div>

        {/* Pause / Resume Button */}
        <button
          id="toggle-pause-btn"
          type="button"
          onClick={onTogglePause}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            isPaused
              ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title={isPaused ? "টাইমার চালু করুন" : "টাইমার সাময়িক থামান"}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>চালান</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>বিরতি</span>
            </>
          )}
        </button>
      </div>

      {/* Main Analog Clock Face - Clickable to finish question and go to next! */}
      <div className="relative group my-1">
        <button
          id="analog-clock-click-target"
          type="button"
          onClick={onFinishAndNext}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative block w-44 h-44 sm:w-48 sm:h-48 rounded-full focus:outline-hidden focus:ring-4 focus:ring-teal-400/40 cursor-pointer transition-transform transform active:scale-95 select-none"
          title="ঘড়িতে ক্লিক করে প্রশ্নটি সমাপ্ত করুন ও পরবর্তী প্রশ্নে যান"
          aria-label="Finish question and go to next"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-md overflow-visible"
          >
            <defs>
              {/* Radial gradient for clock dial */}
              <radialGradient id="clockDialGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </radialGradient>

              {/* Shadow filter */}
              <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Outer Bezel */}
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="url(#clockDialGrad)"
              stroke="#cbd5e1"
              strokeWidth="4"
            />

            {/* Background Circular Track for Progress */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeWidth="6"
              className={ringBgTrack}
            />

            {/* Active Circular Progress Arc (fills as time passes) */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 100 100)"
              className={`transition-all duration-300 ${ringColor}`}
            />

            {/* 60 Minute / Second Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6) * (Math.PI / 180);
              const isHourTick = i % 5 === 0;
              const outerR = 88;
              const innerR = isHourTick ? 78 : 83;
              const x1 = 100 + outerR * Math.sin(angle);
              const y1 = 100 - outerR * Math.cos(angle);
              const x2 = 100 + innerR * Math.sin(angle);
              const y2 = 100 - innerR * Math.cos(angle);

              return (
                <line
                  key={`tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHourTick ? '#334155' : '#cbd5e1'}
                  strokeWidth={isHourTick ? 2.5 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Numerals 12, 3, 6, 9 */}
            <text x="100" y="34" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              ১২
            </text>
            <text x="168" y="104" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              ৩
            </text>
            <text x="100" y="174" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              ৬
            </text>
            <text x="32" y="104" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              ৯
            </text>

            {/* Target Marker Pin on Dial */}
            <g transform={`rotate(${targetMinuteHandAngle} 100 100)`}>
              <polygon points="100,24 96,16 104,16" fill="#0d9488" />
            </g>

            {/* Hour Hand */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="54"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#handShadow)"
              transform={`rotate(${hourHandAngle} 100 100)`}
            />

            {/* Minute Hand */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="38"
              stroke="#0f766e"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#handShadow)"
              transform={`rotate(${minuteHandAngle} 100 100)`}
            />

            {/* Second Hand (Smooth Red/Coral Needle) */}
            <g transform={`rotate(${secondHandAngle} 100 100)`} filter="url(#handShadow)">
              <line
                x1="100"
                y1="116"
                x2="100"
                y2="28"
                stroke={isOvertime ? '#e11d48' : '#0d9488'}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="100" cy="40" r="3" fill={isOvertime ? '#e11d48' : '#0d9488'} />
            </g>

            {/* Center Pivot Cap */}
            <circle cx="100" cy="100" r="5" fill="#0f172a" />
            <circle cx="100" cy="100" r="2.5" fill="#f8fafc" />
          </svg>

          {/* Interactive Hover Overlay indicating click to finish */}
          <div
            className={`absolute inset-0 rounded-full bg-teal-900/85 text-white flex flex-col items-center justify-center p-3 text-center transition-all duration-200 backdrop-blur-xs ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-95'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold leading-tight">
              ঘড়িতে ক্লিক করে শেষ করুন
            </span>
            <span className="text-[10px] text-teal-200 flex items-center gap-0.5 mt-0.5 font-medium">
              পরবর্তী প্রশ্নে যান <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Paused Overlay when exam is paused */}
          {isPaused && (
            <div className="absolute inset-0 rounded-full bg-slate-900/75 text-white flex flex-col items-center justify-center p-3 text-center backdrop-blur-xs">
              <Pause className="w-8 h-8 text-amber-400 animate-pulse mb-1" />
              <span className="text-xs font-bold">সময় স্থগিত</span>
              <span className="text-[10px] text-slate-300">বিরতি মোড</span>
            </div>
          )}
        </button>

        {/* Pulse effect badge for overtime */}
        {isOvertime && !isPaused && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] items-center justify-center font-bold">!</span>
          </div>
        )}
      </div>

      {/* Digital Timer Readout & Status Details */}
      <div className="w-full flex flex-col items-center gap-1.5 mt-2 text-center">
        
        {/* Time Counters: Elapsed vs Target */}
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-1 font-mono text-base sm:text-lg font-bold text-slate-900">
            <span>{englishToBengaliDigits(elapsedFormatted.digital)}</span>
            <span className="text-xs font-normal text-slate-400">/</span>
            <span className="text-xs font-medium text-slate-500">
              {englishToBengaliDigits(estimation.formattedMinutesSeconds)}
            </span>
          </div>
        </div>

        {/* Overtime or Progress Badge */}
        <div className="flex items-center gap-1.5">
          {isOvertime ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>+{englishToBengaliDigits(overtimeFormatted?.digital || '00:00')} অতিরিক্ত</span>
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
              <Zap className="w-3 h-3 text-teal-600" />
              <span>{englishToBengaliDigits(percentUsed)}% সময় অতিবাহিত</span>
            </span>
          )}
        </div>

        {/* Action Prompt Note */}
        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
          <Info className="w-3 h-3 text-slate-400" />
          <span>ঘড়িতে ক্লিক করে প্রশ্নটি শেষ করুন</span>
        </p>

      </div>

    </div>
  );
};
