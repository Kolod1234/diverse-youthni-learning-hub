import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function PageSectionEditor({ section, onClose }) {
  const [formData, setFormData] = useState(section || { is_active: true });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (section?.id) {
        await base44.entities.PageSection.update(section.id, data);
      } else {
        await base44.entities.PageSection.create({ ...data, order: 0 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections']);
      toast.success('Section saved!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await base44.functions.invoke('optimizeAndUploadImage', { file });
      setFormData({ ...formData, [field]: data.file_url });
      toast.success('Image uploaded and optimized!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addCarouselItem = () => {
    setFormData({
      ...formData,
      carousel_items: [
        ...(formData.carousel_items || []),
        { image_url: '', badge: '', title: '', subtitle: '', description: '', cta_text: '', cta_link: '' }
      ]
    });
  };

  const updateCarouselItem = (index, field, value) => {
    const items = [...(formData.carousel_items || [])];
    items[index] = { ...items[index], [field]: value };
    setFormData({ ...formData, carousel_items: items });
  };

  const deleteCarouselItem = (index) => {
    const items = (formData.carousel_items || []).filter((_, i) => i !== index);
    setFormData({ ...formData, carousel_items: items });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section?.id ? 'Edit Section' : 'Add Section'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Section Type</Label>
            <Select 
              value={formData.section_type} 
              onValueChange={(v) => setFormData({ ...formData, section_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero_carousel">Hero Carousel</SelectItem>
                <SelectItem value="programs">Programs Section</SelectItem>
                <SelectItem value="features">Features Section</SelectItem>
                <SelectItem value="ecosystem">Ecosystem Section</SelectItem>
                <SelectItem value="success_stories">Success Stories</SelectItem>
                <SelectItem value="solutions">Solutions Cards</SelectItem>
                <SelectItem value="cta_section">CTA Section</SelectItem>
                <SelectItem value="leadership_cta">Leadership CTA</SelectItem>
                <SelectItem value="about_us">About Us</SelectItem>
                <SelectItem value="contact_form">Contact Form</SelectItem>
                <SelectItem value="blog_listing">Blog Listing</SelectItem>
                <SelectItem value="testimonials">Testimonials</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
            <Switch
              id="is-active"
              checked={formData.is_active !== false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is-active" className="cursor-pointer">
              {formData.is_active !== false ? 'Section is Active (Visible)' : 'Section is Inactive (Hidden)'}
            </Label>
          </div>

          {formData.section_type === 'programs' ? (
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <div>
                <Label>Image</Label>
                {formData.image_url ? (
                  <div className="relative">
                    <img src={formData.image_url} alt="" className="w-full h-32 object-cover rounded" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image_url')}
                      className="hidden"
                      id="program-img"
                    />
                    <label htmlFor="program-img">
                      <Button variant="outline" className="w-full" asChild disabled={uploading}>
                        <span>
                          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Upload Image
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
              <Input
                placeholder="Link URL (e.g., /Explore)"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              />
            </div>
          ) : formData.section_type === 'features' ? (
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Input
                placeholder="Icon (emoji or text)"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Color From (e.g., blue-500)"
                  value={formData.color_from || ''}
                  onChange={(e) => setFormData({ ...formData, color_from: e.target.value })}
                />
                <Input
                  placeholder="Color To (e.g., indigo-600)"
                  value={formData.color_to || ''}
                  onChange={(e) => setFormData({ ...formData, color_to: e.target.value })}
                />
              </div>
            </div>
          ) : formData.section_type === 'ecosystem' ? (
            <div className="space-y-4">
              <Input
                placeholder="Main Title (e.g., Explore the Instructure ecosystem)"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <Input
                placeholder="Button Text (e.g., Take a look)"
                value={formData.cta_text || ''}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              />
              <Input
                placeholder="Button Link"
                value={formData.cta_link || ''}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
              />

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 1 (Red)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Canvas)"
                    value={formData.product1_name || ''}
                    onChange={(e) => setFormData({ ...formData, product1_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product1_subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, product1_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Teaching)"
                    value={formData.product1_desc1 || ''}
                    onChange={(e) => setFormData({ ...formData, product1_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and learning)"
                    value={formData.product1_desc2 || ''}
                    onChange={(e) => setFormData({ ...formData, product1_desc2: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 2 (Green)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Mastery)"
                    value={formData.product2_name || ''}
                    onChange={(e) => setFormData({ ...formData, product2_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product2_subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, product2_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Assessment)"
                    value={formData.product2_desc1 || ''}
                    onChange={(e) => setFormData({ ...formData, product2_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and growth)"
                    value={formData.product2_desc2 || ''}
                    onChange={(e) => setFormData({ ...formData, product2_desc2: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 3 (Blue)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Parchment)"
                    value={formData.product3_name || ''}
                    onChange={(e) => setFormData({ ...formData, product3_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product3_subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, product3_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Credentials)"
                    value={formData.product3_desc1 || ''}
                    onChange={(e) => setFormData({ ...formData, product3_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and opportunity)"
                    value={formData.product3_desc2 || ''}
                    onChange={(e) => setFormData({ ...formData, product3_desc2: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Input
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {formData.is_active !== false ? '✓ This section will be visible' : '⚠ This section will be hidden'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={() => saveMutation.mutate(formData)} 
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Section'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}