export interface FormulaCard {
  title: string;
  category: string;
  formula: string;
  description: string;
  example: string;
}

export const formulaCheatsheet: FormulaCard[] = [
  {
    title: "মোল সংখ্যা ও অ্যাভোগাড্রো রূপান্তর",
    category: "মোল ধারণা",
    formula: "n = w / M = N / N_A = V(STP) / 22.4L = S × V(L) = (P × V) / (R × T)",
    description: "ভর (w), অণু/পরমাণু সংখ্যা (N), STP-তে আয়তন (V) ও মোলারিটি (S) এর পারস্পরিক সম্পর্ক। (N_A = 6.023 × 10²³)",
    example: "১০ গ্রাম CaCO₃ এর মোল = ১০ / ১০০ = ০.১ mol।"
  },
  {
    title: "দ্রবণের মোলারিটি (M)",
    category: "দ্রবণের ঘনমাত্রা",
    formula: "S = (1000 × w) / (M × V_mL)",
    description: "প্রতি লিটার দ্রবণে দ্রবীভূত দ্রবের মোল সংখ্যা।",
    example: "১০০ mL এ ১০.৬ g Na₂CO₃ থাকলে S = (১০০০ × ১০.৬) / (১০৬ × ১০০) = ১ M।"
  },
  {
    title: "দ্রবণের মোলালিটি (m)",
    category: "দ্রবণের ঘনমাত্রা",
    formula: "m = (1000 × w_solute) / (M_solute × w_solvent_g)",
    description: "প্রতি ১০০০ গ্রাম (১ কেজি) দ্রাবকে দ্রবীভূত দ্রবের মোল সংখ্যা। তাপমাত্রার ওপর নির্ভরশীল নয়।",
    example: "৫০০ g পানিতে ২ মোল গ্লুকোজ থাকলে m = ২ / ০.৫ = ৪ m।"
  },
  {
    title: "নরমালিটি ও তুল্য সংখ্যা (N)",
    category: "দ্রবণের ঘনমাত্রা",
    formula: "N = S × e | E = M / e",
    description: "তুল্য সংখ্যা e: এসিডের ক্ষারকত্ব (H₂SO₄=২, HCl=১), ক্ষারের অম্লত্ব (NaOH=১, Ca(OH)₂=২), রেডক্সে স্থানান্তরিত ইলেকট্রন (KMnO₄=৫ অম্লীয় মাধ্যমে)।",
    example: "০.১ M H₂SO₄ এর নরমালিটি = ০.১ × ২ = ০.২ N।"
  },
  {
    title: "ppm ও ppb ঘনমাত্রা",
    category: "দ্রবণের ঘনমাত্রা",
    formula: "ppm = (w_solute_mg) / (V_solution_L) = S × M × 10³ = %w/w × 10,000",
    description: "Parts per million (প্রতি ১০ লক্ষ ভাগে কত ভাগ)। লঘু জলীয় দ্রবণে ১ ppm = ১ mg/L।",
    example: "০.০১ M NaOH এর ppm = ০.০১ × ৪০ × ১০০০ = ৪০০ ppm।"
  },
  {
    title: "লঘুকরণ ও প্রশমন সমীকরণ",
    category: "টাইট্রেশন",
    formula: "লঘুকরণ: V₁S₁ = V₂S₂ | প্রশমন: e₁V₁S₁ = e₂V₂S₂",
    description: "এসিড ও ক্ষারের পূর্ণ প্রশমনে তুল্য গ্রাম সমান হয়।",
    example: "২৫ mL ০.১ M HCl কে প্রশমিত করতে লাগবে ২৫ mL ০.১ M NaOH।"
  },
  {
    title: "রেডক্স টাইট্রেশন সম্পর্ক",
    category: "জারণ-বিজারণ",
    formula: "e_ox × n_ox = e_red × n_red  বা  e₁V₁S₁ = e₂V₂S₂",
    description: "অম্লীয় মাধ্যমে: KMnO₄ (e=৫), K₂Cr₂O₇ (e=৬), Fe²⁺ (e=১), C₂O₄²⁻ (e=২), Na₂S₂O₃ (e=১)।",
    example: "২ মোল KMnO₄ ≡ ৫ মোল H₂C₂O₄ ≡ ১০ মোল FeSO₄।"
  },
  {
    title: "গ্যাসের ঘনত্ব ও বাষ্পঘনত্ব (VD)",
    category: "গ্যাসীয় গণনা",
    formula: "d = M / 22.4 (STP) | M = 2 × VD",
    description: "হাইড্রোজেনের সাপেক্ষে বাষ্পঘনত্ব VD = M/2। বায়ুর গড় আণবিক ভর ≈ ২৯।",
    example: "O₂ এর বাষ্পঘনত্ব = ৩২ / ২ = ১৬।"
  },
  {
    title: "শতকরা সংযুতি ও সংকেত",
    category: "সংকেত নির্ণয়",
    formula: "%মৌল = (পরমাণুর সংখ্যা × পারমাণবিক ভর / আণবিক ভর) × ১০০",
    description: "স্থূল সংকেত থেকে আণবিক সংকেত: (স্থূল সংকেত)_n যেখানে n = আণবিক ভর / স্থূল সংকেতের ভর।",
    example: "গ্লুকোজের স্থূল সংকেত CH₂O (ভর ৩০), আণবিক ভর ১৮০ হলে n = ১৮০/৩০ = ৬ => C₆H₁₂O₆।"
  },
  {
    title: "আকরিকের বিশুদ্ধতা ও লিমিটিং বিক্রিয়ক",
    category: "স্টয়কিওমিতি",
    formula: "%বিশুদ্ধতা = (বিশুদ্ধ ভর / মোট নমুনা ভর) × ১০০ | %Yield = (বাস্তব উৎপাদ / তাত্ত্বিক উৎপাদ) × ১০০",
    description: "বিক্রিয়ায় যে উপাদানটি আগে নিঃশেষ হয়ে উৎপাদের পরিমাণ নির্ধারণ করে সেটিই লিমিটিং বিক্রিয়ক।",
    example: "১৫০ g চুনাপাথরে ১৩৫ g CaCO₃ থাকলে বিশুদ্ধতা = (১৩৫ / ১৫০) × ১০০ = ৯০%।"
  }
];

export const commonAtomicMasses = [
  { symbol: 'H', name: 'হাইড্রোজেন', mass: 1.008, e: 1 },
  { symbol: 'C', name: 'কার্বন', mass: 12.01, e: 4 },
  { symbol: 'N', name: 'নাইট্রোজেন', mass: 14.00, e: 3 },
  { symbol: 'O', name: 'অক্সিজেন', mass: 16.00, e: 2 },
  { symbol: 'Na', name: 'সোডিয়াম', mass: 23.00, e: 1 },
  { symbol: 'Mg', name: 'ম্যাগনেসিয়াম', mass: 24.31, e: 2 },
  { symbol: 'Al', name: 'অ্যালুমিনিয়াম', mass: 26.98, e: 3 },
  { symbol: 'P', name: 'ফসফরাস', mass: 30.97, e: 5 },
  { symbol: 'S', name: 'সালফার', mass: 32.06, e: 2 },
  { symbol: 'Cl', name: 'ক্লোরিন', mass: 35.45, e: 1 },
  { symbol: 'K', name: 'পটাশিয়াম', mass: 39.10, e: 1 },
  { symbol: 'Ca', name: 'ক্যালসিয়াম', mass: 40.08, e: 2 },
  { symbol: 'Cr', name: 'ক্রোমিয়াম', mass: 52.00, e: 6 },
  { symbol: 'Mn', name: 'ম্যাঙ্গানিজ', mass: 54.94, e: 5 },
  { symbol: 'Fe', name: 'আয়রন', mass: 55.85, e: 2 },
  { symbol: 'Cu', name: 'কপার', mass: 63.55, e: 2 },
  { symbol: 'Zn', name: 'জিংক', mass: 65.38, e: 2 },
  { symbol: 'Br', name: 'ব্রোমিন', mass: 79.90, e: 1 },
  { symbol: 'Ag', name: 'সিলভার', mass: 107.87, e: 1 },
  { symbol: 'I', name: 'আয়োডিন', mass: 126.90, e: 1 },
  { symbol: 'Ba', name: 'বেরিয়াম', mass: 137.33, e: 2 },
  { symbol: 'Pb', name: 'লেড', mass: 207.20, e: 2 }
];

export const commonMolarMasses = [
  { formula: 'H₂O', mass: '18.02 g/mol', note: 'পানি' },
  { formula: 'HCl', mass: '36.46 g/mol', note: 'হাইড্রোক্লোরিক এসিড' },
  { formula: 'NaOH', mass: '40.00 g/mol', note: 'কস্টিক সোডা' },
  { formula: 'CO₂', mass: '44.01 g/mol', note: 'কার্বন ডাই অক্সাইড' },
  { formula: 'H₂SO₄', mass: '98.08 g/mol', note: 'সালফিউরিক এসিড (e=2)' },
  { formula: 'CaCO₃', mass: '100.09 g/mol', note: 'চুনাপাথর' },
  { formula: 'Na₂CO₃', mass: '106.00 g/mol', note: 'সোডা অ্যাশ' },
  { formula: 'NaHCO₃', mass: '84.01 g/mol', note: 'বেকিং সোডা' },
  { formula: 'KMnO₄', mass: '158.03 g/mol', note: 'পটাশিয়াম পারম্যাঙ্গানেট' },
  { formula: 'K₂Cr₂O₇', mass: '294.18 g/mol', note: 'পটাশিয়াম ডাইক্রোমেট' },
  { formula: 'Na₂S₂O₃·5H₂O', mass: '248.18 g/mol', note: 'হাইপো (সোডিয়াম থায়োসালফেট)' },
  { formula: 'C₆H₁₂O₆', mass: '180.16 g/mol', note: 'গ্লুকোজ' }
];
