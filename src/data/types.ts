export type Difficulty = 'মৌলিক' | 'মধ্যম' | 'অগ্রবর্তী';

export interface Question {
  id: number;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  formulaHint: string;
  stepExplanation?: string;
  acceptedKeywords?: string[];
  unit?: string;
}

export type PlayMode = 'random' | 'sequential' | 'topic';
export type AppPracticeMode = 'rapid' | 'exam';

export interface ExamConfig {
  sourceType: 'range' | 'random';
  rangeStart: number;
  rangeEnd: number;
  questionCount: number;
  selectedTopic: string;
}

export interface ExamQuestionItem {
  question: Question;
  userAnswer: string;
  isAnswered: boolean;
  timeSpentSeconds: number;
}

export interface ExamResultBreakdown {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  timeSpentSeconds: number;
}

export interface ExamResult {
  id: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  scorePercentage: number;
  totalTimeSeconds: number;
  items: ExamResultBreakdown[];
  completedAt: number;
}

export interface QuestionAttemptLog {
  id: string;
  questionId: number;
  topic: string;
  difficulty: Difficulty;
  timeSpentSeconds: number;
  allocatedSeconds: number;
  isCorrect: boolean;
  attemptsCount: number;
  userAnswer?: string;
  timestamp: number;
}

export interface StudentProgress {
  answeredCount: number;
  correctCount: number;
  wrongAttempts: number;
  streak: number;
  bestStreak: number;
  history: QuestionAttemptLog[];
  bookmarkedIds: number[];
  solvedIds: number[];
}
