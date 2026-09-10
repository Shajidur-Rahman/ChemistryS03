import { Question } from '../data/types';

export type AnswerType = 'number' | 'chemical_formula' | 'text_choice' | 'multi_part';

export interface AnswerClassification {
  type: AnswerType;
  labelBengali: string;
  badgeBengali: string;
  placeholderBengali: string;
  inputMode: 'decimal' | 'text';
  pattern?: string;
  isNumericOnly: boolean;
  hintBengali: string;
}

/**
 * Classifies a chemistry question based on its required answer type:
 * - 'number': purely numerical value (molarity, volume, mass, moles, %, etc.) -> triggers dedicated Number Keyboard
 * - 'chemical_formula': chemical formula (e.g. C2H4, S8, CO2, Fe2O3) -> triggers Formula Keyboard
 * - 'text_choice': boolean/text answer (হ্যাঁ, না, অসামঞ্জস্য ইত্যাদি) -> triggers Quick Choice Keyboard
 * - 'multi_part': multi-part questions (a, b, c) -> triggers Multi-part input mode
 */
export function classifyQuestionAnswer(q: Question): AnswerClassification {
  const ans = q.answer.trim();

  // 1. Text choice (হ্যাঁ, না, বলা যাবে, অসামঞ্জস্য ইত্যাদি)
  if (/হ্যাঁ|না|অসামঞ্জস্য|বলা যাবে|ঋণাত্মক ভর/i.test(ans)) {
    return {
      type: 'text_choice',
      labelBengali: 'বিকল্প / টেক্সট উত্তর',
      badgeBengali: 'বিকল্প নির্বাচন',
      placeholderBengali: 'তোমার উত্তর লিখুন (যেমন: হ্যাঁ, না)...',
      inputMode: 'text',
      isNumericOnly: false,
      hintBengali: 'নিচের বিকল্পগুলোতে ক্লিক করে উত্তর দিন',
    };
  }

  // 2. Multi-part questions like a) CH, b) 26 g/mol, c) C2H2
  if (/^a\)/i.test(ans) || /^\(1\)/i.test(ans)) {
    return {
      type: 'multi_part',
      labelBengali: 'বহু-ধাপীয় উত্তর',
      badgeBengali: 'বহু-ধাপীয়',
      placeholderBengali: 'উত্তর লিখুন (যেমন: 26, CH)...',
      inputMode: 'text',
      isNumericOnly: false,
      hintBengali: 'প্রশ্নের মূল সংখ্যা বা সংকেত লিখুন',
    };
  }

  // 3. Chemical Formula (e.g. C2H4, S8, CO2, Fe2O3, CHCl3, C3H8, etc.)
  const cleanAns = ans.replace(/\s*\(.*\)$/, ''); // strip (ইথানল), (Iron)
  const isFormula =
    /^[A-Z][a-z]?\d*([A-Z][a-z]?\d*)*(\(.*\))?$/i.test(cleanAns.replace(/\s+/g, '')) ||
    /^(C\d*H\d*|S\d+|CO2|Fe|Fe2O3|CH|CHCl3|CnH9N|C\d+H\d+O\d*)/i.test(cleanAns);

  if (isFormula && !/(g\/mol|mL|mol|M|ppm|Kpa|Pa|atm|°C|%|টি)/i.test(ans)) {
    return {
      type: 'chemical_formula',
      labelBengali: 'রাসায়নিক সংকেত',
      badgeBengali: 'সংকেত মোড',
      placeholderBengali: 'সংকেত লিখুন (যেমন: C2H4, S8, CO2)...',
      inputMode: 'text',
      isNumericOnly: false,
      hintBengali: 'প্রতীক ও সংখ্যা ব্যবহার করে সংকেত লিখুন',
    };
  }

  // 4. Default: Numerical Answer (Only numbers / decimals / powers)
  // Over 156 questions are strictly numerical calculation results
  return {
    type: 'number',
    labelBengali: 'সংখ্যা উত্তর (Numeric)',
    badgeBengali: 'শুধু সংখ্যা কিবোর্ড (Numbers Only)',
    placeholderBengali: 'শুধুমাত্র সংখ্যা বা মান লিখুন (যেমন: 0.1, 22.4, 6635)...',
    inputMode: 'decimal',
    pattern: '[0-9.*+-eE^× /]*',
    isNumericOnly: true,
    hintBengali: 'শুধু সংখ্যা লিখলেই সঠিক গণ্য হবে (বাংলা ও ইংরেজি উভয় সংখ্যা গ্রহণযোগ্য)',
  };
}
