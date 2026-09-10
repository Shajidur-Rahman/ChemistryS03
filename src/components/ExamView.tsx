import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  Pause, 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Question, ExamResult, ExamResultBreakdown } from '../data/types';
import { checkStudentAnswer, englishToBengaliDigits } from '../data/questions';
import { classifyQuestionAnswer } from '../utils/answerClassifier';
import { SmartAnswerKeyboard } from './SmartAnswerKeyboard';

interface ExamViewProps {
  questions: Question[];
  onFinishExam: (result: ExamResult) => void;
  onExitExam: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  questions,
  onFinishExam,
  onExitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuestion = questions[currentIndex];

  // Current answer in input
  const currentAnswer = userAnswers[currentQuestion?.id] || '';

  // Classify current question for dynamic keyboard
  const answerClassification = useMemo(() => {
    return currentQuestion ? classifyQuestionAnswer(currentQuestion) : null;
  }, [currentQuestion]);

  // Overall & per-question timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      if (currentQuestion) {
        setTimeSpent((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentQuestion]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${englishToBengaliDigits(mins)}:${remainingSecs < 10 ? '০' : ''}${englishToBengaliDigits(remainingSecs)}`;
  };

  // Handle Input Changes
  const handleUpdateCurrentAnswer = (val: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleInsert = (sym: string) => {
    handleUpdateCurrentAnswer(currentAnswer + sym);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    handleUpdateCurrentAnswer(currentAnswer.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleClear = () => {
    handleUpdateCurrentAnswer('');
    inputRef.current?.focus();
  };

  // Navigation handlers
  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmFinish(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Count answered vs remaining
  const answeredCount = Object.keys(userAnswers).filter(
    (k) => (userAnswers[Number(k)] || '').trim().length > 0
  ).length;
  const unansweredCount = questions.length - answeredCount;

  // Final evaluation logic
  const handleCompleteExam = () => {
    const breakdowns: ExamResultBreakdown[] = questions.map((q) => {
      const studentAns = (userAnswers[q.id] || '').trim();
      const isSkipped = studentAns.length === 0;
      const isCorrect = !isSkipped && checkStudentAnswer(q, studentAns);
      return {
        question: q,
        userAnswer: studentAns,
        isCorrect,
        isSkipped,
        timeSpentSeconds: timeSpent[q.id] || 0,
      };
    });

    const correctCount = breakdowns.filter((b) => b.isCorrect).length;
    const wrongCount = breakdowns.filter((b) => !b.isCorrect && !b.isSkipped).length;
    const skippedCount = breakdowns.filter((b) => b.isSkipped).length;
    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    const result: ExamResult = {
      id: `exam-${Date.now()}`,
      totalQuestions: questions.length,
      answeredCount,
      correctCount,
      wrongCount,
      skippedCount,
      scorePercentage,
      totalTimeSeconds: totalSeconds,
      items: breakdowns,
      completedAt: Date.now(),
    };

    onFinishExam(result);
  };

  if (!currentQuestion || !answerClassification) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Exam Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                মডেল টেস্ট পরীক্ষা চলছে
              </h2>
              <p className="text-xs text-slate-500">
                প্রশ্ন {englishToBengaliDigits(currentIndex + 1)} / {englishToBengaliDigits(questions.length)} • উত্তর দেওয়া হয়েছে: {englishToBengaliDigits(answeredCount)}টি
              </p>
            </div>
          </div>

          {/* Pause Button */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`sm:hidden p-2 rounded-xl border text-xs font-semibold ${
              isPaused ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {/* Stopwatch & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Elapsed Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-800">
            <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>সময়: {formatTime(totalSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isPaused ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>চালান</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>বিরতি</span>
              </>
            )}
          </button>

          {/* Finish Exam Button */}
          <button
            type="button"
            onClick={() => setShowConfirmFinish(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>পরীক্ষা শেষ করুন</span>
          </button>
        </div>
      </div>

      {/* Question Jump Palette (Pills) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">প্রশ্ন সূচি নেভিগেটর:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> উত্তর দেওয়া
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> বাকি
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {questions.map((q, idx) => {
            const isAns = (userAnswers[q.id] || '').trim().length > 0;
            const isCurr = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center ${
                  isCurr
                    ? 'ring-2 ring-teal-600 ring-offset-2 bg-teal-600 text-white shadow-xs'
                    : isAns
                    ? 'bg-teal-100 text-teal-900 border border-teal-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {englishToBengaliDigits(idx + 1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card for Exam Mode */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Pause Overlay Shield */}
        {isPaused && (
          <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Pause className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">পরীক্ষা সাময়িক বিরতিতে রয়েছে</h3>
              <p className="text-xs text-slate-300 max-w-sm">
                টাইমার স্থগিত আছে। প্রস্তুতি নিয়ে পুনরায় শুরু করতে নিচের বাটনে চাপ দিন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>পুনরায় পরীক্ষা শুরু করুন</span>
            </button>
          </div>
        )}

        {/* Card Header */}
        <div className="bg-gradient-to-r from-slate-50 to-teal-50/40 px-5 sm:px-8 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-2xs">
              {englishToBengaliDigits(currentIndex + 1)}
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                প্রশ্ন {englishToBengaliDigits(currentIndex + 1)} (মূল ব্যাংক প্রশ্ন #{currentQuestion.id})
              </span>
              <span className="text-xs text-slate-600 font-medium">
                বিষয়: <span className="text-slate-800 font-semibold">{currentQuestion.topic}</span>
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
            {currentQuestion.difficulty}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Bengali Question Text */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-xl font-medium text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Input Section with Dynamic Keyboard */}
          <div className="space-y-4 pt-2">
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode={answerClassification.inputMode}
                  pattern={answerClassification.pattern}
                  value={currentAnswer}
                  onChange={(e) => handleUpdateCurrentAnswer(e.target.value)}
                  placeholder={answerClassification.placeholderBengali}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white placeholder-slate-400 font-medium"
                />
              </div>

              {currentAnswer && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  মুছুন
                </button>
              )}
            </div>

            {/* Smart Keyboard tailored specifically to the answer type (numbers only, formula, or choices) */}
            <SmartAnswerKeyboard
              classification={answerClassification}
              onInsert={handleInsert}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSubmit={handleSaveAndNext}
              canSubmit={!!currentAnswer.trim()}
            />
          </div>

          {/* Bottom Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পূর্ববর্তী প্রশ্ন</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? "শেষ প্রশ্ন ও জমা দিন" : "সংরক্ষণ ও পরবর্তী প্রশ্ন"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Finish Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-teal-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  আপনি কি পরীক্ষা শেষ করতে চান?
                </h3>
                <p className="text-xs text-slate-600">
                  মোট {englishToBengaliDigits(questions.length)}টি প্রশ্নের মধ্যে আপনি {englishToBengaliDigits(answeredCount)}টি প্রশ্নের উত্তর দিয়েছেন।
                  {unansweredCount > 0 && (
                    <span className="block font-semibold text-amber-700 mt-1">
                      ⚠️ এখনও {englishToBengaliDigits(unansweredCount)}টি প্রশ্নের উত্তর দেওয়া বাকি আছে।
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>• পরীক্ষা জমা দিলে প্রতিটি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা সহ রেজাল্ট শীট দেখতে পাবেন।</p>
              <p>• মোট ব্যয়িত সময়: {formatTime(totalSeconds)}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleCompleteExam}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                হ্যাঁ, ফলাফল দেখুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
