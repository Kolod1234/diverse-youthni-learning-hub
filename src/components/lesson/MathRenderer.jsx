import React from 'react';
import { MathJax } from 'better-react-mathjax';

/**
 * Renders text with LaTeX math support using MathJax
 * Supports:
 * - Inline math: $...$
 * - Block math: $$...$$
 * - Chemical formulas: \ce{H2O}, \cee{...}
 * - Physics notation: vectors, units, graphs
 * - Mathematical symbols, equations, fractions, etc.
 */
export default function MathRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <MathJax className={className} inline dynamic>
      {content}
    </MathJax>
  );
}