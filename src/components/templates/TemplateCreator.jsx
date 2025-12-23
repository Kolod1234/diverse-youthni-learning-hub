import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save, FileText, LayoutTemplate, ClipboardList, Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import SlideEditor from '@/components/editor/SlideEditor';

const CATEGORY_OPTIONS = [
  { value: 'lesson', label: 'Lesson', icon: FileText },
  { value: 'slide', label: 'Slide', icon: LayoutTemplate },
  { value: 'assignment', label: 'Assignment', icon: ClipboardList },
  { value: 'quiz', label: 'Quiz', icon: Award },
  { value: 'custom', label: 'Custom', icon: Star },
];

export default function TemplateCreator({ onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'lesson',
    is_public: initialData?.is_public || false,
    tags: initialData?.tags || [],
    content: initialData?.content || { slides: [], metadata: {} }
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Template.create(formData);
      toast.success('Template saved successfully!');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl h-[90vh] flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Template</h2>
            <p className="text-sm text-gray-500">Save your content as a reusable template</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Biology Lesson Template"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border"
                >
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tags..."
                />
                <Button onClick={addTag} variant="outline">Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="gap-2">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="public" className="cursor-pointer">
                Make this template public (available to all users)
              </Label>
            </div>

            {/* Content Editor */}
            {formData.category === 'lesson' && (
              <div>
                <Label className="mb-3 block text-base font-semibold">Lesson Content</Label>
                <SlideEditor
                  slides={formData.content.slides}
                  onChange={(slides) => setFormData({
                    ...formData,
                    content: { ...formData.content, slides }
                  })}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-600">
            {formData.category === 'lesson' && `${formData.content.slides?.length || 0} slides`}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}