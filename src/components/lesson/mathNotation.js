// Normalises LaTeX in AI-written text so maths always typesets instead of showing as raw code.

// When a model writes LaTeX inside JSON without escaping the backslash, parsing turns
// commands into control characters (\frac → form feed + "rac", \times → tab + "imes").
// Put the backslash back, then drop any other invisible control characters.
function repairControlCharacters(value) {
  const repaired = String(value ?? '')
    .replace(/\f/g, '\\f')
    .replace(/[\b]/g, '\\b')
    .replace(/\v/g, '\\v')
    .replace(/\t(?=[a-zA-Z])/g, '\\t')
    .replace(/\r(?=[a-zA-Z])/g, '\\r');
  return Array.from(repaired)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 || code === 9 || code === 10 || code === 13;
    })
    .join('');
}

// Models sometimes use \( \) and \[ \] even when asked for $...$; convert them to the
// $...$ / $$...$$ delimiters the app's MathJax configuration understands.
const normaliseDelimiters = (value) => value
  .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
  .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');

const MATH_SEGMENT = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/;
// Inside maths, a newline followed by these letters was a negated command (\nu, \neq, \nabla …).
const BROKEN_N_COMMAND = /\n(?=(?:u|eq|abla|ot|leq|geq|mid|parallel|subseteq|exists)(?![a-zA-Z]))/g;
// LaTeX commands written in prose without delimiters, e.g. "T = \frac{1}{f}".
const BARE_COMMAND = /(?:\b[A-Za-z0-9]{1,3}\s*[=<>]\s*)?\\[a-zA-Z]+(?:\{(?:[^{}]|\{[^{}]*\})*\})*(?:\s*[\^_]\s*(?:\{[^{}]*\}|[A-Za-z0-9]))*/g;

export function normaliseMath(value) {
  const text = normaliseDelimiters(repairControlCharacters(value));
  return text
    .split(MATH_SEGMENT)
    .map((segment, index) =>
      index % 2 === 1
        ? segment.replace(BROKEN_N_COMMAND, '\\n')
        : segment.replace(BARE_COMMAND, (match) => `$${match.trim()}$`)
    )
    .join('');
}

const stripDelimiters = (value) => value
  .trim()
  .replace(/^\$\$?|\$\$?$/g, '')
  .replace(/^\\[([]|\\[)\]]$/g, '')
  .trim();

const looksLikeProse = (value) => /(?:^|\s)[A-Za-z]{4,}\s+[A-Za-z]{4,}(?=\s|[.,;:!?]|$)/.test(value);

// A field that should hold one equation: always typeset it as display maths,
// whether or not the model remembered the dollar signs.
export function asDisplayMath(value) {
  const text = repairControlCharacters(value).trim();
  const inner = stripDelimiters(text);
  if (!inner) return '';
  if (inner.includes('$') || looksLikeProse(inner)) return text;
  return `$$${inner}$$`;
}

// A field that should hold one symbol, e.g. "T" or "\theta".
export function asInlineMath(value) {
  const inner = stripDelimiters(repairControlCharacters(value));
  return inner && !inner.includes('$') ? `$${inner}$` : inner;
}