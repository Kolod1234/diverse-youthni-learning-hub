import { useEffect, useRef, useCallback } from "react";
import { MathJax } from "better-react-mathjax";
import ReactMarkdown from "react-markdown";

function annotateSolverMath(node) {
  const mathJax = typeof window !== "undefined" ? window.MathJax : null;
  if (!node || !mathJax) return;
  const containers = Array.from(node.querySelectorAll("mjx-container"));
  const items = mathJax.startup?.document?.getMathItemsWithin?.(node) || [];
  containers.forEach((container, index) => {
    const item = items[index];
    const source = item?.math?.trim();
    if (!source) return;
    const notation = item.display ? `$$${source}$$` : `$${source}$`;
    if (container.dataset.assistantMath !== notation) {
      container.dataset.assistantMath = notation;
      container.setAttribute("aria-label", `Mathematical notation: ${source}`);
    }
  });
}

// Strip rogue code fences the model sometimes wraps around LaTeX
export function cleanMathText(text) {
  if (!text) return "";
  return String(text)
    .replace(/```(?:latex|math)?\n?([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, (_, inner) => {
      if (/[=+\-*/^\\{}]/.test(inner)) return `$${inner}$`;
      return `\`${inner}\``;
    });
}

// Parse GFM pipe tables into blocks so they render as clean tables without needing remark-gfm
function splitMarkdownTables(markdown) {
  const lines = markdown.split("\n");
  const segments = [];
  let textBuffer = [];
  let i = 0;

  const isTableRow = (line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length >= 3;
  };

  const isSeparatorRow = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return false;
    const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());
    return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
  };

  const parseCells = (line) =>
    line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());

  while (i < lines.length) {
    if (i + 1 < lines.length && isTableRow(lines[i]) && isSeparatorRow(lines[i + 1])) {
      if (textBuffer.length > 0) {
        segments.push({ type: "markdown", content: textBuffer.join("\n") });
        textBuffer = [];
      }
      const headers = parseCells(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseCells(lines[i]));
        i++;
      }
      segments.push({ type: "table", headers, rows });
    } else {
      textBuffer.push(lines[i]);
      i++;
    }
  }

  if (textBuffer.length > 0) {
    segments.push({ type: "markdown", content: textBuffer.join("\n") });
  }

  return segments;
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-800">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed text-gray-800">{children}</li>,
  h2: ({ children }) => (
    <h2 className="text-base font-bold mt-5 mb-2 text-indigo-800 border-b border-indigo-100 pb-1">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold mt-4 mb-1.5 text-gray-900">{children}</h3>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-sm font-mono text-amber-800">{children}</code>
    ) : (
      <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto text-sm font-mono my-3">
        <code>{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-400 bg-indigo-50/60 pl-4 pr-3 py-2 rounded-r-xl text-gray-800 my-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-gray-200 my-4" />,
};

export default function AnswerBlock({ text, blockKey }) {
  const containerRef = useRef(null);
  const cleaned = cleanMathText(text);
  const segments = splitMarkdownTables(cleaned);
  const handleTypeset = useCallback(() => annotateSolverMath(containerRef.current), []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    annotateSolverMath(node);
    const observer = new MutationObserver(() => annotateSolverMath(node));
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [text, blockKey]);

  return (
    <MathJax key={blockKey} dynamic onTypeset={handleTypeset}>
      <div ref={containerRef} className="solver-selectable prose prose-sm max-w-none text-gray-800 leading-relaxed text-base">
        {segments.map((seg, idx) =>
          seg.type === "table" ? (
            <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {seg.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-4 py-2.5 text-left font-semibold text-slate-800 border-r last:border-r-0 border-slate-200"
                      >
                        <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                          {h}
                        </ReactMarkdown>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {seg.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="even:bg-slate-50/60">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-4 py-2.5 text-slate-700 border-r last:border-r-0 border-slate-100"
                        >
                          <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                            {cell}
                          </ReactMarkdown>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ReactMarkdown key={idx} components={markdownComponents}>
              {seg.content}
            </ReactMarkdown>
          )
        )}
      </div>
    </MathJax>
  );
}