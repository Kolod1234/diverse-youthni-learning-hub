import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutTemplate, Plus, Search, Trash2, Eye, Copy, 
  Filter, Star, FileText, Award, ClipboardList, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import TemplateCreator from '@/components/templates/TemplateCreator';
import TemplatePreview from '@/components/templates/TemplatePreview';
import AITemplateGenerator from '@/components/templates/AITemplateGenerator';

const CATEGORY_CONFIG = {
  lesson: { icon: FileText, color: 'bg-blue-100 text-blue-700', label: 'Lesson' },
  slide: { icon: LayoutTemplate, color: 'bg-purple-100 text-purple-700', label: 'Slide' },
  assignment: { icon: ClipboardList, color: 'bg-green-100 text-green-700', label: 'Assignment' },
  quiz: { icon: Award, color: 'bg-yellow-100 text-yellow-700', label: 'Quiz' },
  custom: { icon: Star, color: 'bg-pink-100 text-pink-700', label: 'Custom' }
};

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreator, setShowCreator] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', selectedCategory],
    queryFn: async () => {
      const filter = selectedCategory === 'all' ? {} : { category: selectedCategory };
      return base44.entities.Template.filter(filter, '-created_date', 100);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template deleted');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (template) => base44.entities.Template.create({
      ...template,
      name: `${template.name} (Copy)`,
      usage_count: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Template duplicated');
    },
  });

  const useTemplateMutation = useMutation({
    mutationFn: (id) => {
      const template = templates.find(t => t.id === id);
      return base44.entities.Template.update(id, {
        usage_count: (template?.usage_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = template.is_public || template.created_by === user?.email;
    return matchesSearch && matchesOwner;
  });

  const handleUseTemplate = (template) => {
    useTemplateMutation.mutate(template.id);
    // Navigate to appropriate page based on category
    if (template.category === 'lesson') {
      localStorage.setItem('pendingTemplate', JSON.stringify(template));
      window.location.href = '/TutorCourseManager';
    }
    toast.success('Template loaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <LayoutTemplate className="w-6 h-6 text-indigo-600" />
              </div>
              Template Library
            </h1>
            <p className="text-gray-500 mt-2">Save and reuse your best content layouts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAIGenerator(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button 
              onClick={() => setShowCreator(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">Create your first template to get started</p>
            <Button onClick={() => setShowCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const config = CATEGORY_CONFIG[template.category];
              const Icon = config.icon;
              const isOwner = template.created_by === user?.email;

              return (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                    {template.thumbnail_url ? (
                      <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-16 h-16 text-indigo-300" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    {template.is_public && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-100 text-green-700">Public</Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description || 'No description'}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Used {template.usage_count || 0} times</span>
                      <span>By {isOwner ? 'You' : template.created_by}</span>
                    </div>

                    {/* Tags */}
                    {template.tags?.length > 0 && (
                      <div className="flex gap-1 mb-4 flex-wrap">
                        {template.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateMutation.mutate(template)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Delete this template?')) {
                              deleteMutation.mutate(template.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Creator Modal */}
      {showCreator && (
        <TemplateCreator
          onClose={() => setShowCreator(false)}
          onSave={() => {
            queryClient.invalidateQueries(['templates']);
            setShowCreator(false);
          }}
        />
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            handleUseTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}

      {/* AI Template Generator */}
      {showAIGenerator && (
        <AITemplateGenerator
          onClose={() => setShowAIGenerator(false)}
          onTemplateGenerated={() => {
            queryClient.invalidateQueries(['templates']);
            setShowAIGenerator(false);
          }}
        />
      )}
    </div>
  );
}