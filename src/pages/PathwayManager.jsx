import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BookOpen, GripVertical, Eye, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function PathwayManager() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPathway, setEditingPathway] = useState(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'gcse_books',
    cover_image: '',
    estimated_hours: 0,
    difficulty: 'beginner',
    tags: [],
    is_published: false
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: pathways = [] } = useQuery({
    queryKey: ['learning-pathways'],
    queryFn: () => base44.entities.LearningPathway.list('-created_date', 500)
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  const { data: pathwayResources = [] } = useQuery({
    queryKey: ['pathway-resources', selectedPathway?.id],
    queryFn: () => base44.entities.PathwayResource.filter({ pathway_id: selectedPathway.id }, 'order', 100),
    enabled: !!selectedPathway
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningPathway.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-pathways']);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Pathway created!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningPathway.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-pathways']);
      setShowCreateDialog(false);
      setEditingPathway(null);
      resetForm();
      toast.success('Pathway updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningPathway.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-pathways']);
      toast.success('Pathway deleted!');
    }
  });

  const addResourceMutation = useMutation({
    mutationFn: (data) => base44.entities.PathwayResource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pathway-resources']);
      toast.success('Resource added to pathway!');
    }
  });

  const removeResourceMutation = useMutation({
    mutationFn: (id) => base44.entities.PathwayResource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pathway-resources']);
      toast.success('Resource removed!');
    }
  });

  const updateResourceOrderMutation = useMutation({
    mutationFn: ({ id, order }) => base44.entities.PathwayResource.update(id, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pathway-resources']);
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }) => base44.entities.LearningPathway.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-pathways']);
      toast.success('Pathway visibility updated!');
    }
  });

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (editingPathway) {
      updateMutation.mutate({ id: editingPathway.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (pathway) => {
    setEditingPathway(pathway);
    setFormData({
      title: pathway.title,
      description: pathway.description || '',
      category: pathway.category,
      cover_image: pathway.cover_image || '',
      estimated_hours: pathway.estimated_hours || 0,
      difficulty: pathway.difficulty || 'beginner',
      tags: pathway.tags || [],
      is_published: pathway.is_published || false
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (pathway) => {
    if (confirm(`Delete "${pathway.title}"?`)) {
      deleteMutation.mutate(pathway.id);
    }
  };

  const handleAddResource = (resourceId) => {
    const maxOrder = pathwayResources.length > 0 ? Math.max(...pathwayResources.map(r => r.order)) : 0;
    addResourceMutation.mutate({
      pathway_id: selectedPathway.id,
      resource_id: resourceId,
      order: maxOrder + 1,
      is_required: true
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(pathwayResources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      if (item.order !== index + 1) {
        updateResourceOrderMutation.mutate({ id: item.id, order: index + 1 });
      }
    });
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'gcse_books',
      cover_image: '',
      estimated_hours: 0,
      difficulty: 'beginner',
      tags: [],
      is_published: false
    });
  };

  const canManage = user && (user.role === 'admin' || user.is_tutor);

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Access restricted to educators</p>
        </Card>
      </div>
    );
  }

  const availableResources = resources.filter(
    r => !pathwayResources.some(pr => pr.resource_id === r.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Pathways Manager</h1>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Create Pathway
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways.map((pathway) => (
            <Card key={pathway.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{pathway.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{pathway.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublishMutation.mutate({ id: pathway.id, is_published: !pathway.is_published })}
                >
                  {pathway.is_published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </Button>
              </div>

              {pathway.cover_image && (
                <img src={pathway.cover_image} alt={pathway.title} className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{pathway.difficulty}</Badge>
                {pathway.estimated_hours > 0 && (
                  <Badge variant="outline">{pathway.estimated_hours}h</Badge>
                )}
                <Badge variant={pathway.is_published ? 'default' : 'secondary'}>
                  {pathway.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPathway(pathway);
                    setShowResourceDialog(true);
                  }}
                  className="flex-1"
                >
                  Manage Resources
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleEdit(pathway)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(pathway)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {pathways.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pathways yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPathway ? 'Edit Pathway' : 'Create Pathway'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Pathway title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="gcse_books">GCSE Books</option>
                  <option value="a_level_books">A-Level Books</option>
                  <option value="youth_work">Youth Work</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                min="0"
              />
            </div>
            <div>
              <Label>Cover Image</Label>
              <Input type="file" accept="image/*" onChange={handleUploadCover} disabled={uploadingCover} />
              {formData.cover_image && (
                <img src={formData.cover_image} alt="Cover" className="mt-2 h-32 rounded" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                id="published"
              />
              <Label htmlFor="published">Publish (visible to students)</Label>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingPathway(null); resetForm(); }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {editingPathway ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Resources Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Resources - {selectedPathway?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 mt-4">
            {/* Current Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Pathway Resources ({pathwayResources.length})</h3>
              {pathwayResources.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pathway-resources">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {pathwayResources.map((pr, index) => {
                          const resource = resources.find(r => r.id === pr.resource_id);
                          if (!resource) return null;
                          return (
                            <Draggable key={pr.id} draggableId={pr.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{resource.title}</p>
                                    <p className="text-xs text-gray-500">{resource.author}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeResourceMutation.mutate(pr.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <p className="text-gray-500 text-sm">No resources added yet</p>
              )}
            </div>

            {/* Available Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available Resources ({availableResources.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableResources.map((resource) => (
                  <div key={resource.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{resource.title}</p>
                      <p className="text-xs text-gray-500">{resource.author}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddResource(resource.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}