import React, { useState } from 'react';
import { X, Search, Check, Clock, HelpCircle, Layers } from 'lucide-react';
import { Question } from '../data/types';
import { englishToBengaliDigits } from '../data/questions';

interface QuestionNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentQuestionId: number;
  onSelectQuestion: (questionId: number) => void;
  solvedIds: Set<number>;
  attemptedIds: Set<number>;
}

export const QuestionNavigatorModal: React.FC<QuestionNavigatorModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentQuestionId,
  onSelectQuestion,
  solvedIds,
  attemptedIds,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'attempted' | 'unsolved'>('all');

  if (!isOpen) return null;

  const filtered = questions.filter((q) => {
    const isSolved = solvedIds.has(q.id);
    const isAttempted = attemptedIds.has(q.id) && !isSolved;

    if (filterStatus === 'solved' && !isSolved) return false;
    if (filterStatus === 'attempted' && !isAttempted) return false;
    if (filterStatus === 'unsolved' && isSolved) return false;

    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      q.id.toString().includes(s) ||
      englishToBengaliDigits(q.id).includes(s) ||
      q.topic.toLowerCase().includes(s) ||
      q.question.toLowerCase().includes(s)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="question-navigator-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                সকল ১৮৪টি প্রশ্নের সূচি (Question Navigator)
              </h2>
              <p className="text-xs text-slate-500">
                যেকোনো প্রশ্নে সরাসরি যেতে ক্লিক করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="প্রশ্ন নং বা কীওয়ার্ড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: `সব (${englishToBengaliDigits(questions.length)})` },
              { key: 'solved', label: `সঠিক (${englishToBengaliDigits(solvedIds.size)})` },
              { key: 'attempted', label: `চেষ্টাকৃত` },
              { key: 'unsolved', label: `বাকি` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as any)}
                className={`text-xs px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  filterStatus === f.key
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filtered.map((q) => {
              const isCurrent = q.id === currentQuestionId;
              const isSolved = solvedIds.has(q.id);
              const isAttempted = attemptedIds.has(q.id) && !isSolved;

              let btnClasses = "border-slate-200 text-slate-700 hover:bg-slate-100 bg-slate-50";
              if (isSolved) {
                btnClasses = "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
              } else if (isAttempted) {
                btnClasses = "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
              }

              if (isCurrent) {
                btnClasses += " ring-2 ring-teal-600 ring-offset-2";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onSelectQuestion(q.id);
                    onClose();
                  }}
                  title={`প্রশ্ন #${q.id}: ${q.topic}`}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer relative p-1 ${btnClasses}`}
                >
                  <span className="font-semibold">{englishToBengaliDigits(q.id)}</span>
                  <span className="text-3xs text-slate-500 font-mono">#{q.id}</span>

                  {isSolved && (
                    <Check className="w-3 h-3 text-emerald-600 absolute top-1 right-1" />
                  )}
                  {isAttempted && (
                    <Clock className="w-2.5 h-2.5 text-amber-600 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              কোনো প্রশ্ন পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>সঠিক সমাধান</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>চেষ্টাকৃত</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-teal-200" />
              <span>বর্তমান প্রশ্ন</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition cursor-pointer font-medium"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
