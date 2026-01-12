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
    id: 'hero_carousel',
    name: 'Hero Carousel',
    icon: LayoutGrid,
    color: 'from-blue-500 to-purple-600',
    description: 'Full-width hero section with animated carousel',
    default: {
      section_type: 'hero_carousel',
      title: 'Hero Carousel',
      is_active: true,
      carousel_items: [
        {
          image_url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=2400',
          badge: 'ONLINE LEARNING',
          title: 'Transform Your Future',
          subtitle: 'Learn at Your Own Pace',
          description: 'Access world-class courses from anywhere',
          cta_text: 'GET STARTED',
          cta_link: '/explore'
        }
      ]
    }
  },
  {
    id: 'success_stories',
    name: 'Success Stories',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    description: 'Showcase student success stories and testimonials',
    default: {
      section_type: 'success_stories',
      title: 'Success Stories',
      description: 'Real stories from our community',
      is_active: true,
      story1_category: 'Student Achievement',
      story1_tag: 'SUCCESS',
      story1_tag_color: 'bg-green-600',
      story1_title: 'From Beginner to Expert',
      story1_description: 'How one student transformed their career',
      story1_bg_color: 'from-gray-900 via-green-950 to-gray-900',
      story2_category: 'Career Growth',
      story2_tag: 'FEATURED',
      story2_tag_color: 'bg-blue-600',
      story2_title: 'Landing Dream Job',
      story2_description: 'Success story of career transition',
      story2_bg_color: 'from-gray-900 via-blue-950 to-gray-900',
      story3_category: 'Skills Development',
      story3_tag: 'INSPIRING',
      story3_tag_color: 'bg-purple-600',
      story3_title: 'Mastering New Skills',
      story3_description: 'Journey of continuous learning',
      story3_bg_color: 'from-gray-900 via-purple-950 to-gray-900'
    }
  },
  {
    id: 'features',
    name: 'Features Grid',
    icon: Sparkles,
    color: 'from-green-500 to-teal-600',
    description: 'Highlight key platform features in a grid',
    default: {
      section_type: 'features',
      title: 'Why Choose Us',
      is_active: true,
      features: [
        {
          icon: '🎓',
          title: 'Expert Instructors',
          description: 'Learn from industry professionals',
          color_from: 'blue-500',
          color_to: 'purple-600'
        },
        {
          icon: '⚡',
          title: 'Interactive Learning',
          description: 'Hands-on projects and exercises',
          color_from: 'green-500',
          color_to: 'teal-600'
        },
        {
          icon: '🏆',
          title: 'Certificates',
          description: 'Earn recognized certifications',
          color_from: 'orange-500',
          color_to: 'red-600'
        },
        {
          icon: '💬',
          title: '24/7 Support',
          description: 'Get help whenever you need it',
          color_from: 'pink-500',
          color_to: 'rose-600'
        }
      ]
    }
  },
  {
    id: 'solutions',
    name: 'Solutions Cards',
    icon: Target,
    color: 'from-indigo-500 to-blue-600',
    description: 'Display solutions or services in card layout',
    default: {
      section_type: 'solutions',
      title: 'Solutions for Every Need',
      description: 'Comprehensive programs designed for success',
      is_active: true,
      card1_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      card1_title: 'For Students',
      card1_description: 'Complete curriculum for academic success',
      card1_link: '/explore',
      card2_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      card2_title: 'For Professionals',
      card2_description: 'Advance your career with expert training',
      card2_link: '/explore',
      card3_image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      card3_title: 'For Teams',
      card3_description: 'Corporate training programs',
      card3_link: '/explore',
      card4_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      card4_title: 'For Educators',
      card4_description: 'Tools and resources for teaching',
      card4_link: '/explore'
    }
  },
  {
    id: 'leadership_cta',
    name: 'Leadership CTA',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    description: 'Call-to-action for leadership programs',
    default: {
      section_type: 'leadership_cta',
      title: 'Join Our Leadership Programme',
      description: 'Develop essential skills and become a leader in your field',
      badge_text: 'Limited Spots Available',
      cta_text: 'Apply Now',
      cta_link: '/programs',
      is_active: true
    }
  },
  {
    id: 'cta_section',
    name: 'Final CTA',
    icon: Zap,
    color: 'from-rose-500 to-pink-600',
    description: 'Powerful final call-to-action section',
    default: {
      section_type: 'cta_section',
      title: 'Ready to Transform Your Future?',
      subtitle: 'Join Thousands of Successful Learners',
      description: 'Start your learning journey today and unlock your full potential',
      badge_text: 'Start Learning Today',
      cta1_text: 'Browse Courses',
      cta1_link: '/explore',
      cta2_text: 'Learn More',
      cta2_link: '/about',
      is_active: true
    }
  },
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
    id: 'programs',
    name: 'Programs Section',
    icon: MessageCircle,
    color: 'from-emerald-500 to-green-600',
    description: 'Display educational programs',
    default: {
      section_type: 'programs',
      title: 'Our Programs',
      description: 'Comprehensive learning paths for everyone',
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
      link_url: '/programs',
      is_active: true
    }
  },
  {
    id: 'about_us',
    name: 'About Us',
    icon: Info,
    color: 'from-slate-500 to-gray-600',
    description: 'Tell your story with mission, vision, and team',
    default: {
      section_type: 'about_us',
      title: 'About Us',
      subtitle: 'Our Story',
      description: 'We are dedicated to transforming education through innovative learning experiences. Our platform connects students with expert instructors worldwide.',
      mission_title: 'Our Mission',
      mission_text: 'To make quality education accessible to everyone, everywhere.',
      vision_title: 'Our Vision',
      vision_text: 'A world where learning has no boundaries.',
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
      bg_color: '#ffffff',
      text_color: '#1f2937',
      accent_color: '#4f46e5',
      font_family: 'system',
      is_active: true
    }
  },
  {
    id: 'contact_form',
    name: 'Contact Form',
    icon: Mail,
    color: 'from-red-500 to-rose-600',
    description: 'Contact form with custom fields',
    default: {
      section_type: 'contact_form',
      title: 'Get In Touch',
      subtitle: 'Contact Us',
      description: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
      form_fields: ['name', 'email', 'subject', 'message'],
      submit_text: 'Send Message',
      success_message: 'Thank you! We\'ll get back to you soon.',
      bg_color: '#f9fafb',
      text_color: '#1f2937',
      button_color: '#4f46e5',
      font_family: 'system',
      show_info: true,
      info_email: 'contact@example.com',
      info_phone: '+1 234 567 890',
      info_address: '123 Education Street, Learning City',
      is_active: true
    }
  },
  {
    id: 'blog_listing',
    name: 'Blog Listing',
    icon: FileText,
    color: 'from-yellow-500 to-amber-600',
    description: 'Display blog posts in grid or list layout',
    default: {
      section_type: 'blog_listing',
      title: 'Latest From Our Blog',
      subtitle: 'News & Updates',
      description: 'Stay updated with the latest news, tips, and insights from our community.',
      layout: 'grid',
      posts_per_page: 6,
      show_categories: true,
      show_author: true,
      show_date: true,
      show_excerpt: true,
      bg_color: '#ffffff',
      text_color: '#1f2937',
      accent_color: '#f59e0b',
      font_family: 'system',
      is_active: true
    }
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: Star,
    color: 'from-pink-500 to-fuchsia-600',
    description: 'Showcase customer reviews and testimonials',
    default: {
      section_type: 'testimonials',
      title: 'What Our Students Say',
      subtitle: 'Testimonials',
      description: 'Real feedback from our community',
      layout: 'carousel',
      bg_color: '#faf5ff',
      text_color: '#1f2937',
      accent_color: '#d946ef',
      font_family: 'system',
      testimonials: [
        {
          name: 'Sarah Johnson',
          role: 'Marketing Manager',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          rating: 5,
          text: 'This platform transformed my career. The courses are engaging and the instructors are top-notch!',
          company: 'Tech Corp'
        },
        {
          name: 'Michael Chen',
          role: 'Software Engineer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 5,
          text: 'Best investment I\'ve made in my professional development. Highly recommend!',
          company: 'StartupXYZ'
        },
        {
          name: 'Emily Rodriguez',
          role: 'UX Designer',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          rating: 5,
          text: 'The learning experience is exceptional. I\'ve gained skills that directly apply to my work.',
          company: 'Design Studio'
        }
      ],
      is_active: true
    }
  }
];

export default function AdminPageBuilder() {
  const [selectedPage, setSelectedPage] = useState('Home');
  const [editingSection, setEditingSection] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['page-sections', selectedPage],
    queryFn: () => base44.entities.PageSection.filter({ page_name: selectedPage }, 'order', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections']);
      toast.success('Section deleted');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PageSection.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections']);
      toast.success('Section updated');
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections) => {
      await Promise.all(
        reorderedSections.map((section, index) =>
          base44.entities.PageSection.update(section.id, { order: index })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections']);
      toast.success('Order updated');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderMutation.mutate(items);
  };

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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border rounded-lg p-4 ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${!section.is_active ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                    {section.section_type}
                                  </span>
                                  {!section.is_active && (
                                    <span className="text-xs text-gray-500">(Hidden)</span>
                                  )}
                                </div>
                                <h3 className="font-semibold">{section.title || 'Untitled Section'}</h3>
                                <p className="text-sm text-gray-500">{section.subtitle || section.content?.substring(0, 100)}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleActiveMutation.mutate({ 
                                    id: section.id, 
                                    is_active: !section.is_active 
                                  })}
                                >
                                  {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingSection(section)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {editingSection && (
        <PageSectionEditor
          section={editingSection}
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