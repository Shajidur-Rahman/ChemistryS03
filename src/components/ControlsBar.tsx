import React from 'react';
import { Shuffle, ListOrdered, Filter, SlidersHorizontal, ChevronRight, Layers } from 'lucide-react';
import { PlayMode } from '../data/types';
import { englishToBengaliDigits, topicList, difficultyList } from '../data/questions';

interface ControlsBarProps {
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  rangeStart: number;
  rangeEnd: number;
  onRangeChange: (start: number, end: number) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (diff: string) => void;
  totalFilteredCount: number;
  currentIndex: number;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  mode,
  onModeChange,
  rangeStart,
  rangeEnd,
  onRangeChange,
  selectedTopic,
  onTopicChange,
  selectedDifficulty,
  onDifficultyChange,
  totalFilteredCount,
  currentIndex,
}) => {
  const presets = [
    { label: "সব প্রশ্ন (১-১৮৪)", start: 1, end: 184 },
    { label: "পর্ব ১: মোল ও সংকেত (১-৪৫)", start: 1, end: 45 },
    { label: "পর্ব ২: তুল্যভর ও ঘনমাত্রা (৪৬-৯০)", start: 46, end: 90 },
    { label: "পর্ব ৩: গ্যাস ও টাইট্রেশন (৯১-১৪০)", start: 91, end: 140 },
    { label: "পর্ব ৪: রেডক্স ও বিশ্লেষণ (১৪১-১৮৪)", start: 141, end: 184 },
  ];

  return (
    <div id="controls-bar" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Top row: Mode Switcher & Progression Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        
        {/* Play Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            অনুশীলন মোড:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              id="mode-random-btn"
              type="button"
              onClick={() => onModeChange('random')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                mode === 'random'
                  ? 'bg-white text-teal-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>এলোমেলো (Random)</span>
            </button>
            <button
              id="mode-sequential-btn"
              type="button"
              onClick={() => onModeChange('sequential')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                mode === 'sequential'
                  ? 'bg-teal-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>ধারাবাহিক ক্রম (Sequential)</span>
            </button>
          </div>
        </div>

        {/* Structured learning banner */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>
            {mode === 'sequential' 
              ? `ধারাবাহিক প্রগ্রেস: প্রশ্ন ${englishToBengaliDigits(currentIndex + 1)} / ${englishToBengaliDigits(totalFilteredCount)} (ক্রম অনুসারে)` 
              : `র‍্যান্ডম মোড: মোট ${englishToBengaliDigits(totalFilteredCount)}টি উপযোগী প্রশ্ন`}
          </span>
        </div>
      </div>

      {/* Middle row: Range selection inputs & Presets */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Custom Range Inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-700">
              প্রশ্নের পরিসীমা:
            </span>
            <div className="flex items-center gap-1.5">
              <label htmlFor="range-start-input" className="text-xs text-slate-500">শুরু</label>
              <input
                id="range-start-input"
                type="number"
                min="1"
                max="184"
                value={rangeStart}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(184, parseInt(e.target.value) || 1));
                  onRangeChange(val, Math.max(val, rangeEnd));
                }}
                className="w-16 px-2.5 py-1 text-sm border border-slate-300 rounded-lg text-center font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-slate-400">হতে</span>
              <label htmlFor="range-end-input" className="text-xs text-slate-500">শেষ</label>
              <input
                id="range-end-input"
                type="number"
                min="1"
                max="184"
                value={rangeEnd}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(184, parseInt(e.target.value) || 184));
                  onRangeChange(Math.min(val, rangeStart), val);
                }}
                className="w-16 px-2.5 py-1 text-sm border border-slate-300 rounded-lg text-center font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              (প্রশ্ন নং {englishToBengaliDigits(rangeStart)} থেকে {englishToBengaliDigits(rangeEnd)})
            </span>
          </div>

          {/* Topic & Difficulty Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Topic Filter */}
            <div className="relative">
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-7 rounded-lg appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500 max-w-[190px] truncate"
              >
                {topicList.map((top) => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-7 rounded-lg appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {difficultyList.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Range Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-slate-400 mr-1">দ্রুত নির্বাচন:</span>
          {presets.map((preset) => {
            const isActive = rangeStart === preset.start && rangeEnd === preset.end;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onRangeChange(preset.start, preset.end)}
                className={`text-xs px-2.5 py-1 rounded-md transition cursor-pointer border ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
