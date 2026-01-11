import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomeContent() {
  const [user, setUser] = useState(null);
  const [programDialog, setProgramDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [featureDialog, setFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const queryClient = useQueryClient();

  // Fetch programs section
  const { data: programs = [] } = useQuery({
    queryKey: ['page-sections-programs'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'programs' }, 'order', 50),
  });

  // Fetch features section
  const { data: features = [] } = useQuery({
    queryKey: ['page-sections-features'],
    queryFn: () => base44.entities.PageSection.filter({ page_name: 'Home', section_type: 'features' }, 'order', 50),
  });

  // Create/Update program mutation
  const saveProgramMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProgram) {
        await base44.entities.PageSection.update(editingProgram.id, data);
      } else {
        await base44.entities.PageSection.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections-programs']);
      setProgramDialog(false);
      setEditingProgram(null);
      toast.success('Program saved successfully');
    },
  });

  // Create/Update feature mutation
  const saveFeatureMutation = useMutation({
    mutationFn: async (data) => {
      if (editingFeature) {
        await base44.entities.PageSection.update(editingFeature.id, data);
      } else {
        await base44.entities.PageSection.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections-features']);
      setFeatureDialog(false);
      setEditingFeature(null);
      toast.success('Feature saved successfully');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageSection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections-programs']);
      queryClient.invalidateQueries(['page-sections-features']);
      toast.success('Deleted successfully');
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, order }) => base44.entities.PageSection.update(id, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries(['page-sections-programs']);
      queryClient.invalidateQueries(['page-sections-features']);
    },
  });

  const handleSubmitProgram = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveProgramMutation.mutate({
      page_name: 'Home',
      section_type: 'programs',
      title: formData.get('title'),
      description: formData.get('description'),
      image_url: formData.get('image_url'),
      link_url: formData.get('link_url'),
      order: editingProgram ? editingProgram.order : programs.length,
      is_active: true,
    });
  };

  const handleSubmitFeature = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveFeatureMutation.mutate({
      page_name: 'Home',
      section_type: 'features',
      title: formData.get('title'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color_from: formData.get('color_from'),
      color_to: formData.get('color_to'),
      order: editingFeature ? editingFeature.order : features.length,
      is_active: true,
    });
  };

  const moveItem = (items, index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    updateOrderMutation.mutate({ id: items[index].id, order: newIndex });
    updateOrderMutation.mutate({ id: items[newIndex].id, order: index });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Page Content Manager</h1>
          <p className="text-gray-600">Manage all sections on the home page</p>
        </div>

        <Tabs defaultValue="programs">
          <TabsList>
            <TabsTrigger value="programs">Programs Section</TabsTrigger>
            <TabsTrigger value="features">Features Section</TabsTrigger>
            <TabsTrigger value="carousels">Carousels</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Programs (GCSE, A-Levels, etc.)</h2>
              <Button onClick={() => { setEditingProgram(null); setProgramDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {programs.map((program, idx) => (
                <Card key={program.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{program.description}</p>
                      {program.image_url && (
                        <img src={program.image_url} alt={program.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                      )}
                      <p className="text-xs text-gray-500">Link: {program.link_url}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="icon" variant="ghost" onClick={() => moveItem(programs, idx, 'up')} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveItem(programs, idx, 'down')} disabled={idx === programs.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingProgram(program); setProgramDialog(true); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(program.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Why Choose Us Features</h2>
              <Button onClick={() => { setEditingFeature(null); setFeatureDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <Card key={feature.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-${feature.color_from} to-${feature.color_to} mb-3`}>
                        <span className="text-white font-bold">{feature.icon}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="icon" variant="ghost" onClick={() => moveItem(features, idx, 'up')} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveItem(features, idx, 'down')} disabled={idx === features.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingFeature(feature); setFeatureDialog(true); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(feature.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="carousels" className="mt-6">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Hero Carousel</h3>
                <p className="text-gray-600 mb-4">Managed in Admin Page Builder</p>
                <Button variant="outline" onClick={() => window.location.href = '/AdminPageBuilder'}>
                  Go to Page Builder
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Image Carousels</h3>
                <p className="text-gray-600 mb-4">Main carousel and Leadership carousel - managed in Admin Dashboard</p>
                <Button variant="outline" onClick={() => window.location.href = '/AdminDashboard'}>
                  Go to Admin Dashboard
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Program Dialog */}
      <Dialog open={programDialog} onOpenChange={setProgramDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProgram} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={editingProgram?.title} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={editingProgram?.description} rows={3} required />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" name="image_url" defaultValue={editingProgram?.image_url} placeholder="https://..." required />
            </div>
            <div>
              <Label htmlFor="link_url">Link URL (e.g., /Explore or /Programs)</Label>
              <Input id="link_url" name="link_url" defaultValue={editingProgram?.link_url} placeholder="/Explore" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setProgramDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog open={featureDialog} onOpenChange={setFeatureDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitFeature} className="space-y-4">
            <div>
              <Label htmlFor="f_title">Title</Label>
              <Input id="f_title" name="title" defaultValue={editingFeature?.title} required />
            </div>
            <div>
              <Label htmlFor="f_description">Description</Label>
              <Textarea id="f_description" name="description" defaultValue={editingFeature?.description} rows={3} required />
            </div>
            <div>
              <Label htmlFor="icon">Icon Text (emoji or letter)</Label>
              <Input id="icon" name="icon" defaultValue={editingFeature?.icon} placeholder="🎓" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_from">Gradient From (e.g., blue-500)</Label>
                <Input id="color_from" name="color_from" defaultValue={editingFeature?.color_from} placeholder="blue-500" required />
              </div>
              <div>
                <Label htmlFor="color_to">Gradient To (e.g., indigo-600)</Label>
                <Input id="color_to" name="color_to" defaultValue={editingFeature?.color_to} placeholder="indigo-600" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFeatureDialog(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}