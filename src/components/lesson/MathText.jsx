import React from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * Renders plain assistant text that may contain LaTeX maths ($...$ or $$...$$)
 * with the same MathJax typesetting used for lesson content.
 */
export default function MathText({ text, className }) {
  return <MathJaxContent className={className} html={`<span>${escapeHtml(text)}</span>`} />;
}