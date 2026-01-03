import React from 'react';
import { Eye } from 'lucide-react';

export default function SlidePreviewPanel({ slide }) {
  if (!slide) return null;

  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none" key={block.id}>
            <p className="whitespace-pre-wrap">{block.content}</p>
          </div>
        );
      case 'image':
        return block.url ? (
          <img 
            key={block.id}
            src={block.url} 
            alt={block.alt || 'Image'} 
            className="w-full rounded-lg shadow-sm"
          />
        ) : null;
      case 'video':
        return block.url ? (
          <video 
            key={block.id}
            src={block.url} 
            controls 
            className="w-full rounded-lg shadow-sm"
          />
        ) : null;
      case 'code':
        return (
          <pre 
            key={block.id}
            className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"
          >
            <code>{block.content}</code>
          </pre>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-white border-l overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-2">
        <Eye className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm">Live Preview</h3>
      </div>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{slide.title}</h2>
        {slide.blocks?.length > 0 ? (
          <div className="space-y-4">
            {slide.blocks.map(renderBlock)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No content yet</p>
            <p className="text-xs mt-1">Add blocks to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
}