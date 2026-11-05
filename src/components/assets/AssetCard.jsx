import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

const TYPE_COLORS = {
  image: 'bg-blue-100 text-blue-700',
  canva_design: 'bg-purple-100 text-purple-700',
  illustration: 'bg-pink-100 text-pink-700',
  icon: 'bg-amber-100 text-amber-700',
  background: 'bg-emerald-100 text-emerald-700',
  logo: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function AssetCard({ asset, onInsert, onDelete, onCopyUrl, selected, canDelete }) {
  const previewUrl = asset.thumbnail_url || asset.file_url;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.file_url);
    setCopied(true);
    onCopyUrl?.(asset);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`group relative rounded-xl overflow-hidden border-2 bg-white transition-all cursor-pointer hover:shadow-lg ${
        selected ? 'border-purple-500 ring-2 ring-purple-300' : 'border-slate-200 hover:border-purple-300'
      }`}
      onClick={() => onInsert?.(asset)}
    >
      <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="w-10 h-10 text-slate-300" />
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 line-clamp-1 flex-1">{asset.name}</p>
          {asset.source === 'canva' && (
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className={`text-xs ${TYPE_COLORS[asset.asset_type] || TYPE_COLORS.other}`}>
            {asset.asset_type?.replace('_', ' ') || 'image'}
          </Badge>
          {asset.usage_count > 0 && (
            <Badge variant="outline" className="text-xs">used {asset.usage_count}x</Badge>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 bg-white/90 hover:bg-white"
          onClick={handleCopy}
          title="Copy URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        {canDelete && onDelete && (
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-white/90 hover:bg-red-50 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(asset);
            }}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}