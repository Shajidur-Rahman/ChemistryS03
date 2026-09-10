import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Filter, 
  Share2,
  AlertCircle,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamResult } from '../data/types';
import { englishToBengaliDigits } from '../data/questions';
import { formatChemicalFormula } from '../utils/chemistryFormatter';

interface ExamResultViewProps {
  result: ExamResult;
  onRetakeExam: () => void;
  onNewExamSetup: () => void;
  onGoToRapid: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onRetakeExam,
  onNewExamSetup,
  onGoToRapid,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

  // Trigger confetti if scored 70% or higher!
  useEffect(() => {
    if (result.scorePercentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.scorePercentage]);

  // Performance Assessment
  const getAssessment = (percent: number) => {
    if (percent >= 90) return { grade: 'A+', title: 'অসাধারণ পারফরম্যান্স! 🏆', desc: 'আপনার প্রস্তুতি অত্যন্ত শক্তিশালী। পরিমাণগত রসায়নে আপনার দক্ষতা প্রশংসনীয়!' };
    if (percent >= 75) return { grade: 'A', title: 'খুব ভালো ফলাফল! 🌟', desc: 'বেশিরভাগ মৌলিক ও জটিল হিসাব আপনি সফলভাবে সমাধান করেছেন।' };
    if (percent >= 60) return { grade: 'B', title: 'সন্তোষজনক অগ্রগতি! 👍', desc: 'ভালো চেষ্টা করেছেন। কয়েকটি জটিল বিক্রিয়া ও টাইট্রেশনের নিয়ম রিভিশন করুন।' };
    if (percent >= 45) return { grade: 'C', title: 'উন্নতির সুযোগ রয়েছে 📚', desc: 'মৌলিক সূত্র ও হিসাবের গতি বাড়াতে নিয়মিত র‍্যাপিড প্র্যাকটিস প্রয়োজন।' };
    return { grade: 'D', title: 'আরও নিবিড় প্রস্তুতি প্রয়োজন 💪', desc: 'হতাশ হবেন না! ভুল প্রশ্নগুলোর ব্যাখ্যা মনোযোগ দিয়ে পড়ুন এবং পুনরায় পরীক্ষা দিন।' };
  };

  const assessment = getAssessment(result.scorePercentage);

  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    if (mins === 0) return `${englishToBengaliDigits(rem)} সেকেন্ড`;
    return `${englishToBengaliDigits(mins)} মিনিট ${rem > 0 ? `${englishToBengaliDigits(rem)} সেকেন্ড` : ''}`;
  };

  const avgSecs = Math.round(result.totalTimeSeconds / Math.max(1, result.totalQuestions));

  // Filter items
  const filteredItems = result.items.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'wrong') return !item.isCorrect && !item.isSkipped;
    if (filter === 'skipped') return item.isSkipped;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      
      {/* Hero Scorecard */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-xs text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />

        {/* Grade Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold shadow-2xs">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{assessment.grade} গ্রেড • {assessment.title}</span>
        </div>

        {/* Main Score Display */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span className="text-teal-600">{englishToBengaliDigits(result.correctCount)}</span>
            <span className="text-slate-300 font-light text-4xl sm:text-5xl">/</span>
            <span className="text-slate-700">{englishToBengaliDigits(result.totalQuestions)}</span>
          </div>
          <div className="text-lg font-bold text-slate-700">
            প্রাপ্ত নম্বর: {englishToBengaliDigits(result.scorePercentage)}%
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {assessment.desc}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center">
            <div className="text-xs font-semibold text-emerald-800">সঠিক উত্তর</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">
              {englishToBengaliDigits(result.correctCount)}
            </div>
            <div className="text-[11px] text-emerald-600">
              {englishToBengaliDigits(Math.round((result.correctCount / result.totalQuestions) * 100))}% নির্ভুল
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 text-center">
            <div className="text-xs font-semibold text-rose-800">ভুল উত্তর</div>
            <div className="text-2xl font-bold text-rose-700 mt-0.5">
              {englishToBengaliDigits(result.wrongCount)}
            </div>
            <div className="text-[11px] text-rose-600">পুনরায় যাচাই প্রয়োজন</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
            <div className="text-xs font-semibold text-amber-800">অনুত্তরিত / বাদ</div>
            <div className="text-2xl font-bold text-amber-700 mt-0.5">
              {englishToBengaliDigits(result.skippedCount)}
            </div>
            <div className="text-[11px] text-amber-600">উত্তর দেওয়া হয়নি</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center">
            <div className="text-xs font-semibold text-indigo-800">মোট সময় ব্যয়</div>
            <div className="text-base sm:text-lg font-bold text-indigo-950 mt-1">
              {formatSecs(result.totalTimeSeconds)}
            </div>
            <div className="text-[11px] text-indigo-600">
              গড় {englishToBengaliDigits(avgSecs)} সেকেন্ড / প্রশ্ন
            </div>
          </div>

        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onRetakeExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>একই প্রশ্ন পুনরায় দিন</span>
          </button>

          <button
            type="button"
            onClick={onNewExamSetup}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>নতুন পরীক্ষা সেটআপ</span>
          </button>

          <button
            type="button"
            onClick={onGoToRapid}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>র‍্যাপিড প্র্যাকটিসে যান</span>
          </button>
        </div>

      </div>

      {/* Detailed Question Review Breakdown */}
      <div className="space-y-4">
        
        {/* Section Header & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>প্রশ্নভিত্তিক বিস্তারিত সমাধান ও পর্যালোচনা</span>
            </h3>
            <p className="text-xs text-slate-500">
              প্রতিটি প্রশ্নের আপনার প্রদত্ত উত্তর, সঠিক উত্তর এবং রাসায়নিক সমাধান ব্যাখ্যা দেখুন।
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: `সকল প্রশ্ন (${englishToBengaliDigits(result.totalQuestions)})` },
              { id: 'wrong', label: `ভুল (${englishToBengaliDigits(result.wrongCount)})` },
              { id: 'correct', label: `সঠিক (${englishToBengaliDigits(result.correctCount)})` },
              { id: 'skipped', label: `বাদ (${englishToBengaliDigits(result.skippedCount)})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const originalNumber = item.question.id;
            const isCorrect = item.isCorrect;
            const isSkipped = item.isSkipped;

            return (
              <div 
                key={item.question.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 space-y-4 shadow-2xs transition ${
                  isCorrect 
                    ? 'border-emerald-200' 
                    : isSkipped 
                    ? 'border-slate-200' 
                    : 'border-rose-200'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center">
                      {englishToBengaliDigits(index + 1)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      মূল প্রশ্ন #{englishToBengaliDigits(originalNumber)} • {item.question.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      সময়: {formatSecs(item.timeSpentSeconds)}
                    </span>
                    {isCorrect && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>সঠিক</span>
                      </span>
                    )}
                    {!isCorrect && !isSkipped && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ভুল</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>অনুত্তরিত</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bengali Question Text */}
                <h4 className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                  {formatChemicalFormula(item.question.question)}
                </h4>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Student Answer */}
                  <div className={`p-3 rounded-2xl border text-xs sm:text-sm ${
                    isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : isSkipped
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}>
                    <span className="text-xs font-semibold block text-slate-500 mb-0.5">আপনার উত্তর:</span>
                    <span className="font-bold">
                      {item.userAnswer || '(কোনো উত্তর দেওয়া হয়নি)'}
                    </span>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-200 text-xs sm:text-sm text-teal-950">
                    <span className="text-xs font-semibold block text-teal-700 mb-0.5">সঠিক উত্তর:</span>
                    <span className="font-bold text-teal-900">
                      {formatChemicalFormula(item.question.answer)}
                    </span>
                  </div>

                </div>

                {/* Step-by-Step Chemical Explanation */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>পূর্ণাঙ্গ সমাধান ও রাসায়নিক গণনা:</span>
                  </div>
                  <p className="leading-relaxed font-mono whitespace-pre-wrap">
                    {formatChemicalFormula(item.question.stepExplanation || item.question.formulaHint)}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
