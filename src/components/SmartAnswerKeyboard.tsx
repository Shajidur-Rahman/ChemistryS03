import React, { useState } from 'react';
import { 
  Delete, 
  RotateCcw, 
  Send, 
  Hash, 
  Atom, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp,
  Languages
} from 'lucide-react';
import { AnswerClassification } from '../utils/answerClassifier';

interface SmartAnswerKeyboardProps {
  classification: AnswerClassification;
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const SmartAnswerKeyboard: React.FC<SmartAnswerKeyboardProps> = ({
  classification,
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
  canSubmit,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [useBengaliDigits, setUseBengaliDigits] = useState(false);

  const englishDigits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
  const bengaliDigits = ['৭', '৮', '৯', '৪', '৫', '৬', '১', '২', '৩', '০'];

  const currentDigits = useBengaliDigits ? bengaliDigits : englishDigits;

  return (
    <div id="smart-answer-keyboard" className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 transition-all">
      
      {/* Keyboard Header / Badge & Collapse toggle */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {classification.type === 'number' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-semibold shadow-2xs">
              <Hash className="w-3.5 h-3.5 text-teal-600" />
              <span>শুধু সংখ্যা কিবোর্ড (Numbers Only Keyboard)</span>
            </span>
          )}

          {classification.type === 'chemical_formula' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold shadow-2xs">
              <Atom className="w-3.5 h-3.5 text-indigo-600" />
              <span>রাসায়নিক সংকেত কিবোর্ড (Chemical Formula Keyboard)</span>
            </span>
          )}

          {classification.type === 'text_choice' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>বিকল্প নির্বাচন কিবোর্ড (Choice Keyboard)</span>
            </span>
          )}

          {classification.type === 'multi_part' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs">
              <span>বহু-ধাপীয় কিবোর্ড</span>
            </span>
          )}

          <span className="text-slate-500 hidden md:inline-block">
            {classification.hintBengali}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {classification.type === 'number' && (
            <button
              type="button"
              onClick={() => setUseBengaliDigits(!useBengaliDigits)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition cursor-pointer"
              title="সংখ্যা ফরম্যাট পরিবর্তন করুন (ইংরেজি / বাংলা)"
            >
              <Languages className="w-3 h-3 text-slate-500" />
              <span>{useBengaliDigits ? "বাংলা (১-৯)" : "English (1-9)"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <span>কিবোর্ড খুলুন</span>
                <ChevronDown className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>লুকান</span>
                <ChevronUp className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard Body (Conditional on answer type) */}
      {!isCollapsed && (
        <div className="animate-in fade-in duration-200">
          
          {/* 1. NUMBER KEYBOARD (When answer is just only a number) */}
          {classification.type === 'number' && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto sm:mx-0">
                {/* Row 1: 7, 8, 9, Backspace */}
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[0])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[0]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[1])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[1]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[2])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[2]}
                </button>
                <button
                  type="button"
                  onClick={onBackspace}
                  className="h-11 sm:h-12 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl font-semibold text-rose-700 shadow-2xs flex items-center justify-center transition cursor-pointer select-none"
                  title="শেষ অক্ষর মুছুন (Backspace)"
                >
                  <Delete className="w-5 h-5" />
                </button>

                {/* Row 2: 4, 5, 6, Clear */}
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[3])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[3]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[4])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[4]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[5])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[5]}
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="h-11 sm:h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer select-none"
                  title="পুরো ইনপুট মুছুন (Clear)"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>C</span>
                </button>

                {/* Row 3: 1, 2, 3, Negative / Minus */}
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[6])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[6]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[7])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[7]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[8])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[8]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert('-')}
                  className="h-11 sm:h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-700 shadow-2xs transition cursor-pointer select-none"
                  title="ঋণাত্মক চিহ্ন"
                >
                  -
                </button>

                {/* Row 4: 0, Decimal (.), Power/Exponent (×10^), Submit */}
                <button
                  type="button"
                  onClick={() => onInsert(currentDigits[9])}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                >
                  {currentDigits[9]}
                </button>
                <button
                  type="button"
                  onClick={() => onInsert('.')}
                  className="h-11 sm:h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl font-bold text-base sm:text-lg text-slate-800 shadow-2xs transition cursor-pointer select-none"
                  title="দশমিক বিন্দু"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(' × 10^')}
                  className="h-11 sm:h-12 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 rounded-xl font-bold text-xs sm:text-sm text-teal-800 shadow-2xs transition cursor-pointer select-none"
                  title="বিজ্ঞানী ঘাত (যেমন 10^18)"
                >
                  ×10^
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="h-11 sm:h-12 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed border border-teal-700 rounded-xl font-bold text-white shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer select-none"
                  title="উত্তর জমা দিন"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Quick scientific powers and percent */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-600">
                <span className="text-slate-400 font-medium">দ্রুত প্রতীক:</span>
                {['×10²³', '×10⁻³', '×10⁻⁴', '%', '²', '³'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onInsert(sym)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-mono text-xs rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. CHEMICAL FORMULA KEYBOARD */}
          {classification.type === 'chemical_formula' && (
            <div className="space-y-2.5">
              {/* Elements Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-medium mr-1">মৌল:</span>
                {['C', 'H', 'O', 'N', 'S', 'Fe', 'Cl', 'Na', 'K', 'Ca'].map((elem) => (
                  <button
                    key={elem}
                    type="button"
                    onClick={() => onInsert(elem)}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-950 font-bold text-sm rounded-xl border border-indigo-200 shadow-2xs transition cursor-pointer"
                  >
                    {elem}
                  </button>
                ))}
              </div>

              {/* Subscripts & Controls Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-medium mr-1">সংখ্যা:</span>
                {['1', '2', '3', '4', '5', '6', '8', '10', '12', '18', 'x', 'y'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => onInsert(sub)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-mono font-bold text-sm rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
                  >
                    {sub}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => onInsert('(')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-sm rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  (
                </button>
                <button
                  type="button"
                  onClick={() => onInsert(')')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-sm rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  )
                </button>

                <button
                  type="button"
                  onClick={onBackspace}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 shadow-2xs transition cursor-pointer ml-auto"
                  title="মুছুন (Backspace)"
                >
                  <Delete className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* 3. TEXT / CHOICE KEYBOARD */}
          {classification.type === 'text_choice' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-500 block mb-1">সরাসরি ক্লিকের মাধ্যমে উত্তর নির্বাচন করুন:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {['হ্যাঁ', 'না', 'হ্যাঁ, বলা যাবে', 'বলা যাবে না', 'অসামঞ্জস্য রয়েছে', 'ঋণাত্মক ভর'].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => onInsert(choice)}
                    className="px-4 py-2 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-900 font-semibold text-sm rounded-xl border border-emerald-300 shadow-2xs transition cursor-pointer"
                  >
                    {choice}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer ml-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* 4. MULTI-PART KEYBOARD */}
          {classification.type === 'multi_part' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {['a) ', 'b) ', 'c) ', 'CH', '26', 'C2H2', 'g/mol', ',', ' '].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onInsert(item)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-medium text-xs rounded-xl border border-amber-200 shadow-2xs transition cursor-pointer"
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={onBackspace}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer ml-auto"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
