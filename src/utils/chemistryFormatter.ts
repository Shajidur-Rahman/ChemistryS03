/**
 * Utility to format chemical formulas, units, and powers into standard
 * scientific subscripts and superscripts for beautiful rendering.
 */

// Mapping digits to subscript characters
const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

// Mapping digits and signs to superscript characters
const superscriptMap: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};

export function toSubscriptDigits(str: string): string {
  return str.replace(/[0-9]/g, (digit) => subscriptMap[digit] || digit);
}

export function toSuperscriptDigits(str: string): string {
  return str.replace(/[0-9+-]/g, (char) => superscriptMap[char] || char);
}

// Known common chemical formulas and patterns
const commonFormulas: Record<string, string> = {
  'Na2C2O4': 'Na₂C₂O₄',
  'Na2CO3': 'Na₂CO₃',
  'NaHCO3': 'NaHCO₃',
  'KMnO4': 'KMnO₄',
  'K2Cr2O7': 'K₂Cr₂O₇',
  'H2SO4': 'H₂SO₄',
  'H3PO4': 'H₃PO₄',
  'H2C2O4': 'H₂C₂O₄',
  'FeSO4': 'FeSO₄',
  'Fe2O3': 'Fe₂O₃',
  'Fe3O4': 'Fe₃O₄',
  'CaCO3': 'CaCO₃',
  'CuSO4': 'CuSO₄',
  'BaCl2': 'BaCl₂',
  'MgCl2': 'MgCl₂',
  'CaCl2': 'CaCl₂',
  'Al2O3': 'Al₂O₃',
  'CH3COOH': 'CH₃COOH',
  'C2H5OH': 'C₂H₅OH',
  'C6H12O6': 'C₆H₁₂O₆',
  'C12H22O11': 'C₁₂H₂₂O₁₁',
  'CH4': 'CH₄',
  'C2H6': 'C₂H₆',
  'C2H4': 'C₂H₄',
  'C2H2': 'C₂H₂',
  'C3H8': 'C₃H₈',
  'C4H10': 'C₄H₁₀',
  'CO2': 'CO₂',
  'SO2': 'SO₂',
  'SO3': 'SO₃',
  'NO2': 'NO₂',
  'N2O': 'N₂O',
  'NH3': 'NH₃',
  'NH4Cl': 'NH₄Cl',
  'H2O': 'H₂O',
  'H2O2': 'H₂O₂',
  'O2': 'O₂',
  'N2': 'N₂',
  'H2': 'H₂',
  'Cl2': 'Cl₂',
  'Br2': 'Br₂',
  'I2': 'I₂',
  'F2': 'F₂',
  'S8': 'S₈',
  'P4': 'P₄',
  'Cr2O7': 'Cr₂O₇',
  'MnO4': 'MnO₄',
  'SO4': 'SO₄',
  'CO3': 'CO₃',
  'PO4': 'PO₄',
  'NO3': 'NO₃',
};

/**
 * Automatically format chemical formulas and scientific units in any text string.
 */
export function formatChemicalFormula(text: string): string {
  if (!text) return '';

  let formatted = text;

  // 1. First replace explicit known formulas
  for (const [plain, pretty] of Object.entries(commonFormulas)) {
    // Match whole formula word boundaries or adjacent to punctuation/Bengali
    const regex = new RegExp(`(?<=[\\s(,\\[{>]|^)${plain}(?=[\\s),.\\]};!?<]|$)`, 'g');
    formatted = formatted.replace(regex, pretty);
  }

  // 2. Units with volume powers: cm3, dm3, m3, cm^3, etc.
  formatted = formatted
    .replace(/\b(cm|dm|m)\^?3\b/gi, '$1³')
    .replace(/\b(cm|dm|m)\^?2\b/gi, '$1²')
    .replace(/(\d+)\s*(cm|dm|m)3\b/gi, '$1 $2³');

  // 3. Common ions: Fe2+, Fe3+, Cu2+, Mn2+, Cr3+, H+, OH-
  formatted = formatted
    .replace(/\bFe2\+/g, 'Fe²⁺')
    .replace(/\bFe3\+/g, 'Fe³⁺')
    .replace(/\bCu2\+/g, 'Cu²⁺')
    .replace(/\bMn2\+/g, 'Mn²⁺')
    .replace(/\bCr3\+/g, 'Cr³⁺')
    .replace(/\bZn2\+/g, 'Zn²⁺')
    .replace(/\bH\+/g, 'H⁺')
    .replace(/\bOH\-/g, 'OH⁻');

  // 4. Powers of 10 written like 10^23 or 1021 টি / 1022 টি / 1023 টি
  formatted = formatted
    .replace(/10\^([0-9+-]+)/g, (_, pow) => `10${toSuperscriptDigits(pow)}`)
    .replace(/10(2[0-4])\s*(টি|অণু|পরমাণু|mol)/g, (_, pow, unit) => `10${toSuperscriptDigits(pow)} ${unit}`);

  // 5. General chemical formula regex:
  // Matches element symbols followed by numbers e.g. Ca(OH)2, Ba(NO3)2
  formatted = formatted.replace(
    /\b([A-Z][a-z]?\(?[A-Za-z0-9\(\)]*?\)?)([0-9]+)\b/g,
    (match, prefix, digits) => {
      // Avoid converting common non-formula patterns or numbers like 40mL, 0.1M, etc.
      if (prefix === 'M' || prefix === 'pH' || prefix === 'pOH' || prefix === 'N' || prefix === 'V') {
        return match;
      }
      return `${prefix}${toSubscriptDigits(digits)}`;
    }
  );

  return formatted;
}
