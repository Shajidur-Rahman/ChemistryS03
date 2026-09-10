import React from 'react';
import { Zap, ClipboardCheck, Sparkles, Clock, Target, ArrowRight, X } from 'lucide-react';
import { AppPracticeMode } from '../data/types';

interface ModeSelectorModalProps {
  isOpen: boolean;
  currentMode: AppPracticeMode;
  onSelectMode: (mode: AppPracticeMode) => void;
  onClose: () => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  currentMode,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>প্র্যাকটিস ফরম্যাট নির্ধারণ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            আপনি কোন ধরণের প্রশ্ন অনুশীলন করতে চান?
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            আপনার লক্ষ্য অনুযায়ী নিচের যে কোনো একটি মোড বেছে নিন। যে কোনো সময় উপরে মোড পরিবর্তন করতে পারবেন।
          </p>
        </div>

        {/* Mode Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* 1. Rapid Question Mode */}
          <div 
            onClick={() => onSelectMode('rapid')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left group ${
              currentMode === 'rapid' 
                ? 'border-teal-600 bg-teal-50/40 shadow-sm ring-2 ring-teal-600/20' 
                : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  ল্যাব সহকারী মোড
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>র‍্যাপিড প্রশ্ন</span>
                  <span className="text-xs font-normal text-slate-500">(Rapid Question)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  তাত্ক্ষণিক উত্তর যাচাই, ভুল হলে সূত্রের হিন্ট ও পুনরায় চেষ্টার সুযোগ। সাথে রিয়েল-টাইম অ্যানালগ ঘড়ি ও স্মার্ট কিবোর্ড।
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>তাত্ক্ষণিক সঠিক / ভুল যাচাই</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>ভুল হলে প্রয়োজনীয় সূত্রের সংকেত (Hint)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>প্রতি প্রশ্নে অ্যানালগ টাইমার (সর্বোচ্চ ২ মি. ৩০ সে.)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <span>র‍্যাপিড মোড নির্বাচন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Exam Type Question Mode */}
          <div 
            onClick={() => onSelectMode('exam')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left group ${
              currentMode === 'exam' 
                ? 'border-teal-600 bg-teal-50/40 shadow-sm ring-2 ring-teal-600/20' 
                : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold">
                  মডেল টেস্ট মোড
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>পরীক্ষা মোড</span>
                  <span className="text-xs font-normal text-slate-500">(Exam Question)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  নির্দিষ্ট রেঞ্জ বা র্যান্ডম প্রশ্ন এবং প্রশ্ন সংখ্যা নির্বাচন করুন। পরীক্ষা চলাকালীন কোনো হিন্ট থাকবে না; পরীক্ষা শেষে পূর্ণাঙ্গ মার্কস ও ব্যাখ্যা পাবেন।
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>রেঞ্জ (১-৫০) বা র্যান্ডম প্রশ্ন বাছাই</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>প্রশ্ন সংখ্যা নির্ধারণ (৫, ১০, ২০টি ইত্যাদি)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>পরীক্ষা শেষে প্রাপ্ত মার্কস ও পূর্ণাঙ্গ রেজাল্ট</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <span>পরীক্ষা সেটআপ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
