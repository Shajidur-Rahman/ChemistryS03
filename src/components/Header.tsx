import React from 'react';
import { 
  FlaskConical, 
  BookOpen, 
  Grid3X3, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  BarChart2, 
  Pause, 
  Play,
  Zap,
  ClipboardCheck,
  HelpCircle
} from 'lucide-react';
import { englishToBengaliDigits } from '../data/questions';
import { AppPracticeMode } from '../data/types';

interface HeaderProps {
  score: {
    correct: number;
    attempted: number;
    streak: number;
  };
  totalCount: number;
  logsCount: number;
  isPaused: boolean;
  practiceMode: AppPracticeMode;
  onSwitchPracticeMode: (mode: AppPracticeMode) => void;
  onOpenModeSelector: () => void;
  onTogglePause: () => void;
  onOpenAnalysis: () => void;
  onOpenFormulas: () => void;
  onOpenNavigator: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  totalCount,
  logsCount,
  isPaused,
  practiceMode,
  onSwitchPracticeMode,
  onOpenModeSelector,
  onTogglePause,
  onOpenAnalysis,
  onOpenFormulas,
  onOpenNavigator,
  onResetProgress,
}) => {
  const accuracy = score.attempted > 0 
    ? Math.round((score.correct / score.attempted) * 100) 
    : 0;

  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    পরিমাণগত রসায়ন ল্যাব সহকারী
                  </h1>
                  <span className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {englishToBengaliDigits(totalCount)}টি প্রশ্ন ব্যাংক
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ইন্টারেক্টিভ কেমিস্ট্রি প্র্যাকটিস • স্মার্ট টাইমার ও অ্যানালিটিক্স
                </p>
              </div>
            </div>

            {/* Mobile streak & analysis badge */}
            <div className="sm:hidden flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenModeSelector}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold"
              >
                <span>মোড</span>
              </button>
              <button
                type="button"
                onClick={onTogglePause}
                className={`p-1.5 rounded-lg border text-xs font-semibold ${
                  isPaused ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={isPaused ? "চালান" : "বিরতি"}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onOpenAnalysis}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 text-xs font-semibold"
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Practice Mode Switcher Pill */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => onSwitchPracticeMode('rapid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                practiceMode === 'rapid'
                  ? 'bg-white text-amber-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="র‍্যাপিড প্রশ্ন: তাত্ক্ষণিক ফলাফল, হিন্ট ও অ্যানালগ টাইমার"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>র‍্যাপিড প্রশ্ন</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchPracticeMode('exam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                practiceMode === 'exam'
                  ? 'bg-white text-teal-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="পরীক্ষা মোড: রেঞ্জ বা র্যান্ডম প্রশ্ন এবং পরীক্ষা শেষে মার্কস"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>পরীক্ষা মোড</span>
            </button>
          </div>

          {/* Action Tools & Stats */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Desktop Stats */}
            {practiceMode === 'rapid' && (
              <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>সঠিক: <strong className="text-slate-900 font-semibold">{englishToBengaliDigits(score.correct)}</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ধারাবাহিক: <strong className="text-slate-900 font-semibold">{englishToBengaliDigits(score.streak)}</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div>
                  <span>নির্ভুলতা: <strong className="text-slate-900 font-semibold">{englishToBengaliDigits(accuracy)}%</strong></span>
                </div>
              </div>
            )}

            {/* Exam Pause / Resume Quick Toggle */}
            <button
              id="header-pause-btn"
              type="button"
              onClick={onTogglePause}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition cursor-pointer ${
                isPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isPaused ? "পরীক্ষা পুনরায় শুরু করুন" : "পরীক্ষা সাময়িক স্থগিত করুন"}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>বিরতি চলছে (Resume)</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>বিরতি</span>
                </>
              )}
            </button>

            {/* Analysis Section Button */}
            <button
              id="open-analysis-btn"
              type="button"
              onClick={onOpenAnalysis}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer"
              title="পরীক্ষার বিস্তারিত পারফরম্যান্স ও পেসিং বিশ্লেষণ"
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>বিশ্লেষণ</span>
              {logsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {englishToBengaliDigits(logsCount)}
                </span>
              )}
            </button>

            {/* Formula Reference Button */}
            <button
              id="open-formulas-btn"
              onClick={onOpenFormulas}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer"
              title="সকল রাসায়নিক সূত্র ও ধ্রুবক"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">সূত্র ভাণ্ডার</span>
            </button>

            {/* Question Navigator Button */}
            <button
              id="open-navigator-btn"
              onClick={onOpenNavigator}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
              title="১ থেকে ১৮৪ প্রশ্ন সূচি"
            >
              <Grid3X3 className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">প্রশ্ন সূচি</span>
            </button>

            {/* Reset Progress Button */}
            <button
              id="reset-progress-btn"
              onClick={onResetProgress}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="অগ্রগতি রিসেট করুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
