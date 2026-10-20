import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MovieIcon from '@mui/icons-material/Movie';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Plus = _w(AddIcon), Sparkles = _w(AutoAwesomeIcon), Award = _w(EmojiEventsIcon), Users = _w(PeopleIcon);
const BookOpen = _w(MenuBookIcon), MessageCircle = _w(ChatBubbleOutlineIcon), LayoutGrid = _w(ViewModuleIcon);
const AlertCircle = _w(ErrorOutlineIcon), Film = _w(MovieIcon);
import { toast } from 'sonner';
import PageSectionEditor from '@/components/admin/PageSectionEditor';
import { motion, AnimatePresence } from 'framer-motion';
import LivePreview from '@/components/pagebuilder/LivePreview';
import SectionPreview from '@/components/pagebuilder/SectionPreview';
import UnsavedChangesModal from '@/components/pagebuilder/UnsavedChangesModal';
import PageSettings from '@/components/pagebuilder/PageSettings';

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
    icon: Film,
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
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [pendingPageChange, setPendingPageChange] = useState(null);
  const queryClient = useQueryClient();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast.info('Auto-saved');
      }
      if (e.key === 'Delete' && editingSection) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editingSection]);

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
      setHasUnsavedChanges(true);
      toast.success('Section deleted');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (sectionToDuplicate) => {
      const { id, created_date, updated_date, created_by, ...sectionData } = sectionToDuplicate;
      return base44.entities.PageSection.create({
        ...sectionData,
        title: `${sectionData.title} (Copy)`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      setHasUnsavedChanges(true);
      toast.success('Section duplicated');
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections) => {
      return Promise.all(
        reorderedSections.map((section, index) =>
          base44.entities.PageSection.update(section.id, { order: index })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      setHasUnsavedChanges(true);
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

  const handlePageChange = (newPage) => {
    if (hasUnsavedChanges) {
      setPendingPageChange(newPage);
      setShowUnsavedModal(true);
    } else {
      setSelectedPage(newPage);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(source.index, 1);
    reorderedSections.splice(destination.index, 0, movedSection);

    reorderMutation.mutate(reorderedSections);
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-full flex h-screen">
        {/* Left Panel - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-card border-b p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Page Builder
                  {hasUnsavedChanges && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-orange-500 rounded-full"
                      title="Unsaved changes"
                    />
                  )}
                </h1>
                <p className="text-muted-foreground text-sm">Edit and manage page sections</p>
              </div>
              <div className="flex gap-2">
                <PageSettings page={selectedPage} isDraft={isDraft} sections={sections} onUpdate={() => {}} />
                <Button
                  onClick={() => setShowTemplates(true)}
                  variant="outline"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button
                  onClick={() => setEditingSection({ page_name: selectedPage })}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>

            {/* Page Tabs */}
            <div className="flex gap-2 border-t pt-4">
              {['Home', 'About', 'Contact'].map(page => (
                <Button
                  key={page}
                  variant={selectedPage === page ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>

          {/* Sections Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : sections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-indigo-50 dark:bg-indigo-500/15 rounded-lg border-2 border-dashed border-border"
              >
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-4">No sections yet</p>
                <Button onClick={() => setEditingSection({ page_name: selectedPage })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Section
                </Button>
              </motion.div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <SectionPreview
                                  section={section}
                                  isDragging={snapshot.isDragging}
                                  onEdit={() => setEditingSection(section)}
                                  onDuplicate={() => duplicateMutation.mutate(section)}
                                  onDelete={() => deleteMutation.mutate(section.id)}
                                  onToggleActive={(active) =>
                                    toggleActiveMutation.mutate({ id: section.id, is_active: active })
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="hidden lg:flex w-[40%] bg-gray-900 overflow-hidden">
          <LivePreview sections={sections} deviceMode={deviceMode} onDeviceModeChange={setDeviceMode} />
        </div>
      </div>

      {editingSection && (
        <PageSectionEditor
          section={editingSection}
          onSave={(data) => {
            saveMutation.mutate(data);
            setHasUnsavedChanges(true);
          }}
          isSaving={saveMutation.isPending}
          onClose={() => setEditingSection(null)}
        />
      )}

      <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700 }}>Choose a Template</DialogTitle>
        <DialogContent>
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
                  <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all h-full">
                    <div className={`w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      <UnsavedChangesModal
        open={showUnsavedModal}
        onSave={() => {
          setShowUnsavedModal(false);
          setHasUnsavedChanges(false);
          if (pendingPageChange) {
            setSelectedPage(pendingPageChange);
            setPendingPageChange(null);
          }
        }}
        onDiscard={() => {
          setShowUnsavedModal(false);
          setHasUnsavedChanges(false);
          if (pendingPageChange) {
            setSelectedPage(pendingPageChange);
            setPendingPageChange(null);
          }
        }}
        onCancel={() => setShowUnsavedModal(false)}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}