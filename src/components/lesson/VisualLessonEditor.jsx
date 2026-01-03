import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, GripVertical, Trash2, Image as ImageIcon, Video, 
  Type, Layout, Save, Eye, Code, FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ContentBlockEditor from './ContentBlockEditor';
import SlidePreviewPanel from './SlidePreviewPanel';

export default function VisualLessonEditor({ lesson, onSave }) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [slides, setSlides] = useState(lesson?.slides || []);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.type === 'SLIDE') {
      const items = Array.from(slides);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // Update order property
      const reordered = items.map((item, idx) => ({ ...item, order: idx }));
      setSlides(reordered);
    } else if (result.type === 'BLOCK') {
      const slide = slides[selectedSlide];
      const blocks = Array.from(slide.blocks || []);
      const [reorderedBlock] = blocks.splice(result.source.index, 1);
      blocks.splice(result.destination.index, 0, reorderedBlock);
      
      const updatedSlides = [...slides];
      updatedSlides[selectedSlide] = { ...slide, blocks };
      setSlides(updatedSlides);
    }
  };

  const addSlide = () => {
    setSlides([...slides, {
      title: `Slide ${slides.length + 1}`,
      content: '',
      order: slides.length,
      blocks: []
    }]);
    setSelectedSlide(slides.length);
  };

  const deleteSlide = (index) => {
    if (slides.length === 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    const updated = slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx }));
    setSlides(updated);
    if (selectedSlide >= updated.length) {
      setSelectedSlide(updated.length - 1);
    }
  };

  const addBlock = (type) => {
    const slide = slides[selectedSlide];
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: type === 'text' ? '' : null,
      url: type !== 'text' ? '' : null
    };
    
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = {
      ...slide,
      blocks: [...(slide.blocks || []), newBlock]
    };
    setSlides(updatedSlides);
  };

  const updateBlock = (blockId, updates) => {
    const slide = slides[selectedSlide];
    const updatedBlocks = slide.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = { ...slide, blocks: updatedBlocks };
    setSlides(updatedSlides);
  };

  const deleteBlock = (blockId) => {
    const slide = slides[selectedSlide];
    const updatedBlocks = slide.blocks.filter(block => block.id !== blockId);
    
    const updatedSlides = [...slides];
    updatedSlides[selectedSlide] = { ...slide, blocks: updatedBlocks };
    setSlides(updatedSlides);
  };

  const updateSlideTitle = (index, newTitle) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], title: newTitle };
    setSlides(updatedSlides);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    setSaving(true);
    try {
      // Generate HTML content for each slide
      const processedSlides = slides.map(slide => ({
        ...slide,
        content: generateSlideHTML(slide)
      }));

      await onSave({ title, description, slides: processedSlides });
      toast.success('Lesson saved successfully!');
    } catch (error) {
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const generateSlideHTML = (slide) => {
    if (!slide.blocks || slide.blocks.length === 0) return slide.content || '';
    
    return slide.blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<div class="block-text">${block.content || ''}</div>`;
        case 'image':
          return `<div class="block-image"><img src="${block.url}" alt="${block.alt || ''}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
        case 'video':
          return `<div class="block-video"><video src="${block.url}" controls style="max-width: 100%; border-radius: 8px;"></video></div>`;
        case 'code':
          return `<div class="block-code"><pre style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto;"><code>${block.content || ''}</code></pre></div>`;
        default:
          return '';
      }
    }).join('\n');
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No slides yet</h3>
          <p className="text-gray-500 mb-4">Create your first slide to get started</p>
          <Button onClick={addSlide}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Slide
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-xl">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson Title"
              className="text-xl font-semibold border-0 px-0 focus-visible:ring-0"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson description..."
              className="text-sm text-gray-600 border-0 px-0 focus-visible:ring-0 mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Lesson'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails Sidebar */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="w-64 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Slides</h3>
                <Button onClick={addSlide} size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Droppable droppableId="slides" type="SLIDE">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {slides.map((slide, index) => (
                      <Draggable key={index} draggableId={`slide-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative border rounded-lg p-3 cursor-pointer transition-all ${
                              selectedSlide === index
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300 bg-white'
                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            onClick={() => setSelectedSlide(index)}
                          >
                            <div {...provided.dragHandleProps} className="absolute left-1 top-1">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <input
                                value={slide.title}
                                onChange={(e) => updateSlideTitle(index, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium w-full bg-transparent border-0 p-0 focus:outline-none"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {slide.blocks?.length || 0} blocks
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSlide(index);
                              }}
                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="mb-6">
                  <Label className="text-lg font-semibold mb-2">
                    {slides[selectedSlide]?.title || 'Untitled Slide'}
                  </Label>
                  <p className="text-sm text-gray-500">Add content blocks below</p>
                </div>

                {/* Content Blocks */}
                <Droppable droppableId="blocks" type="BLOCK">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4 min-h-[200px]"
                    >
                      {(slides[selectedSlide]?.blocks || []).map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-4 bg-white ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                                </div>
                                <div className="flex-1">
                                  <ContentBlockEditor
                                    block={block}
                                    onUpdate={(updates) => updateBlock(block.id, updates)}
                                  />
                                </div>
                                <button
                                  onClick={() => deleteBlock(block.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Block Buttons */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Add Content Block</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => addBlock('text')} variant="outline" size="sm">
                      <Type className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                    <Button onClick={() => addBlock('image')} variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                    <Button onClick={() => addBlock('video')} variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button onClick={() => addBlock('code')} variant="outline" size="sm">
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Preview Panel */}
        <SlidePreviewPanel slide={slides[selectedSlide]} />
      </div>
    </div>
  );
}