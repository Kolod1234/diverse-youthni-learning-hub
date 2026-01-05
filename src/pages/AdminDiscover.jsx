import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDiscover() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'announcement',
    image_url: '',
    link: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: content = [] } = useQuery({
    queryKey: ['discover-content'],
    queryFn: () => base44.entities.DiscoverContent.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiscoverContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discover-content']);
      setShowDialog(false);
      resetForm();
      toast.success('Content added!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiscoverContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discover-content']);
      setShowDialog(false);
      resetForm();
      toast.success('Content updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscoverContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['discover-content']);
      toast.success('Content deleted');
    }
  });

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      image_url: item.image_url || '',
      link: item.link || '',
      is_active: item.is_active
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'announcement', image_url: '', link: '', is_active: true });
    setEditingContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Content</h1>
            <p className="text-gray-600">Manage tech news, gossips, and announcements</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-purple-600">
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>

        <div className="space-y-4">
          {content.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-24 h-24 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{item.category.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                    if (confirm('Delete this content?')) deleteMutation.mutate(item.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Edit Content' : 'Add Content'}</DialogTitle>
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
                  <option value="tech_news">Tech News</option>
                  <option value="gossip">Gossip</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={handleUploadImage} />
                {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 h-24 rounded" />}
              </div>
              <div>
                <Label>Link (optional)</Label>
                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-purple-600">{editingContent ? 'Update' : 'Add'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}