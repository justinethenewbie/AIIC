/**
 * Mathematical Speech & Natural Language Normalizer for Probability & Statistics (XSTK)
 * Translates spoken Vietnamese math expressions and casual text into precise KaTeX symbols
 */

export function normalizeSpokenMath(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Greek & Stats Symbols (Spoken -> KaTeX)
  const symbolReplacements: [RegExp, string][] = [
    [/\b(số pi|ký hiệu pi|kí hiệu pi|chữ pi|\bpi\b)/gi, '$\\pi$'],
    [/\b(kỳ vọng muy|kỳ vọng mu|\bmuy\b|\bmu\b)/gi, '$\\mu$'],
    [/\b(phương sai sigma bình|sigma bình phương|sigma bình)\b/gi, '$\\sigma^2$'],
    [/\b(độ lệch chuẩn sigma|\bsigma\b)\b/gi, '$\\sigma$'],
    [/\b(trung bình mẫu x ngang|\bx ngang\b)\b/gi, '$\\bar{X}$'],
    [/\b(mức ý nghĩa alpha|\balpha\b)\b/gi, '$\\alpha$'],
    [/\b(\bbeta\b)\b/gi, '$\\beta$'],
    [/\b(\blamda\b|\blambda\b)\b/gi, '$\\lambda$'],
    [/\b(\btheta\b)\b/gi, '$\\theta$'],
    [/\b(dương vô cùng|dương vô cực)\b/gi, '$+\\infty$'],
    [/\b(âm vô cùng|âm vô cực)\b/gi, '$-\\infty$'],
    [/\b(vô cùng|vô cực)\b/gi, '$\\infty$'],
    [/\b(tổng xích ma|tổng sigma|\bxích ma\b)\b/gi, '$\\sum$'],
    [/\b(tích pi lớn)\b/gi, '$\\prod$'],
    [/\b(suy ra|kéo theo)\b/gi, '$\\Rightarrow$'],
    [/\b(tương đương|khi và chỉ khi)\b/gi, '$\\Leftrightarrow$'],
    [/\b(lớn hơn hoặc bằng)\b/gi, '$\\ge$'],
    [/\b(nhỏ hơn hoặc bằng|bé hơn hoặc bằng)\b/gi, '$\\le$'],
    [/\b(khác biệt|không bằng|\bkhác\b)\b/gi, '$\\ne$'],
    [/\b(xấp xỉ bằng|gần bằng)\b/gi, '$\\approx$'],
  ];

  // 2. Probabilistic notation replacements
  const probReplacements: [RegExp, string][] = [
    [/\bxác suất (?:của )?biến cố ([A-Z])\b/gi, '$P($1)$'],
    [/\bxác suất P của ([A-Z])\b/gi, '$P($1)$'],
    [/\bP của ([A-Z])\b/gi, '$P($1)$'],
    [/\bP\(([A-Z])\)\s*giao\s*([A-Z])\b/gi, '$P($1 \\cap $2)$'],
    [/\bP\(([A-Z])\)\s*hợp\s*([A-Z])\b/gi, '$P($1 \\cup $2)$'],
    [/\bP\(([A-Z])\)\s*với điều kiện\s*([A-Z])\b/gi, '$P($1|$2)$'],
    [/\bP của ([A-Z])\s*với điều kiện\s*([A-Z])\b/gi, '$P($1|$2)$'],
    [/\bkhông gian mẫu omega\b/gi, '$\\Omega$'],
    [/\bomega\b/gi, '$\\Omega$'],
  ];

  // 3. Complex formulas & operators
  // Tổ hợp / chỉnh hợp: "tổ hợp chập 3 của 10" -> C_{10}^3
  text = text.replace(
    /tổ hợp chập ([0-9]+) của ([0-9]+)/gi,
    ' $C_{$2}^{$1}$ '
  );
  text = text.replace(
    /chỉnh hợp chập ([0-9]+) của ([0-9]+)/gi,
    ' $A_{$2}^{$1}$ '
  );

  // Phân số: "phân số 3 trên 8" hoặc "3 phần 8"
  text = text.replace(
    /(?:phân số )?([0-9]+) (?:trên|phần) ([0-9]+)/gi,
    ' $\\frac{$1}{$2}$ '
  );

  // Căn thức: "căn bậc hai của x"
  text = text.replace(
    /căn (?:bậc hai )?(?:của )?([a-zA-Z0-9]+)/gi,
    ' $\\sqrt{$1}$ '
  );

  // Lũy thừa: "x bình phương" hoặc "x bình"
  text = text.replace(/\b([a-zA-Z]) bình(?: phương)?\b/gi, ' $1^2 ');
  text = text.replace(/\b([a-zA-Z]) lập phương\b/gi, ' $1^3 ');
  text = text.replace(/\b([a-zA-Z]) mũ ([0-9]+)\b/gi, ' $1^{$2} ');

  // Tích phân: "tích phân từ 0 đến 1 của x^2 dx"
  text = text.replace(
    /tích phân từ ([0-9a-zA-Z\-\\+]+) đến ([0-9a-zA-Z\-\\+]+)(?: của (.+?)(?: d([a-z]))?)?(?=[,.]|$)/gi,
    (_match, a, b, f, varName) => {
      const v = varName || 'x';
      const func = f ? f.trim() : '';
      return ` $\\int_{${a}}^{${b}} ${func} \\, d${v}$ `;
    }
  );

  // Apply symbol replacements
  for (const [pattern, replacement] of symbolReplacements) {
    text = text.replace(pattern, replacement);
  }

  // Apply probability replacements
  for (const [pattern, replacement] of probReplacements) {
    text = text.replace(pattern, replacement);
  }

  // Tidy up consecutive spaces and malformed $$
  text = text.replace(/\$\s*\$/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
