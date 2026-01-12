import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, Edit, Eye, EyeOff, Sparkles, Award, Target, Zap, Users, BookOpen, MessageCircle, LayoutGrid, Info, Mail, FileText, Star } from 'lucide-react';
import { toast } from 'sonner';
import PageSectionEditor from '@/components/admin/PageSectionEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const SECTION_TEMPLATES = [
  {
    id: 'ecosystem',
    name: 'Ecosystem/Products',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-600',
    description: 'Showcase your product ecosystem',
    default: {
      section_type: 'ecosystem',
      title: 'Explore Our Platform',
      description: 'Everything you need to succeed in one place',
      cta_text: 'Learn More',
      cta_link: '/about',
      product1_name: 'Learning Hub',
      product1_subtitle: 'By Our Team',
      product1_desc1: 'Interactive',
      product1_desc2: 'Courses',
      product2_name: 'Assessment',
      product2_subtitle: 'By Our Team',
      product2_desc1: 'Track Your',
      product2_desc2: 'Progress',
      product3_name: 'Certificates',
      product3_subtitle: 'By Our Team',
      product3_desc1: 'Earn',
      product3_desc2: 'Credentials',
      is_active: true
    }
  },
  {
    id: 'image_gallery',
    name: 'Image Gallery',
    icon: LayoutGrid,
    color: 'from-pink-500 to-rose-600',
    description: 'Display images in grid, masonry or carousel',
    default: {
      section_type: 'image_gallery',
      title: 'Our Gallery',
      description: 'Explore our moments',
      gallery_layout: 'grid',
      gallery_images: [],
      is_active: true
    }
  },
  {
    id: 'video_embed',
    name: 'Video Embed',
    icon: Video,
    color: 'from-red-500 to-orange-600',
    description: 'Embed YouTube or Vimeo videos',
    default: {
      section_type: 'video_embed',
      video_title: 'Watch Our Story',
      video_url: '',
      video_description: '',
      is_active: true
    }
  },
  {
    id: 'team_members',
    name: 'Team Members',
    icon: Users,
    color: 'from-indigo-500 to-purple-600',
    description: 'Showcase your team with bios and social links',
    default: {
      section_type: 'team_members',
      title: 'Meet Our Team',
      description: 'The people behind our success',
      team_members: [],
      is_active: true
    }
  },
  {
    id: 'faq_section',
    name: 'FAQ Section',
    icon: MessageCircle,
    color: 'from-yellow-500 to-amber-600',
    description: 'Frequently asked questions with answers',
    default: {
      section_type: 'faq_section',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      faqs: [],
      is_active: true
    }
  },
  {
    id: 'hero_carousel',
    name: 'Hero Carousel',
    icon: Sparkles,
    color: 'from-blue-500 to-purple-600',
    description: 'Full-width hero section with animated carousel',
    default: {
      section_type: 'hero_carousel',
      title: 'Hero Carousel',
      is_active: true
    }
  },
  {
    id: 'features',
    name: 'Features Grid',
    icon: Award,
    color: 'from-green-500 to-teal-600',
    description: 'Highlight key platform features',
    default: {
      section_type: 'features',
      title: 'Why Choose Us',
      is_active: true
    }
  }
];

export default function AdminPageBuilder() {
  const [selectedPage, setSelectedPage] = useState('Home');
  const [editingSection, setEditingSection] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const queryClient = useQueryClient();

  const { data: rawSections = [], isLoading } = useQuery({
    queryKey: ['page-sections', selectedPage],
    queryFn: async () => {
      const results = await base44.entities.PageSection.filter({ page_name: selectedPage }, 'order', 100);
      console.log('Fetched sections:', results);
      return results;
    }
  });

  // Flatten the sections to handle nested data structure
  const sections = rawSections.map(s => ({
    id: s.id,
    ...s.data,
    created_date: s.created_date,
    updated_date: s.updated_date
  }));

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      console.log('Saving form data:', formData);
      
      const { id, created_date, updated_date, created_by, created_by_id, entity_name, app_id, is_sample, is_deleted, deleted_date, ...cleanData } = formData;
      
      if (id) {
        console.log('Updating section', id, 'with data:', cleanData);
        return await base44.entities.PageSection.update(id, cleanData);
      } else {
        console.log('Creating new section with data:', cleanData);
        return await base44.entities.PageSection.create(cleanData);
      }
    },
    onSuccess: (result) => {
      console.log('Save successful, result:', result);
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return typeof key === 'string' && key.includes('page-section');
        }
      });
      toast.success('✅ Section saved! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('❌ Failed to save: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      toast.success('Section deleted');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => {
      console.log('Toggling active state for', id, 'to', is_active);
      return base44.entities.PageSection.update(id, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      toast.success('Section visibility updated');
    }
  });

  const handleTemplateSelect = (template) => {
    setEditingSection({ ...template.default, page_name: selectedPage });
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Page Builder</h1>
              <p className="text-gray-500">Build and customize your pages</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowTemplates(true)} variant="outline">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button onClick={() => setEditingSection({ page_name: selectedPage })}>
                <Plus className="w-4 h-4 mr-2" />
                Custom Section
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {['Home', 'About', 'Contact'].map(page => (
              <Button
                key={page}
                variant={selectedPage === page ? 'default' : 'outline'}
                onClick={() => setSelectedPage(page)}
                size="sm"
              >
                {page}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-gray-500 mb-4">No sections yet</p>
              <Button onClick={() => setEditingSection({ page_name: selectedPage })}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`bg-white border rounded-lg p-4 ${!section.is_active ? 'opacity-50 bg-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                          {section.section_type}
                        </span>
                        {section.is_active ? (
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded">
                            ✗ Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{section.title || 'Untitled Section'}</h3>
                      <p className="text-sm text-gray-500">{section.description?.substring(0, 80)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newActiveState = !section.is_active;
                          console.log('Toggling section', section.id, 'to', newActiveState);
                          toggleActiveMutation.mutate({ id: section.id, is_active: newActiveState });
                        }}
                      >
                        {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log('Editing section:', section);
                          setEditingSection(section);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(section.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingSection && (
        <PageSectionEditor
          section={editingSection}
          onSave={(data) => {
            console.log('onSave called with:', data);
            saveMutation.mutate(data);
          }}
          isSaving={saveMutation.isPending}
          onClose={() => setEditingSection(null)}
        />
      )}

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Choose a Template</DialogTitle>
            <p className="text-gray-500">Select a pre-built section to add to your page</p>
          </DialogHeader>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {SECTION_TEMPLATES.map((template, idx) => {
              const Icon = template.icon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="cursor-pointer"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all h-full">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}