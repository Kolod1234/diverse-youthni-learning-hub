import React, { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import OCRImageEditor from '@/components/presentation/OCRImageEditor';
import MermaidDiagram from '@/components/presentation/MermaidDiagram';
import LabeledIllustration from '@/components/presentation/LabeledIllustration';
import MediaLibrary from '@/components/presentation/MediaLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import {
  Plus, Trash2, Image as ImageIcon,
  LayoutTemplate, ChevronLeft, ChevronRight,
  Save, PanelLeftClose, PanelLeftOpen, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mathJaxConfig = {
  loader: { load: ['input/tex', 'output/chtml'] },
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] }
};

// Cleans AI-generated content — strips markdown fences, converts <p> to <li>
const cleanContent = (html) => {
  if (!html) return '<ul><li>Content here</li></ul>';

  let clean = html
    .replace(/```html\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  if (!clean.includes('<')) {
    const lines = clean.split('\n').filter(l => l.trim());
    return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
  }

  if (!clean.includes('<ul>') && !clean.includes('<li>') && clean.includes('<p>')) {
    const matches = [...clean.matchAll(/<p[^>]*>(.*?)<\/p>/gs)];
    if (matches.length > 0) {
      return '<ul>' + matches.slice(0, 5).map(m => `<li>${m[1].trim()}</li>`).join('') + '</ul>';
    }
  }

  if (!clean.includes('<ul>') && !clean.includes('<li>')) {
    const lines = clean.replace(/<[^>]+>/g, '').split('\n').filter(l => l.trim());
    return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
  }

  return clean;
};

function SlideContent({ html, bulletColor }) {
  if (!html) return null;
  const cleaned = cleanContent(html);
  return (
    <MathJax>
      <style>{`
        .slide-content-render ul { list-style: none; padding: 0; margin: 0; }
        .slide-content-render li {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 10px; font-size: 0.95rem; line-height: 1.6;
        }
        .slide-content-render li::before {
          content: ''; display: block; width: 8px; height: 8px; min-width: 8px;
          border-radius: 50%; background-color: ${bulletColor || '#4f46e5'};
          margin-top: 7px; flex-shrink: 0;
        }
        .slide-content-render strong { font-weight: 700; }
        .slide-content-render em { font-style: italic; opacity: 0.85; }
        .slide-content-render p { margin-bottom: 8px; }
      `}</style>
      <div className="slide-content-render" dangerouslySetInnerHTML={{ __html: cleaned }} />
    </MathJax>
  );
}

export default function SlideWorkspace({ initialSlides = [], onChange }) {
  const [slides, setSlides] = useState(
    initialSlides.length > 0 ? initialSlides : [
      { id: 1, title: 'New Presentation', content: '<ul><li>Start typing here...</li></ul>', imageUrl: null, speakerNotes: '', order: 1 }
    ]
  );
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
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const activeSlide = slides[currentSlideIndex];

  const themes = {
    modern:  { name: 'Modern',  gradient: 'from-indigo-500 via-purple-500 to-pink-500',   bg: 'bg-white',         text: 'text-slate-800',  bulletColor: '#4f46e5' },
    dark:    { name: 'Dark',    gradient: 'from-slate-700 via-slate-800 to-slate-900',    bg: 'bg-slate-900',     text: 'text-slate-100',  bulletColor: '#22d3ee' },
    ocean:   { name: 'Ocean',   gradient: 'from-blue-400 via-teal-500 to-cyan-600',       bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',   text: 'text-blue-900',   bulletColor: '#0284c7' },
    sunset:  { name: 'Sunset',  gradient: 'from-orange-400 via-red-500 to-pink-600',      bg: 'bg-gradient-to-br from-orange-50 to-pink-50', text: 'text-orange-900', bulletColor: '#ea580c' },
    forest:  { name: 'Forest',  gradient: 'from-green-500 via-emerald-600 to-teal-700',   bg: 'bg-gradient-to-br from-green-50 to-emerald-50', text: 'text-green-900', bulletColor: '#16a34a' },
    minimal: { name: 'Minimal', gradient: 'from-gray-300 via-gray-400 to-gray-500',       bg: 'bg-white',         text: 'text-gray-900',   bulletColor: '#374151' },
  };
  const currentTheme = themes[theme];

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-lesson'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons-for-course', selectedCourse],
    queryFn: () => base44.entities.Lesson.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse,
  });

  const updateSlides = (newSlides) => {
    setSlides(newSlides);
    onChange?.(newSlides);
  };

  const updateSlide = (field, value) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...activeSlide, [field]: value };
    updateSlides(newSlides);
  };

  const addNewSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: 'New Slide',
      content: '<ul><li>Add your content here</li></ul>',
      imageUrl: null,
      speakerNotes: '',
      order: slides.length + 1
    };
    updateSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    toast.success('Slide added!');
  };

  const deleteSlide = async (e) => {
    e.stopPropagation();
    if (slides.length <= 1) { toast.error('Cannot delete the last slide'); return; }
    const deletedSlide = slides[currentSlideIndex];
    try {
      const analytics = await base44.entities.SlideAnalytics.filter({ slide_title: deletedSlide.title }, '-created_date', 1);
      if (analytics.length > 0) {
        await base44.entities.SlideAnalytics.update(analytics[0].id, { success_score: 0, was_kept: false });
      }
    } catch (err) { /* silent */ }
    const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
    updateSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    toast.success('Slide deleted');
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) { toast.error('Please enter a template name'); return; }
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
    } catch { toast.error('Failed to save template'); }
    finally { setSaving(false); }
  };

  const addToCourse = async () => {
    if (!selectedCourse) { toast.error('Please select a course'); return; }
    if (lessonMode === 'new' && !newLessonTitle.trim()) { toast.error('Please enter a lesson title'); return; }
    if (lessonMode === 'replace' && !selectedLesson) { toast.error('Please select a lesson'); return; }

    setSaving(true);
    try {
      if (lessonMode === 'new') {
        const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order || 0), 0);
        const newLesson = await base44.entities.Lesson.create({
          course_id: selectedCourse,
          title: newLessonTitle,
          content_type: 'richtext',
          slides: slides,
          order: maxOrder + 1,
        });
        toast.success('Lesson created successfully!');
        setShowAddDialog(false);
        setSelectedCourse(''); setSelectedLesson(''); setNewLessonTitle('');
        window.location.href = `/LessonPlayerClassic?lesson=${newLesson.id}&course=${selectedCourse}`;
      } else {
        const existingLesson = await base44.entities.Lesson.get(selectedLesson);
        await base44.entities.Lesson.update(selectedLesson, {
          ...existingLesson,
          slides: slides,
          content_type: 'richtext',
        });
        toast.success('Lesson updated successfully!');
        setShowAddDialog(false);
        setSelectedCourse(''); setSelectedLesson(''); setNewLessonTitle('');
        window.location.href = `/LessonPlayerClassic?lesson=${selectedLesson}&course=${selectedCourse}`;
      }
    } catch (error) {
      console.error('Save error:', error);
      // FIX 1 (line 224): Removed markdown hyperlink wrapping around error.message
      toast.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        // FIX 2 (line 238): Removed markdown hyperlink wrapping around toast.info(...)
        if (type !== 'image') toast.info(`Uploading ${type}...`);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        // FIX 3 (line 240): Restored truncated object literal — `audio` key was cut off mid-line
        const fieldMap = { image: 'imageUrl', diagram: 'diagramImageUrl', video: 'videoUrl', audio: 'audioUrl' };
        updateSlide(fieldMap[type], file_url);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
      } catch { toast.error(`Failed to upload ${type}`); }
    };
    input.click();
  };

  const regenerateImage = async () => {
    if (!imageEditPrompt.trim()) { toast.error('Please enter an image description'); return; }
    setRegenerating(true);
    try {
      const enhancedPrompt = `Educational diagram, flat vector style, white background: ${imageEditPrompt}`;
      let imageResult;
      if (imageProvider === 'base44') {
        const result = await base44.integrations.Core.GenerateImage({ prompt: enhancedPrompt });
        imageResult = { data: { url: result.url } };
      } else if (imageProvider === 'dalle') {
        imageResult = await base44.functions.invoke('generateImageWithDallE', { prompt: enhancedPrompt, size: imageAspectRatio === '1:1' ? '1024x1024' : '1792x1024' });
      } else if (imageProvider === 'flux2') {
        imageResult = await base44.functions.invoke('generateImageWithFlux2', { prompt: enhancedPrompt, aspect_ratio: imageAspectRatio });
      } else {
        imageResult = await base44.functions.invoke('generateImageWithManus', { prompt: enhancedPrompt, aspect_ratio: imageAspectRatio });
      }
      const imageUrl = imageResult.data?.url || imageResult?.url;
      if (imageUrl) {
        updateSlide('imageUrl', imageUrl);
        toast.success('Image generated!');
        setShowImageEditor(false);
        setImageEditPrompt('');
      } else {
        toast.error('Failed to get image URL');
      }
    } catch (error) {
      // FIX 4 (line 274): Removed markdown hyperlink wrapping around error.message
      toast.error('Failed to generate image: ' + error.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">

        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
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
                  }`}>{idx + 1}</span>
                  <button
                    onClick={deleteSlide}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all"
                    disabled={slides.length <= 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="aspect-video bg-white rounded border border-slate-200 p-2 overflow-hidden text-[6px] text-slate-400 select-none">
                  <div className="font-bold text-slate-800 mb-1 truncate">{slide.title}</div>
                  <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: cleanContent(slide.content) }} />
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

        {/* MAIN STAGE */}
        <div className="flex-1 flex flex-col h-full relative min-w-0">

          {/* Toolbar */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-500">
              <LayoutTemplate className="w-5 h-5" />
              <span className="text-sm">Slide Editor</span>
            </div>
            <div className="flex items-center gap-3">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(themes).map(([key, t]) => (
                    <SelectItem key={key} value={key}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowSaveTemplate(true)}>
                <Save className="w-4 h-4 mr-2" />Save Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <BookOpen className="w-4 h-4 mr-2" />Add to Course
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Exit Editor
              </Button>
            </div>
          </header>

          {/* Canvas */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-slate-100">
            <div
              className={`w-full max-w-5xl ${currentTheme.bg} rounded-xl shadow-2xl flex flex-col transition-all duration-300`}
              style={{ minHeight: '560px', height: 'auto' }}
            >
              {/* Top colour stripe */}
              <div className={`h-2 w-full bg-gradient-to-r ${currentTheme.gradient} flex-shrink-0 rounded-t-xl`} />

              {/* Slide body — NO overflow-hidden so content never clips */}
              <div className="flex flex-col p-8 gap-4">

                {/* Title */}
                <Input
                  value={activeSlide.title}
                  onChange={(e) => updateSlide('title', e.target.value)}
                  className={`text-3xl font-extrabold border-none px-0 shadow-none focus-visible:ring-0 placeholder:opacity-30 ${currentTheme.text} tracking-tight bg-transparent`}
                  placeholder="Click to add title"
                />

                {/* Content grid — editor left, visuals right */}
                <div className={`grid gap-6 transition-all duration-300 ${textEditorCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>

                  {/* LEFT: Rich Text Editor */}
                  {!textEditorCollapsed && (
                    <div
                      className="bg-slate-50 rounded-lg border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden"
                      style={{ maxHeight: '380px' }}
                    >
                      <RichTextEditor
                        value={cleanContent(activeSlide.content)}
                        onChange={(html) => updateSlide('content', html)}
                        placeholder="Type your bullet points..."
                      />
                    </div>
                  )}

                  {/* RIGHT: Visuals */}
                  <div className="relative" style={{ minHeight: '200px' }}>
                    {/* Collapse toggle */}
                    <button
                      onClick={() => setTextEditorCollapsed(!textEditorCollapsed)}
                      className="absolute -left-4 top-4 z-10 bg-white border-2 border-slate-200 rounded-full p-2 shadow-lg hover:bg-slate-50 transition-all hover:scale-110"
                    >
                      {textEditorCollapsed
                        ? <PanelLeftOpen className="w-4 h-4 text-slate-600" />
                        : <PanelLeftClose className="w-4 h-4 text-slate-600" />}
                    </button>

                    {/* Collapsed: show rendered content */}
                    {textEditorCollapsed && (
                      <div className={`px-4 py-2 ${currentTheme.text}`}>
                        <SlideContent html={activeSlide.content} bulletColor={currentTheme.bulletColor} />
                      </div>
                    )}

                    {/* Visuals section */}
                    {(activeSlide.diagramCode || activeSlide.diagramImageUrl || activeSlide.labeledIllustration || activeSlide.imageUrl || activeSlide.videoUrl || activeSlide.audioUrl) ? (
                      <div className="flex flex-col gap-4 mt-2">

                        {activeSlide.diagramCode && (
                          <div className="relative group">
                            <MermaidDiagram code={activeSlide.diagramCode} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm rounded-lg">
                              <Button variant="secondary" size="sm" onClick={() => { const c = window.prompt("Edit diagram code:", activeSlide.diagramCode); if (c !== null) updateSlide('diagramCode', c); }}>✏️ Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => { if (confirm('Delete diagram?')) updateSlide('diagramCode', null); }}>🗑️ Delete</Button>
                            </div>
                          </div>
                        )}

                        {activeSlide.diagramImageUrl && (
                          <div className="relative group">
                            <img src={activeSlide.diagramImageUrl} alt="Diagram" className="w-full h-auto object-contain p-4 rounded-xl border border-slate-200 bg-slate-50" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                              <Button variant="destructive" size="sm" onClick={() => updateSlide('diagramImageUrl', null)}>🗑️</Button>
                            </div>
                          </div>
                        )}

                        {activeSlide.labeledIllustration && (
                          <div className="relative group">
                            <LabeledIllustration
                              data={activeSlide.labeledIllustration}
                              onImageGenerated={(url) => {
                                const newSlides = [...slides];
                                if (newSlides[currentSlideIndex].labeledIllustration) {
                                  newSlides[currentSlideIndex].labeledIllustration.generatedUrl = url;
                                  updateSlides(newSlides);
                                }
                              }}
                            />
                            {activeSlide.labeledIllustration.generatedUrl && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm rounded-lg flex-wrap p-4">
                                <Button variant="secondary" size="sm" onClick={() => { const p = window.prompt("Edit description:", activeSlide.labeledIllustration.baseImagePrompt); if (p !== null) updateSlide('labeledIllustration', { ...activeSlide.labeledIllustration, baseImagePrompt: p, generatedUrl: null }); }}>✏️ Edit</Button>
                                <Button variant="secondary" size="sm" onClick={() => handleFileUpload('image')}>📤 Upload</Button>
                                <Button variant="destructive" size="sm" onClick={() => { if (confirm('Delete?')) updateSlide('labeledIllustration', null); }}>🗑️ Delete</Button>
                              </div>
                            )}
                          </div>
                        )}

                        {activeSlide.imageUrl && (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            {/* FIX 5 (line 463): Restored truncated img className string and the missing overlay div */}
                            <img src={activeSlide.imageUrl} alt="Slide Visual" className="w-full h-auto object-contain p-4" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm p-4">
                              <div className="flex gap-2 flex-wrap justify-center">
                                <Button variant="secondary" size="sm" onClick={() => { setShowImageEditor(true); setImageEditPrompt(''); }}>🎨 AI</Button>
                                <Button variant="secondary" size="sm" onClick={() => setShowOCREditor(true)}>✏️ OCR</Button>
                                <Button variant="secondary" size="sm" onClick={() => handleFileUpload('image')}>📤 Upload</Button>
                                <Button variant="secondary" size="sm" onClick={() => setShowMediaLibrary(true)}>📁 Library</Button>
                                <Button variant="destructive" size="sm" onClick={() => updateSlide('imageUrl', null)}>🗑️ Remove</Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSlide.videoUrl && (
                          <div className="relative group">
                            <video src={activeSlide.videoUrl} controls className="w-full h-auto rounded-xl border border-slate-200" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                              <Button variant="destructive" size="sm" onClick={() => updateSlide('videoUrl', null)}>🗑️</Button>
                            </div>
                          </div>
                        )}

                        {activeSlide.audioUrl && (
                          <div className="relative group p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <audio src={activeSlide.audioUrl} controls className="w-full" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                              <Button variant="destructive" size="sm" onClick={() => updateSlide('audioUrl', null)}>🗑️</Button>
                            </div>
                          </div>
                        )}
                      </div>

                    ) : !textEditorCollapsed ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50 p-6 mt-2" style={{ minHeight: '200px' }}>
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="font-medium">Add Visual Content</span>
                        <div className="w-full max-w-xs space-y-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowImageEditor(true)} className="flex-1 text-xs">🎨 AI Image</Button>
                            <Button variant="outline" size="sm" onClick={() => handleFileUpload('image')} className="flex-1 text-xs">📤 Upload</Button>
                            <Button variant="outline" size="sm" onClick={() => setShowMediaLibrary(true)} className="flex-1 text-xs">📁 Library</Button>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { const c = window.prompt("Enter Mermaid code:"); if (c) updateSlide('diagramCode', c); }} className="flex-1 text-xs">📊 Diagram</Button>
                            <Button variant="outline" size="sm" onClick={() => handleFileUpload('video')} className="flex-1 text-xs">🎥 Video</Button>
                            <Button variant="outline" size="sm" onClick={() => handleFileUpload('audio')} className="flex-1 text-xs">🎵 Audio</Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Speaker Notes */}
                {activeSlide.speakerNotes && (
                  <div className="mt-2">
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

                {/* Footer */}
                <div className={`flex justify-between items-end pt-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'} text-xs opacity-40 ${currentTheme.text} uppercase tracking-widest font-semibold`}>
                  <span>Educational Content</span>
                  <span>{currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-xl px-4 py-2 border border-slate-200 z-10">
            <Button variant="ghost" size="icon" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="px-4 flex items-center text-sm font-medium text-slate-700">
              Slide {currentSlideIndex + 1} of {slides.length}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === slides.length - 1}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save as Template</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Template Name</Label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Science Presentation Template" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>Cancel</Button>
              <Button onClick={saveAsTemplate} disabled={saving}>{saving ? 'Saving...' : 'Save Template'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add to Course</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedLesson(''); }}>
                <SelectTrigger><SelectValue placeholder="Choose a course..." /></SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <>
                <div>
                  <Label>Mode</Label>
                  <Select value={lessonMode} onValueChange={setLessonMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Lesson</SelectItem>
                      <SelectItem value="replace">Update Existing Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {lessonMode === 'new' ? (
                  <div>
                    <Label>Lesson Title</Label>
                    <Input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} placeholder="Enter lesson title..." />
                  </div>
                ) : (
                  <div>
                    <Label>Select Lesson to Update</Label>
                    {lessonsLoading ? (
                      <p className="text-sm text-gray-400 mt-1">Loading lessons...</p>
                    ) : lessons.length === 0 ? (
                      <p className="text-sm text-amber-600 mt-1">No lessons found. Try creating a new one instead.</p>
                    ) : (
                      <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                        <SelectTrigger><SelectValue placeholder="Choose a lesson..." /></SelectTrigger>
                        <SelectContent>
                          {lessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={addToCourse} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? 'Saving...' : lessonMode === 'new' ? 'Create Lesson' : 'Update Lesson'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Image Editor Dialog */}
      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>AI Image Generation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Image Description</Label>
              <textarea value={imageEditPrompt} onChange={(e) => setImageEditPrompt(e.target.value)} placeholder="Describe the image you want..." className="w-full min-h-[100px] p-3 border rounded-lg text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">AI Provider</Label>
              <div className="grid grid-cols-2 gap-2">
                {[['base44', 'Base44 AI'], ['dalle', 'DALL-E 3'], ['manus', 'Manus'], ['flux2', 'Flux 2']].map(([val, label]) => (
                  <button key={val} onClick={() => setImageProvider(val)} disabled={regenerating}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${imageProvider === val ? 'border-indigo-600 bg-indigo-50 font-semibold' : 'border-gray-200 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Aspect Ratio</Label>
              <div className="grid grid-cols-4 gap-2">
                {['16:9', '1:1', '4:3', '9:16'].map((ratio) => (
                  <button key={ratio} onClick={() => setImageAspectRatio(ratio)} disabled={regenerating}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${imageAspectRatio === ratio ? 'border-indigo-600 bg-indigo-50 font-semibold' : 'border-gray-200 hover:border-gray-300'}`}>
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowImageEditor(false)}>Cancel</Button>
              <Button onClick={regenerateImage} disabled={regenerating}>{regenerating ? 'Generating...' : 'Generate Image'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OCR Editor */}
      <Dialog open={showOCREditor} onOpenChange={setShowOCREditor}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader><DialogTitle>OCR Image Editor</DialogTitle></DialogHeader>
          <div className="overflow-y-auto">
            {activeSlide.imageUrl && (
              <OCRImageEditor
                imageUrl={activeSlide.imageUrl}
                onSave={(url) => { updateSlide('imageUrl', url); setShowOCREditor(false); }}
                onClose={() => setShowOCREditor(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelectMedia={(media) => {
          const fieldMap = { image: 'imageUrl', video: 'videoUrl', audio: 'audioUrl' };
          if (fieldMap[media.file_type]) {
            updateSlide(fieldMap[media.file_type], media.file_url);
            toast.success(`${media.file_type} added to slide`);
          }
        }}
      />
    </MathJaxContext>
  );
}