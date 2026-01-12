import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function PageSectionEditor({ section, onClose }) {
  const [formData, setFormData] = useState(section || {});
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
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'page-sections-ecosystem' || query.queryKey[0] === 'page-sections' });
      toast.success('Section saved!');
      onClose();
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
                <SelectItem value="text_block">Text Block</SelectItem>
                <SelectItem value="card_grid">Card Grid</SelectItem>
              </SelectContent>
            </Select>
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
          ) : formData.section_type === 'success_stories' ? (
            <div className="space-y-4">
              <Input
                placeholder="Section Title (e.g., Success stories and resources)"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Story Cards</Label>
                {[1, 2, 3].map((num) => (
                  <div key={num} className="border rounded-lg p-4 mb-4">
                    <Label className="font-medium mb-2 block">Story {num}</Label>
                    <div className="space-y-3 pl-2">
                      <Input
                        placeholder="Category (e.g., Instructure)"
                        value={formData[`story${num}_category`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`story${num}_category`]: e.target.value })}
                      />
                      <Input
                        placeholder="Tag (e.g., Research)"
                        value={formData[`story${num}_tag`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`story${num}_tag`]: e.target.value })}
                      />
                      <Select
                        value={formData[`story${num}_tag_color`] || 'bg-red-600'}
                        onValueChange={(v) => setFormData({ ...formData, [`story${num}_tag_color`]: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tag Color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bg-red-600">Red</SelectItem>
                          <SelectItem value="bg-blue-600">Blue</SelectItem>
                          <SelectItem value="bg-orange-600">Orange</SelectItem>
                          <SelectItem value="bg-green-600">Green</SelectItem>
                          <SelectItem value="bg-purple-600">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Title"
                        value={formData[`story${num}_title`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`story${num}_title`]: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={formData[`story${num}_description`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`story${num}_description`]: e.target.value })}
                        rows={2}
                      />
                      <Select
                        value={formData[`story${num}_bg_color`] || 'from-gray-900 via-red-950 to-gray-900'}
                        onValueChange={(v) => setFormData({ ...formData, [`story${num}_bg_color`]: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Background Gradient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="from-gray-900 via-red-950 to-gray-900">Red Dark</SelectItem>
                          <SelectItem value="from-blue-950 via-slate-900 to-blue-950">Blue Dark</SelectItem>
                          <SelectItem value="from-gray-900 via-orange-950 to-gray-900">Orange Dark</SelectItem>
                          <SelectItem value="from-purple-950 via-slate-900 to-purple-950">Purple Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : formData.section_type === 'solutions' ? (
            <div className="space-y-4">
              <Input
                placeholder="Section Title (e.g., Solutions for every age...)"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Solution Cards (4)</Label>
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="border rounded-lg p-4 mb-4">
                    <Label className="font-medium mb-2 block">Card {num}</Label>
                    <div className="space-y-3 pl-2">
                      <div>
                        <Label>Image</Label>
                        {formData[`card${num}_image`] ? (
                          <div className="relative">
                            <img src={formData[`card${num}_image`]} alt="" className="w-full h-32 object-cover rounded" />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData({ ...formData, [`card${num}_image`]: '' })}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, `card${num}_image`)}
                              className="hidden"
                              id={`card${num}-img`}
                            />
                            <label htmlFor={`card${num}-img`}>
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
                        placeholder="Title (e.g., GCSE)"
                        value={formData[`card${num}_title`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`card${num}_title`]: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={formData[`card${num}_description`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`card${num}_description`]: e.target.value })}
                        rows={2}
                      />
                      <Input
                        placeholder="Link URL"
                        value={formData[`card${num}_link`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`card${num}_link`]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : formData.section_type === 'cta_section' ? (
            <div className="space-y-4">
              <Input
                placeholder="Badge Text (e.g., Join Thousands of...)"
                value={formData.badge_text || ''}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
              />
              <Input
                placeholder="Main Title (e.g., Ready to Transform)"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Highlighted Title (e.g., Your Future?)"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Button Text</Label>
                  <Input
                    placeholder="Get Started for Free"
                    value={formData.cta1_text || ''}
                    onChange={(e) => setFormData({ ...formData, cta1_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Primary Button Link</Label>
                  <Input
                    placeholder="/Dashboard"
                    value={formData.cta1_link || ''}
                    onChange={(e) => setFormData({ ...formData, cta1_link: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Secondary Button Text</Label>
                  <Input
                    placeholder="Browse Courses"
                    value={formData.cta2_text || ''}
                    onChange={(e) => setFormData({ ...formData, cta2_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Secondary Button Link</Label>
                  <Input
                    placeholder="/Explore"
                    value={formData.cta2_link || ''}
                    onChange={(e) => setFormData({ ...formData, cta2_link: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : formData.section_type === 'leadership_cta' ? (
            <div className="space-y-4">
              <Input
                placeholder="Badge Text (e.g., Leadership Development)"
                value={formData.badge_text || ''}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
              />
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
                placeholder="Button Text"
                value={formData.cta_text || ''}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              />
              <Input
                placeholder="Button Link"
                value={formData.cta_link || ''}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
              />
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
          ) : formData.section_type === 'about_us' ? (
            <div className="space-y-4">
              <Input placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Subtitle" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mission Title</Label>
                  <Input placeholder="Our Mission" value={formData.mission_title || ''} onChange={(e) => setFormData({ ...formData, mission_title: e.target.value })} />
                </div>
                <div>
                  <Label>Vision Title</Label>
                  <Input placeholder="Our Vision" value={formData.vision_title || ''} onChange={(e) => setFormData({ ...formData, vision_title: e.target.value })} />
                </div>
              </div>
              <Textarea placeholder="Mission Text" value={formData.mission_text || ''} onChange={(e) => setFormData({ ...formData, mission_text: e.target.value })} rows={2} />
              <Textarea placeholder="Vision Text" value={formData.vision_text || ''} onChange={(e) => setFormData({ ...formData, vision_text: e.target.value })} rows={2} />
              
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" />Styling</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={formData.bg_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} className="w-16 h-10" />
                      <Input value={formData.bg_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} placeholder="#ffffff" />
                    </div>
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={formData.text_color || '#1f2937'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} className="w-16 h-10" />
                      <Input value={formData.text_color || '#1f2937'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} placeholder="#1f2937" />
                    </div>
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={formData.accent_color || '#4f46e5'} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} className="w-16 h-10" />
                      <Input value={formData.accent_color || '#4f46e5'} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} placeholder="#4f46e5" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Font Family</Label>
                  <Select value={formData.font_family || 'system'} onValueChange={(v) => setFormData({ ...formData, font_family: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : formData.section_type === 'contact_form' ? (
            <div className="space-y-4">
              <Input placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Subtitle" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              <Input placeholder="Submit Button Text" value={formData.submit_text || 'Send Message'} onChange={(e) => setFormData({ ...formData, submit_text: e.target.value })} />
              <Input placeholder="Success Message" value={formData.success_message || ''} onChange={(e) => setFormData({ ...formData, success_message: e.target.value })} />
              
              <div className="border-t pt-4">
                <Label className="mb-2 block">Contact Information (Optional)</Label>
                <div className="space-y-2">
                  <Input placeholder="Email" value={formData.info_email || ''} onChange={(e) => setFormData({ ...formData, info_email: e.target.value })} />
                  <Input placeholder="Phone" value={formData.info_phone || ''} onChange={(e) => setFormData({ ...formData, info_phone: e.target.value })} />
                  <Input placeholder="Address" value={formData.info_address || ''} onChange={(e) => setFormData({ ...formData, info_address: e.target.value })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" />Styling</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Background</Label>
                    <Input type="color" value={formData.bg_color || '#f9fafb'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Text</Label>
                    <Input type="color" value={formData.text_color || '#1f2937'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Button</Label>
                    <Input type="color" value={formData.button_color || '#4f46e5'} onChange={(e) => setFormData({ ...formData, button_color: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          ) : formData.section_type === 'blog_listing' ? (
            <div className="space-y-4">
              <Input placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Subtitle" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Layout</Label>
                  <Select value={formData.layout || 'grid'} onValueChange={(v) => setFormData({ ...formData, layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Posts Per Page</Label>
                  <Input type="number" value={formData.posts_per_page || 6} onChange={(e) => setFormData({ ...formData, posts_per_page: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" />Styling</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Background</Label>
                    <Input type="color" value={formData.bg_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Text</Label>
                    <Input type="color" value={formData.text_color || '#1f2937'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Accent</Label>
                    <Input type="color" value={formData.accent_color || '#f59e0b'} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          ) : formData.section_type === 'testimonials' ? (
            <div className="space-y-4">
              <Input placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Subtitle" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              <Textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              
              <div>
                <Label>Layout</Label>
                <Select value={formData.layout || 'carousel'} onValueChange={(v) => setFormData({ ...formData, layout: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4" />Styling</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Background</Label>
                    <Input type="color" value={formData.bg_color || '#faf5ff'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Text</Label>
                    <Input type="color" value={formData.text_color || '#1f2937'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} />
                  </div>
                  <div>
                    <Label>Accent</Label>
                    <Input type="color" value={formData.accent_color || '#d946ef'} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Font Family</Label>
                  <Select value={formData.font_family || 'system'} onValueChange={(v) => setFormData({ ...formData, font_family: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : formData.section_type === 'hero_carousel' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Carousel Slides</Label>
                <Button onClick={addCarouselItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide
                </Button>
              </div>
              {(formData.carousel_items || []).map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Slide {index + 1}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteCarouselItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Background Image</Label>
                    {item.image_url ? (
                      <div className="relative">
                        <img src={item.image_url} alt="" className="w-full h-32 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => updateCarouselItem(index, 'image_url', '')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploading(true);
                              try {
                                const { data } = await base44.functions.invoke('optimizeAndUploadImage', { file });
                                updateCarouselItem(index, 'image_url', data.file_url);
                              } catch (error) {
                                toast.error('Upload failed');
                              }
                              setUploading(false);
                            }
                          }}
                          className="hidden"
                          id={`carousel-img-${index}`}
                        />
                        <label htmlFor={`carousel-img-${index}`}>
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
                    placeholder="Badge (e.g., ONLINE LEARNING)"
                    value={item.badge || ''}
                    onChange={(e) => updateCarouselItem(index, 'badge', e.target.value)}
                  />
                  <Input
                    placeholder="Title (e.g., Afterschool Hours)"
                    value={item.title || ''}
                    onChange={(e) => updateCarouselItem(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Subtitle (e.g., Online Quizzes)"
                    value={item.subtitle || ''}
                    onChange={(e) => updateCarouselItem(index, 'subtitle', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={item.description || ''}
                    onChange={(e) => updateCarouselItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Button Text (e.g., BROWSE COURSES)"
                    value={item.cta_text || ''}
                    onChange={(e) => updateCarouselItem(index, 'cta_text', e.target.value)}
                  />
                  <Input
                    placeholder="Button Link"
                    value={item.cta_link || ''}
                    onChange={(e) => updateCarouselItem(index, 'cta_link', e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Input
                placeholder="Badge Text"
                value={formData.badge_text || ''}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
              />
              <Input
                placeholder="Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <Textarea
                placeholder="Content"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
              <Input
                placeholder="CTA Button Text"
                value={formData.cta_text || ''}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              />
              <Input
                placeholder="CTA Link"
                value={formData.cta_link || ''}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(formData)}>Save Section</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}