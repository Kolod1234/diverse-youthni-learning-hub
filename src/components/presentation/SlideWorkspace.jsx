import React, { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Trash2, Image as ImageIcon, 
  LayoutTemplate, ChevronLeft, ChevronRight,
  MonitorPlay, Save, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function SlideWorkspace({ initialSlides = [], onChange }) {
  const [slides, setSlides] = useState(initialSlides.length > 0 ? initialSlides : [
    { id: 1, title: 'New Presentation', content: '<p>Start typing here...</p>', imageUrl: null, order: 1 }
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [textEditorCollapsed, setTextEditorCollapsed] = useState(false);
  const activeSlide = slides[currentSlideIndex];

  // Sync changes to parent
  const updateSlides = (newSlides) => {
    setSlides(newSlides);
    onChange?.(newSlides);
  };

  // Update specific field of active slide
  const updateSlide = (field, value) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...activeSlide, [field]: value };
    updateSlides(newSlides);
  };

  const addNewSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: 'New Slide',
      content: '<p>Add your content here...</p>',
      imageUrl: null,
      order: slides.length + 1
    };
    updateSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    toast.success('Slide added!');
  };

  const deleteSlide = (e) => {
    e.stopPropagation();
    if (slides.length === 1) {
      toast.error('You need at least one slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    updateSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    toast.success('Slide deleted');
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      try {
        const { base44 } = await import('@/api/base44Client');
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        updateSlide('imageUrl', file_url);
        toast.success('Image uploaded!');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    };
    
    input.click();
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR - SLIDE THUMBNAILS */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
          <span>Slides ({slides.length})</span>
          <Button variant="ghost" size="icon" onClick={addNewSlide}>
            <Plus className="w-5 h-5 text-indigo-600" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id || idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`group relative rounded-lg border-2 transition-all cursor-pointer p-2 ${
                idx === currentSlideIndex 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                  : 'border-transparent bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  idx === currentSlideIndex ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1}
                </span>
                {slides.length > 1 && (
                  <button onClick={deleteSlide} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Mini Thumbnail Preview */}
              <div className="aspect-video bg-white rounded border border-slate-200 p-2 overflow-hidden text-[6px] text-slate-400 select-none">
                 <div className="font-bold text-slate-800 mb-1 truncate">{slide.title}</div>
                 <div className="line-clamp-3" dangerouslySetInnerHTML={{__html: slide.content}} />
              </div>
            </div>
          ))}
          
          <button 
            onClick={addNewSlide}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>
      </div>

      {/* 2. MAIN STAGE - EDITING AREA */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <LayoutTemplate className="w-5 h-5" />
            <span className="text-sm">Slide Editor</span>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => window.location.reload()}
             >
               Exit Editor
             </Button>
          </div>
        </header>

        {/* Canvas Area (Gray Background) */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-100">
          
          {/* THE SLIDE (16:9 Aspect Ratio Container) */}
          <div 
            className="w-full max-w-5xl aspect-video bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300"
            style={{ minHeight: '500px' }}
          >
            
            {/* Slide Header Decoration */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0" />

            <div className="flex-1 flex flex-col p-8 gap-6 h-full">
              
              {/* Slide Title Input */}
              <Input
                value={activeSlide.title}
                onChange={(e) => updateSlide('title', e.target.value)}
                className="text-4xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-300 text-slate-800 tracking-tight"
                placeholder="Click to add title"
              />

              {/* Slide Content Grid */}
              <div className={`flex-1 grid gap-8 min-h-0 transition-all duration-300 ${textEditorCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
                
                {/* LEFT COL: Rich Text Editor */}
                {!textEditorCollapsed && (
                  <div className="flex flex-col h-full bg-slate-50 rounded-lg border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden relative group">
                    <RichTextEditor 
                      value={activeSlide.content}
                      onChange={(html) => updateSlide('content', html)}
                      placeholder="Type your bullet points..."
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      <span className="text-xs bg-white px-2 py-1 rounded shadow text-slate-400 border border-slate-200">Text Editor</span>
                    </div>
                  </div>
                )}

                {/* RIGHT COL: Image / Visuals */}
                <div className="flex flex-col h-full relative">
                  {/* Toggle Button */}
                  <button
                    onClick={() => setTextEditorCollapsed(!textEditorCollapsed)}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-slate-200 rounded-full p-2 shadow-lg hover:bg-slate-50 transition-all hover:scale-110"
                    title={textEditorCollapsed ? 'Show text editor' : 'Hide text editor'}
                  >
                    {textEditorCollapsed ? (
                      <PanelLeftOpen className="w-4 h-4 text-slate-600" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  {activeSlide.imageUrl ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden group border border-slate-200 bg-slate-50">
                      <img 
                        src={activeSlide.imageUrl} 
                        alt="Slide Visual" 
                        className="w-full h-full object-contain p-4"
                      />
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            const url = window.prompt("Enter new image URL");
                            if(url) updateSlide('imageUrl', url);
                          }}
                        >
                          Change Image
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={handleImageUpload}
                        >
                          Upload New
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => updateSlide('imageUrl', null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all cursor-pointer bg-slate-50"
                         onClick={handleImageUpload}
                    >
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                      <span className="font-medium">Click to add Diagram or Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer / Slide Number */}
              <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100 text-xs text-slate-400 uppercase tracking-widest font-semibold">
                <span>Educational Content</span>
                <span>{currentSlideIndex + 1} / {slides.length}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-xl px-4 py-2 border border-slate-200">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="px-4 flex items-center text-sm font-medium text-slate-700">
            Slide {currentSlideIndex + 1} of {slides.length}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}