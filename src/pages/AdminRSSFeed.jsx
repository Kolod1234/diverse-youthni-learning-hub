import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Rss, Plus, Pencil, Trash2, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminRSSFeed() {
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    image_url: '',
    published_date: new Date().toISOString().split('T')[0],
    category: '',
    is_featured: false,
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: feedItems = [] } = useQuery({
    queryKey: ['rss-feed-admin'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RSSFeed.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item created!');
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RSSFeed.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item updated!');
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RSSFeed.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item deleted!');
    },
  });

  const importFeedMutation = useMutation({
    mutationFn: async (source) => {
      const response = await base44.functions.invoke('importRSSFeeds', { source });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success(data.message || 'RSS feed imported successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import RSS feed');
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('cleanupOldNews', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success(data.message || 'Old news cleaned up successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cleanup old news');
    },
  });

  const handleOpenDialog = (feed = null) => {
    if (feed) {
      setEditingFeed(feed);
      setFormData({
        title: feed.title,
        description: feed.description,
        link: feed.link || '',
        image_url: feed.image_url || '',
        published_date: feed.published_date ? new Date(feed.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: feed.category || '',
        is_featured: feed.is_featured || false,
      });
    } else {
      setEditingFeed(null);
      setFormData({
        title: '',
        description: '',
        link: '',
        image_url: '',
        published_date: new Date().toISOString().split('T')[0],
        category: '',
        is_featured: false,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingFeed(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: result.file_url });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    const submitData = {
      ...formData,
      published_date: new Date(formData.published_date).toISOString(),
    };

    if (editingFeed) {
      updateMutation.mutate({ id: editingFeed.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">Admin Access Only</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">News & Announcements Manager</h1>
            <p className="text-gray-600">Import daily news or create custom announcements for your users</p>
            <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live news from 5 sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Custom announcements</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
              <Button 
                onClick={() => cleanupMutation.mutate()}
                disabled={cleanupMutation.isPending}
                variant="outline"
                className="border-red-600 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Old News
              </Button>
              <Button 
                onClick={() => {
                  const sources = ['bbc', 'bbceducation', 'cnn', 'ocnni', 'ukhomeoffice', 'migrantni', 'eani', 'deni', 'govuk', 'ukparliament'];
                  sources.forEach(source => importFeedMutation.mutate(source));
                }}
                disabled={importFeedMutation.isPending}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Refresh All News
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={importFeedMutation.isPending}>
                    <Download className="w-4 h-4 mr-2" />
                    Import Source
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('bbc')}>
                    BBC News
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('bbceducation')}>
                    BBC Education
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('cnn')}>
                    CNN
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('eani')}>
                    Education Authority NI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('deni')}>
                    Department of Education NI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('govuk')}>
                    Gov.uk Education
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('ukparliament')}>
                    UK Parliament Education
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('ocnni')}>
                    OCN NI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('ukhomeoffice')}>
                    UK Home Office
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => importFeedMutation.mutate('migrantni')}>
                    Migrant NI
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Announcement
              </Button>
            </div>
        </div>

        <div className="grid gap-4">
          {feedItems.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                        {item.is_featured && (
                          <Badge className="bg-yellow-400 text-gray-900">Featured</Badge>
                        )}
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View article
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Published: {format(new Date(item.published_date || item.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Delete this feed item?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {feedItems.length === 0 && (
          <Card className="p-12 text-center">
            <Rss className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feed Items Yet</h3>
            <p className="text-gray-600 mb-4">Create your first RSS feed item</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feed Item
            </Button>
          </Card>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingFeed ? 'Edit News Item' : 'Create Custom Announcement'}</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                {editingFeed ? 'Update news item details' : 'Share important updates with your users on the homepage'}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Feed item title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Feed item description..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (URL) {formData.category !== 'ANNOUNCEMENT' && <span className="text-red-500">*</span>}
                  {formData.category === 'ANNOUNCEMENT' && <span className="text-xs text-gray-500">(Optional for announcements)</span>}
                </label>
                <Input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="text-xs text-gray-500">Or paste an image URL:</div>
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select source...</option>
                    <option value="ANNOUNCEMENT">📢 Custom Announcement</option>
                    <option value="BBC">BBC News</option>
                    <option value="BBCEDUCATION">BBC Education</option>
                    <option value="CNN">CNN</option>
                    <option value="EANI">Education Authority NI</option>
                    <option value="DENI">Department of Education NI</option>
                    <option value="GOVUK">Gov.uk Education</option>
                    <option value="UKPARLIAMENT">UK Parliament Education</option>
                    <option value="OCNNI">OCN NI</option>
                    <option value="UKHOMEOFFICE">UK Home Office</option>
                    <option value="MIGRANTNI">Migrant NI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Published Date
                  </label>
                  <Input
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured item
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingFeed ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}