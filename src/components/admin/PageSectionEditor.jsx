import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function PageSectionEditor({ section, onSave, isSaving, onClose }) {
  // Extract data properly - handle nested data structure
  const extractedData = section?.data || section || {};
  
  const [formData, setFormData] = useState({
    page_name: extractedData.page_name || 'Home',
    section_type: extractedData.section_type || '',
    title: extractedData.title || '',
    subtitle: extractedData.subtitle || '',
    description: extractedData.description || '',
    cta_text: extractedData.cta_text || '',
    cta_link: extractedData.cta_link || '',
    is_active: extractedData.is_active !== false,
    order: extractedData.order || 0,
    // SEO fields
    seo_title: extractedData.seo_title || '',
    seo_description: extractedData.seo_description || '',
    seo_keywords: extractedData.seo_keywords || '',
    // Ecosystem products
    product1_name: extractedData.product1_name || '',
    product1_subtitle: extractedData.product1_subtitle || '',
    product1_desc1: extractedData.product1_desc1 || '',
    product1_desc2: extractedData.product1_desc2 || '',
    product2_name: extractedData.product2_name || '',
    product2_subtitle: extractedData.product2_subtitle || '',
    product2_desc1: extractedData.product2_desc1 || '',
    product2_desc2: extractedData.product2_desc2 || '',
    product3_name: extractedData.product3_name || '',
    product3_subtitle: extractedData.product3_subtitle || '',
    product3_desc1: extractedData.product3_desc1 || '',
    product3_desc2: extractedData.product3_desc2 || '',
    // New section types
    gallery_images: extractedData.gallery_images || [],
    gallery_layout: extractedData.gallery_layout || 'grid',
    video_url: extractedData.video_url || '',
    video_title: extractedData.video_title || '',
    video_description: extractedData.video_description || '',
    team_members: extractedData.team_members || [],
    faqs: extractedData.faqs || []
  });

  const handleSave = () => {
    // Include the section ID if editing
    const dataToSave = section?.id ? { ...formData, id: section.id } : formData;
    onSave(dataToSave);
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
                <SelectItem value="ecosystem">Ecosystem Section</SelectItem>
                <SelectItem value="hero_carousel">Hero Carousel</SelectItem>
                <SelectItem value="programs">Programs Section</SelectItem>
                <SelectItem value="features">Features Section</SelectItem>
                <SelectItem value="image_gallery">Image Gallery</SelectItem>
                <SelectItem value="video_embed">Video Embed</SelectItem>
                <SelectItem value="team_members">Team Members</SelectItem>
                <SelectItem value="faq_section">FAQ Section</SelectItem>
                <SelectItem value="success_stories">Success Stories</SelectItem>
                <SelectItem value="solutions">Solutions Cards</SelectItem>
                <SelectItem value="cta_section">CTA Section</SelectItem>
                <SelectItem value="leadership_cta">Leadership CTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
            <Switch
              id="is-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is-active" className="cursor-pointer font-semibold">
              {formData.is_active ? '✅ Active (Visible on page)' : '❌ Inactive (Hidden)'}
            </Label>
          </div>

          {/* SEO Fields */}
          <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">SEO</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Search Engine Optimization</h3>
                <p className="text-xs text-gray-600">Optimize this page for search engines</p>
              </div>
            </div>
            
            <div>
              <Label>SEO Title (Page Title)</Label>
              <Input
                placeholder="e.g., Best Online Learning Platform - Diverse Youth NI"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <Label>Meta Description</Label>
              <Textarea
                placeholder="Brief description that appears in search results (150-160 characters)"
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.seo_description.length}/160 characters
              </p>
            </div>

            <div>
              <Label>Keywords</Label>
              <Input
                placeholder="e.g., online learning, education, courses, youth"
                value={formData.seo_keywords}
                onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
            </div>
          </div>

          {formData.section_type === 'ecosystem' && (
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
                  placeholder="Main description text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="border-t pt-4 mt-4 bg-red-50 p-4 rounded">
                <Label className="text-base font-semibold mb-3 block">🔴 Product 1 (Red)</Label>
                <div className="space-y-3">
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

              <div className="border-t pt-4 mt-4 bg-green-50 p-4 rounded">
                <Label className="text-base font-semibold mb-3 block">🟢 Product 2 (Green)</Label>
                <div className="space-y-3">
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

              <div className="border-t pt-4 mt-4 bg-blue-50 p-4 rounded">
                <Label className="text-base font-semibold mb-3 block">🔵 Product 3 (Blue)</Label>
                <div className="space-y-3">
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
          )}

          {formData.section_type === 'image_gallery' && (
            <div className="space-y-4">
              <Input placeholder="Gallery Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              
              <div>
                <Label>Layout Style</Label>
                <Select value={formData.gallery_layout} onValueChange={(v) => setFormData({ ...formData, gallery_layout: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border p-4 rounded">
                <Label className="mb-2 block">Images</Label>
                {formData.gallery_images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input placeholder="Image URL" value={img.url} onChange={(e) => {
                      const imgs = [...formData.gallery_images];
                      imgs[idx].url = e.target.value;
                      setFormData({ ...formData, gallery_images: imgs });
                    }} />
                    <Input placeholder="Caption" value={img.caption} onChange={(e) => {
                      const imgs = [...formData.gallery_images];
                      imgs[idx].caption = e.target.value;
                      setFormData({ ...formData, gallery_images: imgs });
                    }} />
                    <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, gallery_images: formData.gallery_images.filter((_, i) => i !== idx) })}>
                      ✕
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={() => setFormData({ ...formData, gallery_images: [...formData.gallery_images, { url: '', caption: '', alt: '' }] })}>
                  + Add Image
                </Button>
              </div>
            </div>
          )}

          {formData.section_type === 'video_embed' && (
            <div className="space-y-4">
              <Input placeholder="Video Title" value={formData.video_title} onChange={(e) => setFormData({ ...formData, video_title: e.target.value })} />
              <Input placeholder="YouTube/Vimeo Embed URL" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} />
              <Textarea placeholder="Video Description" value={formData.video_description} onChange={(e) => setFormData({ ...formData, video_description: e.target.value })} rows={3} />
            </div>
          )}

          {formData.section_type === 'team_members' && (
            <div className="space-y-4">
              <Input placeholder="Section Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              
              <div className="border p-4 rounded">
                <Label className="mb-2 block">Team Members</Label>
                {formData.team_members.map((member, idx) => (
                  <div key={idx} className="border p-3 mb-3 rounded bg-gray-50">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input placeholder="Name" value={member.name} onChange={(e) => {
                        const members = [...formData.team_members];
                        members[idx].name = e.target.value;
                        setFormData({ ...formData, team_members: members });
                      }} />
                      <Input placeholder="Role" value={member.role} onChange={(e) => {
                        const members = [...formData.team_members];
                        members[idx].role = e.target.value;
                        setFormData({ ...formData, team_members: members });
                      }} />
                    </div>
                    <Input placeholder="Image URL" value={member.image} onChange={(e) => {
                      const members = [...formData.team_members];
                      members[idx].image = e.target.value;
                      setFormData({ ...formData, team_members: members });
                    }} className="mb-2" />
                    <Textarea placeholder="Bio" value={member.bio} onChange={(e) => {
                      const members = [...formData.team_members];
                      members[idx].bio = e.target.value;
                      setFormData({ ...formData, team_members: members });
                    }} rows={2} className="mb-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Email" value={member.email} onChange={(e) => {
                        const members = [...formData.team_members];
                        members[idx].email = e.target.value;
                        setFormData({ ...formData, team_members: members });
                      }} />
                      <Input placeholder="LinkedIn" value={member.linkedin} onChange={(e) => {
                        const members = [...formData.team_members];
                        members[idx].linkedin = e.target.value;
                        setFormData({ ...formData, team_members: members });
                      }} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, team_members: formData.team_members.filter((_, i) => i !== idx) })} className="mt-2">
                      Remove Member
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={() => setFormData({ ...formData, team_members: [...formData.team_members, { name: '', role: '', bio: '', image: '', email: '', linkedin: '', twitter: '' }] })}>
                  + Add Member
                </Button>
              </div>
            </div>
          )}

          {formData.section_type === 'faq_section' && (
            <div className="space-y-4">
              <Input placeholder="Section Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              
              <div className="border p-4 rounded">
                <Label className="mb-2 block">FAQ Items</Label>
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="border p-3 mb-3 rounded bg-gray-50">
                    <Input placeholder="Question" value={faq.question} onChange={(e) => {
                      const faqs = [...formData.faqs];
                      faqs[idx].question = e.target.value;
                      setFormData({ ...formData, faqs });
                    }} className="mb-2" />
                    <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => {
                      const faqs = [...formData.faqs];
                      faqs[idx].answer = e.target.value;
                      setFormData({ ...formData, faqs });
                    }} rows={3} />
                    <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== idx) })} className="mt-2">
                      Remove FAQ
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={() => setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] })}>
                  + Add FAQ
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {formData.is_active ? '✓ Will appear on homepage' : '⚠ Will be hidden'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Section'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}