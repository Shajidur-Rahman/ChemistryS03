import { Question } from '../data/types';
import { englishToBengaliDigits } from '../data/questions';

export interface TimeEstimationResult {
  seconds: number;
  formattedBengali: string;
  formattedMinutesSeconds: string;
  reasonBengali: string;
  complexityScore: 'সহজ' | 'মধ্যম' | 'উচ্চ';
}

// Intelligent time estimation configuration
// Strict rule: Timer must NEVER exceed 2 minutes 30 seconds (150 seconds)
export const MAX_TIMER_SECONDS = 150;
export const MIN_TIMER_SECONDS = 45;

/**
 * Intelligent time estimator that analyzes chemistry questions:
 * - Strict upper limit: 2 minutes 30 seconds (150s)
 * - Recognizes difficulty level (মৌলিক, মধ্যম, অগ্রবর্তী)
 * - Detects multi-part sub-questions: (a), (b), (c) or (1), (2)
 * - Identifies calculation depth (titration, redox, limiting reactant, dilution, Kjeldahl)
 * - Analyzes problem length and stoichiometric equation complexity
 */
export function estimateQuestionTime(question: Question): TimeEstimationResult {
  let baseSeconds = 50;
  const reasons: string[] = [];

  // 1. Difficulty Base (scaled so max with additions stays neatly within 150s)
  if (question.difficulty === 'মৌলিক') {
    baseSeconds = 55;
    reasons.push('মৌলিক স্তরের প্রশ্ন');
  } else if (question.difficulty === 'মধ্যম') {
    baseSeconds = 90;
    reasons.push('মধ্যম স্তরের গণনা');
  } else {
    // অগ্রবর্তী
    baseSeconds = 125;
    reasons.push('অগ্রবর্তী জটিল সমস্যা');
  }

  // 2. Sub-questions / Multi-part Detection
  const qText = question.question;
  const subpartMatches = (qText.match(/\([a-d]\)|\([১-৪]\)|\([1-4]\)|A\.|B\.|C\.|D\./gi) || []).length;
  const questionMarkMatches = (qText.match(/\?/g) || []).length;

  if (subpartMatches >= 3 || questionMarkMatches >= 3) {
    baseSeconds += 20;
    reasons.push('৩টি বা ততোধিক অংশ');
  } else if (subpartMatches >= 2 || questionMarkMatches >= 2) {
    baseSeconds += 15;
    reasons.push('একাধিক অংশ');
  }

  // 3. Topic specific calculation depth
  const topic = question.topic;
  if (topic.includes('রেডক্স') || topic.includes('জারণ-বিজারণ') || topic.includes('আয়োডোমিতি')) {
    baseSeconds += 15;
    reasons.push('রেডক্স ইলেকট্রন সমতা');
  } else if (topic.includes('জেলডাল')) {
    baseSeconds += 15;
    reasons.push('জেলডাল শতকরা N');
  } else if (topic.includes('দ্বৈত নির্দেশক') || topic.includes('ব্যাক টাইট্রেশন')) {
    baseSeconds += 15;
    reasons.push('দ্বৈত নির্দেশক টাইট্রেশন');
  } else if (topic.includes('মিশ্রণ') || topic.includes('সংকর ধাতু')) {
    baseSeconds += 15;
    reasons.push('মিশ্রণ সমীকরণ');
  } else if (topic.includes('লিমিটিং বিক্রিয়ক')) {
    baseSeconds += 10;
    reasons.push('লিমিটিং রিয়েজেন্ট');
  } else if (topic.includes('ইউডিওমিতি') || topic.includes('দহন')) {
    baseSeconds += 10;
    reasons.push('হাইড্রোকার্বন দহন');
  }

  // 4. Question Text Length (Word problem complexity)
  if (qText.length > 200) {
    baseSeconds += 10;
  } else if (qText.length > 130) {
    baseSeconds += 5;
  }

  // Bound strictly: Minimum 45s, Maximum 150s (2 minutes 30 seconds)
  const finalSeconds = Math.max(MIN_TIMER_SECONDS, Math.min(MAX_TIMER_SECONDS, Math.round(baseSeconds / 5) * 5));

  const mins = Math.floor(finalSeconds / 60);
  const secs = finalSeconds % 60;

  let formattedBengali = '';
  if (mins > 0 && secs > 0) {
    formattedBengali = `${englishToBengaliDigits(mins)} মিনিট ${englishToBengaliDigits(secs)} সেকেন্ড`;
  } else if (mins > 0) {
    formattedBengali = `${englishToBengaliDigits(mins)} মিনিট`;
  } else {
    formattedBengali = `${englishToBengaliDigits(secs)} সেকেন্ড`;
  }

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const formattedMinutesSeconds = `${mm}:${ss}`;

  let complexityScore: 'সহজ' | 'মধ্যম' | 'উচ্চ' = 'মধ্যম';
  if (finalSeconds <= 75) {
    complexityScore = 'সহজ';
  } else if (finalSeconds >= 150) {
    complexityScore = 'উচ্চ';
  }

  return {
    seconds: finalSeconds,
    formattedBengali,
    formattedMinutesSeconds,
    reasonBengali: reasons.slice(0, 2).join(' • '),
    complexityScore,
  };
}

export function formatTimeElapsed(totalSeconds: number): {
  bengali: string;
  digital: string;
} {
  const isNegative = totalSeconds < 0;
  const absSec = Math.abs(Math.round(totalSeconds));
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  const digital = `${isNegative ? '-' : ''}${mm}:${ss}`;
  const bnM = englishToBengaliDigits(m);
  const bnS = englishToBengaliDigits(s);

  let bengali = '';
  if (m > 0 && s > 0) {
    bengali = `${bnM} মি ${bnS} সে`;
  } else if (m > 0) {
    bengali = `${bnM} মি`;
  } else {
    bengali = `${bnS} সে`;
  }

  return { bengali, digital };
}
