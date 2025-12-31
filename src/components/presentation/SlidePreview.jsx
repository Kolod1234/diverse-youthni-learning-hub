import React from 'react';

export default function SlidePreview({ slide }) {
  return (
    <div className="w-full h-full p-12 bg-white rounded-xl shadow-lg flex flex-col min-h-[500px]">
      {/* 1. Header Area */}
      <h1 className="text-4xl font-bold text-indigo-900 mb-8">{slide.title}</h1>

      <div className="flex-1 grid grid-cols-2 gap-8 items-center">
        {/* 2. Text Area - Styled with Typography plugin or custom CSS */}
        <div 
          className="prose prose-lg text-slate-700" 
          dangerouslySetInnerHTML={{ __html: slide.content }} 
        />

        {/* 3. Image Area - Only renders if we have an image */}
        {slide.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="rounded-xl shadow-lg object-cover max-h-[400px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}