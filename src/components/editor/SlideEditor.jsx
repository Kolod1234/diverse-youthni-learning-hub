import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight, LayoutTemplate, GripVertical, Maximize2, Image as ImageIcon, Save } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SLIDE_TEMPLATES = {
  blank: {
    name: 'Blank Slide',
    icon: '📄',
    content: '<p>Start writing your content here...</p>'
  },
  title: {
    name: 'Title Slide',
    icon: '📌',
    content: '<h1 style="text-align: center; color: #4F46E5; margin-bottom: 20px;">Main Title</h1><p style="text-align: center; font-size: 18px; color: #6B7280;">Subtitle or key point</p>'
  },
  content: {
    name: 'Content Slide',
    icon: '📝',
    content: '<h2 style="color: #4F46E5; border-bottom: 2px solid #E0E7FF; padding-bottom: 10px;">Section Title</h2><p style="margin-top: 15px; line-height: 1.8;">Add your main content here with detailed explanations and examples.</p>'
  },
  bullets: {
    name: 'Bullet Points',
    icon: '📋',
    content: '<h2 style="color: #4F46E5;">Key Points</h2><ul style="margin-top: 15px; line-height: 2;"><li>First important point</li><li>Second important point</li><li>Third important point</li><li>Add more points as needed</li></ul>'
  },
  twoColumn: {
    name: 'Two Column Layout',
    icon: '📊',
    content: '<h2 style="color: #4F46E5; margin-bottom: 20px;">Comparison or Split Content</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;"><div style="padding: 15px; background: #F9FAFB; border-radius: 8px;"><h3 style="color: #1F2937; margin-bottom: 10px;">Left Column</h3><p>Content for the left side goes here with details and explanations.</p></div><div style="padding: 15px; background: #F9FAFB; border-radius: 8px;"><h3 style="color: #1F2937; margin-bottom: 10px;">Right Column</h3><p>Content for the right side goes here with comparisons or additional info.</p></div></div>'
  },
  definition: {
    name: 'Definition Box',
    icon: '📖',
    content: '<h2 style="color: #4F46E5;">Term or Concept</h2><blockquote style="border-left: 4px solid #4F46E5; padding-left: 20px; margin: 20px 0; background: #EEF2FF; padding: 15px; border-radius: 4px;"><strong style="color: #312E81;">Definition:</strong> Explain the term clearly and concisely with proper academic rigor.</blockquote><p style="margin-top: 15px;"><strong>Example:</strong> Provide a practical, real-world example to illustrate the concept.</p>'
  },
  imageText: {
    name: 'Image & Text',
    icon: '🖼️',
    content: '<h2 style="color: #4F46E5;">Visual Learning</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 20px;"><div><img src="https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Add+Your+Image" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div><div><p style="line-height: 1.8;">Add descriptive text here to explain the image. Include key observations, analysis, or context that helps students understand the visual content.</p></div></div>'
  },
  quote: {
    name: 'Quote/Highlight',
    icon: '💬',
    content: '<div style="background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); padding: 40px; border-radius: 12px; text-align: center; margin: 30px 0;"><blockquote style="color: white; font-size: 24px; font-weight: 600; font-style: italic; margin: 0;">"Insert an important quote or key takeaway message here"</blockquote><p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 16px;">— Author or Source</p></div>'
  },
  steps: {
    name: 'Step-by-Step',
    icon: '🔢',
    content: '<h2 style="color: #4F46E5;">Process or Procedure</h2><div style="margin-top: 20px;"><div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 15px; background: #F0F9FF; border-left: 4px solid #0EA5E9; border-radius: 4px;"><span style="background: #0EA5E9; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">1</span><div><strong>First Step</strong><p style="margin-top: 5px; color: #475569;">Describe the first action or stage in the process.</p></div></div><div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 15px; background: #F0FDF4; border-left: 4px solid #10B981; border-radius: 4px;"><span style="background: #10B981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">2</span><div><strong>Second Step</strong><p style="margin-top: 5px; color: #475569;">Explain the second action or stage.</p></div></div><div style="display: flex; gap: 15px; padding: 15px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 4px;"><span style="background: #F59E0B; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">3</span><div><strong>Third Step</strong><p style="margin-top: 5px; color: #475569;">Detail the final action or stage.</p></div></div></div>'
  },
  imageTop: {
    name: 'Image Top',
    icon: '🖼️⬆️',
    content: '<h2 style="color: #4F46E5; margin-bottom: 20px;">Visual Example</h2><div style="margin-bottom: 20px;"><img src="https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Add+Your+Image" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div><p style="line-height: 1.8; color: #374151;">Add a detailed explanation below the image. This layout is perfect for diagrams, charts, or any visual that needs comprehensive text explanation underneath.</p><ul style="margin-top: 15px; line-height: 2;"><li>Key observation 1</li><li>Key observation 2</li><li>Key observation 3</li></ul>'
  },
  threeImages: {
    name: 'Three Images',
    icon: '🖼️🖼️🖼️',
    content: '<h2 style="color: #4F46E5; margin-bottom: 25px;">Comparison or Examples</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;"><div style="text-align: center;"><img src="https://via.placeholder.com/300x200/0EA5E9/FFFFFF?text=Image+1" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 10px;" /><h4 style="color: #1F2937; margin-bottom: 8px; font-size: 16px;">Example 1</h4><p style="font-size: 14px; color: #6B7280;">Description of the first example or concept.</p></div><div style="text-align: center;"><img src="https://via.placeholder.com/300x200/10B981/FFFFFF?text=Image+2" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 10px;" /><h4 style="color: #1F2937; margin-bottom: 8px; font-size: 16px;">Example 2</h4><p style="font-size: 14px; color: #6B7280;">Description of the second example or concept.</p></div><div style="text-align: center;"><img src="https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Image+3" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 10px;" /><h4 style="color: #1F2937; margin-bottom: 8px; font-size: 16px;">Example 3</h4><p style="font-size: 14px; color: #6B7280;">Description of the third example or concept.</p></div></div>'
  },
  beforeAfter: {
    name: 'Before/After',
    icon: '⏮️⏭️',
    content: '<h2 style="color: #4F46E5; text-align: center; margin-bottom: 25px;">Before & After Comparison</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;"><div style="padding: 20px; background: #FEF2F2; border-radius: 12px; border: 2px solid #FCA5A5;"><h3 style="color: #991B1B; text-align: center; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">❌ Before</h3><img src="https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Before+State" style="width: 100%; border-radius: 8px; margin-bottom: 15px;" /><p style="font-size: 14px; color: #7F1D1D; line-height: 1.6;">Describe the initial state, problem, or situation before the change or intervention.</p></div><div style="padding: 20px; background: #F0FDF4; border-radius: 12px; border: 2px solid #86EFAC;"><h3 style="color: #14532D; text-align: center; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">✅ After</h3><img src="https://via.placeholder.com/400x300/10B981/FFFFFF?text=After+State" style="width: 100%; border-radius: 8px; margin-bottom: 15px;" /><p style="font-size: 14px; color: #14532D; line-height: 1.6;">Describe the improved state, solution, or outcome after the change or intervention.</p></div></div>'
  },
  annotatedImage: {
    name: 'Annotated Image',
    icon: '🖼️📝',
    content: '<h2 style="color: #4F46E5; margin-bottom: 20px;">Labeled Diagram</h2><div style="position: relative; margin-bottom: 25px;"><img src="https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Add+Diagram+Here" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;"><div style="padding: 12px; background: #EEF2FF; border-left: 4px solid #6366F1; border-radius: 4px;"><strong style="color: #312E81;">Label 1:</strong> <span style="color: #4B5563;">Explanation of the first labeled component or feature.</span></div><div style="padding: 12px; background: #EEF2FF; border-left: 4px solid #6366F1; border-radius: 4px;"><strong style="color: #312E81;">Label 2:</strong> <span style="color: #4B5563;">Explanation of the second labeled component or feature.</span></div><div style="padding: 12px; background: #EEF2FF; border-left: 4px solid #6366F1; border-radius: 4px;"><strong style="color: #312E81;">Label 3:</strong> <span style="color: #4B5563;">Explanation of the third labeled component or feature.</span></div><div style="padding: 12px; background: #EEF2FF; border-left: 4px solid #6366F1; border-radius: 4px;"><strong style="color: #312E81;">Label 4:</strong> <span style="color: #4B5563;">Explanation of the fourth labeled component or feature.</span></div></div>'
  },
  imageOverlay: {
    name: 'Image Overlay',
    icon: '🌄',
    content: '<div style="position: relative; border-radius: 12px; overflow: hidden; margin-bottom: 20px;"><img src="https://via.placeholder.com/1200x600/1F2937/FFFFFF?text=Full+Width+Background" style="width: 100%; height: 400px; object-fit: cover;" /><div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; text-align: center;"><h2 style="color: white; font-size: 36px; font-weight: bold; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Impactful Title Over Image</h2><p style="color: rgba(255,255,255,0.95); font-size: 18px; max-width: 700px; line-height: 1.6; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Add a compelling description or key message that overlays the background image. Perfect for dramatic introductions or section breaks.</p></div></div>'
  },
  imageGallery: {
    name: 'Image Gallery',
    icon: '🎨',
    content: '<h2 style="color: #4F46E5; margin-bottom: 20px;">Visual Gallery</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;"><img src="https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Image+1" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Image+2" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Image+3" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Image+4" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /></div><p style="line-height: 1.8; color: #374151;">Add descriptive text below the gallery to explain the collection of images, provide context, or highlight key observations across all the visuals shown above.</p>'
  },
  textOnImage: {
    name: 'Text on Image',
    icon: '📸',
    content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 20px;"><div style="position: relative; border-radius: 8px; overflow: hidden;"><img src="https://via.placeholder.com/450x350/0EA5E9/FFFFFF?text=Concept+1" style="width: 100%; height: 300px; object-fit: cover;" /><div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 20px; color: white;"><h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">First Concept</h3><p style="font-size: 14px; opacity: 0.95;">Brief description overlaid on the image.</p></div></div><div style="position: relative; border-radius: 8px; overflow: hidden;"><img src="https://via.placeholder.com/450x350/10B981/FFFFFF?text=Concept+2" style="width: 100%; height: 300px; object-fit: cover;" /><div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 20px; color: white;"><h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Second Concept</h3><p style="font-size: 14px; opacity: 0.95;">Brief description overlaid on the image.</p></div></div></div><p style="margin-top: 20px; line-height: 1.8;">Add additional explanatory text here to provide more detail about both concepts shown in the images above.</p>'
  },
  textLeftImageRight: {
    name: 'Text Left Image Right',
    icon: '📝🖼️',
    content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center;"><div><h2 style="color: #4F46E5; margin-bottom: 15px;">Main Heading</h2><p style="line-height: 1.8; color: #374151; margin-bottom: 15px;">Write detailed explanatory text on the left side. This layout is perfect for presenting information with supporting visuals on the right.</p><ul style="margin-top: 15px; line-height: 2; color: #4B5563;"><li>Key point one with explanation</li><li>Key point two with explanation</li><li>Key point three with explanation</li></ul></div><div style="display: flex; flex-direction: column; gap: 15px;"><img src="https://via.placeholder.com/500x300/6366F1/FFFFFF?text=Main+Image" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><p style="text-align: center; font-size: 13px; color: #6B7280; font-style: italic;">Click image to change - add caption here</p></div></div>'
  },
  textRightImageLeft: {
    name: 'Image Left Text Right',
    icon: '🖼️📝',
    content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center;"><div style="display: flex; flex-direction: column; gap: 15px;"><img src="https://via.placeholder.com/500x300/10B981/FFFFFF?text=Main+Image" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><p style="text-align: center; font-size: 13px; color: #6B7280; font-style: italic;">Click image to change - add caption here</p></div><div><h2 style="color: #4F46E5; margin-bottom: 15px;">Main Heading</h2><p style="line-height: 1.8; color: #374151; margin-bottom: 15px;">Write detailed explanatory text on the right side. This layout places the visual first, drawing attention before the explanation.</p><ul style="margin-top: 15px; line-height: 2; color: #4B5563;"><li>Key point one with explanation</li><li>Key point two with explanation</li><li>Key point three with explanation</li></ul></div></div>'
  },
  multiImageText: {
    name: 'Multiple Images & Text',
    icon: '🖼️📄',
    content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;"><div><h2 style="color: #4F46E5; margin-bottom: 15px;">Detailed Explanation</h2><p style="line-height: 1.8; color: #374151; margin-bottom: 15px;">Add comprehensive text explanation here. Perfect for when you need multiple supporting images with detailed written content.</p><blockquote style="border-left: 4px solid #4F46E5; padding-left: 15px; margin: 15px 0; color: #4B5563; font-style: italic; background: #F3F4F6; padding: 15px; border-radius: 4px;">💡 Add an important note or key insight here</blockquote><p style="line-height: 1.8; color: #374151;">Continue with more explanatory text as needed.</p></div><div style="display: flex; flex-direction: column; gap: 15px;"><div><img src="https://via.placeholder.com/500x250/EC4899/FFFFFF?text=Image+1" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><p style="text-align: center; font-size: 12px; color: #6B7280; margin-top: 5px;">Caption for first image</p></div><div><img src="https://via.placeholder.com/500x250/F59E0B/FFFFFF?text=Image+2" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><p style="text-align: center; font-size: 12px; color: #6B7280; margin-top: 5px;">Caption for second image</p></div></div></div>'
  }
};

export default function SlideEditor({ slides = [], onChange }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);

  const addSlide = (template = 'blank') => {
    const templateData = SLIDE_TEMPLATES[template];
    const newSlides = [
      ...slides,
      {
        title: `Slide ${slides.length + 1}`,
        content: templateData.content,
        order: slides.length + 1
      }
    ];
    onChange(newSlides);
    setCurrentSlide(slides.length);
    toast.success(`${templateData.name} added!`);
  };

  const duplicateSlide = (index) => {
    const slideToDupe = slides[index];
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, {
      ...slideToDupe,
      title: `${slideToDupe.title} (Copy)`,
      order: index + 2
    });
    // Reorder
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });
    onChange(newSlides);
    setCurrentSlide(index + 1);
    toast.success('Slide duplicated!');
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange(newSlides);
  };

  const deleteSlide = (index) => {
    if (slides.length === 1) {
      toast.error('You need at least one slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index).map((slide, i) => ({
      ...slide,
      order: i + 1
    }));
    onChange(newSlides);
    setCurrentSlide(Math.max(0, Math.min(currentSlide, newSlides.length - 1)));
    toast.success('Slide deleted');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((slide, i) => {
      slide.order = i + 1;
    });

    onChange(items);
    setCurrentSlide(result.destination.index);
    toast.success('Slides reordered');
  };

  const currentSlideData = slides[currentSlide] || null;

  if (slides.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="max-w-2xl mx-auto">
          <LayoutTemplate className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Slide</h3>
          <p className="text-gray-500 mb-8">Choose from professional templates to get started with your lesson</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => addSlide(key)}
                className="h-auto py-6 flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{template.icon}</span>
                <span className="font-medium text-sm">{template.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`${fullscreenEdit ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Slide Editor</h3>
            <p className="text-sm text-gray-500">{slides.length} slide{slides.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreenEdit(!fullscreenEdit)}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            {fullscreenEdit ? 'Exit' : 'Fullscreen'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => addSlide(key)}
                  className="cursor-pointer py-3"
                >
                  <span className="text-xl mr-3">{template.icon}</span>
                  <span className="font-medium">{template.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`flex gap-6 ${fullscreenEdit ? 'h-[calc(100vh-80px)] p-6' : 'min-h-[600px]'}`}>
        {/* Thumbnail Sidebar */}
        <Card className={`${fullscreenEdit ? 'w-72' : 'w-64'} flex flex-col border-2`}>
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">All Slides</p>
          </div>
          <ScrollArea className="flex-1">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-3 space-y-2"
                  >
                    {slides.map((slide, index) => (
                      <Draggable key={index} draggableId={`slide-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative cursor-pointer transition-all ${
                              currentSlide === index 
                                ? 'ring-2 ring-indigo-500' 
                                : 'hover:ring-2 hover:ring-gray-300'
                            } ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                          >
                            <div className="bg-white border rounded-lg overflow-hidden">
                              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 p-3 text-xs overflow-hidden">
                                <div className="bg-white rounded shadow-sm p-2 h-full overflow-hidden">
                                  <div className="font-semibold text-gray-900 mb-1 truncate text-[10px]">
                                    {slide.title || `Slide ${index + 1}`}
                                  </div>
                                  <div 
                                    className="text-gray-600 line-clamp-3 text-[9px]"
                                    dangerouslySetInnerHTML={{ 
                                      __html: slide.content?.replace(/<[^>]*>/g, ' ').substring(0, 80) + '...' 
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="px-2 py-1.5 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateSlide(index);
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete this slide?')) deleteSlide(index);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ScrollArea>
        </Card>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {currentSlideData && (
            <>
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateSlide(currentSlide)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this slide?')) deleteSlide(currentSlide);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Editor Area */}
              <Card className="flex-1 overflow-hidden border-2">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Template Selector */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                        <Label className="text-base font-semibold text-indigo-900">Choose a Template</Label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => {
                              updateSlide(currentSlide, 'content', template.content);
                              toast.success(`${template.name} applied!`);
                            }}
                            className="h-24 bg-white hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-md transition-all flex-col gap-2 p-3"
                          >
                            <span className="text-3xl">{template.icon}</span>
                            <span className="text-xs font-medium text-center leading-tight text-gray-700">{template.name}</span>
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-indigo-700 mt-3">💡 Click any template to instantly apply it to this slide</p>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-2 block">Slide Title</Label>
                      <Input
                        value={currentSlideData.title || ''}
                        onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                        placeholder={`Slide ${currentSlide + 1} title`}
                        className="text-lg font-medium"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <Label className="text-base font-semibold">Slide Content</Label>
                      </div>
                      <div 
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onKeyPress={(e) => e.stopPropagation()}
                      >
                        <RichTextEditor
                          key={`slide-editor-${currentSlide}`}
                          value={currentSlideData.content || ''}
                          onChange={(value) => updateSlide(currentSlide, 'content', value)}
                          placeholder="Write your lesson content with rich formatting..."
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                        <span>💡</span>
                        <span>Use the toolbar above to add headings, lists, images, equations, and symbols. Click any image to replace it.</span>
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}