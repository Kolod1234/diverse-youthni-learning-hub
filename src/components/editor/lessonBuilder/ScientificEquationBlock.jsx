import React, { useRef } from 'react';
import { FlaskConical, ArrowRight, RotateCw } from 'lucide-react';
import SymbolPalette from './SymbolPalette';

// Scientific Equation block — designed for chemistry & physics tutors writing
// reactions, balanced equations, units with proper subscripts/superscripts
// and state symbols. It deliberately does NOT use LaTeX so the input matches
// what students see, e.g.:
//   2H₂(g) + O₂(g) → 2H₂O(l)
//
// Data shape:
//   { equation: string, caption: string, arrow: 'forward' | 'equilibrium' }
//
// The equation is stored as plain Unicode text; sub/sup converters below
// turn ASCII shortcuts (H_2 → H₂, Cu^2+ → Cu²⁺) into Unicode in one click so
// tutors can type quickly without hunting through the palette.

const SUB_MAP  = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎','a':'ₐ','e':'ₑ','o':'ₒ','x':'ₓ','h':'ₕ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','p':'ₚ','s':'ₛ','t':'ₜ' };
const SUP_MAP  = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ' };

const STATE_SYMBOLS = ['(s)', '(l)', '(g)', '(aq)'];
const ARROW_PRESETS = [
  { value: 'forward',     char: '→',  label: 'Forward (→)' },
  { value: 'equilibrium', char: '⇌',  label: 'Equilibrium (⇌)' },
  { value: 'reverse',     char: '←',  label: 'Reverse (←)' },
];

function applyMap(text, map) {
  return text.split('').map(ch => map[ch] || ch).join('');
}

// Convert ASCII shortcuts inside the current selection / whole field:
//   H_2  → H₂        (underscore = subscript run)
//   Cu^2+ → Cu²⁺    (caret = superscript run, stops at space/letter break)
// Runs continue until the next non-[0-9a-zA-Z+\-] character.
function autoConvertShortcuts(text) {
  // Subscripts: A_token  (token: digits + a few common letters/signs)
  let out = text.replace(/_([0-9+\-=()aeoxhklmnpst]+)/g, (_, run) => applyMap(run, SUB_MAP));
  // Superscripts
  out = out.replace(/\^([0-9+\-=()ni]+)/g, (_, run) => applyMap(run, SUP_MAP));
  return out;
}

export default function ScientificEquationBlock({ data, onChange }) {
  const { equation = '', caption = '', arrow = 'forward' } = data || {};
  const taRef = useRef(null);

  const update = (patch) => onChange({ ...data, ...patch });

  const insertAtCaret = (text) => {
    const ta = taRef.current;
    if (!ta) { update({ equation: equation + text }); return; }
    const start = ta.selectionStart ?? equation.length;
    const end   = ta.selectionEnd   ?? equation.length;
    const next  = equation.slice(0, start) + text + equation.slice(end);
    update({ equation: next });
    requestAnimationFrame(() => {
      const pos = start + text.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const convertShortcuts = () => {
    update({ equation: autoConvertShortcuts(equation) });
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <FlaskConical className="w-4 h-4" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Scientific Equation</span>
        </div>
        <div className="flex items-center gap-1">
          <SymbolPalette onInsert={insertAtCaret} />
          <button
            type="button"
            onClick={convertShortcuts}
            title="Convert H_2 → H₂ and Cu^2+ → Cu²⁺"
            className="text-xs px-2 py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 inline-flex items-center gap-1"
          >
            <RotateCw className="w-3 h-3" /> Auto sub/sup
          </button>
        </div>
      </div>

      {/* Quick insert: states + reaction arrows */}
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold mr-1">States:</span>
        {STATE_SYMBOLS.map(s => (
          <button
            key={s}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertAtCaret(s)}
            className="text-xs px-1.5 py-0.5 rounded bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800"
          >{s}</button>
        ))}
        <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold mx-2">Arrow:</span>
        {ARROW_PRESETS.map(a => (
          <button
            key={a.value}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { update({ arrow: a.value }); insertAtCaret(` ${a.char} `); }}
            className={`text-xs px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${arrow === a.value ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-emerald-200 hover:bg-emerald-100 text-emerald-800'}`}
            title={a.label}
          >{a.char}</button>
        ))}
      </div>

      <textarea
        ref={taRef}
        value={equation}
        onChange={(e) => update({ equation: e.target.value })}
        placeholder="e.g.  2H₂(g) + O₂(g) → 2H₂O(l)"
        className="w-full text-base bg-white border border-emerald-200 rounded p-2 outline-none min-h-[60px] focus:ring-2 focus:ring-emerald-300 font-mono"
        spellCheck={false}
        aria-label="Scientific equation"
      />

      <input
        value={caption}
        onChange={(e) => update({ caption: e.target.value })}
        placeholder="Caption / description (optional)"
        className="mt-2 w-full text-sm bg-white border border-emerald-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-300"
      />

      {equation && (
        <div className="mt-2 bg-white border border-emerald-100 rounded p-3 text-center">
          <p className="text-lg text-gray-900 font-mono">{equation}</p>
          {caption && <p className="text-xs text-gray-500 italic mt-1">{caption}</p>}
        </div>
      )}

      <p className="mt-1.5 text-[10px] text-emerald-700">
        Tip: type <code className="bg-white px-1 rounded">H_2O</code> or <code className="bg-white px-1 rounded">Cu^2+</code>, then press <strong>Auto sub/sup</strong>.
      </p>
    </div>
  );
}