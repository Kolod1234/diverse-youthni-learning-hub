import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search, LayoutTemplate, Download } from 'lucide-react';

export default function TemplateSelector({ category, onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates-selector', category],
    queryFn: async () => {
      const filter = category ? { category } : {};
      return base44.entities.Template.filter(filter, '-usage_count', 50);
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = template.is_public || template.created_by === user?.email;
    return matchesSearch && matchesOwner;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-sm text-gray-500">Start with a pre-designed template</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates List */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="h-48 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const isOwner = template.created_by === user?.email;
                const slideCount = template.content?.slides?.length || 0;

                return (
                  <Card 
                    key={template.id} 
                    className="p-4 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-indigo-300"
                    onClick={() => onSelect(template)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LayoutTemplate className="w-10 h-10 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {template.description || 'No description'}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {template.is_public && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Public</Badge>
                          )}
                          {isOwner && (
                            <Badge variant="outline" className="text-xs">Mine</Badge>
                          )}
                          {slideCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {slideCount} slides
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Used {template.usage_count || 0} times</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(template);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Use This Template
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}