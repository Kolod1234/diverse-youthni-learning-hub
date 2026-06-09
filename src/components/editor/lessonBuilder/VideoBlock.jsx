import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Upload, Video as VideoIcon, AlignLeft, AlignCenter, AlignRight, Maximize2,
  RotateCcw, Image as ImageIcon,
} from 'lucide-react';
import BlockSettingsPanel from './BlockSettingsPanel';
import { useBlockExpanded } from './BlockSettingsPanel';

// Video block.
//
// Accepts YouTube, Vimeo, direct MP4 URLs, or uploaded files. Renders as a
// native <video> for uploads/MP4 and as a safe sandboxed iframe for YouTube
// / Vimeo embeds (we ONLY ever inject the resolved embed URL, never the raw
// user input, and we restrict iframe attributes to a known-safe list).
//
// Data shape:
//   {
//     url:      string,                  // original URL (yt watch, vimeo page, mp4, uploaded)
//     caption:  string,
//     poster:   string,                  // poster image URL (uploads/mp4 only)
//     ratio:    '16:9'|'4:3'|'1:1'|'9:16',
//     align:    'left' | 'center' | 'right' | 'full',
//     widthUnit:'percent' | 'px',
//     width:    number,
//   }

const RATIOS = {
  '16:9': 16 / 9,
  '4:3':  4 / 3,
  '1:1':  1,
  '9:16': 9 / 16,
};

const DEFAULTS = {
  ratio: '16:9',
  align: 'center',
  widthUnit: 'percent',
  width: 100,
};

// Resolve a user-supplied URL to a safe embed URL (or null if direct/native).
function resolveEmbed(url) {
  if (!url) return { kind: 'empty' };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  // direct mp4/webm/ogg or uploaded file → native player
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || /\/storage\//i.test(url)) {
    return { kind: 'native', src: url };
  }
  // unknown provider — refuse to embed arbitrary URLs
  return { kind: 'unknown' };
}

export default function VideoBlock({ data, onChange }) {
  const merged = { ...DEFAULTS, ...(data || {}) };
  const { url, caption, poster, ratio, align, widthUnit, width } = merged;
  const update = (patch) => onChange({ ...merged, ...patch });
  const expanded = useBlockExpanded();

  const upload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ url: file_url });
    } catch {
      toast.error('Failed to upload video');
    }
  };

  const uploadPoster = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ poster: file_url });
    } catch {
      toast.error('Failed to upload poster image');
    }
  };

  const resolved = resolveEmbed(url);
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const figureWidth =
    align === 'full' ? '100%' :
    widthUnit === 'percent' ? `${width}%` : `${width}px`;

  return (
    <div>
      {/* URL + upload row — shown when there's no video yet (so the user can
          add one) OR when the block is expanded (advanced editing). Hidden
          on the lesson canvas in the default collapsed state once a video
          is set, keeping the preview clean. */}
      {(!url || expanded) && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <input
            value={url || ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="Paste a YouTube / Vimeo / MP4 URL, or upload"
            className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded px-3 py-1.5"
          />
          <label className="text-xs text-indigo-600 cursor-pointer hover:underline inline-flex items-center gap-1">
            <Upload className="w-3 h-3" /> Upload video
            <input type="file" accept="video/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
      )}

      {/* Player */}
      {url ? (
        <div style={{ display: 'flex', justifyContent: justify }}>
          <figure
            style={{ width: figureWidth, maxWidth: '100%', margin: 0 }}
          >
            <Player resolved={resolved} ratio={ratio} poster={poster} title={caption || 'Lesson video'} />
            {caption && (
              <figcaption className="mt-2 text-center text-xs text-gray-600 italic">
                {caption}
              </figcaption>
            )}
          </figure>
        </div>
      ) : (
        <EmptyVideoState onFile={upload} />
      )}

      {resolved.kind === 'unknown' && url && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          ⚠ This URL isn't a supported provider (YouTube / Vimeo / MP4). Embed has been disabled for safety.
        </p>
      )}

      <BlockSettingsPanel label="Video settings">
        <Controls
          merged={merged}
          update={update}
          uploadPoster={uploadPoster}
        />
      </BlockSettingsPanel>
    </div>
  );
}

function Player({ resolved, ratio, poster, title }) {
  const ratioValue = RATIOS[ratio] || RATIOS['16:9'];
  const paddingBottom = `${(1 / ratioValue) * 100}%`;

  if (resolved.kind === 'iframe') {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden shadow-sm" style={{ paddingBottom }}>
        <iframe
          src={resolved.src}
          title={title}
          className="absolute inset-0 w-full h-full"
          // Tight allow-list — no microphone / camera / payment APIs.
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    );
  }
  if (resolved.kind === 'native') {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden shadow-sm" style={{ paddingBottom }}>
        <video
          src={resolved.src}
          poster={poster || undefined}
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  return (
    <div
      className="relative bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs"
      style={{ paddingBottom }}
    >
      <span className="absolute">No preview available</span>
    </div>
  );
}

function EmptyVideoState({ onFile }) {
  const [over, setOver] = useState(false);
  return (
    <label
      className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        over ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'
      }`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
    >
      <VideoIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm font-medium text-gray-700">Click to upload video, or drag & drop</p>
      <p className="text-xs text-gray-500 mt-1">Or paste a YouTube / Vimeo / MP4 URL above</p>
      <input type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );
}

function Controls({ merged, update, uploadPoster }) {
  const { caption, poster, ratio, align, widthUnit, width } = merged;

  return (
    <div className="mt-2 space-y-2">
      <input
        value={caption || ''}
        onChange={(e) => update({ caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full text-xs border border-gray-200 rounded px-2 py-1"
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={poster || ''}
          onChange={(e) => update({ poster: e.target.value })}
          placeholder="Poster image URL (shown before play)"
          className="flex-1 min-w-[180px] text-xs border border-gray-200 rounded px-2 py-1"
        />
        <label className="text-xs text-indigo-600 cursor-pointer hover:underline inline-flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Upload poster
          <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPoster(e.target.files?.[0])} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Alignment */}
        <div className="flex border border-gray-200 rounded" role="group" aria-label="Video alignment">
          <CtrlBtn active={align === 'left'}   onClick={() => update({ align: 'left' })}   label="Align left"><AlignLeft className="w-3.5 h-3.5" /></CtrlBtn>
          <CtrlBtn active={align === 'center'} onClick={() => update({ align: 'center' })} label="Align centre"><AlignCenter className="w-3.5 h-3.5" /></CtrlBtn>
          <CtrlBtn active={align === 'right'}  onClick={() => update({ align: 'right' })}  label="Align right"><AlignRight className="w-3.5 h-3.5" /></CtrlBtn>
          <CtrlBtn active={align === 'full'}   onClick={() => update({ align: 'full' })}   label="Full width"><Maximize2 className="w-3.5 h-3.5" /></CtrlBtn>
        </div>

        {/* Aspect ratio */}
        <label className="text-xs text-gray-600 inline-flex items-center gap-1">
          Ratio
          <select
            value={ratio}
            onChange={(e) => update({ ratio: e.target.value })}
            className="text-xs border border-gray-200 rounded px-1.5 py-1"
          >
            {Object.keys(RATIOS).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>

        {/* Reset */}
        <button
          type="button"
          onClick={() => update({ align: 'center', widthUnit: 'percent', width: 100, ratio: '16:9' })}
          title="Reset video size & alignment"
          className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Width */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-600">Width</label>
        <input
          type="range"
          min={widthUnit === 'percent' ? 20 : 200}
          max={widthUnit === 'percent' ? 100 : 1920}
          step={widthUnit === 'percent' ? 5 : 20}
          value={width}
          onChange={(e) => update({ width: Number(e.target.value) })}
          className="flex-1 min-w-[120px]"
          aria-label="Video width"
          disabled={align === 'full'}
        />
        <input
          type="number"
          min={widthUnit === 'percent' ? 20 : 200}
          max={widthUnit === 'percent' ? 100 : 1920}
          value={width}
          onChange={(e) => update({ width: Number(e.target.value) || 0 })}
          className="w-20 text-xs border border-gray-200 rounded px-1.5 py-1"
          disabled={align === 'full'}
        />
        <div className="flex border border-gray-200 rounded" role="group" aria-label="Width unit">
          <CtrlBtn active={widthUnit === 'percent'} onClick={() => update({ widthUnit: 'percent', width: 100 })} label="Percent">
            <span className="text-[10px] font-semibold px-0.5">%</span>
          </CtrlBtn>
          <CtrlBtn active={widthUnit === 'px'} onClick={() => update({ widthUnit: 'px', width: 800 })} label="Pixels">
            <span className="text-[10px] font-semibold px-0.5">px</span>
          </CtrlBtn>
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ children, active, onClick, label }) {
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