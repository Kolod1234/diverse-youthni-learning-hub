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
  // Properly extract data from nested structure
  const sectionData = section?.data || section || {};
  const initialData = {
    page_name: section?.page_name || sectionData.page_name || 'Home',
    section_type: sectionData.section_type || '',
    title: sectionData.title || '',
    subtitle: sectionData.subtitle || '',
    description: sectionData.description || '',
    cta_text: sectionData.cta_text || '',
    cta_link: sectionData.cta_link || '',
    badge_text: sectionData.badge_text || '',
    content: sectionData.content || '',
    icon: sectionData.icon || '',
    color_from: sectionData.color_from || '',
    color_to: sectionData.color_to || '',
    link_url: sectionData.link_url || '',
    image_url: sectionData.image_url || '',
    order: sectionData.order || 0,
    is_active: sectionData.is_active !== false,
    // Ecosystem products
    product1_name: sectionData.product1_name || '',
    product1_subtitle: sectionData.product1_subtitle || '',
    product1_desc1: sectionData.product1_desc1 || '',
    product1_desc2: sectionData.product1_desc2 || '',
    product2_name: sectionData.product2_name || '',
    product2_subtitle: sectionData.product2_subtitle || '',
    product2_desc1: sectionData.product2_desc1 || '',
    product2_desc2: sectionData.product2_desc2 || '',
    product3_name: sectionData.product3_name || '',
    product3_subtitle: sectionData.product3_subtitle || '',
    product3_desc1: sectionData.product3_desc1 || '',
    product3_desc2: sectionData.product3_desc2 || '',
  };
  
  const [formData, setFormData] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Saving data:', data);
      
      if (section?.id) {
        await base44.entities.PageSection.update(section.id, data);
      } else {
        await base44.entities.PageSection.create(data);
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries(['page-sections']);
      queryClient.invalidateQueries(['page-sections-home']);
      queryClient.invalidateQueries(['page-sections-ecosystem']);
      queryClient.refetchQueries();
      
      toast.success('✅ Section saved successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('❌ Failed to save: ' + error.message);
    }
  });

  const handleSave = () => {
    console.log('Form data to save:', formData);
    saveMutation.mutate(formData);
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
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is-active" className="cursor-pointer">
              {formData.is_active ? '✅ Section is Active (Visible)' : '❌ Section is Inactive (Hidden)'}
            </Label>
          </div>

          {formData.section_type === 'ecosystem' ? (
            <div className="space-y-4">
              <div>
                <Label>Main Title</Label>
                <Input
                  placeholder="e.g., Explore Our Platform"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Description text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input
                  placeholder="e.g., Learn More"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input
                  placeholder="e.g., /about"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 1 (Red)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Canvas)"
                    value={formData.product1_name}
                    onChange={(e) => setFormData({ ...formData, product1_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product1_subtitle}
                    onChange={(e) => setFormData({ ...formData, product1_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Teaching)"
                    value={formData.product1_desc1}
                    onChange={(e) => setFormData({ ...formData, product1_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and learning)"
                    value={formData.product1_desc2}
                    onChange={(e) => setFormData({ ...formData, product1_desc2: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 2 (Green)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Mastery)"
                    value={formData.product2_name}
                    onChange={(e) => setFormData({ ...formData, product2_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product2_subtitle}
                    onChange={(e) => setFormData({ ...formData, product2_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Assessment)"
                    value={formData.product2_desc1}
                    onChange={(e) => setFormData({ ...formData, product2_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and growth)"
                    value={formData.product2_desc2}
                    onChange={(e) => setFormData({ ...formData, product2_desc2: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold mb-3 block">Product 3 (Blue)</Label>
                <div className="space-y-3 pl-4">
                  <Input
                    placeholder="Product Name (e.g., Parchment)"
                    value={formData.product3_name}
                    onChange={(e) => setFormData({ ...formData, product3_name: e.target.value })}
                  />
                  <Input
                    placeholder="Subtitle (e.g., By Instructure)"
                    value={formData.product3_subtitle}
                    onChange={(e) => setFormData({ ...formData, product3_subtitle: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 1 (e.g., Credentials)"
                    value={formData.product3_desc1}
                    onChange={(e) => setFormData({ ...formData, product3_desc1: e.target.value })}
                  />
                  <Input
                    placeholder="Description line 2 (e.g., and opportunity)"
                    value={formData.product3_desc2}
                    onChange={(e) => setFormData({ ...formData, product3_desc2: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {formData.is_active ? '✓ Visible on homepage' : '⚠ Hidden from homepage'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSave}
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