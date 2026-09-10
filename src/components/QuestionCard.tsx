import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  RotateCw, 
  HelpCircle, 
  Eye, 
  Calculator,
  Award,
  Sparkles,
  Pause,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, PlayMode, QuestionAttemptLog } from '../data/types';
import { checkStudentAnswer, englishToBengaliDigits } from '../data/questions';
import { AnalogClockTimer } from './AnalogClockTimer';
import { estimateQuestionTime } from '../utils/timeEstimator';
import { classifyQuestionAnswer } from '../utils/answerClassifier';
import { SmartAnswerKeyboard } from './SmartAnswerKeyboard';
import { formatChemicalFormula } from '../utils/chemistryFormatter';

interface QuestionCardProps {
  question: Question;
  mode: PlayMode;
  questionIndex: number;
  totalFiltered: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onRecordResult: (id: number, isCorrect: boolean) => void;
  onRecordAttemptLog: (log: QuestionAttemptLog) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  mode,
  questionIndex,
  totalFiltered,
  isPaused,
  onTogglePause,
  onNextQuestion,
  onPrevQuestion,
  onRecordResult,
  onRecordAttemptLog,
  hasPrev,
  hasNext,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [showFormulaHint, setShowFormulaHint] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Intelligent time estimation based on question content, difficulty, and depth
  const estimation = useMemo(() => estimateQuestionTime(question), [question]);

  // Intelligent answer type classification (Number only vs Formula vs Text)
  const answerClassification = useMemo(() => classifyQuestionAnswer(question), [question]);

  // Reset local question state and timer when question changes
  useEffect(() => {
    setUserAnswer('');
    setStatus('idle');
    setAttempts(0);
    setShowFullSolution(false);
    setShowFormulaHint(false);
    setElapsedSeconds(0);
    inputRef.current?.focus();
  }, [question.id]);

  // Per-question timer ticker (freezes if exam is paused)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, question.id]);

  // Handle student clicking the clock or advancing: record pacing log and go to next!
  const handleFinishAndNext = useCallback(() => {
    onRecordAttemptLog({
      id: `${question.id}-${Date.now()}`,
      questionId: question.id,
      topic: question.topic,
      difficulty: question.difficulty,
      timeSpentSeconds: elapsedSeconds,
      allocatedSeconds: estimation.seconds,
      isCorrect: status === 'correct',
      attemptsCount: attempts,
      userAnswer: userAnswer.trim() || undefined,
      timestamp: Date.now(),
    });

    onNextQuestion();
  }, [
    question,
    elapsedSeconds,
    estimation.seconds,
    status,
    attempts,
    userAnswer,
    onRecordAttemptLog,
    onNextQuestion,
  ]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;

    const result = checkStudentAnswer(userAnswer, question);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (result.isCorrect) {
      setStatus('correct');
      setShowFormulaHint(false);
      onRecordResult(question.id, true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    } else {
      setStatus('wrong');
      // When student is wrong: do NOT give answer, provide formula hint and let them try again!
      setShowFormulaHint(true);
      onRecordResult(question.id, false);
    }
  };

  // Helper to append quick characters to input
  const handleInsert = (sym: string) => {
    setUserAnswer(prev => prev + sym);
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    setUserAnswer(prev => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setUserAnswer('');
    inputRef.current?.focus();
  };

  // Badge colors for difficulty
  const difficultyBadgeClasses = {
    'মৌলিক': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'মধ্যম': 'bg-amber-50 text-amber-800 border-amber-200',
    'অগ্রবর্তী': 'bg-rose-50 text-rose-700 border-rose-200',
  }[question.difficulty] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div id="active-question-card" className="relative bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      
      {/* Question Card Header */}
      <div className="bg-gradient-to-r from-slate-50 to-teal-50/40 px-5 sm:px-8 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-2xs">
            {englishToBengaliDigits(question.id)}
          </span>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              প্রশ্ন নম্বর {englishToBengaliDigits(question.id)} (Question #{question.id})
            </span>
            <span className="text-xs text-slate-600 font-medium">
              বিষয়: <span className="text-slate-800 font-semibold">{question.topic}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${difficultyBadgeClasses}`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-slate-500 bg-white/80 px-2 py-1 rounded-lg border border-slate-200">
            {englishToBengaliDigits(questionIndex + 1)} / {englishToBengaliDigits(totalFiltered)}
          </span>
        </div>
      </div>

      {/* Main Container: Split into Interactive Content and Analog Clock */}
      <div className="p-5 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch relative">
        
        {/* Left / Main Question Area */}
        <div className="flex-1 space-y-6">
          
          {/* Bengali Question Text */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-xl font-medium text-slate-900 leading-relaxed tracking-normal">
              {formatChemicalFormula(question.question)}
            </h2>
          </div>

          {/* Dynamic Status / Feedback section */}
          {status === 'correct' && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-950 flex items-center gap-1.5">
                    অভিনন্দন! তোমার উত্তরটি একদম সঠিক হয়েছে! 🎉
                  </h3>
                  <p className="text-sm text-emerald-800">
                    সঠিক উত্তর: <strong className="font-semibold text-emerald-950">{formatChemicalFormula(question.answer)}</strong>
                  </p>
                </div>
              </div>

              {/* Explanation / Verification */}
              <div className="pt-2 border-t border-emerald-200 text-xs sm:text-sm text-emerald-800/90 leading-relaxed bg-white/60 p-3 rounded-xl">
                <strong className="text-emerald-950 block mb-1">ব্যাখ্যা ও রাসায়নিক গণনা:</strong>
                <p>{formatChemicalFormula(question.stepExplanation)}</p>
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-emerald-800 font-medium">
                  ঘড়িতে ক্লিক করে পরবর্তী প্রশ্নে যেতে পারো অথবা নিচের বাটনে চাপ দাও:
                </span>
                <button
                  id="next-after-correct-btn"
                  onClick={handleFinishAndNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
                >
                  <span>পরবর্তী প্রশ্ন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {status === 'wrong' && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950">
                    একটু ভুল হয়েছে, তবে নিরাশ হয়ো না!
                  </h3>
                  <p className="text-sm text-amber-800">
                    নিচে এই সমস্যার জন্য প্রয়োজনীয় সূত্রের সংকেত (Formula Hint) দেওয়া হলো। সূত্রটি প্রয়োগ করে পুনরায় উত্তর করার চেষ্টা করো।
                    (চেষ্টা নম্বর: {englishToBengaliDigits(attempts)})
                  </p>
                </div>
              </div>

              {/* Formula Hint Box */}
              {showFormulaHint && (
                <div className="p-4 bg-white rounded-xl border border-amber-300 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>প্রয়োজনীয় সূত্র ও সমাধান সূত্র (Formula Hint):</span>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-lg font-mono text-xs sm:text-sm text-slate-800 border border-amber-100 whitespace-pre-wrap leading-relaxed">
                    {formatChemicalFormula(question.formulaHint)}
                  </div>
                </div>
              )}

              {/* If student gets stuck after 2 tries, allow viewing the full solution */}
              {attempts >= 2 && !showFullSolution && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-amber-800">
                    এখনও সমাধান করতে সমস্যা হচ্ছে?
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullSolution(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>সম্পূর্ণ সমাধান দেখুন</span>
                  </button>
                </div>
              )}

              {showFullSolution && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>পূর্ণাঙ্গ সমাধান ও সঠিক উত্তর:</span>
                  </div>
                  <p className="font-bold text-teal-800 text-base">উত্তর: {formatChemicalFormula(question.answer)}</p>
                  <p className="text-slate-700 leading-relaxed">{formatChemicalFormula(question.stepExplanation)}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer Input Section */}
          {status !== 'correct' && (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              
              {/* Input Row */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    id="student-answer-input"
                    type="text"
                    inputMode={answerClassification.inputMode}
                    pattern={answerClassification.pattern}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={answerClassification.placeholderBengali}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white placeholder-slate-400 font-medium"
                  />
                </div>

                <button
                  id="submit-answer-btn"
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{attempts > 0 ? "পুনরায় জমা দিন" : "উত্তর জমা দিন"}</span>
                </button>
              </div>

              {/* Dynamic Keyboard Tailored Specifically to the Answer Type */}
              <SmartAnswerKeyboard
                classification={answerClassification}
                onInsert={handleInsert}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onSubmit={handleSubmit}
                canSubmit={!!userAnswer.trim()}
              />

              {/* Helpful instructions under the input */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>* {answerClassification.hintBengali}</span>
                {status === 'idle' && (
                  <button
                    type="button"
                    onClick={() => setShowFormulaHint(!showFormulaHint)}
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFormulaHint ? "হিন্ট লুকান" : "হিন্ট প্রয়োজন?"}</span>
                  </button>
                )}
              </div>

              {/* Manual Hint Toggle when idle */}
              {status === 'idle' && showFormulaHint && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs sm:text-sm text-slate-800 space-y-1 animate-in fade-in">
                  <div className="font-semibold text-teal-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-teal-700" />
                    <span>সূত্র সংকেত (Formula Hint):</span>
                  </div>
                  <p className="font-mono text-slate-700 leading-relaxed">{question.formulaHint}</p>
                </div>
              )}
            </form>
          )}

        </div>

        {/* Right / Analog Clock Timer (prominently recognized and interactive) */}
        <div className="lg:w-64 shrink-0 flex flex-col items-center justify-start border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6">
          <AnalogClockTimer
            estimation={estimation}
            isPaused={isPaused}
            onTogglePause={onTogglePause}
            onFinishAndNext={handleFinishAndNext}
            elapsedSeconds={elapsedSeconds}
          />
        </div>

      </div>

      {/* Bottom Navigation & Controls */}
      <div className="p-4 sm:px-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Previous Question */}
        <button
          id="prev-question-btn"
          type="button"
          onClick={onPrevQuestion}
          disabled={!hasPrev}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পূর্ববর্তী প্রশ্ন</span>
        </button>

        {/* Center Info */}
        <div className="text-xs text-slate-500 text-center">
          {mode === 'sequential' 
            ? `ধারাবাহিক ক্রম: প্রশ্ন ${englishToBengaliDigits(question.id)}` 
            : `এলোমেলো মোড: মোট ${englishToBengaliDigits(totalFiltered)} টির মধ্যে প্র্যাকটিস`}
        </div>

        {/* Next / Random Switch Question */}
        <button
          id="next-question-btn"
          type="button"
          onClick={handleFinishAndNext}
          disabled={!hasNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
        >
          <span>{mode === 'random' ? "অন্য এলোমেলো প্রশ্ন" : "পরবর্তী প্রশ্ন"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Paused Overlay over the question card when exam is paused */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
            <Pause className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-xl font-bold">পরীক্ষা বিরতিতে আছে (Exam Paused)</h3>
            <p className="text-sm text-slate-200">
              টাইমার ও পরীক্ষা সাময়িক স্থগিত রাখা হয়েছে। প্রস্তুত হলে নিচের বাটনে ক্লিক করে চালিয়ে যান।
            </p>
          </div>
          <button
            type="button"
            id="resume-exam-btn"
            onClick={onTogglePause}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>পরীক্ষা পুনরায় চালু করুন (Resume)</span>
          </button>
        </div>
      )}

    </div>
  );
};
