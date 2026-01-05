import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Quote } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminQuotes() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    category: 'motivation',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.InspirationalQuote.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InspirationalQuote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotes']);
      setShowDialog(false);
      resetForm();
      toast.success('Quote added!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InspirationalQuote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotes']);
      setShowDialog(false);
      resetForm();
      toast.success('Quote updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InspirationalQuote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotes']);
      toast.success('Quote deleted');
    }
  });

  const handleSubmit = () => {
    if (!formData.quote || !formData.author) {
      toast.error('Quote and author are required');
      return;
    }

    if (editingQuote) {
      updateMutation.mutate({ id: editingQuote.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      quote: quote.quote,
      author: quote.author,
      category: quote.category,
      is_active: quote.is_active
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({ quote: '', author: '', category: 'motivation', is_active: true });
    setEditingQuote(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inspirational Quotes</h1>
            <p className="text-gray-600">Manage motivational quotes</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-amber-600">
            <Plus className="w-4 h-4" />
            Add Quote
          </Button>
        </div>

        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="p-6">
              <div className="flex items-start gap-4">
                <Quote className="w-8 h-8 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <blockquote className="text-lg font-medium text-gray-900 mb-2">"{quote.quote}"</blockquote>
                  <p className="text-sm text-gray-600 mb-2">— {quote.author}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{quote.category}</span>
                    <span className={`text-xs px-2 py-1 rounded ${quote.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {quote.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(quote)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                    if (confirm('Delete this quote?')) deleteMutation.mutate(quote.id);
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
              <DialogTitle>{editingQuote ? 'Edit Quote' : 'Add Quote'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Quote *</Label>
                <Textarea value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Author *</Label>
                <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="education">Education</option>
                  <option value="leadership">Leadership</option>
                  <option value="success">Success</option>
                  <option value="motivation">Motivation</option>
                  <option value="wisdom">Wisdom</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-amber-600">{editingQuote ? 'Update' : 'Add'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}