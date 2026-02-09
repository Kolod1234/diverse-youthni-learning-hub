import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Lightbulb, Sparkles, Loader, Beaker, BookOpen, Leaf, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import FactCard from '@/components/facts/FactCard.jsx';

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

  const getCategoryIcon = (category) => {
    const icons = { science: Beaker, history: BookOpen, nature: Leaf, technology: Zap };
    return icons[category] || Lightbulb;
  };

  const getStats = () => {
    return {
      total: facts.length,
      active: facts.filter(f => f.is_active).length,
      byCategory: ['science', 'history', 'nature', 'technology', 'general'].reduce((acc, cat) => {
        acc[cat] = facts.filter(f => f.category === cat).length;
        return acc;
      }, {})
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Facts Library</h1>
            <p className="text-gray-600">Manage engaging facts across multiple categories</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Fact
            </Button>
            <Button onClick={() => { resetForm(); setShowDialog(true); generateFactWithAI(); }} className="gap-2 bg-purple-600 hover:bg-purple-700" disabled={generatingFact}>
              <Sparkles className="w-4 h-4" />
              {generatingFact ? 'Fetching...' : 'Fetch from Sources'}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Total Facts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
            <p className="text-blue-600 text-sm font-medium">Science</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.byCategory.science}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
            <p className="text-purple-600 text-sm font-medium">History</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">{stats.byCategory.history}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
            <p className="text-green-600 text-sm font-medium">Nature</p>
            <p className="text-2xl font-bold text-green-700 mt-2">{stats.byCategory.nature}</p>
          </div>
        </motion.div>

        {/* Facts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {facts.length > 0 ? (
            facts.map((fact, index) => (
              <div key={fact.id} className="relative group">
                <FactCard fact={fact} index={index} />
                {/* Action buttons overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute top-4 right-4 flex gap-2"
                >
                  <Button size="sm" variant="outline" onClick={() => handleEdit(fact)} className="shadow-lg">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 shadow-lg" onClick={() => {
                    if (confirm('Delete this fact?')) deleteMutation.mutate(fact.id);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No facts yet. Create one or fetch from sources!</p>
            </motion.div>
          )}
        </motion.div>

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