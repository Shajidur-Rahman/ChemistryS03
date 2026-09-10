import React, { useState } from 'react';
import { X, Search, BookOpen, Layers, Atom, Scale } from 'lucide-react';
import { formulaCheatsheet, commonAtomicMasses, commonMolarMasses } from '../data/cheatsheet';
import { englishToBengaliDigits } from '../data/questions';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'elements' | 'molar'>('formulas');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredFormulas = formulaCheatsheet.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="formula-modal-dialog"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                রাসায়নিক সূত্র ও ধ্রুবক ভাণ্ডার (Lab Formula Reference)
              </h2>
              <p className="text-xs text-slate-500">
                পরিমাণগত রসায়নের প্রয়োজনীয় সকল সূত্র, পারমাণবিক ভর ও আণবিক ভর
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'formulas'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>প্রয়োজনীয় সূত্রাবলি</span>
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'elements'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>পারমাণবিক ভর সারণি</span>
          </button>
          <button
            onClick={() => setActiveTab('molar')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'molar'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>সাধারণ যৌগের আণবিক ভর</span>
          </button>
        </div>

        {/* Search Bar */}
        {activeTab === 'formulas' && (
          <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="সূত্র বা টপিক খুঁজুন (যেমন: মোলারিটি, ppm, তুল্য সংখ্যা)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'formulas' && (
            <div className="space-y-3">
              {filteredFormulas.map((card, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {card.title}
                    </h3>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {card.category}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-teal-100 font-mono text-xs sm:text-sm text-teal-900 font-medium">
                    {card.formula}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="text-xs text-slate-500 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                    <strong className="text-slate-700">উদাহরণ: </strong> {card.example}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'elements' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {commonAtomicMasses.map((el) => (
                <div key={el.symbol} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-teal-700 font-mono">{el.symbol}</span>
                      <span className="text-xs text-slate-600">({el.name})</span>
                    </div>
                    <span className="text-2xs text-slate-400">তুল্য সংখ্যা e={el.e}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 block">
                      {el.mass}
                    </span>
                    <span className="text-2xs text-slate-400">g/mol</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'molar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {commonMolarMasses.map((item) => (
                <div key={item.formula} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                      {item.formula}
                    </h4>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs sm:text-sm text-teal-800">
                      {item.mass}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
