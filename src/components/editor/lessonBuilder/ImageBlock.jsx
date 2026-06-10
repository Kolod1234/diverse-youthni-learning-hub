import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Upload, AlignLeft, AlignCenter, AlignRight, Maximize2,
  Image as ImageIcon, RotateCcw, Lock, Unlock, Percent, Ruler,
  Replace,
} from 'lucide-react';
import BlockSettingsPanel from './BlockSettingsPanel';

// Self-contained image block. Data shape (backwards-compatible with the old block):
//   {
//     url, alt, caption, credit,
//     align:    'left' | 'center' | 'right' | 'full',
//     widthUnit:'percent' | 'px',
//     width:    number,            // percent: 20-100, px: 80-2000
//     aspect:   number | null,     // intrinsic ratio (w/h) for lock-on-resize
//     lockAspect: boolean,
//     fit:      'contain' | 'cover',
//   }
//
// Resize handles are real, visible elements (no absolute drag layer) so the
// block plays nicely with the @hello-pangea/dnd block reordering above.
// Keyboard-resizable: Arrow keys while a handle is focused = ±1, Shift = ±10.

const DEFAULTS = {
  align: 'center',
  widthUnit: 'percent',
  width: 100,
  lockAspect: true,
  fit: 'contain',
};

export default function ImageBlock({ data, onChange }) {
  const merged = { ...DEFAULTS, ...(data || {}) };
  const {
    url, alt, caption, credit,
    align, widthUnit, width, aspect, lockAspect, fit,
  } = merged;

  // STALE-CLOSURE FIX
  // -----------------
  // We always patch against the LATEST data, not the data captured in the
  // closure at the time a callback was created. Without this, an async
  // upload that fires `update({ url })` followed by an async `img.onload`
  // that fires `update({ aspect })` would compute the second `...merged`
  // from the pre-upload render — silently wiping the url back to ''.
  // The ref + functional patcher pattern keeps every write atomic.
  const latestRef = useRef(merged);
  latestRef.current = merged;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const update = useCallback((patch) => {
    const base = latestRef.current || {};
    onChangeRef.current?.({ ...base, ...patch });
  }, []);

  // Unique per-instance id for the (otherwise hidden) file inputs. Prevents
  // two ImageBlocks on the same slide from sharing an `id` and triggering
  // the wrong block when a label is clicked.
  const fileInputId = useId();

  // Replace-image input ref — used by the overlay button on the visible
  // image preview so the tutor can swap a template's placeholder for a
  // real upload in one click (the old UX hid this inside the settings
  // panel, which is why "add image" in templates appeared not to work).
  const replaceInputRef = useRef(null);

  // Detect intrinsic aspect ratio after URL changes so the lock can use it.
  // Declared BEFORE `upload` so the upload handler can reference it without
  // the temporal-dead-zone bug the previous ordering produced.
  const detectAspect = useCallback((src) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        update({ aspect: img.naturalWidth / img.naturalHeight });
      }
    };
    img.src = src;
  }, [update]);

  // ── Upload & URL ────────────────────────────────────────────────────────
  const upload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ url: file_url, aspect: null });
      detectAspect(file_url);
    } catch {
      toast.error('Failed to upload image');
    }
  };

  useEffect(() => {
    if (url && !aspect) detectAspect(url);
  }, [url, aspect, detectAspect]);

  // ── Resize (handles + keyboard) ─────────────────────────────────────────
  // We expose two handles on the image: right (W) and bottom-right (W+H).
  // For percent units we only resize width — height follows aspect.
  // For pixel units we resize width directly; height follows from aspect if
  // lockAspect is on.
  const wrapRef = useRef(null);
  const [drag, setDrag] = useState(null); // { startX, startY, startW, handle }

  const minWidth = widthUnit === 'percent' ? 20 : 80;
  const maxWidth = widthUnit === 'percent' ? 100 : 2000;

  const clampW = (n) => Math.max(minWidth, Math.min(maxWidth, Math.round(n)));

  const onPointerDown = (e, handle) => {
    if (!wrapRef.current) return;
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    setDrag({
      startX: e.clientX,
      startY: e.clientY,
      startW: width,
      startPx: rect.width,
      containerPx: wrapRef.current.parentElement?.getBoundingClientRect().width || rect.width,
      handle,
    });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (widthUnit === 'percent') {
      const ratio = (drag.startPx + dx) / drag.containerPx;
      update({ width: clampW(ratio * 100) });
    } else {
      update({ width: clampW(drag.startW + dx) });
    }
  };

  const onPointerUp = () => setDrag(null);

  const onHandleKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      update({ width: clampW(width + step) });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      update({ width: clampW(width - step) });
    } else if (e.key === 'Home') {
      e.preventDefault();
      update({ width: minWidth });
    } else if (e.key === 'End') {
      e.preventDefault();
      update({ width: maxWidth });
    }
  };

  // ── Layout helpers ──────────────────────────────────────────────────────
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const figureWidth =
    align === 'full'
      ? '100%'
      : widthUnit === 'percent'
        ? `${width}%`
        : `${width}px`;
  const heightStyle = aspect && widthUnit === 'px' && lockAspect
    ? { height: `${Math.round(width / aspect)}px` }
    : {};

  return (
    <div>
      {url ? (
        <div
          style={{ display: 'flex', justifyContent: justify }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <figure
            ref={wrapRef}
            style={{ width: figureWidth, maxWidth: '100%', margin: 0, position: 'relative' }}
            className={`group ${drag ? 'select-none' : ''}`}
          >
            <div
              className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200"
              style={{ ...heightStyle }}
            >
              <img
                src={url}
                alt={alt || ''}
                draggable={false}
                style={{
                  width: '100%',
                  height: heightStyle.height || 'auto',
                  objectFit: fit,
                  display: 'block',
                }}
              />

              {/* Replace-image overlay — appears on hover/focus. Lets the
                  tutor swap a placeholder image (used by templates) for
                  their own upload in one click, without having to open
                  the settings panel and find the small "Upload" link.
                  Positioned top-right so it does not overlap the bottom-
                  right resize corner. */}
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                title="Replace image"
                aria-label="Replace image"
                className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs font-medium opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <Replace className="w-3.5 h-3.5" />
                Replace
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  // Reset so picking the same file twice still triggers change.
                  e.target.value = '';
                }}
              />

              {/* Visible resize handles — always shown on hover/focus so it's
                  obvious the image can be resized without dragging from edges. */}
              <ResizeHandle
                position="right"
                onPointerDown={(e) => onPointerDown(e, 'right')}
                onKeyDown={onHandleKeyDown}
                ariaLabel="Resize width — arrow keys ±1, shift ±10"
              />
              <ResizeHandle
                position="corner"
                onPointerDown={(e) => onPointerDown(e, 'corner')}
                onKeyDown={onHandleKeyDown}
                ariaLabel="Resize image — arrow keys ±1, shift ±10"
              />
            </div>

            {caption && (
              <figcaption className="mt-2 text-center text-xs text-gray-600 italic">
                {caption}{credit ? <span className="not-italic text-gray-400"> — {credit}</span> : null}
              </figcaption>
            )}
          </figure>
        </div>
      ) : (
        <UploadDrop onFile={upload} />
      )}

      {/* Advanced controls — hidden until the block is in Edit mode. The
          image preview above remains visible at all times. */}
      <BlockSettingsPanel label="Image settings">
        <Controls
          merged={merged}
          update={update}
          onUpload={upload}
        />
      </BlockSettingsPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function UploadDrop({ onFile }) {
  // Each drop zone gets its OWN file input id — the previous shared id meant
  // a click on one drop zone could trigger the wrong block's file picker when
  // multiple ImageBlocks rendered on the same slide.
  const inputId = useId();
  const [over, setOver] = useState(false);
  return (
    <label
      htmlFor={inputId}
      className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        over ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'
      }`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
    >
      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm font-medium text-gray-700">Click to upload, or drag & drop</p>
      <p className="text-xs text-gray-500 mt-1">Or paste a URL below</p>
      <input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );
}

function ResizeHandle({ position, onPointerDown, onKeyDown, ariaLabel }) {
  // We use button elements so they are reachable by Tab + keyboard.
  const styles =
    position === 'right'
      ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-10 cursor-ew-resize'
      : 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 cursor-nwse-resize';
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={`absolute ${styles} bg-indigo-600 border-2 border-white rounded-sm shadow opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Controls({ merged, update, onUpload }) {
  const { url, alt, caption, credit, align, widthUnit, width, lockAspect, fit, aspect } = merged;
  // Per-instance file input id keeps each block's Upload control independent.
  const uploadInputId = useId();

  const setAlign = (a) => update({ align: a });
  const setFit   = (f) => update({ fit: f });

  return (
    <div className="mt-2 space-y-2">
      {/* URL + Alt */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={url || ''}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="Image URL"
          className="flex-1 min-w-[180px] text-xs border border-gray-200 rounded px-2 py-1"
        />
        <label htmlFor={uploadInputId} className="text-xs text-indigo-600 cursor-pointer hover:underline flex items-center gap-1">
          <Upload className="w-3 h-3" /> Upload
          <input id={uploadInputId} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
        </label>
      </div>
      <input
        value={alt || ''}
        onChange={(e) => update({ alt: e.target.value })}
        placeholder="Alt text (accessibility — describe the image for screen readers)"
        className="w-full text-xs border border-gray-200 rounded px-2 py-1"
      />

      {/* Caption + Credit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={caption || ''}
          onChange={(e) => update({ caption: e.target.value })}
          placeholder="Caption (optional)"
          className="text-xs border border-gray-200 rounded px-2 py-1"
        />
        <input
          value={credit || ''}
          onChange={(e) => update({ credit: e.target.value })}
          placeholder="Credit / source (optional)"
          className="text-xs border border-gray-200 rounded px-2 py-1"
        />
      </div>

      {/* Alignment + Fit */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-gray-200 rounded" role="group" aria-label="Image alignment">
          <AlignBtn active={align === 'left'}   onClick={() => setAlign('left')}   label="Align left"><AlignLeft className="w-3.5 h-3.5" /></AlignBtn>
          <AlignBtn active={align === 'center'} onClick={() => setAlign('center')} label="Align centre"><AlignCenter className="w-3.5 h-3.5" /></AlignBtn>
          <AlignBtn active={align === 'right'}  onClick={() => setAlign('right')}  label="Align right"><AlignRight className="w-3.5 h-3.5" /></AlignBtn>
          <AlignBtn active={align === 'full'}   onClick={() => setAlign('full')}   label="Full width"><Maximize2 className="w-3.5 h-3.5" /></AlignBtn>
        </div>

        <div className="flex border border-gray-200 rounded" role="group" aria-label="Image fit">
          <AlignBtn active={fit === 'contain'} onClick={() => setFit('contain')} label="Fit (contain — show whole image)">
            <span className="text-[10px] font-semibold px-0.5">Fit</span>
          </AlignBtn>
          <AlignBtn active={fit === 'cover'}   onClick={() => setFit('cover')}   label="Crop (cover — fill, may crop)">
            <span className="text-[10px] font-semibold px-0.5">Crop</span>
          </AlignBtn>
        </div>

        <button
          type="button"
          onClick={() => update({ lockAspect: !lockAspect })}
          title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
          aria-pressed={lockAspect}
          className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded border ${lockAspect ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600'}`}
        >
          {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          Aspect {aspect ? `(${aspect.toFixed(2)}:1)` : ''}
        </button>

        <button
          type="button"
          onClick={() => update({ align: 'center', widthUnit: 'percent', width: 100, fit: 'contain', lockAspect: true })}
          title="Reset image size & alignment"
          className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Width control */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Width
        </label>
        <input
          type="range"
          min={widthUnit === 'percent' ? 20 : 80}
          max={widthUnit === 'percent' ? 100 : 2000}
          step={widthUnit === 'percent' ? 5 : 10}
          value={width}
          onChange={(e) => update({ width: Number(e.target.value) })}
          className="flex-1 min-w-[120px]"
          aria-label="Image width"
          disabled={align === 'full'}
        />
        <input
          type="number"
          min={widthUnit === 'percent' ? 20 : 80}
          max={widthUnit === 'percent' ? 100 : 2000}
          value={width}
          onChange={(e) => update({ width: Number(e.target.value) || 0 })}
          className="w-20 text-xs border border-gray-200 rounded px-1.5 py-1"
          disabled={align === 'full'}
        />
        <div className="flex border border-gray-200 rounded" role="group" aria-label="Width unit">
          <AlignBtn active={widthUnit === 'percent'} onClick={() => update({ widthUnit: 'percent', width: 100 })} label="Percent">
            <Percent className="w-3 h-3" />
          </AlignBtn>
          <AlignBtn active={widthUnit === 'px'} onClick={() => update({ widthUnit: 'px', width: Math.round(800) })} label="Pixels">
            <Ruler className="w-3 h-3" />
          </AlignBtn>
        </div>
      </div>
    </div>
  );
}

function AlignBtn({ children, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`px-2 py-1 ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
}