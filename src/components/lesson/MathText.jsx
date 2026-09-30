import React from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/**
 * Models sometimes return maths with the wrong delimiters (\( \), \[ \]) even
 * when asked for $...$. Normalise both forms to the $...$ / $$...$$ that the
 * app's MathJax configuration understands, so notation never shows raw.
 */
const normaliseMathDelimiters = (value) => String(value ?? '')
  .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
  .replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');

/**
 * Renders plain assistant text that may contain LaTeX maths ($...$ or $$...$$)
 * with the same MathJax typesetting used for lesson content.
 */
export default function MathText({ text, className }) {
  const normalised = normaliseMathDelimiters(text);
  return <MathJaxContent className={className} html={`<span>${escapeHtml(normalised)}</span>`} />;
}