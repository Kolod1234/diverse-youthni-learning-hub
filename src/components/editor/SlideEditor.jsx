import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronUp, ChevronDown, FileText, Layout, LayoutTemplate } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SLIDE_TEMPLATES = {
  blank: {
    name: 'Blank Slide',
    content: '<p></p>'
  },
  title: {
    name: 'Title Slide',
    content: '<h1>Main Title</h1><p>Subtitle or key point</p>'
  },
  content: {
    name: 'Content Slide',
    content: '<h2>Section Title</h2><p>Add your content here with details and explanations.</p>'
  },
  bullets: {
    name: 'Bullet Points',
    content: '<h2>Key Points</h2><ul><li>First point</li><li>Second point</li><li>Third point</li></ul>'
  },
  twoColumn: {
    name: 'Two Column',
    content: '<h2>Title</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div><h3>Left Column</h3><p>Content for left side</p></div><div><h3>Right Column</h3><p>Content for right side</p></div></div>'
  },
  definition: {
    name: 'Definition',
    content: '<h2>Term or Concept</h2><blockquote><strong>Definition:</strong> Explain the term clearly and concisely.</blockquote><p><strong>Example:</strong> Provide a practical example.</p>'
  }
};

export default function SlideEditor({ slides = [], onChange }) {
  const [expandedSlide, setExpandedSlide] = useState(0);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

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
    setExpandedSlide(slides.length);
    toast.success(`${templateData.name} added!`);
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
    setExpandedSlide(Math.max(0, expandedSlide - 1));
    toast.success('Slide deleted');
  };

  const moveSlide = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    
    // Update order
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });

    onChange(newSlides);
    setExpandedSlide(targetIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Lesson Slides</h3>
          <p className="text-sm text-gray-500">Create written content with multiple pages/slides</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
              <DropdownMenuItem 
                key={key}
                onClick={() => addSlide(key)}
                className="cursor-pointer"
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {slides.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No slides yet. Choose a template to start writing your lesson!</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create First Slide
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => addSlide(key)}
                  className="cursor-pointer"
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  {template.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <Card key={index} className="overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedSlide(expandedSlide === index ? -1 : index)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{slide.title || `Slide ${index + 1}`}</h4>
                    <p className="text-xs text-gray-500">
                      {slide.content ? `${slide.content.replace(/<[^>]*>/g, '').substring(0, 50)}...` : 'No content yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSlide(index, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSlide(index, 'down');
                    }}
                    disabled={index === slides.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this slide?')) deleteSlide(index);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {expandedSlide === index && (
                <div className="p-4 border-t space-y-4">
                  <div>
                    <Label>Slide Title</Label>
                    <Input
                      value={slide.title || ''}
                      onChange={(e) => updateSlide(index, 'title', e.target.value)}
                      placeholder={`Slide ${index + 1} title`}
                    />
                  </div>

                  <div>
                    <Label>Slide Content</Label>
                    <RichTextEditor
                      value={slide.content || ''}
                      onChange={(value) => updateSlide(index, 'content', value)}
                      placeholder="Write your lesson content here with full formatting..."
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}