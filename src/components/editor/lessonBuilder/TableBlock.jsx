import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  AlignLeft, AlignCenter, AlignRight, Palette, Merge, Split,
  Bold, Eraser,
} from 'lucide-react';
import InlineEditable from './InlineEditable';

// Visual table block.
//
// Data shape (backwards-compatible — old { rows, header } still loads):
//   {
//     header: boolean,                       // whether row 0 is a <thead> row
//     caption: string,                       // optional <caption>
//     striped: boolean,
//     bordered: boolean,
//     compact: boolean,
//     rows: Cell[][]                         // 2D grid of cell objects
//   }
//
// Cell shape — every entry is the "owner" of a logical cell. Cells that are
// covered by a merge from above/left are marked `hidden: true` so they don't
// render in the DOM but their slot still occupies the grid (this is how we
// keep row/column indices stable while supporting merges).
//
//   Cell = {
//     html: string,           // contents (rich text via InlineEditable)
//     align: 'left'|'center'|'right',
//     bg:   string|null,      // background colour
//     border: boolean,        // override block-level bordered for this cell
//     bold: boolean,
//     rowspan: number,        // >= 1
//     colspan: number,        // >= 1
//     hidden: boolean,        // covered by a merge — don't render
//   }

const PALETTE = [
  null, '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#FEE2E2', '#E0E7FF', '#F3F4F6',
];

const DEFAULT_CELL = () => ({
  html: '', align: 'left', bg: null, border: false, bold: false,
  rowspan: 1, colspan: 1, hidden: false,
});

// Normalise legacy data: old format was `rows: string[][]` (just strings).
function normalise(data = {}) {
  const header   = data.header !== false;
  const caption  = data.caption || '';
  const striped  = !!data.striped;
  const bordered = data.bordered !== false; // default on for legibility
  const compact  = !!data.compact;
  const raw = Array.isArray(data.rows) && data.rows.length ? data.rows : [[''], ['']];
  // Pad ragged rows so every row has the same width.
  const width = Math.max(...raw.map(r => Array.isArray(r) ? r.length : 0), 1);
  const rows = raw.map(row => {
    const r = Array.isArray(row) ? row : [];
    const out = [];
    for (let i = 0; i < width; i++) {
      const cell = r[i];
      if (cell && typeof cell === 'object') {
        out.push({ ...DEFAULT_CELL(), ...cell });
      } else {
        out.push({ ...DEFAULT_CELL(), html: cell == null ? '' : String(cell) });
      }
    }
    return out;
  });
  return { header, caption, striped, bordered, compact, rows };
}

export default function TableBlock({ data, onChange }) {
  const norm = useMemo(() => normalise(data), [data]);
  const { header, caption, striped, bordered, compact, rows } = norm;
  const numCols = rows[0]?.length || 0;

  // selection — multi-cell allowed for merging
  const [sel, setSel] = useState([]); // [{r,c}, …]
  const inSel = (r, c) => sel.some(s => s.r === r && s.c === c);

  const update = (patch) => onChange({ ...norm, ...patch });
  const setRows = (next) => update({ rows: next });

  // ── Cell helpers ────────────────────────────────────────────────────────
  const setCell = useCallback((r, c, patch) => {
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    next[r][c] = { ...next[r][c], ...patch };
    setRows(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const patchSelection = (patch) => {
    if (!sel.length) return;
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    sel.forEach(({ r, c }) => { next[r][c] = { ...next[r][c], ...patch }; });
    setRows(next);
  };

  // ── Row operations ──────────────────────────────────────────────────────
  const addRow = (at) => {
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    next.splice(at, 0, Array.from({ length: numCols }, () => DEFAULT_CELL()));
    setRows(next);
  };
  const removeRow = (idx) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
    setSel([]);
  };
  const moveRow = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    [next[idx], next[target]] = [next[target], next[idx]];
    setRows(next);
  };

  // ── Column operations ───────────────────────────────────────────────────
  const addCol = (at) => {
    const next = rows.map(row => {
      const r = row.map(cell => ({ ...cell }));
      r.splice(at, 0, DEFAULT_CELL());
      return r;
    });
    setRows(next);
  };
  const removeCol = (idx) => {
    if (numCols <= 1) return;
    setRows(rows.map(row => row.filter((_, i) => i !== idx)));
    setSel([]);
  };
  const moveCol = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= numCols) return;
    const next = rows.map(row => {
      const r = row.map(cell => ({ ...cell }));
      [r[idx], r[target]] = [r[target], r[idx]];
      return r;
    });
    setRows(next);
  };

  // ── Merge / Unmerge ─────────────────────────────────────────────────────
  // Merge requires a rectangular contiguous selection. The top-left cell
  // becomes the owner with rowspan/colspan covering the rectangle; the rest
  // are marked hidden so their indices remain stable.
  const canMerge = useMemo(() => isRectSelection(sel), [sel]);
  const canUnmerge = sel.length === 1 && (() => {
    const { r, c } = sel[0];
    const cell = rows[r]?.[c];
    return cell && (cell.rowspan > 1 || cell.colspan > 1);
  })();

  const mergeSelection = () => {
    if (!canMerge) return;
    const { minR, minC, maxR, maxC } = bounds(sel);
    const next = rows.map(row => row.map(cell => ({ ...cell })));
    // Concatenate non-empty cells' html into the owner so content isn't lost.
    const combinedHtml = [];
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r === minR && c === minC) continue;
        const h = next[r][c].html;
        if (h && h.trim()) combinedHtml.push(h);
        next[r][c] = { ...next[r][c], hidden: true, rowspan: 1, colspan: 1 };
      }
    }
    next[minR][minC] = {
      ...next[minR][minC],
      hidden: false,
      rowspan: maxR - minR + 1,
      colspan: maxC - minC + 1,
      html: [next[minR][minC].html, ...combinedHtml].filter(Boolean).join(' '),
    };
    setRows(next);
    setSel([{ r: minR, c: minC }]);
  };

  const unmergeSelection = () => {
    if (!canUnmerge) return;
    const { r, c } = sel[0];
    const cell = rows[r][c];
    const next = rows.map(row => row.map(x => ({ ...x })));
    for (let rr = r; rr < r + cell.rowspan; rr++) {
      for (let cc = c; cc < c + cell.colspan; cc++) {
        next[rr][cc] = { ...next[rr][cc], hidden: false, rowspan: 1, colspan: 1 };
      }
    }
    next[r][c] = { ...next[r][c], rowspan: 1, colspan: 1, hidden: false };
    setRows(next);
  };

  const clearFormatting = () => {
    if (!sel.length) return;
    patchSelection({ align: 'left', bg: null, border: false, bold: false });
  };

  // ── Click selection ─────────────────────────────────────────────────────
  const onCellMouseDown = (r, c, e) => {
    if (e.shiftKey && sel.length) {
      const a = sel[0];
      const minR = Math.min(a.r, r), maxR = Math.max(a.r, r);
      const minC = Math.min(a.c, c), maxC = Math.max(a.c, c);
      const range = [];
      for (let rr = minR; rr <= maxR; rr++) {
        for (let cc = minC; cc <= maxC; cc++) range.push({ r: rr, c: cc });
      }
      setSel(range);
    } else {
      setSel([{ r, c }]);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <Toolbar
        norm={norm}
        update={update}
        sel={sel}
        canMerge={canMerge}
        canUnmerge={canUnmerge}
        onMerge={mergeSelection}
        onUnmerge={unmergeSelection}
        onAlign={(a) => patchSelection({ align: a })}
        onColour={(bg) => patchSelection({ bg })}
        onToggleBorder={() => patchSelection({ border: !sel.every(({r,c}) => rows[r][c].border) })}
        onToggleBold={() => patchSelection({ bold: !sel.every(({r,c}) => rows[r][c].bold) })}
        onClearFormatting={clearFormatting}
      />

      {/* Mobile-scrolling wrapper so wide tables don't blow up the layout */}
      <div className="overflow-x-auto -mx-1 px-1 rounded border border-gray-200 bg-white">
        <table
          className={`w-full text-sm ${bordered ? '' : ''}`}
          style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}
        >
          {caption && (
            <caption className="text-left text-xs text-gray-500 italic px-2 py-1">
              {caption}
            </caption>
          )}
          {rows.map((row, r) => {
            const isHeader = header && r === 0;
            const RowTag = 'tr';
            return (
              <React.Fragment key={r}>
                {isHeader ? (
                  <thead>
                    <RowTag>
                      <RowControls
                        side="left"
                        onAddBefore={() => addRow(r)}
                        onAddAfter={() => addRow(r + 1)}
                        onRemove={() => removeRow(r)}
                        onMoveUp={() => moveRow(r, -1)}
                        onMoveDown={() => moveRow(r, 1)}
                        disableUp={r === 0}
                        disableDown={r === rows.length - 1}
                      />
                      {row.map((cell, c) =>
                        cell.hidden ? null : (
                          <CellTd
                            key={c}
                            as="th"
                            scope="col"
                            cell={cell}
                            selected={inSel(r, c)}
                            bordered={bordered || cell.border}
                            compact={compact}
                            onMouseDown={(e) => onCellMouseDown(r, c, e)}
                            onChange={(v) => setCell(r, c, { html: v })}
                          />
                        ),
                      )}
                    </RowTag>
                  </thead>
                ) : (
                  <tbody>
                    {r === (header ? 1 : 0) && (
                      <tr aria-hidden="true">
                        <td />
                        {row.map((_, c) => (
                          <td key={`colctl-${c}`} className="p-0">
                            <ColControls
                              onAddBefore={() => addCol(c)}
                              onAddAfter={() => addCol(c + 1)}
                              onRemove={() => removeCol(c)}
                              onMoveLeft={() => moveCol(c, -1)}
                              onMoveRight={() => moveCol(c, 1)}
                              disableLeft={c === 0}
                              disableRight={c === numCols - 1}
                            />
                          </td>
                        ))}
                      </tr>
                    )}
                    <RowTag className={striped && r % 2 === (header ? 0 : 1) ? 'bg-gray-50/60' : ''}>
                      <RowControls
                        side="left"
                        onAddBefore={() => addRow(r)}
                        onAddAfter={() => addRow(r + 1)}
                        onRemove={() => removeRow(r)}
                        onMoveUp={() => moveRow(r, -1)}
                        onMoveDown={() => moveRow(r, 1)}
                        disableUp={r === 0}
                        disableDown={r === rows.length - 1}
                      />
                      {row.map((cell, c) =>
                        cell.hidden ? null : (
                          <CellTd
                            key={c}
                            as="td"
                            cell={cell}
                            selected={inSel(r, c)}
                            bordered={bordered || cell.border}
                            compact={compact}
                            isRowHeader={false}
                            onMouseDown={(e) => onCellMouseDown(r, c, e)}
                            onChange={(v) => setCell(r, c, { html: v })}
                          />
                        ),
                      )}
                    </RowTag>
                  </tbody>
                )}
              </React.Fragment>
            );
          })}
        </table>
      </div>

      {/* Add row at the end */}
      <button
        type="button"
        onClick={() => addRow(rows.length)}
        className="text-xs inline-flex items-center gap-1 text-indigo-600 hover:underline"
      >
        <Plus className="w-3 h-3" /> Add row
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CellTd({ as = 'td', scope, cell, selected, bordered, compact, onMouseDown, onChange }) {
  const Tag = as;
  const style = {
    border: bordered ? '1px solid #E5E7EB' : '1px solid transparent',
    background: cell.bg || undefined,
    textAlign: cell.align || 'left',
    verticalAlign: 'top',
    padding: compact ? '4px 6px' : '8px 12px',
    outline: selected ? '2px solid #6366F1' : 'none',
    outlineOffset: '-2px',
    fontWeight: cell.bold || as === 'th' ? 600 : 400,
    minWidth: 80,
  };
  return (
    <Tag
      scope={scope}
      rowSpan={cell.rowspan > 1 ? cell.rowspan : undefined}
      colSpan={cell.colspan > 1 ? cell.colspan : undefined}
      style={style}
      onMouseDown={onMouseDown}
    >
      <InlineEditable
        value={cell.html}
        onChange={onChange}
        placeholder="…"
        singleLine
        className="text-sm"
      />
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function RowControls({ onAddBefore, onAddAfter, onRemove, onMoveUp, onMoveDown, disableUp, disableDown }) {
  return (
    <td className="p-0 w-8 align-middle text-center print:hidden" aria-hidden="true">
      <div className="flex flex-col items-center gap-0.5 text-gray-400">
        <MicroBtn label="Move row up" onClick={onMoveUp} disabled={disableUp}><ArrowUp className="w-3 h-3" /></MicroBtn>
        <MicroBtn label="Insert row above" onClick={onAddBefore}><Plus className="w-3 h-3" /></MicroBtn>
        <MicroBtn label="Delete row" onClick={onRemove}><Trash2 className="w-3 h-3" /></MicroBtn>
        <MicroBtn label="Insert row below" onClick={onAddAfter}><Plus className="w-3 h-3 rotate-180" /></MicroBtn>
        <MicroBtn label="Move row down" onClick={onMoveDown} disabled={disableDown}><ArrowDown className="w-3 h-3" /></MicroBtn>
      </div>
    </td>
  );
}

function ColControls({ onAddBefore, onAddAfter, onRemove, onMoveLeft, onMoveRight, disableLeft, disableRight }) {
  return (
    <div className="flex items-center justify-center gap-0.5 py-0.5 text-gray-400 print:hidden">
      <MicroBtn label="Move column left" onClick={onMoveLeft} disabled={disableLeft}><ArrowLeft className="w-3 h-3" /></MicroBtn>
      <MicroBtn label="Insert column before" onClick={onAddBefore}><Plus className="w-3 h-3" /></MicroBtn>
      <MicroBtn label="Delete column" onClick={onRemove}><Trash2 className="w-3 h-3" /></MicroBtn>
      <MicroBtn label="Insert column after" onClick={onAddAfter}><Plus className="w-3 h-3" /></MicroBtn>
      <MicroBtn label="Move column right" onClick={onMoveRight} disabled={disableRight}><ArrowRight className="w-3 h-3" /></MicroBtn>
    </div>
  );
}

function MicroBtn({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({
  norm, update, sel,
  canMerge, canUnmerge, onMerge, onUnmerge,
  onAlign, onColour, onToggleBorder, onToggleBold, onClearFormatting,
}) {
  const { header, caption, striped, bordered, compact } = norm;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const hasSel = sel.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1.5">
      {/* Table-level toggles */}
      <label className="text-xs flex items-center gap-1 text-gray-700">
        <input type="checkbox" checked={header} onChange={(e) => update({ header: e.target.checked })} />
        Header row
      </label>
      <label className="text-xs flex items-center gap-1 text-gray-700">
        <input type="checkbox" checked={striped} onChange={(e) => update({ striped: e.target.checked })} />
        Striped
      </label>
      <label className="text-xs flex items-center gap-1 text-gray-700">
        <input type="checkbox" checked={bordered} onChange={(e) => update({ bordered: e.target.checked })} />
        Borders
      </label>
      <label className="text-xs flex items-center gap-1 text-gray-700">
        <input type="checkbox" checked={compact} onChange={(e) => update({ compact: e.target.checked })} />
        Compact
      </label>

      <input
        value={caption}
        onChange={(e) => update({ caption: e.target.value })}
        placeholder="Table caption (for accessibility)"
        className="text-xs border border-gray-200 rounded px-2 py-0.5 flex-1 min-w-[140px]"
      />

      <span aria-hidden className="inline-block w-px h-5 bg-gray-200 mx-0.5" />

      {/* Per-cell controls — only meaningful when something is selected */}
      <Group disabled={!hasSel} label="Selection: alignment">
        <ToolBtn label="Align left"   onClick={() => onAlign('left')}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn label="Align centre" onClick={() => onAlign('center')}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn label="Align right"  onClick={() => onAlign('right')}><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
      </Group>

      <Group disabled={!hasSel} label="Selection: formatting">
        <ToolBtn label="Toggle bold"   onClick={onToggleBold}><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn label="Toggle cell border" onClick={onToggleBorder}>
          <span className="w-3.5 h-3.5 border border-current rounded-sm" aria-hidden />
        </ToolBtn>
        <div className="relative">
          <ToolBtn label="Cell background colour" onClick={() => setPaletteOpen(o => !o)}>
            <Palette className="w-3.5 h-3.5" />
          </ToolBtn>
          {paletteOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded shadow p-2 flex gap-1">
              {PALETTE.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  title={c || 'No colour'}
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ background: c || 'repeating-linear-gradient(45deg,#fff,#fff 3px,#ddd 3px,#ddd 6px)' }}
                  onClick={() => { onColour(c); setPaletteOpen(false); }}
                />
              ))}
            </div>
          )}
        </div>
        <ToolBtn label="Clear cell formatting" onClick={onClearFormatting}>
          <Eraser className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>

      <Group label="Merge cells">
        <ToolBtn label="Merge selected cells" onClick={onMerge} disabled={!canMerge}>
          <Merge className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn label="Unmerge cell" onClick={onUnmerge} disabled={!canUnmerge}>
          <Split className="w-3.5 h-3.5" />
        </ToolBtn>
      </Group>
    </div>
  );
}

function Group({ children, disabled, label }) {
  return (
    <div className={`flex items-center gap-0.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`} aria-label={label} role="group">
      {children}
    </div>
  );
}

function ToolBtn({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="h-7 w-7 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function bounds(sel) {
  return {
    minR: Math.min(...sel.map(s => s.r)),
    maxR: Math.max(...sel.map(s => s.r)),
    minC: Math.min(...sel.map(s => s.c)),
    maxC: Math.max(...sel.map(s => s.c)),
  };
}

function isRectSelection(sel) {
  if (sel.length < 2) return false;
  const { minR, minC, maxR, maxC } = bounds(sel);
  const expected = (maxR - minR + 1) * (maxC - minC + 1);
  if (expected !== sel.length) return false;
  const set = new Set(sel.map(s => `${s.r}:${s.c}`));
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (!set.has(`${r}:${c}`)) return false;
    }
  }
  return true;
}