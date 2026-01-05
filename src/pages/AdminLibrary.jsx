import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLibrary() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'document',
    file_url: '',
    cover_image: '',
    author: '',
    tags: [],
    is_featured: false
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const queryClient = useQueryClient();

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LibraryResource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      setShowDialog(false);
      resetForm();
      toast.success('Resource added!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LibraryResource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      setShowDialog(false);
      resetForm();
      toast.success('Resource updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryResource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      toast.success('Resource deleted');
    }
  });

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url });
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.file_url) {
      toast.error('Title and file are required');
      return;
    }

    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      file_url: resource.file_url,
      cover_image: resource.cover_image || '',
      author: resource.author || '',
      tags: resource.tags || [],
      is_featured: resource.is_featured || false
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'document',
      file_url: '',
      cover_image: '',
      author: '',
      tags: [],
      is_featured: false
    });
    setEditingResource(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
            <p className="text-gray-600">Manage educational resources</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-indigo-600">
            <Plus className="w-4 h-4" />
            Add Resource
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              {resource.cover_image && (
                <img src={resource.cover_image} alt={resource.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{resource.description}</p>
                <p className="text-xs text-gray-500 mb-4">{resource.category}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                    if (confirm('Delete this resource?')) deleteMutation.mutate(resource.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Category</Label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="book">Book</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="research">Research</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>File * {uploadingFile && '(Uploading...)'}</Label>
                <Input type="file" onChange={handleUploadFile} disabled={uploadingFile} />
                {formData.file_url && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
              </div>
              <div>
                <Label>Cover Image</Label>
                <Input type="file" accept="image/*" onChange={handleUploadCover} />
                {formData.cover_image && <img src={formData.cover_image} alt="Cover" className="mt-2 h-24 rounded" />}
              </div>
              <div>
                <Label>Author</Label>
                <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={formData.tags.join(', ')} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                <Label>Featured</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} disabled={uploadingFile} className="flex-1 bg-indigo-600">
                  {editingResource ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}