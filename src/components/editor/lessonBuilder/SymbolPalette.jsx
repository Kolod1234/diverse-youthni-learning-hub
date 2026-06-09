import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sigma, Search } from 'lucide-react';

// Searchable maths/science symbol palette. Click a symbol to insert it at
// the current caret in any contenteditable / input / textarea.
//
// Usage:
//   <SymbolPalette onInsert={(text) => editableRef.current?.format('insertText', text)} />
//
// The palette is purely presentational — the parent decides HOW the chosen
// character is inserted, which keeps the component reusable across blocks
// (rich text, LaTeX input, plain text equation editor, …).

// Each symbol has: char (what is inserted), name (visible label / search),
// optional aliases for richer search ("alpha", "lcm", "≈ approx").
const CATEGORIES = [
  {
    id: 'arithmetic',
    label: 'Arithmetic',
    items: [
      { char: '+', name: 'Plus' },
      { char: '−', name: 'Minus', aliases: ['subtract'] },
      { char: '×', name: 'Multiply', aliases: ['times'] },
      { char: '÷', name: 'Divide' },
      { char: '·', name: 'Dot product', aliases: ['multiply'] },
      { char: '±', name: 'Plus-minus', aliases: ['plusminus','pm'] },
      { char: '∓', name: 'Minus-plus', aliases: ['mp'] },
      { char: '=', name: 'Equals' },
      { char: '≠', name: 'Not equal' },
      { char: '≈', name: 'Approximately', aliases: ['approx'] },
      { char: '≡', name: 'Identical to' },
      { char: '∝', name: 'Proportional to', aliases: ['propto'] },
      { char: '%', name: 'Percent' },
      { char: '‰', name: 'Per mille' },
    ],
  },
  {
    id: 'inequalities',
    label: 'Inequalities',
    items: [
      { char: '<',  name: 'Less than' },
      { char: '>',  name: 'Greater than' },
      { char: '≤',  name: 'Less than or equal', aliases: ['leq'] },
      { char: '≥',  name: 'Greater than or equal', aliases: ['geq'] },
      { char: '≪',  name: 'Much less than' },
      { char: '≫',  name: 'Much greater than' },
    ],
  },
  {
    id: 'algebra',
    label: 'Algebra',
    items: [
      { char: '√',  name: 'Square root', aliases: ['sqrt','root'] },
      { char: '∛',  name: 'Cube root' },
      { char: '∜',  name: 'Fourth root' },
      { char: '^',  name: 'Power', aliases: ['exponent','superscript'] },
      { char: '∞',  name: 'Infinity', aliases: ['infty'] },
      { char: '∅',  name: 'Empty set' },
      { char: '∈',  name: 'Element of' },
      { char: '∉',  name: 'Not element of' },
      { char: '⊂',  name: 'Subset' },
      { char: '⊆',  name: 'Subset or equal' },
      { char: '∪',  name: 'Union' },
      { char: '∩',  name: 'Intersection' },
      { char: '|',  name: 'Absolute value bar' },
    ],
  },
  {
    id: 'calculus',
    label: 'Calculus',
    items: [
      { char: '∑',  name: 'Sum', aliases: ['sigma','summation'] },
      { char: '∏',  name: 'Product' },
      { char: '∫',  name: 'Integral' },
      { char: '∬',  name: 'Double integral' },
      { char: '∭',  name: 'Triple integral' },
      { char: '∮',  name: 'Contour integral' },
      { char: '∂',  name: 'Partial derivative', aliases: ['partial'] },
      { char: '∇',  name: 'Nabla / gradient' },
      { char: 'Δ',  name: 'Delta (change)' },
      { char: 'δ',  name: 'Small delta' },
      { char: 'd',  name: 'Differential d' },
      { char: '→',  name: 'Limit arrow' },
      { char: 'lim',name: 'Limit' },
      { char: '′',  name: 'Prime (derivative)' },
      { char: '″',  name: 'Double prime' },
    ],
  },
  {
    id: 'statistics',
    label: 'Statistics',
    items: [
      { char: 'μ',  name: 'Mean (mu)' },
      { char: 'σ',  name: 'Standard deviation (sigma)' },
      { char: 'σ²', name: 'Variance' },
      { char: 'Σ',  name: 'Sum' },
      { char: 'ρ',  name: 'Correlation (rho)' },
      { char: 'χ²', name: 'Chi-squared' },
      { char: 'x̄',  name: 'Sample mean (x-bar)' },
      { char: 'p̂',  name: 'Sample proportion (p-hat)' },
      { char: 'ŷ',  name: 'Predicted y' },
      { char: 'P(', name: 'Probability of', aliases: ['prob'] },
      { char: '∼',  name: 'Distributed as' },
    ],
  },
  {
    id: 'greek',
    label: 'Greek',
    items: [
      { char: 'α', name: 'Alpha' }, { char: 'β', name: 'Beta' },
      { char: 'γ', name: 'Gamma' }, { char: 'δ', name: 'Delta' },
      { char: 'ε', name: 'Epsilon' }, { char: 'ζ', name: 'Zeta' },
      { char: 'η', name: 'Eta' }, { char: 'θ', name: 'Theta' },
      { char: 'ι', name: 'Iota' }, { char: 'κ', name: 'Kappa' },
      { char: 'λ', name: 'Lambda' }, { char: 'μ', name: 'Mu' },
      { char: 'ν', name: 'Nu' }, { char: 'ξ', name: 'Xi' },
      { char: 'π', name: 'Pi' }, { char: 'ρ', name: 'Rho' },
      { char: 'σ', name: 'Sigma' }, { char: 'τ', name: 'Tau' },
      { char: 'υ', name: 'Upsilon' }, { char: 'φ', name: 'Phi' },
      { char: 'χ', name: 'Chi' }, { char: 'ψ', name: 'Psi' },
      { char: 'ω', name: 'Omega' },
      { char: 'Γ', name: 'Capital Gamma' }, { char: 'Δ', name: 'Capital Delta' },
      { char: 'Θ', name: 'Capital Theta' }, { char: 'Λ', name: 'Capital Lambda' },
      { char: 'Π', name: 'Capital Pi' }, { char: 'Σ', name: 'Capital Sigma' },
      { char: 'Φ', name: 'Capital Phi' }, { char: 'Ψ', name: 'Capital Psi' },
      { char: 'Ω', name: 'Capital Omega' },
    ],
  },
  {
    id: 'physics',
    label: 'Physics',
    items: [
      { char: '°',  name: 'Degree' },
      { char: '℃',  name: 'Degrees Celsius' },
      { char: '℉',  name: 'Degrees Fahrenheit' },
      { char: 'Å',  name: 'Ångström' },
      { char: 'ℏ',  name: 'Reduced Planck constant', aliases: ['hbar'] },
      { char: 'ℎ',  name: 'Planck constant' },
      { char: 'λ',  name: 'Wavelength (lambda)' },
      { char: 'ν',  name: 'Frequency (nu)' },
      { char: 'ω',  name: 'Angular frequency' },
      { char: 'Ω',  name: 'Ohm' },
      { char: '·s', name: 'Per second' },
      { char: 'ms⁻¹', name: 'm/s' },
      { char: 'ms⁻²', name: 'm/s²' },
      { char: 'N',  name: 'Newton' },
      { char: 'J',  name: 'Joule' },
      { char: 'W',  name: 'Watt' },
      { char: 'Pa', name: 'Pascal' },
      { char: 'eV', name: 'Electron-volt' },
    ],
  },
  {
    id: 'chemistry',
    label: 'Chemistry',
    items: [
      { char: '→',  name: 'Reaction arrow' },
      { char: '⇌',  name: 'Equilibrium arrow' },
      { char: '⇋',  name: 'Reverse equilibrium' },
      { char: '↑',  name: 'Gas (up arrow)' },
      { char: '↓',  name: 'Precipitate (down arrow)' },
      { char: '+',  name: 'Plus (between species)' },
      { char: '(s)', name: 'Solid state' },
      { char: '(l)', name: 'Liquid state' },
      { char: '(g)', name: 'Gas state' },
      { char: '(aq)', name: 'Aqueous state' },
      { char: 'ΔH', name: 'Enthalpy change' },
      { char: 'ΔS', name: 'Entropy change' },
      { char: 'ΔG', name: 'Gibbs free energy' },
      { char: '⁻',  name: 'Negative charge superscript' },
      { char: '⁺',  name: 'Positive charge superscript' },
      { char: '²⁺', name: '2+ charge' },
      { char: '³⁻', name: '3- charge' },
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows',
    items: [
      { char: '→', name: 'Right arrow' },
      { char: '←', name: 'Left arrow' },
      { char: '↑', name: 'Up arrow' },
      { char: '↓', name: 'Down arrow' },
      { char: '↔', name: 'Left-right arrow' },
      { char: '⇌', name: 'Equilibrium' },
      { char: '⇒', name: 'Implies' },
      { char: '⇐', name: 'Implied by' },
      { char: '⇔', name: 'If and only if' },
      { char: '⟶', name: 'Long right arrow' },
      { char: '⟵', name: 'Long left arrow' },
      { char: '↦', name: 'Maps to' },
    ],
  },
  {
    id: 'super-sub',
    label: 'Sub/Super',
    items: [
      { char: '²', name: 'Superscript 2' }, { char: '³', name: 'Superscript 3' },
      { char: '⁴', name: 'Superscript 4' }, { char: '⁵', name: 'Superscript 5' },
      { char: '⁶', name: 'Superscript 6' }, { char: '⁷', name: 'Superscript 7' },
      { char: '⁸', name: 'Superscript 8' }, { char: '⁹', name: 'Superscript 9' },
      { char: '⁰', name: 'Superscript 0' }, { char: '¹', name: 'Superscript 1' },
      { char: '⁺', name: 'Superscript plus' }, { char: '⁻', name: 'Superscript minus' },
      { char: 'ⁿ', name: 'Superscript n' }, { char: 'ˣ', name: 'Superscript x' },
      { char: '₀', name: 'Subscript 0' }, { char: '₁', name: 'Subscript 1' },
      { char: '₂', name: 'Subscript 2' }, { char: '₃', name: 'Subscript 3' },
      { char: '₄', name: 'Subscript 4' }, { char: '₅', name: 'Subscript 5' },
      { char: '₆', name: 'Subscript 6' }, { char: '₇', name: 'Subscript 7' },
      { char: '₈', name: 'Subscript 8' }, { char: '₉', name: 'Subscript 9' },
      { char: 'ₓ', name: 'Subscript x' }, { char: 'ₙ', name: 'Subscript n' },
    ],
  },
];

const ALL_ITEMS = CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, category: c.id })));

export default function SymbolPalette({ onInsert, trigger, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(CATEGORIES[0].id);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 10);
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return CATEGORIES.find(c => c.id === tab)?.items || [];
    }
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(i =>
      i.name.toLowerCase().includes(q)
      || i.char.toLowerCase().includes(q)
      || (i.aliases || []).some(a => a.toLowerCase().includes(q))
    );
  }, [query, tab]);

  const insert = (char) => {
    onInsert?.(char);
    // Keep open so users can insert multiple symbols quickly.
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Insert symbol"
        aria-label="Insert maths or science symbol"
        aria-haspopup="dialog"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()} // preserve caret/selection
        onClick={() => setOpen(o => !o)}
        className={`h-7 min-w-[28px] px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded ${open ? 'bg-gray-100' : ''}`}
      >
        {trigger || <Sigma className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Symbol palette"
          onMouseDown={(e) => e.preventDefault()} // preserve caret/selection in editor
          className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} z-40 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl w-[360px] overflow-hidden`}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-2 py-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbols (alpha, sqrt, →, propto…)"
              className="flex-1 text-xs outline-none bg-transparent"
              aria-label="Search symbols"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[10px] text-gray-500 hover:text-gray-700"
              >Clear</button>
            )}
          </div>

          {/* Category tabs — hidden while searching globally */}
          {!query.trim() && (
            <div className="flex gap-1 px-1.5 py-1 border-b border-gray-100 overflow-x-auto" role="tablist">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === c.id}
                  onClick={() => setTab(c.id)}
                  className={`text-[11px] px-2 py-1 rounded whitespace-nowrap ${tab === c.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No symbols match "{query}"</p>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {filtered.map((item, idx) => (
                  <button
                    key={`${item.char}-${idx}`}
                    type="button"
                    title={item.name}
                    aria-label={`Insert ${item.name} (${item.char})`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insert(item.char)}
                    className="h-9 min-w-0 inline-flex items-center justify-center text-base text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 rounded border border-transparent hover:border-indigo-200"
                  >
                    <span className="leading-none">{item.char}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-2 py-1.5 border-t border-gray-100 text-[10px] text-gray-500 bg-gray-50">
            Tip: keep the palette open to add several symbols in a row.
          </div>
        </div>
      )}
    </div>
  );
}