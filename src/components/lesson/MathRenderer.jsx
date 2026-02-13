import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Renders text with LaTeX math support
 * Supports:
 * - Inline math: $...$
 * - Block math: $$...$$
 * - Chemical formulas: \ce{H2O}
 * - Mathematical symbols, equations, fractions, etc.
 */
export default function MathRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split content by block math ($$...$$) and inline math ($...$)
  const parts = [];
  let remaining = content;
  let index = 0;

  while (remaining.length > 0) {
    // Check for block math first ($$...$$)
    const blockStart = remaining.indexOf('$$');
    const inlineStart = remaining.indexOf('$');

    if (blockStart === 0) {
      const blockEnd = remaining.indexOf('$$', 2);
      if (blockEnd !== -1) {
        const math = remaining.substring(2, blockEnd);
        parts.push({ type: 'block', content: math, key: index++ });
        remaining = remaining.substring(blockEnd + 2);
        continue;
      }
    }

    if (inlineStart === 0) {
      const inlineEnd = remaining.indexOf('$', 1);
      if (inlineEnd !== -1) {
        const math = remaining.substring(1, inlineEnd);
        parts.push({ type: 'inline', content: math, key: index++ });
        remaining = remaining.substring(inlineEnd + 1);
        continue;
      }
    }

    // Find the next math delimiter
    let nextDelimiter = -1;
    let nextType = null;

    if (blockStart !== -1 && (nextDelimiter === -1 || blockStart < nextDelimiter)) {
      nextDelimiter = blockStart;
      nextType = 'block';
    }
    if (inlineStart !== -1 && inlineStart !== blockStart && (nextDelimiter === -1 || inlineStart < nextDelimiter)) {
      nextDelimiter = inlineStart;
      nextType = 'inline';
    }

    if (nextDelimiter === -1) {
      // No more math, add remaining text
      if (remaining.length > 0) {
        parts.push({ type: 'text', content: remaining, key: index++ });
      }
      break;
    }

    // Add text before the math
    if (nextDelimiter > 0) {
      parts.push({ type: 'text', content: remaining.substring(0, nextDelimiter), key: index++ });
    }
    remaining = remaining.substring(nextDelimiter);
  }

  return (
    <span className={className}>
      {parts.map((part) => {
        if (part.type === 'block') {
          return (
            <div key={part.key} className="my-2">
              <BlockMath math={part.content} />
            </div>
          );
        } else if (part.type === 'inline') {
          return <InlineMath key={part.key} math={part.content} />;
        } else {
          return <span key={part.key}>{part.content}</span>;
        }
      })}
    </span>
  );
}