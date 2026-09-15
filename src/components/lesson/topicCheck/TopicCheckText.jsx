import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { MathJax } from 'better-react-mathjax';

export default function TopicCheckText({ content = '', className = '' }) {
  const html = useMemo(() => DOMPurify.sanitize(String(content), {
    USE_PROFILES: { html: true, mathMl: true },
    FORBID_TAGS: ['style', 'iframe', 'input', 'button', 'form', 'img', 'video', 'audio'],
    FORBID_ATTR: ['style', 'id'],
  }), [content]);
  return <MathJax dynamic className={'topic-check-text break-words leading-7 [&_math]:max-w-full [&_math]:overflow-x-auto [&_math]:align-middle [&_math[display=block]]:my-4 [&_math[display=block]]:block [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 ' + className}><div dangerouslySetInnerHTML={{ __html: html }} /></MathJax>;
}