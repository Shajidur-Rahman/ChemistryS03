import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  BarChart2, 
  TrendingUp, 
  Flame, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  Check,
  Award,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { QuestionAttemptLog, Question } from '../data/types';
import { englishToBengaliDigits } from '../data/questions';
import { formatTimeElapsed } from '../utils/timeEstimator';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: QuestionAttemptLog[];
  allQuestions: Question[];
  onSelectQuestion: (questionId: number) => void;
  onClearHistory: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  logs,
  allQuestions,
  onSelectQuestion,
  onClearHistory,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'mistakes' | 'overtime' | 'correct'>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<QuestionAttemptLog | null>(null);

  // Map question by id for quick lookup
  const questionMap = useMemo(() => {
    const map = new Map<number, Question>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [allQuestions]);

  // Comprehensive analytics calculations
  const stats = useMemo(() => {
    if (logs.length === 0) {
      return null;
    }

    const totalAttempts = logs.length;
    const correctCount = logs.filter((l) => l.isCorrect).length;
    const wrongCount = totalAttempts - correctCount;
    const accuracy = Math.round((correctCount / totalAttempts) * 100);

    const totalSeconds = logs.reduce((acc, l) => acc + l.timeSpentSeconds, 0);
    const avgSeconds = Math.round(totalSeconds / totalAttempts);
    const totalAllocated = logs.reduce((acc, l) => acc + l.allocatedSeconds, 0);
    const avgAllocated = Math.round(totalAllocated / totalAttempts);

    // Pacing breakdown
    let fastCount = 0;
    let onTimeCount = 0;
    let overtimeCount = 0;

    logs.forEach((l) => {
      const ratio = l.timeSpentSeconds / l.allocatedSeconds;
      if (ratio < 0.8) {
        fastCount++;
      } else if (ratio <= 1.1) {
        onTimeCount++;
      } else {
        overtimeCount++;
      }
    });

    const efficiencyScore = Math.round(((fastCount + onTimeCount) / totalAttempts) * 100);

    // Topic wise analysis
    const topicStatsMap: {
      [topic: string]: {
        total: number;
        correct: number;
        totalTime: number;
        totalAllocated: number;
      };
    } = {};

    logs.forEach((l) => {
      if (!topicStatsMap[l.topic]) {
        topicStatsMap[l.topic] = { total: 0, correct: 0, totalTime: 0, totalAllocated: 0 };
      }
      topicStatsMap[l.topic].total++;
      if (l.isCorrect) topicStatsMap[l.topic].correct++;
      topicStatsMap[l.topic].totalTime += l.timeSpentSeconds;
      topicStatsMap[l.topic].totalAllocated += l.allocatedSeconds;
    });

    const topicList = Object.entries(topicStatsMap).map(([topic, data]) => {
      const topicAccuracy = Math.round((data.correct / data.total) * 100);
      const topicAvgTime = Math.round(data.totalTime / data.total);
      const topicAvgAllocated = Math.round(data.totalAllocated / data.total);
      return {
        topic,
        total: data.total,
        correct: data.correct,
        accuracy: topicAccuracy,
        avgTime: topicAvgTime,
        avgAllocated: topicAvgAllocated,
      };
    }).sort((a, b) => b.total - a.total);

    // Difficulty wise analysis
    const diffStatsMap: {
      [key: string]: { total: number; correct: number; totalTime: number };
    } = {
      'মৌলিক': { total: 0, correct: 0, totalTime: 0 },
      'মধ্যম': { total: 0, correct: 0, totalTime: 0 },
      'অগ্রবর্তী': { total: 0, correct: 0, totalTime: 0 },
    };

    logs.forEach((l) => {
      if (diffStatsMap[l.difficulty]) {
        diffStatsMap[l.difficulty].total++;
        if (l.isCorrect) diffStatsMap[l.difficulty].correct++;
        diffStatsMap[l.difficulty].totalTime += l.timeSpentSeconds;
      }
    });

    // Smart recommendations
    const recommendations: string[] = [];
    const weakTopics = topicList.filter((t) => t.accuracy < 60 && t.total >= 1);
    if (weakTopics.length > 0) {
      recommendations.push(
        `তোমার "${weakTopics[0].topic}" অধ্যায়ে নির্ভুলতা ${englishToBengaliDigits(weakTopics[0].accuracy)}%। এই অধ্যায়ের সূত্র ভাণ্ডার এবং রেডক্স/টাইট্রেশন সমতাকরণ পুনরায় অনুশীলন করা বাঞ্ছনীয়।`
      );
    }
    if (overtimeCount > totalAttempts * 0.4) {
      recommendations.push(
        'প্রায় ৪০% প্রশ্নে নির্ধারিত সময়ের চেয়ে বেশি সময় ব্যয় হয়েছে। মোলার ভর ও ঘনমাত্রার শর্টকাট রূপান্তর (যেমন %w/v হতে M) আয়ত্ত করলে গতি দ্বিগুণ হবে।'
      );
    } else if (accuracy >= 80 && efficiencyScore >= 75) {
      recommendations.push(
        'অসাধারণ পারফরম্যান্স! তোমার নির্ভুলতা ও গতি উভয়ই এইচএসসি ও মেডিকেল/ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার জন্য অত্যন্ত আশাব্যঞ্জক।'
      );
    } else {
      recommendations.push(
        'মধ্যম ও অগ্রবর্তী প্রশ্নের ধাপগুলো লিখে লিখে সমাধান করলে ভুল প্রচেষ্টার হার দ্রুত কমে আসবে।'
      );
    }

    return {
      totalAttempts,
      correctCount,
      wrongCount,
      accuracy,
      totalSeconds,
      avgSeconds,
      avgAllocated,
      fastCount,
      onTimeCount,
      overtimeCount,
      efficiencyScore,
      topicList,
      diffStatsMap,
      recommendations,
    };
  }, [logs]);

  if (!isOpen) return null;

  // Filtered log list
  const filteredLogs = logs.filter((log) => {
    if (filterType === 'mistakes') return !log.isCorrect;
    if (filterType === 'correct') return log.isCorrect;
    if (filterType === 'overtime') return log.timeSpentSeconds > log.allocatedSeconds;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="analysis-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  পরীক্ষা বিশ্লেষণ ও পারফরম্যান্স অ্যানালিটিক্স
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 text-xs font-medium">
                  {englishToBengaliDigits(logs.length)}টি সমাধান রেকর্ড
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                স্মার্ট টাইমার ও উত্তর বিশ্লেষণের পূর্ণাঙ্গ অগ্রগতি প্রতিবেদন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition cursor-pointer"
                title="ইতিহাস রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>হিস্ট্রি মুছুন</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {logs.length === 0 || !stats ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200 shadow-2xs">
                <Clock className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-900">এখনও কোনো প্রশ্ন সমাধান করা হয়নি!</h3>
                <p className="text-sm text-slate-600">
                  রসায়ন প্রশ্নগুলোর সমাধান শুরু করো। প্রশ্নের উত্তর দিলে এবং ঘড়িতে ক্লিক করে শেষ করলে এখানে স্বয়ংক্রিয়ভাবে বিশদ গতি ও নির্ভুলতা বিশ্লেষণ দেখতে পাবে।
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>অনুশীলন শুরু করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* 1. Executive Summary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Accuracy */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>সামগ্রিক নির্ভুলতা</span>
                    <Target className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {englishToBengaliDigits(stats.accuracy)}%
                    </span>
                    <span className="text-xs text-slate-500">
                      ({englishToBengaliDigits(stats.correctCount)}/{englishToBengaliDigits(stats.totalAttempts)})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-600 rounded-full" 
                      style={{ width: `${stats.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Average Time */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>গড় সময় / প্রশ্ন</span>
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {formatTimeElapsed(stats.avgSeconds).bengali}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    বরাদ্দকৃত গড়: {formatTimeElapsed(stats.avgAllocated).bengali}
                  </p>
                </div>

                {/* Speed & Efficiency Score */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>টাইম এফিসিয়েন্সি</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {englishToBengaliDigits(stats.efficiencyScore)}%
                    </span>
                    <span className="text-xs text-slate-500">অন-টাইম</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${stats.efficiencyScore}%` }}
                    />
                  </div>
                </div>

                {/* Total Exam Time */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>মোট পরীক্ষার সময়</span>
                    <Trophy className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {formatTimeElapsed(stats.totalSeconds).bengali}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    মোট সমাধান: {englishToBengaliDigits(stats.totalAttempts)}টি
                  </p>
                </div>

              </div>

              {/* 2. Pacing Speed Distribution */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-600" />
                      <span>সময় ব্যবস্থাপনা ও পেসিং বিশ্লেষণ (Pacing Breakdown)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      নির্ধারিত সময়সীমার সাথে তোমার প্রকৃত গতিধারার তুলনা
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-teal-500" />
                      <span>দ্রুত: {englishToBengaliDigits(stats.fastCount)}টি</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>সঠিক সময়: {englishToBengaliDigits(stats.onTimeCount)}টি</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span>অতিরিক্ত সময়: {englishToBengaliDigits(stats.overtimeCount)}টি</span>
                    </div>
                  </div>
                </div>

                {/* Stacked Visual Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  {stats.fastCount > 0 && (
                    <div 
                      className="h-full bg-teal-500 transition-all" 
                      style={{ width: `${(stats.fastCount / stats.totalAttempts) * 100}%` }}
                      title={`দ্রুত সমাধান: ${stats.fastCount}টি`}
                    />
                  )}
                  {stats.onTimeCount > 0 && (
                    <div 
                      className="h-full bg-amber-500 transition-all" 
                      style={{ width: `${(stats.onTimeCount / stats.totalAttempts) * 100}%` }}
                      title={`সঠিক সময়ে: ${stats.onTimeCount}টি`}
                    />
                  )}
                  {stats.overtimeCount > 0 && (
                    <div 
                      className="h-full bg-rose-500 transition-all" 
                      style={{ width: `${(stats.overtimeCount / stats.totalAttempts) * 100}%` }}
                      title={`বিলম্বিত/ওভারটাইম: ${stats.overtimeCount}টি`}
                    />
                  )}
                </div>
              </div>

              {/* 3. AI Insights & Recommendations Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>স্মার্ট ল্যাব মূল্যায়ন ও পরীক্ষার প্রস্তুতি টিপস:</span>
                </div>
                <div className="space-y-1.5 pl-6 list-disc text-xs sm:text-sm text-teal-900 leading-relaxed">
                  {stats.recommendations.map((rec, idx) => (
                    <p key={idx} className="relative before:content-['•'] before:absolute before:-left-4 before:text-teal-600">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>

              {/* 4. Topic-wise Performance Table */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>অধ্যায় ও টপিকভিত্তিক পারফরম্যান্স ড্যাশবোর্ড</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">টপিক / বিষয়</th>
                        <th className="py-2.5 px-3 text-center">সমাধান</th>
                        <th className="py-2.5 px-3 text-center">নির্ভুলতা</th>
                        <th className="py-2.5 px-3 text-center">গড় সময়</th>
                        <th className="py-2.5 px-3 text-right">মাস্টারি লেভেল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.topicList.map((item) => {
                        let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        let label = 'মাস্টারি 🌟';
                        if (item.accuracy < 50) {
                          badge = 'bg-rose-50 text-rose-700 border-rose-200';
                          label = 'অনুশীলন প্রয়োজন ⚠️';
                        } else if (item.accuracy < 80) {
                          badge = 'bg-amber-50 text-amber-800 border-amber-200';
                          label = 'সন্তোষজনক 👍';
                        }

                        return (
                          <tr key={item.topic} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 font-semibold text-slate-800 max-w-[240px] truncate">
                              {item.topic}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600 font-medium">
                              {englishToBengaliDigits(item.correct)} / {englishToBengaliDigits(item.total)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-bold text-slate-900">
                                {englishToBengaliDigits(item.accuracy)}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600 font-mono">
                              {formatTimeElapsed(item.avgTime).bengali}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge}`}>
                                {label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Detailed Question-by-Question Audit Log */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-teal-600" />
                      <span>প্রতিটি প্রশ্নের বিস্তারিত অডিট ও সমাধান লগ</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      কোন প্রশ্নে কত সময় নিয়েছো এবং কেমন হয়েছে তা দেখে নাও
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        filterType === 'all'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      সকল ({englishToBengaliDigits(logs.length)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('mistakes')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        filterType === 'mistakes'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      ভুলসমূহ ({englishToBengaliDigits(stats.wrongCount)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('overtime')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        filterType === 'overtime'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      ওভারটাইম ({englishToBengaliDigits(stats.overtimeCount)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('correct')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        filterType === 'correct'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      সঠিক ({englishToBengaliDigits(stats.correctCount)})
                    </button>
                  </div>
                </div>

                {/* Log List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {filteredLogs.map((log) => {
                    const qData = questionMap.get(log.questionId);
                    const isOvertime = log.timeSpentSeconds > log.allocatedSeconds;

                    return (
                      <div
                        key={log.id}
                        className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                            {englishToBengaliDigits(log.questionId)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">
                                প্রশ্ন #{englishToBengaliDigits(log.questionId)}
                              </span>
                              <span className="text-slate-500">• {log.topic}</span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                                {log.difficulty}
                              </span>
                            </div>
                            {qData && (
                              <p className="text-slate-600 line-clamp-1 mt-0.5 text-[11px]">
                                {qData.question}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          {/* Result status */}
                          {log.isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>সঠিক</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ভুল</span>
                            </span>
                          )}

                          {/* Time spent */}
                          <div className="text-right font-mono">
                            <span className="font-bold text-slate-900">
                              {formatTimeElapsed(log.timeSpentSeconds).bengali}
                            </span>
                            <span className="text-slate-400 text-[10px] block">
                              বরাদ্দ: {formatTimeElapsed(log.allocatedSeconds).bengali}
                            </span>
                          </div>

                          {/* Overtime indicator */}
                          {isOvertime && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                              বিলম্বিত
                            </span>
                          )}

                          {/* Go to Question Button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectQuestion(log.questionId);
                              onClose();
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                            title="এই প্রশ্নে যান ও সমাধান দেখুন"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            * প্রতিটি প্রশ্নের সমাধান শেষে স্বয়ংক্রিয়ভাবে গতি ও অ্যানালিটিক্স হালনাগাদ হয়
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
