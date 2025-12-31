import React from 'react';

export default function SlidePreview({ slide }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[500px] flex flex-col">
      {/* Image Section */}
      {slide.imageUrl && (
        <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <img 
            src={slide.imageUrl} 
            alt={slide.title}
            className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {slide.title}
        </h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: slide.content }}
          style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: '#374151'
          }}
        />
      </div>
    </div>
  );
}