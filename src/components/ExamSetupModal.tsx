import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  X, 
  Sliders, 
  Shuffle, 
  Layers, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { ExamConfig, Question } from '../data/types';
import { englishToBengaliDigits } from '../data/questions';

interface ExamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (config: ExamConfig) => void;
  allQuestions: Question[];
  topicsList: string[];
}

export const ExamSetupModal: React.FC<ExamSetupModalProps> = ({
  isOpen,
  onClose,
  onStartExam,
  allQuestions,
  topicsList,
}) => {
  const [sourceType, setSourceType] = useState<'range' | 'random'>('random');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(50);
  const [selectedTopic, setSelectedTopic] = useState<string>('সকল বিষয় (All Topics)');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Filter questions matching current setup to check pool size
  const poolCount = useMemo(() => {
    return allQuestions.filter((q) => {
      if (sourceType === 'range') {
        if (q.id < rangeStart || q.id > rangeEnd) return false;
      }
      if (selectedTopic !== 'সকল বিষয় (All Topics)' && q.topic !== selectedTopic) {
        return false;
      }
      return true;
    }).length;
  }, [allQuestions, sourceType, rangeStart, rangeEnd, selectedTopic]);

  // Adjust count if requested exceeds pool
  const effectiveCount = Math.min(questionCount, Math.max(1, poolCount));

  // Estimated duration in minutes (~1.5 min per question)
  const estimatedMins = Math.round(effectiveCount * 1.5);

  if (!isOpen) return null;

  const handleStart = () => {
    if (poolCount === 0) return;
    onStartExam({
      sourceType,
      rangeStart: Math.min(rangeStart, rangeEnd),
      rangeEnd: Math.max(rangeStart, rangeEnd),
      questionCount: effectiveCount,
      selectedTopic,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>মডেল টেস্ট সেটআপ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            রসায়ন পরীক্ষা কনফিগারেশন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            প্রশ্ন বাছাই পদ্ধতি, পরিসীমা এবং মোট প্রশ্নের সংখ্যা নির্বাচন করুন।
          </p>
        </div>

        <div className="space-y-5">
          
          {/* 1. Question Source Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              ১. প্রশ্ন নির্বাচনের উৎস (Question Source):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('random')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  sourceType === 'random'
                    ? 'border-teal-600 bg-teal-50/60 text-teal-950 ring-1 ring-teal-500 font-semibold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Shuffle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">র্যান্ডম প্রশ্ন (Random)</div>
                  <div className="text-[11px] text-slate-500 font-normal">সম্পূর্ণ ব্যাংক থেকে এলোমেলো প্রশ্ন</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('range')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  sourceType === 'range'
                    ? 'border-teal-600 bg-teal-50/60 text-teal-950 ring-1 ring-teal-500 font-semibold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">নির্দিষ্ট রেঞ্জ (Range)</div>
                  <div className="text-[11px] text-slate-500 font-normal">একটি নির্দিষ্ট নম্বর পরিসীমা থেকে</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Range is chosen: from where to where */}
          {sourceType === 'range' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>প্রশ্ন নম্বর পরিসীমা (Range Selection):</span>
                <span className="text-teal-700 font-bold">
                  {englishToBengaliDigits(rangeStart)} থেকে {englishToBengaliDigits(rangeEnd)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">শুরু (Start #):</label>
                  <input
                    type="number"
                    min={1}
                    max={184}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(Math.max(1, Math.min(184, Number(e.target.value))))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">শেষ (End #):</label>
                  <input
                    type="number"
                    min={1}
                    max={184}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(Math.max(1, Math.min(184, Number(e.target.value))))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Range Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400">দ্রুত রেঞ্জ:</span>
                {[
                  { label: '১-৫০', start: 1, end: 50 },
                  { label: '৫১-১০০', start: 51, end: 100 },
                  { label: '১০১-১৫০', start: 101, end: 150 },
                  { label: '১৫১-১৮৪', start: 151, end: 184 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setRangeStart(preset.start);
                      setRangeEnd(preset.end);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Topic Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              ২. বিষয় নির্বাচন (Topic Filter):
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
            >
              {topicsList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 3. Question Count Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>৩. মোট প্রশ্নের সংখ্যা (How Many Questions):</span>
              <span className="text-teal-700 font-bold">
                {englishToBengaliDigits(effectiveCount)} টি প্রশ্ন
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2">
              {[5, 10, 15, 20, 25, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  disabled={poolCount > 0 && num > poolCount}
                  className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    questionCount === num
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {englishToBengaliDigits(num)}টি
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-500">অথবা কাস্টম সংখ্যা:</span>
              <input
                type="number"
                min={1}
                max={poolCount || 184}
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
                className="w-24 px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-400">
                (উপলব্ধ মোট: {englishToBengaliDigits(poolCount)}টি)
              </span>
            </div>
          </div>

          {/* Exam Summary Preview Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-950 flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-teal-900">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>আনুমানিক সময়: প্রায় {englishToBengaliDigits(estimatedMins)} মিনিট</span>
              </div>
              <p className="text-teal-800">
                প্রশ্ন সংখ্যা: <strong className="font-semibold">{englishToBengaliDigits(effectiveCount)}টি</strong> • কোনো হিন্ট থাকবে না • পরীক্ষা শেষে পূর্ণাঙ্গ মার্কস
              </p>
            </div>
          </div>

          {poolCount === 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>নির্বাচিত রেঞ্জ ও বিষয়ে কোনো প্রশ্ন পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।</span>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={poolCount === 0}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span>পরীক্ষা শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
