import React, { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Tesseract from 'tesseract.js';
import { 
  Plus, Trash2, Image as ImageIcon, 
  LayoutTemplate, ChevronLeft, ChevronRight,
  MonitorPlay, Save, PanelLeftClose, PanelLeftOpen, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SlideWorkspace({ initialSlides = [], onChange }) {
  const [slides, setSlides] = useState(initialSlides.length > 0 ? initialSlides : [
    { id: 1, title: 'New Presentation', content: '<p>Start typing here...</p>', imageUrl: null, speakerNotes: '', order: 1 }
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [textEditorCollapsed, setTextEditorCollapsed] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessonMode, setLessonMode] = useState('new');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('modern');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [imageProvider, setImageProvider] = useState('base44');
  const [imageAspectRatio, setImageAspectRatio] = useState('16:9');
  const [regenerating, setRegenerating] = useState(false);
  const [showOCREditor, setShowOCREditor] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [extractingOCR, setExtractingOCR] = useState(false);
  const activeSlide = slides[currentSlideIndex];

  const themes = {
    modern: {
      name: 'Modern',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bg: 'bg-white',
      text: 'text-slate-800',
      accent: 'text-indigo-600'
    },
    dark: {
      name: 'Dark',
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      bg: 'bg-slate-900',
      text: 'text-slate-100',
      accent: 'text-cyan-400'
    },
    ocean: {
      name: 'Ocean',
      gradient: 'from-blue-400 via-teal-500 to-cyan-600',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    sunset: {
      name: 'Sunset',
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      bg: 'bg-gradient-to-br from-orange-50 to-pink-50',
      text: 'text-orange-900',
      accent: 'text-orange-600'
    },
    forest: {
      name: 'Forest',
      gradient: 'from-green-500 via-emerald-600 to-teal-700',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      text: 'text-green-900',
      accent: 'text-green-600'
    },
    minimal: {
      name: 'Minimal',
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'text-gray-700'
    }
  };

  const currentTheme = themes[theme];

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-lesson'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons-for-course', selectedCourse],
    queryFn: () => base44.entities.Lesson.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse,
  });

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
      speakerNotes: '',
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

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Template.create({
        name: templateName,
        description: 'AI Generated Presentation',
        category: 'slide',
        content: { slides },
        is_public: false,
        tags: ['ai-generated']
      });
      toast.success('Saved as template!');
      setShowSaveTemplate(false);
      setTemplateName('');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const addToCourse = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (lessonMode === 'new' && !newLessonTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (lessonMode === 'replace' && !selectedLesson) {
      toast.error('Please select a lesson to replace');
      return;
    }

    setSaving(true);
    try {
      if (lessonMode === 'new') {
        const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order || 0), 0);
        await base44.entities.Lesson.create({
          course_id: selectedCourse,
          title: newLessonTitle,
          content_type: 'richtext',
          slides: slides,
          order: maxOrder + 1,
        });
        toast.success('Lesson created successfully!');
      } else {
        await base44.entities.Lesson.update(selectedLesson, {
          slides: slides,
        });
        toast.success('Lesson updated successfully!');
      }
      setShowAddDialog(false);
      setSelectedCourse('');
      setSelectedLesson('');
      setNewLessonTitle('');
    } catch (error) {
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
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

  const regenerateImage = async () => {
    if (!imageEditPrompt.trim()) {
      toast.error('Please enter an image description');
      return;
    }

    setRegenerating(true);
    try {
      const enhancedPrompt = `Educational diagram, flat vector style, white background: ${imageEditPrompt}`;
      const dalleSize = imageAspectRatio === '1:1' ? '1024x1024' : '1792x1024';
      
      let imageResult;
      if (imageProvider === 'base44') {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt
        });
        imageResult = { data: { url: result.url } };
      } else if (imageProvider === 'dalle') {
        imageResult = await base44.functions.invoke('generateImageWithDallE', {
          prompt: enhancedPrompt,
          size: dalleSize
        });
      } else if (imageProvider === 'stability') {
        imageResult = await base44.functions.invoke('generateImageWithStability', {
          prompt: enhancedPrompt,
          aspect_ratio: imageAspectRatio
        });
      } else {
        imageResult = await base44.functions.invoke('generateImageWithManus', {
          prompt: enhancedPrompt,
          aspect_ratio: imageAspectRatio
        });
      }

      const imageUrl = imageResult.data?.url || imageResult?.url || imageResult?.response?.url;
      
      if (imageUrl) {
        updateSlide('imageUrl', imageUrl);
        toast.success('Image regenerated!');
        setShowImageEditor(false);
        setImageEditPrompt('');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      toast.error('Failed to regenerate image: ' + error.message);
    } finally {
      setRegenerating(false);
    }
  };

  const extractTextFromImage = async () => {
    if (!activeSlide.imageUrl) {
      toast.error('No image to extract text from');
      return;
    }

    setExtractingOCR(true);
    try {
      toast.info('Extracting text from image...');
      
      const result = await Tesseract.recognize(
        activeSlide.imageUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      setOcrText(result.data.text);
      setShowOCREditor(true);
      toast.success('Text extracted successfully!');
    } catch (error) {
      toast.error('Failed to extract text: ' + error.message);
    } finally {
      setExtractingOCR(false);
    }
  };

  const regenerateImageWithText = async () => {
    if (!ocrText.trim()) {
      toast.error('Please enter text for the image');
      return;
    }

    setRegenerating(true);
    try {
      const enhancedPrompt = `Educational diagram with text overlay. Text content: "${ocrText}". Style: clean, professional, educational diagram with clear typography`;
      const dalleSize = imageAspectRatio === '1:1' ? '1024x1024' : '1792x1024';
      
      let imageResult;
      if (imageProvider === 'base44') {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt
        });
        imageResult = { data: { url: result.url } };
      } else if (imageProvider === 'dalle') {
        imageResult = await base44.functions.invoke('generateImageWithDallE', {
          prompt: enhancedPrompt,
          size: dalleSize
        });
      } else if (imageProvider === 'stability') {
        imageResult = await base44.functions.invoke('generateImageWithStability', {
          prompt: enhancedPrompt,
          aspect_ratio: imageAspectRatio
        });
      } else {
        imageResult = await base44.functions.invoke('generateImageWithManus', {
          prompt: enhancedPrompt,
          aspect_ratio: imageAspectRatio
        });
      }

      const imageUrl = imageResult.data?.url || imageResult?.url || imageResult?.response?.url;
      
      if (imageUrl) {
        updateSlide('imageUrl', imageUrl);
        toast.success('Image regenerated with new text!');
        setShowOCREditor(false);
        setOcrText('');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      toast.error('Failed to regenerate image: ' + error.message);
    } finally {
      setRegenerating(false);
    }
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
             <Select value={theme} onValueChange={setTheme}>
               <SelectTrigger className="w-32">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {Object.entries(themes).map(([key, t]) => (
                   <SelectItem key={key} value={key}>{t.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => setShowSaveTemplate(true)}
             >
               <Save className="w-4 h-4 mr-2" />
               Save Template
             </Button>
             <Button 
               variant="outline" 
               size="sm"
               onClick={() => setShowAddDialog(true)}
             >
               <BookOpen className="w-4 h-4 mr-2" />
               Add to Course
             </Button>
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
            className={`w-full max-w-5xl aspect-video ${currentTheme.bg} rounded-xl shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300`}
            style={{ minHeight: '500px' }}
          >
            
            {/* Slide Header Decoration */}
            <div className={`h-2 w-full bg-gradient-to-r ${currentTheme.gradient} flex-shrink-0`} />

            <div className="flex-1 flex flex-col p-8 gap-4 h-full overflow-y-auto">
              
              {/* Slide Title Input */}
              <Input
                value={activeSlide.title}
                onChange={(e) => updateSlide('title', e.target.value)}
                className={`text-4xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:opacity-30 ${currentTheme.text} tracking-tight`}
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
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setShowImageEditor(true);
                              setImageEditPrompt('');
                            }}
                          >
                            AI Regenerate
                          </Button>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={extractTextFromImage}
                            disabled={extractingOCR}
                          >
                            {extractingOCR ? 'Extracting...' : 'OCR Edit'}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={handleImageUpload}
                          >
                            Upload
                          </Button>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const url = window.prompt("Enter image URL");
                              if(url) updateSlide('imageUrl', url);
                            }}
                          >
                            URL
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => updateSlide('imageUrl', null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50">
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                      <span className="font-medium mb-2">Add Image</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setShowImageEditor(true)}
                        >
                          AI Generate
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleImageUpload}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Speaker Notes Section */}
              {activeSlide.speakerNotes && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-2"
                  >
                    <span>📝 Speaker Notes</span>
                    <span className="text-slate-400">{showSpeakerNotes ? '▼' : '▶'}</span>
                  </button>
                  {showSpeakerNotes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <textarea
                        value={activeSlide.speakerNotes || ''}
                        onChange={(e) => updateSlide('speakerNotes', e.target.value)}
                        className="w-full min-h-[80px] text-sm bg-white border border-amber-200 rounded p-3 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="Add speaker notes..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Footer / Slide Number */}
              <div className={`flex justify-between items-end mt-auto pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'} text-xs opacity-40 ${currentTheme.text} uppercase tracking-widest font-semibold`}>
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

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Science Presentation Template"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={saveAsTemplate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <>
                <div>
                  <Label>Mode</Label>
                  <Select value={lessonMode} onValueChange={setLessonMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Lesson</SelectItem>
                      <SelectItem value="replace">Replace Existing Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {lessonMode === 'new' ? (
                  <div>
                    <Label>Lesson Title</Label>
                    <Input
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="Enter lesson title..."
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Select Lesson to Replace</Label>
                    <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lesson..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addToCourse} disabled={saving}>
                {saving ? 'Saving...' : 'Add to Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Image Editor Dialog */}
      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Image Generation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Image Description</Label>
              <textarea
                value={imageEditPrompt}
                onChange={(e) => setImageEditPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full min-h-[100px] p-3 border rounded-lg text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-600 mb-2 block">AI Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImageProvider('base44')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'base44'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Base44 AI
                </button>
                <button
                  onClick={() => setImageProvider('dalle')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'dalle'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  DALL-E 3
                </button>
                <button
                  onClick={() => setImageProvider('manus')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'manus'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Manus
                </button>
                <button
                  onClick={() => setImageProvider('stability')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'stability'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Stability AI
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Aspect Ratio</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setImageAspectRatio('16:9')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageAspectRatio === '16:9'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  16:9
                </button>
                <button
                  onClick={() => setImageAspectRatio('1:1')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageAspectRatio === '1:1'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  1:1
                </button>
                <button
                  onClick={() => setImageAspectRatio('4:3')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageAspectRatio === '4:3'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  4:3
                </button>
                <button
                  onClick={() => setImageAspectRatio('9:16')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageAspectRatio === '9:16'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  9:16
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowImageEditor(false)}>
                Cancel
              </Button>
              <Button onClick={regenerateImage} disabled={regenerating}>
                {regenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OCR Text Editor Dialog */}
      <Dialog open={showOCREditor} onOpenChange={setShowOCREditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>OCR Text Editor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Original Image</Label>
                {activeSlide.imageUrl && (
                  <img 
                    src={activeSlide.imageUrl} 
                    alt="Original" 
                    className="w-full rounded-lg border"
                  />
                )}
              </div>
              <div>
                <Label className="mb-2 block">Extracted & Editable Text</Label>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder="Edit the extracted text here..."
                  className="w-full h-[300px] p-3 border rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Edit the text and click regenerate to create a new image with your changes
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-600 mb-2 block">AI Provider for Regeneration</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setImageProvider('base44')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'base44'
                      ? 'border-indigo-600 bg-indigo-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Base44 AI
                </button>
                <button
                  onClick={() => setImageProvider('dalle')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'dalle'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  DALL-E 3
                </button>
                <button
                  onClick={() => setImageProvider('manus')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'manus'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Manus
                </button>
                <button
                  onClick={() => setImageProvider('stability')}
                  disabled={regenerating}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    imageProvider === 'stability'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Stability AI
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button 
                variant="outline" 
                onClick={extractTextFromImage}
                disabled={extractingOCR}
              >
                {extractingOCR ? 'Re-extracting...' : 'Re-extract Text'}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowOCREditor(false)}>
                  Cancel
                </Button>
                <Button onClick={regenerateImageWithText} disabled={regenerating}>
                  {regenerating ? 'Regenerating...' : 'Regenerate Image'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}