import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Key, Copy, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonKeyManager() {
  const queryClient = useQueryClient();
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    course_id: '',
    lesson_id: '',
    assigned_to_email: '',
    key_count: 1
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('title', 500)
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('order', 1000)
  });

  const { data: keys = [] } = useQuery({
    queryKey: ['unlock-keys'],
    queryFn: () => base44.entities.LessonUnlockKey.list('-created_date', 500)
  });

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateLessonUnlockKey', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['unlock-keys']);
      toast.success(`Generated ${data.keys.length} key(s)`);
      setShowGenerator(false);
      setFormData({ course_id: '', lesson_id: '', assigned_to_email: '', key_count: 1 });
    },
    onError: () => {
      toast.error('Failed to generate keys');
    }
  });

  const handleGenerate = () => {
    if (!formData.course_id || !formData.lesson_id) {
      toast.error('Please select course and lesson');
      return;
    }
    generateMutation.mutate(formData);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Key copied to clipboard!');
  };

  const filteredKeys = keys.filter(key => {
    const matchesSearch = !searchQuery || 
      key.key_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.assigned_to_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'used' && key.is_used) ||
      (filterStatus === 'unused' && !key.is_used);
    return matchesSearch && matchesStatus;
  });

  const courseLessons = formData.course_id 
    ? lessons.filter(l => l.course_id === formData.course_id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lesson Unlock Keys</h2>
          <p className="text-gray-600">Generate and manage unlock keys for lessons</p>
        </div>
        <Button onClick={() => setShowGenerator(true)} className="bg-gradient-to-r from-orange-600 to-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Generate Keys
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Keys</option>
            <option value="unused">Unused</option>
            <option value="used">Used</option>
          </select>
        </div>
      </Card>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lesson</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredKeys.map((key) => {
                const lesson = lessons.find(l => l.id === key.lesson_id);
                const course = courses.find(c => c.id === key.course_id);
                
                return (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {key.key_code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lesson?.title || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{course?.title || 'Unknown Course'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {key.assigned_to_email ? (
                        <Badge variant="outline">{key.assigned_to_email}</Badge>
                      ) : (
                        <span className="text-gray-400">Anyone</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {key.is_used ? (
                        <Badge className="bg-green-100 text-green-700">Used</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">Unused</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {key.used_by || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.key_code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              Generate Unlock Keys
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Course *</Label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value, lesson_id: '' })}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              >
                <option value="">Select course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Lesson *</Label>
              <select
                value={formData.lesson_id}
                onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mt-1"
                disabled={!formData.course_id}
              >
                <option value="">Select lesson</option>
                {courseLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Assign to Student (optional)</Label>
              <Input
                value={formData.assigned_to_email}
                onChange={(e) => setFormData({ ...formData, assigned_to_email: e.target.value })}
                placeholder="student@email.com"
                type="email"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to create generic keys</p>
            </div>

            <div>
              <Label>Number of Keys</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.key_count}
                onChange={(e) => setFormData({ ...formData, key_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGenerator(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
              >
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}