import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  AlignLeft, AlignCenter, AlignRight, Palette, Highlighter, X,
  Merge, Split, MoreHorizontal,
} from 'lucide-react';
import InlineEditable from './InlineEditable';

// Rich table block.
//
// Data shape (backwards-compatible with the old `{ rows: string[][] }` shape —
// migrateRows() upgrades legacy values to the new cell-object shape on read).
//
//   {
//     rows: Cell[][],
//     header: boolean,       // first row is rendered as <th> with role="columnheader"
//     stripe: boolean,       // alternating row background
//     caption: string,       // <caption> for screen readers + visible label
//   }
//
//   Cell = {
//     content: string,       // rich inline HTML (sanitised by serializer)
//     align?:  'left'|'center'|'right',
//     color?:  string,       // text colour
//     bg?:     string,       // background colour
//     border?: 'default'|'thick'|'none',
//     rowSpan?: number,      // ≥ 2 means this cell spans
//     colSpan?: number,
//     hidden?: boolean,      // covered by a merged neighbour — not rendered
//   }
//
// Merging:
//   We allow a rectangular merge from a "primary" selected cell to a second
//   click target. Cells covered by the merge get { hidden: true } and the
//   primary cell gets rowSpan / colSpan. Unmerge restores hidden=false and
//   resets the spans to 1.

const PALETTE_TEXT = ['#111827','#4F46E5','#10B981','#F59E0B','#EF4444','#0EA5E9','#6B7280',''];
const PALETTE_BG   = ['#F9FAFB','#EEF2FF','#ECFDF5','#FEF3C7','#FEE2E2','#E0F2FE','#F5F3FF',''];

const emptyCell = () => ({ content: '' });

function migrateRows(rows) {
  if (!Array.isArray(rows)) return [[emptyCell(), emptyCell()], [emptyCell(), emptyCell()]];
  return rows.map(r => (Array.isArray(r) ? r : []).map(c => {
    if (c && typeof c === 'object' && 'content' in c) return c;
    return { content: typeof c === 'string' ? c : '' };
  }));
}

export default function TableBlock({ data, onChange }) {
  const rows = migrateRows(data.rows);
  const header = data.header !== false;
  const stripe = !!data.stripe;
  const caption = data.caption || '';

  // Selected cell { r, c } for the inline cell toolbar.
  const [selected, setSelected] = useState(null);
  // Merge mode: clicking another cell after this completes the merge.
  const [mergePending, setMergePending] = useState(false);

  const update = (next) => onChange({ ...data, rows: next });
  const patchCell = (r, c, patch) => {
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    next[r][c] = { ...next[r][c], ...patch };
    update(next);
  };

  // ── Structure ops ──────────────────────────────────────────────────────
  const numCols = rows[0]?.length || 0;

  const addRow = (at = rows.length) => {
    const newRow = Array.from({ length: Math.max(1, numCols) }, emptyCell);
    const next = [...rows.slice(0, at), newRow, ...rows.slice(at)];
    update(next);
  };
  const removeRow = (at) => {
    if (rows.length <= 1) return;
    update(rows.filter((_, i) => i !== at));
  };
  const moveRow = (at, delta) => {
    const to = at + delta;
    if (to < 0 || to >= rows.length) return;
    const next = rows.map(r => [...r]);
    [next[at], next[to]] = [next[to], next[at]];
    update(next);
  };

  const addCol = (at = numCols) => {
    const next = rows.map(r => {
      const copy = [...r];
      copy.splice(at, 0, emptyCell());
      return copy;
    });
    update(next);
  };
  const removeCol = (at) => {
    if (numCols <= 1) return;
    update(rows.map(r => r.filter((_, i) => i !== at)));
  };
  const moveCol = (at, delta) => {
    const to = at + delta;
    if (to < 0 || to >= numCols) return;
    update(rows.map(r => {
      const copy = [...r];
      [copy[at], copy[to]] = [copy[to], copy[at]];
      return copy;
    }));
  };

  // ── Merge / unmerge ────────────────────────────────────────────────────
  // Merge a rectangle from (r1,c1) to (r2,c2) into the top-left cell.
  const mergeRect = (r1, c1, r2, c2) => {
    const top = Math.min(r1, r2), bot = Math.max(r1, r2);
    const lef = Math.min(c1, c2), rig = Math.max(c1, c2);
    if (top === bot && lef === rig) return;
    const next = rows.map(r => r.map(c => ({ ...c })));
    // Reject if any cell in range is already part of a different merge.
    for (let r = top; r <= bot; r++) {
      for (let c = lef; c <= rig; c++) {
        if ((next[r][c].rowSpan && next[r][c].rowSpan > 1) ||
            (next[r][c].colSpan && next[r][c].colSpan > 1) ||
            next[r][c].hidden) {
          return; // silently bail — caller can show feedback
        }
      }
    }
    next[top][lef].rowSpan = bot - top + 1;
    next[top][lef].colSpan = rig - lef + 1;
    for (let r = top; r <= bot; r++) {
      for (let c = lef; c <= rig; c++) {
        if (r === top && c === lef) continue;
        next[r][c].hidden = true;
      }
    }
    update(next);
  };

  const unmergeAt = (r, c) => {
    const cell = rows[r]?.[c];
    if (!cell) return;
    const rowSpan = cell.rowSpan || 1;
    const colSpan = cell.colSpan || 1;
    if (rowSpan === 1 && colSpan === 1) return;
    const next = rows.map(row => row.map(cc => ({ ...cc })));
    for (let rr = r; rr < r + rowSpan; rr++) {
      for (let cc = c; cc < c + colSpan; cc++) {
        const target = next[rr]?.[cc];
        if (!target) continue;
        target.hidden = false;
        target.rowSpan = 1;
        target.colSpan = 1;
      }
    }
    update(next);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const selectedCell = selected ? rows[selected.r]?.[selected.c] : null;

  return (
    <div className="space-y-2">
      <Toolbar
        rows={rows}
        header={header}
        stripe={stripe}
        caption={caption}
        selected={selected}
        selectedCell={selectedCell}
        mergePending={mergePending}
        onAddRow={() => addRow()}
        onAddCol={() => addCol()}
        onToggleHeader={() => onChange({ ...data, header: !header })}
        onToggleStripe={() => onChange({ ...data, stripe: !stripe })}
        onCaptionChange={(v) => onChange({ ...data, caption: v })}
        onPatchCell={(patch) => selected && patchCell(selected.r, selected.c, patch)}
        onStartMerge={() => setMergePending(true)}
        onCancelMerge={() => setMergePending(false)}
        onUnmerge={() => selected && unmergeAt(selected.r, selected.c)}
      />

      {/* Horizontal scroll container for mobile */}
      <div className="overflow-x-auto -mx-1 px-1" role="region" aria-label={caption || 'Editable table'}>
        <table
          className="w-full border-collapse text-sm"
          style={{ tableLayout: 'auto', minWidth: numCols > 4 ? `${numCols * 140}px` : '100%' }}
        >
          {caption && (
            <caption className="text-left text-xs text-gray-500 italic pb-1">
              {caption}
            </caption>
          )}
          <colgroup>
            {Array.from({ length: numCols }).map((_, c) => <col key={c} />)}
          </colgroup>
          <thead className="sr-only">
            {/* Visual header is rendered as the first body row to keep editing
                ergonomics consistent — the column controls live above. */}
            <tr>{Array.from({ length: numCols }).map((_, c) => <th key={c} scope="col">{`Column ${c + 1}`}</th>)}</tr>
          </thead>
          <tbody>
            {/* Column control row (not part of saved data) */}
            <tr aria-hidden="true">
              {Array.from({ length: numCols }).map((_, c) => (
                <td key={c} className="p-1 border-0">
                  <ColControl
                    index={c}
                    numCols={numCols}
                    onMoveLeft={() => moveCol(c, -1)}
                    onMoveRight={() => moveCol(c, +1)}
                    onInsertLeft={() => addCol(c)}
                    onInsertRight={() => addCol(c + 1)}
                    onRemove={() => removeCol(c)}
                  />
                </td>
              ))}
              <td className="p-1 border-0" />
            </tr>

            {rows.map((row, r) => {
              const isHeaderRow = header && r === 0;
              const rowStriped = stripe && !isHeaderRow && r % 2 === 0;
              return (
                <tr key={r} className={rowStriped ? 'bg-gray-50/60' : ''}>
                  {row.map((cell, c) => {
                    if (cell.hidden) return null;
                    const isSel = selected?.r === r && selected?.c === c;
                    const Cell = isHeaderRow ? 'th' : 'td';
                    const align = cell.align || (isHeaderRow ? 'left' : 'left');
                    const borderClass =
                      cell.border === 'thick' ? 'border-2 border-gray-400' :
                      cell.border === 'none'  ? 'border border-transparent' :
                                                'border border-gray-200';
                    return (
                      <Cell
                        key={c}
                        rowSpan={cell.rowSpan || 1}
                        colSpan={cell.colSpan || 1}
                        scope={isHeaderRow ? 'col' : undefined}
                        onClick={(e) => {
                          if (mergePending && selected && (selected.r !== r || selected.c !== c)) {
                            e.preventDefault();
                            mergeRect(selected.r, selected.c, r, c);
                            setMergePending(false);
                            return;
                          }
                          setSelected({ r, c });
                        }}
                        className={`${borderClass} p-0 align-top ${isSel ? 'outline outline-2 outline-indigo-400 outline-offset-[-2px]' : ''} ${mergePending && !isSel ? 'cursor-crosshair' : ''}`}
                        style={{
                          backgroundColor: cell.bg || (isHeaderRow ? '#F3F4F6' : undefined),
                          color: cell.color || undefined,
                          fontWeight: isHeaderRow ? 600 : undefined,
                          textAlign: align,
                          verticalAlign: 'top',
                        }}
                      >
                        <div className="px-3 py-2 min-h-[36px]">
                          <InlineEditable
                            value={cell.content || ''}
                            onChange={(v) => patchCell(r, c, { content: v })}
                            placeholder={isHeaderRow ? 'Header' : '…'}
                            singleLine
                            className="text-sm outline-none"
                            ariaLabel={`Row ${r + 1} column ${c + 1}`}
                          />
                        </div>
                      </Cell>
                    );
                  })}
                  <td className="p-1 border-0 w-10">
                    <RowControl
                      index={r}
                      numRows={rows.length}
                      onMoveUp={() => moveRow(r, -1)}
                      onMoveDown={() => moveRow(r, +1)}
                      onInsertAbove={() => addRow(r)}
                      onInsertBelow={() => addRow(r + 1)}
                      onRemove={() => removeRow(r)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Toolbar({
  rows, header, stripe, caption, selected, selectedCell, mergePending,
  onAddRow, onAddCol, onToggleHeader, onToggleStripe, onCaptionChange,
  onPatchCell, onStartMerge, onCancelMerge, onUnmerge,
}) {
  const canUnmerge = selectedCell && ((selectedCell.rowSpan || 1) > 1 || (selectedCell.colSpan || 1) > 1);
  return (
    <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
      <BtnGroup>
        <Btn onClick={onAddRow} title="Add row"><Plus className="w-3 h-3" /> Row</Btn>
        <Btn onClick={onAddCol} title="Add column"><Plus className="w-3 h-3" /> Column</Btn>
      </BtnGroup>

      <BtnGroup>
        <Toggle active={header} onClick={onToggleHeader} title="Treat first row as header">
          Header row
        </Toggle>
        <Toggle active={stripe} onClick={onToggleStripe} title="Stripe alternating rows">
          Stripes
        </Toggle>
      </BtnGroup>

      <input
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Caption (optional, helps screen readers)"
        className="text-xs border border-gray-200 rounded px-2 py-1 flex-1 min-w-[160px]"
        aria-label="Table caption"
      />

      {/* Selected cell controls */}
      {selected && selectedCell && !selectedCell.hidden && (
        <>
          <span className="text-[10px] text-gray-400 px-1">Cell {selected.r + 1},{selected.c + 1}</span>
          <BtnGroup>
            <IconToggle active={selectedCell.align === 'left'}   onClick={() => onPatchCell({ align: 'left' })} title="Align left"><AlignLeft className="w-3 h-3" /></IconToggle>
            <IconToggle active={selectedCell.align === 'center'} onClick={() => onPatchCell({ align: 'center' })} title="Align centre"><AlignCenter className="w-3 h-3" /></IconToggle>
            <IconToggle active={selectedCell.align === 'right'}  onClick={() => onPatchCell({ align: 'right' })} title="Align right"><AlignRight className="w-3 h-3" /></IconToggle>
          </BtnGroup>

          <ColourPick icon={<Palette className="w-3 h-3" />} title="Text colour" colours={PALETTE_TEXT} onPick={(c) => onPatchCell({ color: c || undefined })} />
          <ColourPick icon={<Highlighter className="w-3 h-3" />} title="Cell background" colours={PALETTE_BG} onPick={(c) => onPatchCell({ bg: c || undefined })} />

          <select
            value={selectedCell.border || 'default'}
            onChange={(e) => onPatchCell({ border: e.target.value })}
            className="text-xs border border-gray-200 rounded px-1.5 py-1"
            aria-label="Cell border"
          >
            <option value="default">Border: default</option>
            <option value="thick">Border: thick</option>
            <option value="none">Border: none</option>
          </select>

          {canUnmerge ? (
            <Btn onClick={onUnmerge} title="Unmerge this cell"><Split className="w-3 h-3" /> Unmerge</Btn>
          ) : mergePending ? (
            <Btn onClick={onCancelMerge} title="Cancel merge" tone="amber">
              <X className="w-3 h-3" /> Cancel merge
            </Btn>
          ) : (
            <Btn onClick={onStartMerge} title="Merge with another cell (click to pick)">
              <Merge className="w-3 h-3" /> Merge…
            </Btn>
          )}
        </>
      )}
    </div>
  );
}

function RowControl({ index, numRows, onMoveUp, onMoveDown, onInsertAbove, onInsertBelow, onRemove }) {
  return (
    <PopMenu
      ariaLabel={`Row ${index + 1} actions`}
      items={[
        { icon: ChevronUp,   label: 'Move up',       onClick: onMoveUp,    disabled: index === 0 },
        { icon: ChevronDown, label: 'Move down',     onClick: onMoveDown,  disabled: index === numRows - 1 },
        { icon: Plus,        label: 'Insert above',  onClick: onInsertAbove },
        { icon: Plus,        label: 'Insert below',  onClick: onInsertBelow },
        { icon: Trash2,      label: 'Delete row',    onClick: onRemove, disabled: numRows <= 1, danger: true },
      ]}
    />
  );
}

function ColControl({ index, numCols, onMoveLeft, onMoveRight, onInsertLeft, onInsertRight, onRemove }) {
  return (
    <PopMenu
      ariaLabel={`Column ${index + 1} actions`}
      items={[
        { icon: ChevronLeft,  label: 'Move left',       onClick: onMoveLeft,    disabled: index === 0 },
        { icon: ChevronRight, label: 'Move right',      onClick: onMoveRight,   disabled: index === numCols - 1 },
        { icon: Plus,         label: 'Insert left',     onClick: onInsertLeft },
        { icon: Plus,         label: 'Insert right',    onClick: onInsertRight },
        { icon: Trash2,       label: 'Delete column',   onClick: onRemove, disabled: numCols <= 1, danger: true },
      ]}
    />
  );
}

function PopMenu({ items, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={ariaLabel}
        aria-label={ariaLabel}
        className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-44">
          {items.map(({ icon: Icon, label, onClick, disabled, danger }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => { if (disabled) return; onClick(); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'} ${danger ? 'text-red-600' : 'text-gray-700'}`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColourPick({ icon, title, colours, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={title}
        aria-label={title}
        className="px-2 py-1 text-xs inline-flex items-center gap-1 border border-gray-200 rounded text-gray-600 hover:bg-white"
      >
        {icon}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-4 gap-1 w-44">
          {colours.map((c, i) => (
            <button
              key={i}
              type="button"
              aria-label={c || 'No colour'}
              onClick={() => { onPick(c); setOpen(false); }}
              className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ background: c || 'repeating-linear-gradient(45deg,#fff,#fff 3px,#ddd 3px,#ddd 6px)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BtnGroup({ children }) {
  return <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded px-1 py-0.5">{children}</div>;
}
function Btn({ children, onClick, title, tone }) {
  const colour =
    tone === 'amber' ? 'text-amber-700 hover:bg-amber-50' :
                       'text-gray-700 hover:bg-gray-50';
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title}
      className={`px-2 py-1 text-xs inline-flex items-center gap-1 rounded ${colour}`}>
      {children}
    </button>
  );
}
function Toggle({ children, active, onClick, title }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-pressed={active}
      className={`px-2 py-1 text-xs rounded ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
      {children}
    </button>
  );
}
function IconToggle({ children, active, onClick, title }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} aria-pressed={active}
      className={`px-1.5 py-1 rounded ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
      {children}
    </button>
  );
}