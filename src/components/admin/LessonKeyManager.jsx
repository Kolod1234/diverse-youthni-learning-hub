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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const toggleKeyStatusMutation = useMutation({
    mutationFn: async ({ keyId, isActive }) => {
      await base44.entities.LessonUnlockKey.update(keyId, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['unlock-keys']);
      toast.success('Key status updated');
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId) => {
      await base44.entities.LessonUnlockKey.delete(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['unlock-keys']);
      toast.success('Key deleted');
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
      key.used_by_emails?.some(email => email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && key.is_active) ||
      (filterStatus === 'inactive' && !key.is_active);
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
             <SelectTrigger className="w-32">
               <SelectValue placeholder="Filter" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Keys</SelectItem>
               <SelectItem value="active">Active</SelectItem>
               <SelectItem value="inactive">Inactive</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </Card>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lesson</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
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
                    <td className="px-4 py-3">
                      {key.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Suspended</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          {key.used_by_emails?.length || 0}
                        </span>
                        {key.max_uses && <span className="text-gray-500">/{key.max_uses}</span>}
                        <span className="text-gray-500"> {key.used_by_emails?.length === 1 ? 'use' : 'uses'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key_code)}
                          title="Copy key"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyStatusMutation.mutate({ keyId: key.id, isActive: key.is_active })}
                          title={key.is_active ? 'Suspend key' : 'Activate key'}
                          className={key.is_active ? 'text-orange-600' : 'text-green-600'}
                        >
                          {key.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this key? This cannot be undone.')) {
                              deleteKeyMutation.mutate(key.id);
                            }
                          }}
                          className="text-red-600"
                          title="Delete key"
                        >
                          Delete
                        </Button>
                      </div>
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
              <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value, lesson_id: '' })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lesson *</Label>
              <Select value={formData.lesson_id} onValueChange={(value) => setFormData({ ...formData, lesson_id: value })} disabled={!formData.course_id}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {courseLessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <p className="text-xs text-gray-500 mt-1">Keys can be used by multiple students</p>
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