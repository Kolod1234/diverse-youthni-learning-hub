import React, { useEffect, useRef } from 'react';

/**
 * Renders lesson HTML and typesets any LaTeX it contains ($...$ / $$...$$).
 * MathJax is provided app-wide by the MathJaxContext in the layout; if it is
 * not ready yet the effect simply does nothing and re-runs when content changes.
 * Content that contains no LaTeX (e.g. MathML lessons) is unaffected.
 */
export default function MathJaxContent({ html, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;

    const typeset = () => {
      const mathJax = window.MathJax;
      if (cancelled || !mathJax?.typesetPromise) return;
      mathJax.typesetClear?.([node]);
      mathJax.typesetPromise([node]).catch(() => {});
    };

    if (window.MathJax?.typesetPromise) {
      typeset();
    } else {
      // MathJax loads asynchronously; poll briefly until it is available.
      const started = Date.now();
      const timer = setInterval(() => {
        if (window.MathJax?.typesetPromise || Date.now() - started > 8000) {
          clearInterval(timer);
          typeset();
        }
      }, 200);
      return () => { cancelled = true; clearInterval(timer); };
    }

    return () => { cancelled = true; };
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}