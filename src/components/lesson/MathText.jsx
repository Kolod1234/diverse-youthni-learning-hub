import React from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';
import { normaliseMath } from '@/components/lesson/mathNotation';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * Renders plain assistant text that may contain LaTeX maths ($...$ or $$...$$)
 * with the same MathJax typesetting used for lesson content. Wrong delimiters,
 * missing delimiters and JSON-damaged commands are repaired first, so notation
 * never shows raw. `inline` lets it sit inside a sentence or list item.
 */
export default function MathText({ text, className = '', inline = false }) {
  return (
    <MathJaxContent
      className={inline ? `inline ${className}` : className}
      html={`<span>${escapeHtml(normaliseMath(text))}</span>`}
    />
  );
}