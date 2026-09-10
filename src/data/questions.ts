import { Question } from './types';
import { questionsBatch1 } from './questionsBatch1';
import { questionsBatch2 } from './questionsBatch2';
import { questionsBatch3 } from './questionsBatch3';
import { questionsBatch4 } from './questionsBatch4';

export const allQuestions: Question[] = [
  ...questionsBatch1,
  ...questionsBatch2,
  ...questionsBatch3,
  ...questionsBatch4,
];

// Verify we have all 184 questions
export const totalQuestionsCount = allQuestions.length;

export const topicList = [
  "সকল বিষয় (All Topics)",
  "মোল ধারণা ও পরমাণু গণনা",
  "গ্যাসের ঘনত্ব ও বাষ্পঘনত্ব",
  "শতকরা সংযুতি ও সংকেত নির্ণয়",
  "হাইড্রোকার্বন ইউডিওমিতি ও দহন",
  "তুল্যভর ও তুল্য সংখ্যা",
  "দ্রবণের ঘনমাত্রা (M, m, N, ppm, মোল ভগ্নাংশ)",
  "স্টয়কিওমিতি ও গ্যাসীয় সমীকরণ",
  "আকরিকের বিশুদ্ধতা ও ভেজাল সংক্রান্ত",
  "মিশ্রণ বিশ্লেষণ ও সংকর ধাতু",
  "জেলডাল পদ্ধতি",
  "লিমিটিং বিক্রিয়ক ও উৎপাদের শতকরা পরিমাণ",
  "শিল্প উৎপাদন ও রসায়ন কারখানা",
  "এসিড-ক্ষার প্রশমন ও ব্যাক টাইট্রেশন",
  "দ্বৈত নির্দেশক ও pH পরিবর্তন",
  "জারণ-বিজারণ (রেডক্স) ও আয়োডোমিতি টাইট্রেশন"
];

export const difficultyList = ["সকল স্তর", "মৌলিক", "মধ্যম", "অগ্রবর্তী"] as const;

// Helper to convert Bengali numbers and sub/superscripts to standard English digits
export function bengaliToEnglishDigits(str: string): string {
  if (typeof str !== 'string') return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
  };
  return str.replace(/[০-৯₀-₉⁰-⁹]/g, (char) => bnToEnMap[char] || char);
}

// Helper to convert English numbers to Bengali numerals
export function englishToBengaliDigits(val: number | string): string {
  const enToBnMap: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(val).replace(/[0-9]/g, (char) => enToBnMap[char] || char);
}

// Smart validation for student answers
export function checkStudentAnswer(userAns: string, q: Question): { isCorrect: boolean; feedback?: string } {
  if (!userAns || !userAns.trim()) {
    return { isCorrect: false, feedback: "অনুগ্রহ করে তোমার উত্তরটি লিখো।" };
  }

  const normalizedUser = bengaliToEnglishDigits(userAns.trim().toLowerCase())
    .replace(/[,\s]+/g, ' ')
    .replace(/×/g, '*')
    .replace(/x/g, '*')
    .replace(/\^/g, '');

  const normalizedExpected = bengaliToEnglishDigits(q.answer.trim().toLowerCase())
    .replace(/[,\s]+/g, ' ')
    .replace(/×/g, '*')
    .replace(/x/g, '*')
    .replace(/\^/g, '');

  // 1. Exact or keyword match
  if (normalizedUser === normalizedExpected) {
    return { isCorrect: true };
  }

  // 2. Accepted keywords checking
  if (q.acceptedKeywords && q.acceptedKeywords.length > 0) {
    for (const kw of q.acceptedKeywords) {
      const normKw = bengaliToEnglishDigits(kw.toLowerCase())
        .replace(/[,\s]+/g, ' ')
        .replace(/×/g, '*')
        .replace(/x/g, '*');
      if (normalizedUser.includes(normKw)) {
        return { isCorrect: true };
      }
    }
  }

  // 3. Extract standalone numbers and compare with numeric tolerance
  const userNumbers = normalizedUser.match(/-?\d+(\.\d+)?/g);
  const expectedNumbers = normalizedExpected.match(/-?\d+(\.\d+)?/g);

  if (userNumbers && expectedNumbers && userNumbers.length > 0 && expectedNumbers.length > 0) {
    // If the expected has a single major number, test if the user's number is close within 3% tolerance
    if (expectedNumbers.length === 1 && userNumbers.length === 1) {
      const uNum = parseFloat(userNumbers[0]);
      const eNum = parseFloat(expectedNumbers[0]);
      if (!isNaN(uNum) && !isNaN(eNum) && eNum !== 0) {
        const diffRatio = Math.abs(uNum - eNum) / Math.abs(eNum);
        if (diffRatio <= 0.035) {
          return { isCorrect: true };
        }
      }
    }

    // Check if the primary expected number exists in user answer
    const mainExp = parseFloat(expectedNumbers[0]);
    for (const un of userNumbers) {
      const uNum = parseFloat(un);
      if (!isNaN(uNum) && !isNaN(mainExp) && mainExp !== 0) {
        const diff = Math.abs(uNum - mainExp) / Math.abs(mainExp);
        if (diff <= 0.03) {
          return { isCorrect: true };
        }
      }
    }
  }

  // 4. Special cases for chemical formulas like S8, C2H4, CaCO3
  const formulaMatch = q.answer.match(/[A-Z][a-z0-9]+/g);
  if (formulaMatch) {
    const allFormulasPresent = formulaMatch.every(f => 
      normalizedUser.toLowerCase().includes(f.toLowerCase())
    );
    if (allFormulasPresent && formulaMatch.length > 0) {
      return { isCorrect: true };
    }
  }

  // 5. Bengali "হ্যাঁ" / "Yes" check
  if (q.answer.includes("হ্যাঁ") && (normalizedUser.includes("হ্যাঁ") || normalizedUser.includes("yes") || normalizedUser.includes("ha"))) {
    return { isCorrect: true };
  }

  return { isCorrect: false };
}
