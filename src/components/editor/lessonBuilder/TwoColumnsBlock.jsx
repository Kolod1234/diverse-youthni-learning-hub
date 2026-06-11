import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Plus, Trash2, Copy, ArrowUp, ArrowDown, GripVertical,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Smartphone, Columns2, Settings2, ChevronDown, ChevronUp, Pencil, Check,
} from 'lucide-react';
import { createBlock, BLOCK_GROUPS, blockTypeLabel } from './blockTypes';
import { BlockExpandedContext } from './BlockWrapper';

// ── Editor-side responsive stylesheet ───────────────────────────────────────
// The two-column grid is driven by a CSS custom property (`--tc-cols`) set
// inline per instance, but the actual `display:grid` / `grid-template-columns`
// declarations live in a real stylesheet so a media query can override them
// at mobile widths. Inline styles cannot be overridden by `@media` rules from
// a stylesheet, which is why the previous version stayed side-by-side on
// 390px viewports. Injected ONCE at module load, idempotent.
const TC_STYLE_ID = 'lb-twocol-editor-style';
if (typeof document !== 'undefined' && !document.getElementById(TC_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = TC_STYLE_ID;
  // NB: text overflow rules (overflow-wrap / word-break / max-width:100% on
  // descendants) are critical — long unbroken strings (URLs, code, words
  // without spaces) otherwise force the column wider than its grid track,
  // overflowing the slide and breaking the responsive stack. Applied to
  // every descendant of .two-columns-block so it covers nested editors,
  // pre/code, headings, images and tables alike.
  styleEl.textContent = `
    .two-columns-block {
      display: grid;
      grid-template-columns: var(--tc-cols, 1fr 8px 1fr);
      min-width: 0;
    }
    .two-columns-block > * { min-width: 0; }
    .two-columns-block, .two-columns-block * {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .two-columns-block img,
    .two-columns-block video,
    .two-columns-block iframe,
    .two-columns-block table,
    .two-columns-block pre {
      max-width: 100%;
    }
    @media (max-width: 767px) {
      .two-columns-block[data-stack="true"] {
        grid-template-columns: 1fr !important;
      }
      .two-columns-block[data-stack="true"] > [data-tc-divider] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

// True container: each side holds an array of child blocks of any supported
// type. Parent passes `renderChild(block, onChange)` so we can render any
// block via the main BlockRenderer without a circular import.
//
// Data shape (with backwards-compat for the old { left, right } HTML form):
//   {
//     leftBlocks: Block[],
//     rightBlocks: Block[],
//     ratio: number,            // 0..1 — left column fraction; default 0.5
//     gap: number,              // px between columns
//     verticalAlign: 'top'|'center'|'bottom',
//     stackOnMobile: boolean,
//   }

const PRESETS = [
  { label: '50 / 50', value: 0.5 },
  { label: '60 / 40', value: 0.6 },
  { label: '40 / 60', value: 0.4 },
  { label: '70 / 30', value: 0.7 },
  { label: '30 / 70', value: 0.3 },
];

function normalise(data = {}) {
  const columnCount = [1, 2, 3].includes(data.columnCount) ? data.columnCount : 2;

  // Legacy form: { left, right } HTML strings → wrap as a single legacy-html
  // child per side so existing slides round-trip without data loss.
  if (!Array.isArray(data.leftBlocks) && !Array.isArray(data.rightBlocks)
      && (typeof data.left === 'string' || typeof data.right === 'string')) {
    return {
      columnCount,
      leftBlocks:   data.left  ? [createBlock('legacy-html', { html: data.left  })] : [],
      middleBlocks: [],
      rightBlocks:  data.right ? [createBlock('legacy-html', { html: data.right })] : [],
      ratio: typeof data.ratio === 'number' ? data.ratio : 0.5,
      gap: Number.isFinite(data.gap) ? data.gap : 24,
      verticalAlign: data.verticalAlign || 'top',
      stackOnMobile: data.stackOnMobile !== false,
    };
  }
  return {
    columnCount,
    leftBlocks:   Array.isArray(data.leftBlocks)   ? data.leftBlocks   : [],
    middleBlocks: Array.isArray(data.middleBlocks) ? data.middleBlocks : [],
    rightBlocks:  Array.isArray(data.rightBlocks)  ? data.rightBlocks  : [],
    ratio: typeof data.ratio === 'number' ? clamp(data.ratio, 0.15, 0.85) : 0.5,
    gap: Number.isFinite(data.gap) ? data.gap : 24,
    verticalAlign: ['top','center','bottom'].includes(data.verticalAlign) ? data.verticalAlign : 'top',
    stackOnMobile: data.stackOnMobile !== false,
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function TwoColumnsBlock({ data, onChange, renderChild }) {
  const norm = useMemo(() => normalise(data), [data]);
  const { columnCount, leftBlocks, middleBlocks, rightBlocks, ratio, gap, verticalAlign, stackOnMobile } = norm;

  const update = (patch) => onChange({ ...norm, ...patch });
  const setLeft   = (next) => update({ leftBlocks:   next });
  const setMiddle = (next) => update({ middleBlocks: next });
  const setRight  = (next) => update({ rightBlocks:  next });

  // Switching column count must NEVER destroy column content. We just hide
  // middleBlocks when collapsing to 2, and re-show them when expanding to 3.
  const setColumnCount = (n) => update({ columnCount: n });

  // SHARED nested-accordion state — exactly one child across BOTH columns
  // may be expanded at any time. Key shape: `${side}:${blockId}`. Ephemeral,
  // never serialised. Done / Escape clear it. Toggling a closed child sets
  // exactly that key (it does NOT merge — any previously open child closes
  // automatically because expanded === (nestedExpandedKey === key)).
  const [nestedExpandedKey, setNestedExpandedKey] = useState(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setNestedExpandedKey(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Draggable divider ────────────────────────────────────────────────────
  const wrapRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDividerDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const next = clamp(x / rect.width, 0.15, 0.85);
      update({ ratio: Math.round(next * 100) / 100 });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, norm]);

  // ── Render ──────────────────────────────────────────────────────────────
  const valign = { top: 'flex-start', center: 'center', bottom: 'flex-end' }[verticalAlign];

  return (
    <div className="space-y-2">
      {/* Layout settings — INDEPENDENT disclosure, intentionally NOT gated
          by the outer block's Edit/Done state. A tutor can collapse the
          row of presets at any time, even mid-edit, without having to
          collapse the whole container block. Ephemeral local state. */}
      <LayoutSettingsDisclosure>
        <Toolbar
          columnCount={columnCount}
          ratio={ratio}
          gap={gap}
          verticalAlign={verticalAlign}
          stackOnMobile={stackOnMobile}
          onColumnCount={setColumnCount}
          onRatio={(r) => update({ ratio: r })}
          onGap={(g) => update({ gap: g })}
          onValign={(v) => update({ verticalAlign: v })}
          onToggleStack={() => update({ stackOnMobile: !stackOnMobile })}
        />
      </LayoutSettingsDisclosure>

      <div
        ref={wrapRef}
        className="two-columns-block"
        data-stack={stackOnMobile ? 'true' : 'false'}
        data-cols={columnCount}
        style={{
          // grid-template-columns is supplied via a CSS custom property so a
          // media query in the stylesheet (see top of file) can override it
          // at <=767px when stackOnMobile is true. Inline `gridTemplateColumns`
          // would defeat the media query — do NOT add it back here.
          ['--tc-cols']: gridTemplateFor(columnCount, ratio),
          // For 1-col layouts the only thing the column-gap (`gap`) would
          // affect on a single-track grid is nothing — vertical inter-block
          // spacing already lives on the Column flex container. So we zero
          // the grid gap when there's just one track to avoid a phantom
          // 24px gutter on the right of the single column.
          gap: columnCount === 1 ? 0 : `${gap}px`,
          // alignItems vertically aligns the column tracks within the row.
          // For 1-col this also needs a minimum row height to be visible,
          // matching the serialized preview (see two-columns serializer).
          alignItems: valign,
          minHeight: verticalAlign !== 'top' ? '240px' : undefined,
          userSelect: dragging ? 'none' : undefined,
        }}
      >
        {columnCount === 1 && (
          <Column
            title="Content"
            side="left"
            blocks={leftBlocks}
            onChange={setLeft}
            renderChild={renderChild}
            nestedExpandedKey={nestedExpandedKey}
            setNestedExpandedKey={setNestedExpandedKey}
            blockSpacing={gap}
          />
        )}

        {columnCount === 2 && (
          <>
            <Column
              title="Left"
              side="left"
              blocks={leftBlocks}
              onChange={setLeft}
              renderChild={renderChild}
              nestedExpandedKey={nestedExpandedKey}
              setNestedExpandedKey={setNestedExpandedKey}
            />
            <Divider onMouseDown={onDividerDown} onTouchStart={onDividerDown} dragging={dragging} ratio={ratio} />
            <Column
              title="Right"
              side="right"
              blocks={rightBlocks}
              onChange={setRight}
              renderChild={renderChild}
              nestedExpandedKey={nestedExpandedKey}
              setNestedExpandedKey={setNestedExpandedKey}
            />
          </>
        )}

        {columnCount === 3 && (
          <>
            <Column
              title="Left"
              side="left"
              blocks={leftBlocks}
              onChange={setLeft}
              renderChild={renderChild}
              nestedExpandedKey={nestedExpandedKey}
              setNestedExpandedKey={setNestedExpandedKey}
            />
            <Column
              title="Middle"
              side="middle"
              blocks={middleBlocks}
              onChange={setMiddle}
              renderChild={renderChild}
              nestedExpandedKey={nestedExpandedKey}
              setNestedExpandedKey={setNestedExpandedKey}
            />
            <Column
              title="Right"
              side="right"
              blocks={rightBlocks}
              onChange={setRight}
              renderChild={renderChild}
              nestedExpandedKey={nestedExpandedKey}
              setNestedExpandedKey={setNestedExpandedKey}
            />
          </>
        )}
      </div>
    </div>
  );
}

// Build the grid-template-columns string for the current column count.
// 1-col → single track. 2-col → ratio-controlled with an 8px divider gutter.
// 3-col → equal thirds (no divider; drag-resize only makes sense for 2-col).
function gridTemplateFor(columnCount, ratio) {
  if (columnCount === 1) return '1fr';
  if (columnCount === 3) return '1fr 1fr 1fr';
  return `${(ratio * 100).toFixed(2)}fr 8px ${((1 - ratio) * 100).toFixed(2)}fr`;
}

// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({ columnCount, ratio, gap, verticalAlign, stackOnMobile, onColumnCount, onRatio, onGap, onValign, onToggleStack }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded px-2 py-1.5">
      {/* Columns: 1 / 2 / 3 — drives layout. Ratio is only meaningful for 2. */}
      <div className="flex items-center gap-1" role="group" aria-label="Number of columns">
        <Columns2 className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-600">Columns:</span>
        {[1, 2, 3].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onColumnCount(n)}
            aria-pressed={columnCount === n}
            className={`text-xs px-2 py-0.5 rounded border ${columnCount === n
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >{n}</button>
        ))}
      </div>

      <span aria-hidden className="w-px h-5 bg-gray-200 mx-1" />

      {columnCount === 2 && (
        <>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">Ratio:</span>
            {PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => onRatio(p.value)}
                className={`text-xs px-2 py-0.5 rounded border ${Math.abs(ratio - p.value) < 0.01
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >{p.label}</button>
            ))}
            <span className="text-[11px] text-gray-400 ml-1">({Math.round(ratio * 100)} / {Math.round((1 - ratio) * 100)})</span>
          </div>

          <span aria-hidden className="w-px h-5 bg-gray-200 mx-1" />
        </>
      )}

      {/* Label disambiguates what the value actually controls:
          - 1 column → "Block spacing" (vertical gap between nested blocks)
          - 2/3 cols → "Column gap" (horizontal gap between columns).
          The data key (`gap`) is unchanged — only the human label switches,
          so previously authored blocks round-trip identically. */}
      <label
        className="text-xs text-gray-600 flex items-center gap-1"
        title={columnCount === 1
          ? 'Vertical space between blocks inside the column'
          : 'Horizontal space between columns'}
      >
        {columnCount === 1 ? 'Block spacing' : 'Column gap'}
        <input
          type="number" min={0} max={96} value={gap}
          onChange={(e) => onGap(clamp(Number(e.target.value) || 0, 0, 96))}
          className="w-14 border border-gray-200 rounded px-1.5 py-0.5 text-xs"
        />
        px
      </label>

      <span aria-hidden className="w-px h-5 bg-gray-200 mx-1" />

      <div className="flex items-center gap-0.5" role="group" aria-label="Vertical alignment">
        <ValignBtn active={verticalAlign === 'top'}    onClick={() => onValign('top')}    label="Align top">    <AlignStartVertical  className="w-3.5 h-3.5" /></ValignBtn>
        <ValignBtn active={verticalAlign === 'center'} onClick={() => onValign('center')} label="Align middle"><AlignCenterVertical className="w-3.5 h-3.5" /></ValignBtn>
        <ValignBtn active={verticalAlign === 'bottom'} onClick={() => onValign('bottom')} label="Align bottom"><AlignEndVertical    className="w-3.5 h-3.5" /></ValignBtn>
      </div>

      <span aria-hidden className="w-px h-5 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={onToggleStack}
        className={`text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded border ${stackOnMobile
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        title="When on, columns stack vertically below 768px"
      >
        <Smartphone className="w-3.5 h-3.5" />
        {stackOnMobile ? 'Mobile: stacked' : 'Mobile: side-by-side'}
      </button>
    </div>
  );
}

function ValignBtn({ children, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`h-7 w-7 inline-flex items-center justify-center rounded ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
    >{children}</button>
  );
}

function Divider({ onMouseDown, onTouchStart, dragging }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize columns — drag"
      data-tc-divider=""
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`group flex items-center justify-center cursor-col-resize select-none rounded ${dragging ? 'bg-indigo-200' : 'bg-gray-100 hover:bg-indigo-100'}`}
      style={{ alignSelf: 'stretch', minHeight: 60 }}
    >
      <GripVertical className={`w-3 h-3 ${dragging ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-600'}`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Column({ title, side, blocks, onChange, renderChild, nestedExpandedKey, setNestedExpandedKey, blockSpacing = 8 }) {
  const [adderOpen, setAdderOpen] = useState(false);

  const updateAt = (idx, nextData) => {
    const next = [...blocks];
    next[idx] = { ...next[idx], data: nextData };
    onChange(next);
  };
  const insertAt = (idx, type) => {
    const next = [...blocks];
    next.splice(idx, 0, createBlock(type));
    onChange(next);
    setAdderOpen(false);
  };
  const removeAt = (idx) => {
    const next = blocks.filter((_, i) => i !== idx);
    onChange(next);
  };
  const duplicateAt = (idx) => {
    const next = [...blocks];
    const cloned = createBlock(blocks[idx].type, JSON.parse(JSON.stringify(blocks[idx].data || {})));
    next.splice(idx + 1, 0, cloned);
    onChange(next);
  };
  const moveBy = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div
      className="border border-dashed border-gray-200 rounded p-1 min-w-0"
      aria-label={`${title} column`}
      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%' }}
    >
      {blocks.length === 0 && (
        <div className="py-4 text-center space-y-2">
          <div className="text-xs text-gray-400 italic">{title} column — empty</div>
          <div className="flex flex-wrap gap-1 justify-center">
            <QuickAddBtn onClick={() => insertAt(0, 'paragraph')}>+ Text</QuickAddBtn>
            <QuickAddBtn onClick={() => insertAt(0, 'heading-2')}>+ Heading</QuickAddBtn>
            <QuickAddBtn onClick={() => insertAt(0, 'bullet-list')}>+ List</QuickAddBtn>
            <QuickAddBtn onClick={() => insertAt(0, 'image')}>+ Image</QuickAddBtn>
          </div>
        </div>
      )}

      {/* Vertical gap between nested blocks is driven by the `Gap` / `Block
          spacing` toolbar value. For 2-/3-column layouts this is purely
          visual breathing room inside the column; for 1-column it's the
          ONLY thing the value controls (no second column → no column gap),
          so it must actually apply here in the editor too — otherwise
          editing a 1-col block with gap=24 shows zero spacing but the
          serialized HTML uses 24px and the preview disagrees with the
          editor. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${blockSpacing}px` }}>
        {blocks.map((child, idx) => (
          <ChildWrapper
            key={child.id}
            onMoveUp={() => moveBy(idx, -1)}
            onMoveDown={() => moveBy(idx, +1)}
            onDuplicate={() => duplicateAt(idx)}
            onDelete={() => removeAt(idx)}
            disableUp={idx === 0}
            disableDown={idx === blocks.length - 1}
            label={child.type}
          >
            {/* Each nested child gets its OWN Edit/Done accordion driven by
                a SHARED key owned by TwoColumnsBlock. Only one child across
                both columns can be expanded at any time — opening this one
                automatically collapses any other (including one in the
                other column) because `expanded` is computed as
                (nestedExpandedKey === key). Done toggles it back to null;
                Escape clears it. Ephemeral — never serialised. */}
            {(() => {
              const key = `${side}:${child.id}`;
              const expanded = nestedExpandedKey === key;
              return (
                <NestedAccordion
                  label={blockTypeLabel(child.type)}
                  expanded={expanded}
                  onToggle={() => setNestedExpandedKey(expanded ? null : key)}
                >
                  {renderChild
                    ? renderChild(child, (nextData) => updateAt(idx, nextData))
                    : <div className="text-xs text-red-500">Child renderer missing</div>}
                </NestedAccordion>
              );
            })()}
          </ChildWrapper>
        ))}
      </div>

      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => setAdderOpen(o => !o)}
          className="text-xs inline-flex items-center gap-1 text-indigo-600 hover:underline"
        >
          <Plus className="w-3 h-3" /> Add block
        </button>
        {adderOpen && (
          <BlockPicker
            onPick={(type) => insertAt(blocks.length, type)}
            onClose={() => setAdderOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function ChildWrapper({ children, label, onMoveUp, onMoveDown, onDuplicate, onDelete, disableUp, disableDown }) {
  return (
    <div className="group relative border border-transparent hover:border-gray-200 rounded p-1.5 transition">
      <div className="absolute -top-2 right-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 bg-white border border-gray-200 rounded shadow-sm px-1 py-0.5 z-10">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1">{label}</span>
        <MiniBtn onClick={onMoveUp} disabled={disableUp} label="Move up"><ArrowUp className="w-3 h-3" /></MiniBtn>
        <MiniBtn onClick={onMoveDown} disabled={disableDown} label="Move down"><ArrowDown className="w-3 h-3" /></MiniBtn>
        <MiniBtn onClick={onDuplicate} label="Duplicate"><Copy className="w-3 h-3" /></MiniBtn>
        <MiniBtn onClick={onDelete} label="Delete" danger><Trash2 className="w-3 h-3" /></MiniBtn>
      </div>
      {children}
    </div>
  );
}

function QuickAddBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] px-2 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition"
    >
      {children}
    </button>
  );
}

function MiniBtn({ children, onClick, label, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`h-5 w-5 inline-flex items-center justify-center rounded ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'} disabled:opacity-30`}
    >{children}</button>
  );
}

// LayoutSettingsDisclosure
// ------------------------
// Independent disclosure for the ratio / gap / alignment / mobile-stack
// controls. Crucially it does NOT read BlockExpandedContext — its open
// state is decoupled from the outer block's Edit/Done toggle so a tutor
// can leave Edit mode and still keep layout settings open (or vice versa).
// Ephemeral only — never serialised.
function LayoutSettingsDisclosure({ children, label = 'Layout settings' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-indigo-100 bg-indigo-50/40">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-left rounded-md hover:bg-indigo-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-indigo-700 font-semibold">
          <Settings2 className="w-3 h-3" /> {label}
        </span>
        {open ? <ChevronUp className="w-3 h-3 text-indigo-700" /> : <ChevronDown className="w-3 h-3 text-indigo-700" />}
      </button>
      {open && <div className="px-2 pb-2 pt-1">{children}</div>}
    </div>
  );
}

// NestedAccordion
// ---------------
// CONTROLLED. `expanded` and `onToggle` are supplied by TwoColumnsBlock so
// a single shared `nestedExpandedKey` decides which child (across BOTH
// columns) is currently expanded — exclusivity is enforced at the
// container, not here. We still override BlockExpandedContext locally so
// the child renderer reacts to *this* toggle, not the outer container's
// Edit state. Ephemeral — never serialised.
function NestedAccordion({ children, label, expanded, onToggle }) {
  return (
    <div className="border border-transparent hover:border-indigo-100 rounded">
      <div className="flex items-center justify-between gap-1 px-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold select-none">
          {label}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? `Done editing nested ${label}` : `Edit nested ${label}`}
          className={`inline-flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            expanded
              ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {expanded ? <><Check className="w-2.5 h-2.5" /> Done</> : <><Pencil className="w-2.5 h-2.5" /> Edit</>}
        </button>
      </div>
      <div className="px-1.5 pb-1.5 pt-1">
        <BlockExpandedContext.Provider value={expanded}>
          {children}
        </BlockExpandedContext.Provider>
      </div>
    </div>
  );
}

// Compact picker — flat list grouped by category. Nested two-columns is
// disallowed to keep the data shape sane.
function BlockPicker({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-20 mt-1 left-0 bg-white border border-gray-200 rounded shadow-lg p-2 w-64 max-h-72 overflow-y-auto">
      {BLOCK_GROUPS.map(group => (
        <div key={group.label} className="mb-2 last:mb-0">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 px-1 mb-1">{group.label}</p>
          <div className="grid grid-cols-2 gap-1">
            {group.items
              .filter(item => item.type !== 'two-columns')
              .map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onPick(item.type)}
                    className="flex items-center gap-1.5 px-1.5 py-1 text-xs text-gray-700 rounded hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}