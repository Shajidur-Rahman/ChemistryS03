import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { QuestionCard } from './components/QuestionCard';
import { FormulaModal } from './components/FormulaModal';
import { QuestionNavigatorModal } from './components/QuestionNavigatorModal';
import { AnalysisModal } from './components/AnalysisModal';
import { ModeSelectorModal } from './components/ModeSelectorModal';
import { ExamSetupModal } from './components/ExamSetupModal';
import { ExamView } from './components/ExamView';
import { ExamResultView } from './components/ExamResultView';
import { allQuestions, totalQuestionsCount, englishToBengaliDigits } from './data/questions';
import { Question, PlayMode, QuestionAttemptLog, AppPracticeMode, ExamConfig, ExamResult } from './data/types';
import { Sparkles, GraduationCap, CheckCircle, Target, ArrowUpDown, BarChart2, Pause, Play, ClipboardCheck, Zap, Sliders, RotateCcw } from 'lucide-react';

const STORAGE_KEY_SCORE = 'chem_lab_assistant_score';
const STORAGE_KEY_SOLVED = 'chem_lab_assistant_solved';
const STORAGE_KEY_ATTEMPTED = 'chem_lab_assistant_attempted';
const STORAGE_KEY_LOGS = 'chem_lab_assistant_logs';
const STORAGE_KEY_MODE = 'chem_practice_mode';
const STORAGE_KEY_VISITED = 'chem_lab_visited';

export default function App() {
  // Practice Mode: 'rapid' (instant feedback & hints) vs 'exam' (structured mock test with final results)
  const [practiceMode, setPracticeMode] = useState<AppPracticeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE);
      return (saved === 'exam' || saved === 'rapid') ? saved : 'rapid';
    } catch {
      return 'rapid';
    }
  });

  // Mode Selection Modal (Show on first visit or when requested)
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY_VISITED);
    } catch {
      return false;
    }
  });

  // Exam Setup & Session States
  const [isExamSetupOpen, setIsExamSetupOpen] = useState(false);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[] | null>(null);
  const [currentExamResult, setCurrentExamResult] = useState<ExamResult | null>(null);

  // Rapid Mode & Filtering States
  const [isRapidActive, setIsRapidActive] = useState<boolean>(false);
  const [mode, setMode] = useState<PlayMode>('random');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(184);
  const [selectedTopic, setSelectedTopic] = useState<string>('সকল বিষয় (All Topics)');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('সকল স্তর');

  // Exam Timing & Pause State
  const [isExamPaused, setIsExamPaused] = useState<boolean>(false);

  // Modals
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Student Score & Persistence (Rapid Mode)
  const [score, setScore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCORE);
      return saved ? JSON.parse(saved) : { correct: 0, attempted: 0, streak: 0 };
    } catch {
      return { correct: 0, attempted: 0, streak: 0 };
    }
  });

  const [solvedIds, setSolvedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOLVED);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [attemptedIds, setAttemptedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTED);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Question Attempt & Timing Logs for Deep Analysis
  const [attemptLogs, setAttemptLogs] = useState<QuestionAttemptLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save progress & logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCORE, JSON.stringify(score));
      localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(Array.from(solvedIds)));
      localStorage.setItem(STORAGE_KEY_ATTEMPTED, JSON.stringify(Array.from(attemptedIds)));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(attemptLogs));
      localStorage.setItem(STORAGE_KEY_MODE, practiceMode);
    } catch (e) {
      console.warn("LocalStorage save error", e);
    }
  }, [score, solvedIds, attemptedIds, attemptLogs, practiceMode]);

  // Unique Topics List
  const topicsList = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach((q) => set.add(q.topic));
    return ['সকল বিষয় (All Topics)', ...Array.from(set)];
  }, []);

  // Handler to select practice mode from modal
  const handleSelectPracticeMode = (selected: AppPracticeMode) => {
    setPracticeMode(selected);
    setIsModeSelectorOpen(false);
    setIsRapidActive(false);
    try {
      localStorage.setItem(STORAGE_KEY_VISITED, 'true');
      localStorage.setItem(STORAGE_KEY_MODE, selected);
    } catch {
      // Safe fallback
    }

    if (selected === 'exam' && (!activeExamQuestions || activeExamQuestions.length === 0)) {
      setIsExamSetupOpen(true);
    }
  };

  // Start a new Exam session
  const handleStartExam = (config: ExamConfig) => {
    setExamConfig(config);
    let pool = allQuestions.filter((q) => {
      if (config.sourceType === 'range') {
        if (q.id < config.rangeStart || q.id > config.rangeEnd) return false;
      }
      if (config.selectedTopic !== 'সকল বিষয় (All Topics)' && q.topic !== config.selectedTopic) {
        return false;
      }
      return true;
    });

    if (pool.length === 0) pool = allQuestions;

    let chosen: Question[] = [];
    if (config.sourceType === 'random') {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      chosen = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
    } else {
      // Range mode: if range has more questions than count, pick from range
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      chosen = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
    }

    setActiveExamQuestions(chosen);
    setCurrentExamResult(null);
    setIsExamSetupOpen(false);
    setPracticeMode('exam');
  };

  // Finish exam handler
  const handleFinishExam = (result: ExamResult) => {
    setCurrentExamResult(result);

    // Also record attempts into deep analysis logs
    const newLogs: QuestionAttemptLog[] = result.items.map((item) => ({
      id: `exam-log-${Date.now()}-${item.question.id}`,
      questionId: item.question.id,
      timestamp: Date.now(),
      topic: item.question.topic,
      difficulty: item.question.difficulty,
      isCorrect: item.isCorrect,
      allocatedSeconds: item.timeSpentSeconds,
      timeSpentSeconds: item.timeSpentSeconds,
      attemptsCount: item.isSkipped ? 0 : 1,
      userAnswer: item.userAnswer,
      expectedAnswer: item.question.answer,
    }));

    setAttemptLogs((prev) => [...newLogs, ...prev]);

    // Update solved ids
    setSolvedIds((prev) => {
      const next = new Set(prev);
      result.items.forEach((it) => {
        if (it.isCorrect) next.add(it.question.id);
      });
      return next;
    });
  };

  // Retake exact same questions in exam
  const handleRetakeExam = () => {
    setCurrentExamResult(null);
  };

  // Reset exam and launch setup modal
  const handleNewExamSetup = () => {
    setCurrentExamResult(null);
    setActiveExamQuestions(null);
    setIsExamSetupOpen(true);
  };

  // Switch to rapid mode
  const handleGoToRapid = () => {
    setPracticeMode('rapid');
    setIsRapidActive(false);
    setCurrentExamResult(null);
  };

  // Keyboard shortcut to toggle pause (Spacebar when not typing in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsExamPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter questions based on range, topic, and difficulty
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Range check
      if (q.id < rangeStart || q.id > rangeEnd) return false;
      // Topic check
      if (selectedTopic !== 'সকল বিষয় (All Topics)' && q.topic !== selectedTopic) return false;
      // Difficulty check
      if (selectedDifficulty !== 'সকল স্তর' && q.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [rangeStart, rangeEnd, selectedTopic, selectedDifficulty]);

  // Current Question Index in filtered questions
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Navigation history for random mode
  const [history, setHistory] = useState<number[]>([]);
  const [historyPos, setHistoryPos] = useState<number>(-1);

  // Pick initial random question on start
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      if (mode === 'random') {
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        setCurrentIndex(randomIndex);
        const qId = filteredQuestions[randomIndex].id;
        setHistory([qId]);
        setHistoryPos(0);
      } else {
        // Sequential mode starts at the beginning of the range
        setCurrentIndex(0);
        const qId = filteredQuestions[0].id;
        setHistory([qId]);
        setHistoryPos(0);
      }
    }
  }, [rangeStart, rangeEnd, selectedTopic, selectedDifficulty, mode]);

  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0] || allQuestions[0];

  // Handle Next Question
  const handleNextQuestion = useCallback(() => {
    if (filteredQuestions.length === 0) return;

    if (mode === 'sequential') {
      // In sequential mode: strictly next in numerical order!
      if (currentIndex < filteredQuestions.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        const qId = filteredQuestions[nextIdx].id;
        setHistory(prev => [...prev.slice(0, historyPos + 1), qId]);
        setHistoryPos(prev => prev + 1);
      }
    } else {
      // In random mode: randomly select next question, preferring unsolved questions
      const unsolved = filteredQuestions.filter(q => !solvedIds.has(q.id) && q.id !== currentQuestion.id);
      const candidates = unsolved.length > 0 ? unsolved : filteredQuestions.filter(q => q.id !== currentQuestion.id);
      
      const pool = candidates.length > 0 ? candidates : filteredQuestions;
      const randomQ = pool[Math.floor(Math.random() * pool.length)];
      const nextIdx = filteredQuestions.findIndex(q => q.id === randomQ.id);
      
      if (nextIdx !== -1) {
        setCurrentIndex(nextIdx);
        setHistory(prev => [...prev.slice(0, historyPos + 1), randomQ.id]);
        setHistoryPos(prev => prev + 1);
      }
    }
  }, [filteredQuestions, mode, currentIndex, historyPos, solvedIds, currentQuestion]);

  // Handle Prev Question
  const handlePrevQuestion = useCallback(() => {
    if (mode === 'sequential') {
      if (currentIndex > 0) {
        const prevIdx = currentIndex - 1;
        setCurrentIndex(prevIdx);
      }
    } else {
      // In random mode, use history
      if (historyPos > 0) {
        const prevQId = history[historyPos - 1];
        const prevIdx = filteredQuestions.findIndex(q => q.id === prevQId);
        if (prevIdx !== -1) {
          setCurrentIndex(prevIdx);
          setHistoryPos(prev => prev - 1);
        }
      }
    }
  }, [mode, currentIndex, history, historyPos, filteredQuestions]);

  // Handle direct selection from Question Navigator modal or Analysis modal
  const handleSelectQuestion = useCallback((qId: number) => {
    // If qId is outside current range, expand range to include it
    if (qId < rangeStart || qId > rangeEnd) {
      setRangeStart(Math.min(rangeStart, qId));
      setRangeEnd(Math.max(rangeEnd, qId));
    }
    // Also reset topic and difficulty filter if necessary so the question appears
    const targetQ = allQuestions.find(q => q.id === qId);
    if (targetQ) {
      if (selectedTopic !== 'সকল বিষয় (All Topics)' && targetQ.topic !== selectedTopic) {
        setSelectedTopic('সকল বিষয় (All Topics)');
      }
      if (selectedDifficulty !== 'সকল স্তর' && targetQ.difficulty !== selectedDifficulty) {
        setSelectedDifficulty('সকল স্তর');
      }
    }

    // Also reset practice mode to rapid and activate question view
    setPracticeMode('rapid');
    setIsRapidActive(true);

    setTimeout(() => {
      const idx = allQuestions.filter(q => q.id >= Math.min(rangeStart, qId) && q.id <= Math.max(rangeEnd, qId))
        .findIndex(q => q.id === qId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }, 50);
  }, [rangeStart, rangeEnd, selectedTopic, selectedDifficulty]);

  // Record student score and progress
  const handleRecordResult = useCallback((questionId: number, isCorrect: boolean) => {
    setAttemptedIds(prev => new Set(prev).add(questionId));

    if (isCorrect) {
      setSolvedIds(prev => new Set(prev).add(questionId));
      setScore(prev => ({
        correct: prev.correct + (solvedIds.has(questionId) ? 0 : 1),
        attempted: prev.attempted + 1,
        streak: prev.streak + 1,
      }));
    } else {
      setScore(prev => ({
        ...prev,
        attempted: prev.attempted + 1,
        streak: 0,
      }));
    }
  }, [solvedIds]);

  // Record attempt logs with timing
  const handleRecordAttemptLog = useCallback((log: QuestionAttemptLog) => {
    setAttemptLogs((prev) => [log, ...prev]);
  }, []);

  // Clear Attempt History from Analysis Modal
  const handleClearHistory = () => {
    if (window.confirm("আপনি কি সমস্ত পরীক্ষার টাইমিং ও অ্যানালিটিক্স হিস্ট্রি মুছে ফেলতে চান?")) {
      setAttemptLogs([]);
      localStorage.removeItem(STORAGE_KEY_LOGS);
    }
  };

  // Reset All Progress
  const handleResetProgress = () => {
    if (window.confirm("আপনি কি সমস্ত অগ্রগতি, স্কোর ও পরিসংখ্যান রিসেট করতে চান?")) {
      setScore({ correct: 0, attempted: 0, streak: 0 });
      setSolvedIds(new Set());
      setAttemptedIds(new Set());
      setAttemptLogs([]);
      localStorage.removeItem(STORAGE_KEY_SCORE);
      localStorage.removeItem(STORAGE_KEY_SOLVED);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTED);
      localStorage.removeItem(STORAGE_KEY_LOGS);
    }
  };

  const hasPrev = mode === 'sequential' ? currentIndex > 0 : historyPos > 0;
  const hasNext = mode === 'sequential' ? currentIndex < filteredQuestions.length - 1 : filteredQuestions.length > 1;

  // Percentage of current range solved
  const solvedInRange = filteredQuestions.filter(q => solvedIds.has(q.id)).length;
  const rangeProgressPercent = filteredQuestions.length > 0 
    ? Math.round((solvedInRange / filteredQuestions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900">
      
      {/* Header with Pause, Mode Switcher and Analysis Controls */}
      <Header
        score={score}
        totalCount={totalQuestionsCount}
        logsCount={attemptLogs.length}
        isPaused={isExamPaused}
        practiceMode={practiceMode}
        onSwitchPracticeMode={(newMode) => {
          if (newMode === 'exam') {
            if (!activeExamQuestions || activeExamQuestions.length === 0) {
              setIsExamSetupOpen(true);
            }
          } else {
            setIsRapidActive(false);
          }
          setPracticeMode(newMode);
        }}
        onOpenModeSelector={() => setIsModeSelectorOpen(true)}
        onTogglePause={() => setIsExamPaused(prev => !prev)}
        onOpenAnalysis={() => setIsAnalysisModalOpen(true)}
        onOpenFormulas={() => setIsFormulaModalOpen(true)}
        onOpenNavigator={() => setIsNavigatorOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ============================================================== */}
        {/* 1. EXAM MODE VIEW */}
        {/* ============================================================== */}
        {practiceMode === 'exam' ? (
          <div>
            {currentExamResult ? (
              // Results & Scorecard Screen
              <ExamResultView
                result={currentExamResult}
                onRetakeExam={handleRetakeExam}
                onNewExamSetup={handleNewExamSetup}
                onGoToRapid={handleGoToRapid}
              />
            ) : activeExamQuestions && activeExamQuestions.length > 0 ? (
              // Active Exam Screen
              <ExamView
                questions={activeExamQuestions}
                onFinishExam={handleFinishExam}
                onExitExam={() => {
                  if (window.confirm("আপনি কি নিশ্চিত যে বর্তমান পরীক্ষাটি বাতিল করতে চান?")) {
                    setActiveExamQuestions(null);
                  }
                }}
              />
            ) : (
              // Exam Setup Welcome Screen
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    মডেল টেস্ট / পরীক্ষা মোড
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    আপনার পছন্দের পরিসীমা (যেমন ১-৫০) অথবা সম্পূর্ণ ১৮৪টি প্রশ্ন ব্যাংক থেকে র্যান্ডম প্রশ্ন এবং প্রশ্নের সংখ্যা নির্বাচন করে পরীক্ষা দিন।
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExamSetupOpen(true)}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>নতুন পরীক্ষা সেটআপ করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeMode('rapid')}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-current" />
                    <span>র‍্যাপিড প্রশ্নে ফিরে যান</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* 2. RAPID QUESTION PRACTICE VIEW (Instant Feedback & Hints) */
          /* ============================================================== */
          <div className="space-y-6">
            
            {/* Exam Mode Invitation Banner */}
            <div className="bg-gradient-to-r from-teal-50 to-indigo-50/60 rounded-2xl border border-teal-200 p-4 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    পূর্ণাঙ্গ মডেল টেস্ট দিতে চান?
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-600">
                    নির্দিষ্ট পরিসীমা বা র্যান্ডম প্রশ্ন নির্বাচন করে পরীক্ষা দিন এবং পরীক্ষা শেষে পূর্ণাঙ্গ মার্কস ও ব্যাখ্যা পান।
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPracticeMode('exam');
                  setIsExamSetupOpen(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                পরীক্ষা শুরু করুন
              </button>
            </div>

            {/* Controls Bar (Range, Sequential/Random Mode, Topics) */}
            <ControlsBar
              mode={mode}
              onModeChange={setMode}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onRangeChange={(start, end) => {
                setRangeStart(start);
                setRangeEnd(end);
              }}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              totalFilteredCount={filteredQuestions.length}
              currentIndex={currentIndex}
            />

            {/* Progress Indicator & Analysis Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 px-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
                <Target className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  নির্বাচিত পরিসীমা অগ্রগতি ({englishToBengaliDigits(rangeStart)}-{englishToBengaliDigits(rangeEnd)}):
                </span>
                <span className="text-teal-800 font-bold ml-1">
                  {englishToBengaliDigits(solvedInRange)} / {englishToBengaliDigits(filteredQuestions.length)} সমাধান সম্পন্ন
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="w-full sm:w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${rangeProgressPercent}%` }}
                  />
                </div>

                {isRapidActive && (
                  <button
                    type="button"
                    onClick={() => setIsRapidActive(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer shrink-0"
                    title="অনুশীলন স্থগিত করে সূচনা স্ক্রিনে ফিরে যান"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>স্থগিত / পরিবর্তন</span>
                  </button>
                )}

                {/* Quick Button to Open Analysis */}
                <button
                  type="button"
                  onClick={() => setIsAnalysisModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>বিশ্লেষণ রিপোর্ট</span>
                </button>
              </div>
            </div>

            {/* If Rapid practice is NOT started yet, show Start Practice Card with prominent Start button */}
            {!isRapidActive ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Zap className="w-8 h-8 fill-current" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>র‍্যাপিড প্রশ্ন অনুশীলন (Rapid Mode)</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    অনুশীলন শুরু করতে প্রস্তুত?
                  </h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    প্রতিটি প্রশ্নে রিয়েল-টাইম অ্যানালগ স্টপওয়াচ চলবে, ভুল হলে তাত্ক্ষণিক সূত্রের হিন্ট পাবেন এবং পুনরায় উত্তর দেওয়ার সুযোগ থাকবে। প্রস্তুত হলে নিচের 'অনুশীলন শুরু করুন' বাটনে চাপ দিন।
                  </p>
                </div>

                {/* Setup Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div>
                    <span className="text-slate-400 block mb-0.5">নির্বাচিত বিষয়:</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{selectedTopic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">প্রশ্ন পরিসীমা:</span>
                    <span className="font-bold text-slate-800">
                      {englishToBengaliDigits(rangeStart)} হতে {englishToBengaliDigits(rangeEnd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">উপলব্ধ প্রশ্ন:</span>
                    <span className="font-bold text-amber-700">
                      {englishToBengaliDigits(filteredQuestions.length)}টি প্রশ্ন
                    </span>
                  </div>
                </div>

                {/* Start Button */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRapidActive(true);
                      setIsExamPaused(false);
                    }}
                    disabled={filteredQuestions.length === 0}
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>অনুশীলন শুরু করুন (Start Practice)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPracticeMode('exam');
                      setIsExamSetupOpen(true);
                    }}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl transition cursor-pointer flex items-center gap-2"
                  >
                    <ClipboardCheck className="w-4 h-4 text-teal-600" />
                    <span>মডেল টেস্ট দিন</span>
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              /* Interactive Question Card with Analog Clock Timer & Pause */
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                mode={mode}
                questionIndex={currentIndex}
                totalFiltered={filteredQuestions.length}
                isPaused={isExamPaused}
                onTogglePause={() => setIsExamPaused(prev => !prev)}
                onNextQuestion={handleNextQuestion}
                onPrevQuestion={handlePrevQuestion}
                onRecordResult={handleRecordResult}
                onRecordAttemptLog={handleRecordAttemptLog}
                hasPrev={hasPrev}
                hasNext={hasNext}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
                <p className="text-base font-semibold">নির্বাচিত ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-400">পরিসীমা বা ফিল্টারের মান পরিবর্তন করে আবার চেষ্টা করুন।</p>
                <button
                  onClick={() => {
                    setRangeStart(1);
                    setRangeEnd(184);
                    setSelectedTopic('সকল বিষয় (All Topics)');
                    setSelectedDifficulty('সকল স্তর');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  সকল প্রশ্ন ফিল্টার রিসেট
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Mode Selector Modal (Shown on first entry or when clicking Mode) */}
      <ModeSelectorModal
        isOpen={isModeSelectorOpen}
        currentMode={practiceMode}
        onSelectMode={handleSelectPracticeMode}
        onClose={() => setIsModeSelectorOpen(false)}
      />

      {/* Exam Setup Modal */}
      <ExamSetupModal
        isOpen={isExamSetupOpen}
        onClose={() => setIsExamSetupOpen(false)}
        onStartExam={handleStartExam}
        allQuestions={allQuestions}
        topicsList={topicsList}
      />

      {/* Modals */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      <QuestionNavigatorModal
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        questions={allQuestions}
        currentQuestionId={currentQuestion?.id || 1}
        onSelectQuestion={handleSelectQuestion}
        solvedIds={solvedIds}
        attemptedIds={attemptedIds}
      />

      {/* Deep Exam Performance Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        logs={attemptLogs}
        allQuestions={allQuestions}
        onSelectQuestion={handleSelectQuestion}
        onClearHistory={handleClearHistory}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-400">
          পরিমাণগত রসায়ন ল্যাব সহকারী • ১৮৪টি প্রশ্নমালা • স্মার্ট টাইমার ও অ্যানালিটিক্স • এইচএসসি ও ভর্তি প্রস্তুতি
        </div>
      </footer>

    </div>
  );
}
