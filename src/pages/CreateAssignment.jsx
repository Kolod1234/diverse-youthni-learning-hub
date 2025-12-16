import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CreateAssignment() {
  const [formData, setFormData] = useState({ total_points: 100, is_published: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-assignments']);
      toast.success('Assignment created!');
      navigate(createPageUrl('TutorDashboard'));
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.course_id) {
      toast.error('Please fill required fields');
      return;
    }
    createMutation.mutate({
      ...formData,
      total_points: parseInt(formData.total_points) || 100,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Assignment</h1>

          <div className="space-y-4">
            <div>
              <Label>Course *</Label>
              <select 
                value={formData.course_id || ''} 
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md border"
              >
                <option value="">Select course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Assignment Title *</Label>
              <Input 
                value={formData.title || ''} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            <div>
              <Label>Instructions</Label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                rows={5}
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input 
                type="date"
                value={formData.due_date || ''} 
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
              />
            </div>

            <div>
              <Label>Total Points</Label>
              <Input 
                type="number"
                value={formData.total_points || ''} 
                onChange={(e) => setFormData({ ...formData, total_points: e.target.value })} 
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="published"
                checked={formData.is_published || false} 
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} 
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
              <Link to={createPageUrl('TutorDashboard')}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}