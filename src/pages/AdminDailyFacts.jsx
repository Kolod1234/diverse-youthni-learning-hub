import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Lightbulb, Sparkles, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDailyFacts() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [formData, setFormData] = useState({
    fact: '',
    category: 'science',
    is_active: true
  });
  const [generatingFact, setGeneratingFact] = useState(false);

  const queryClient = useQueryClient();

  const { data: facts = [] } = useQuery({
    queryKey: ['daily-facts'],
    queryFn: () => base44.entities.DailyFact.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyFact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-facts']);
      setShowDialog(false);
      resetForm();
      toast.success('Fact added!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DailyFact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-facts']);
      setShowDialog(false);
      resetForm();
      toast.success('Fact updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DailyFact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-facts']);
      toast.success('Fact deleted');
    }
  });

  const handleSubmit = () => {
    if (!formData.fact) {
      toast.error('Fact is required');
      return;
    }

    if (editingFact) {
      updateMutation.mutate({ id: editingFact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (fact) => {
    setEditingFact(fact);
    setFormData({
      fact: fact.fact,
      category: fact.category,
      is_active: fact.is_active
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({ fact: '', category: 'science', is_active: true });
    setEditingFact(null);
  };

  const generateFactWithAI = async () => {
    setGeneratingFact(true);
    try {
      const result = await base44.functions.invoke('fetchDailyFactsFromSources');
      
      if (result.data.success) {
        queryClient.invalidateQueries(['daily-facts']);
        toast.success(`Added ${result.data.factsAdded} unique facts from ${result.data.sourcesAttempted} sources!`);
        setShowDialog(false);
      } else {
        toast.error('Failed to fetch facts from sources');
      }
    } catch (error) {
      toast.error('Failed to generate facts from sources');
      console.error(error);
    } finally {
      setGeneratingFact(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Facts</h1>
            <p className="text-gray-600">Manage educational facts</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-blue-600">
              <Plus className="w-4 h-4" />
              Add Fact
            </Button>
            <Button onClick={() => { resetForm(); setShowDialog(true); generateFactWithAI(); }} className="gap-2 bg-purple-600 hover:bg-purple-700" disabled={generatingFact}>
              <Sparkles className="w-4 h-4" />
              {generatingFact ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {facts.map((fact) => (
            <Card key={fact.id} className="p-6">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-yellow-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{fact.fact}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{fact.category}</span>
                    <span className={`text-xs px-2 py-1 rounded ${fact.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {fact.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(fact)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                    if (confirm('Delete this fact?')) deleteMutation.mutate(fact.id);
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
              <DialogTitle>{editingFact ? 'Edit Fact' : 'Add Fact'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Fact *</Label>
                <Textarea value={formData.fact} onChange={(e) => setFormData({ ...formData, fact: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Category</Label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="nature">Nature</option>
                  <option value="technology">Technology</option>
                  <option value="space">Space</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-blue-600">{editingFact ? 'Update' : 'Add'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}