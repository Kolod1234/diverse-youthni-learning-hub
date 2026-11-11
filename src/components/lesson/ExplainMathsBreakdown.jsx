import React from 'react';
import MathText from '@/components/lesson/MathText';
import ExplainAskButton from '@/components/lesson/ExplainAskButton';
import { asDisplayMath, asInlineMath } from '@/components/lesson/mathNotation';

// "The maths, bit by bit": the equation (always typeset), what each symbol means and the worked steps.
export default function ExplainMathsBreakdown({ breakdown, onAsk }) {
  const { equation, symbol_meanings: symbols = [], worked_steps: steps = [], check_line: check } = breakdown || {};
  if (!equation && !steps.length) return null;

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">The maths, bit by bit</p>
      {equation && (
        <div className="overflow-x-auto rounded-md bg-white p-2 text-center text-base">
          <MathText text={asDisplayMath(equation)} />
        </div>
      )}
      {symbols.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-6 text-sky-900">
          {symbols.map((item, index) => (
            <li key={index}>
              <MathText inline className="font-semibold" text={asInlineMath(item.symbol)} /> — <MathText inline text={item.meaning} />
            </li>
          ))}
        </ul>
      )}
      {steps.length > 0 && (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-6 text-sky-900">
          {steps.map((step, index) => (
            <li key={index}>
              <MathText inline text={step} />
              <ExplainAskButton label={`maths step ${index + 1}`} onClick={() => onAsk({ label: `maths step ${index + 1}`, text: step })} />
            </li>
          ))}
        </ol>
      )}
      {check && <div className="mt-2 text-xs italic text-sky-800"><MathText text={check} /></div>}
    </div>
  );
}