import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import PageSectionEditor from '@/components/admin/PageSectionEditor';

export default function AdminPageBuilder() {
  const [selectedPage, setSelectedPage] = useState('Home');
  const [editingSection, setEditingSection] = useState(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Page Builder</h1>
              <p className="text-gray-500">Build and customize your pages</p>
            </div>
            <Button onClick={() => setEditingSection({ page_name: selectedPage })}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
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
    </div>
  );
}