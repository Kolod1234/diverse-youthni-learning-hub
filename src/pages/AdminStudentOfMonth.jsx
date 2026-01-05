import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Trophy, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudentOfMonth() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_avatar: '',
    month: '',
    achievement: '',
    testimonial: '',
    is_current: false
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['student-of-month'],
    queryFn: () => base44.entities.StudentOfMonth.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentOfMonth.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-of-month']);
      setShowDialog(false);
      resetForm();
      toast.success('Student added!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StudentOfMonth.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-of-month']);
      setShowDialog(false);
      resetForm();
      toast.success('Student updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StudentOfMonth.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-of-month']);
      toast.success('Student removed');
    }
  });

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, student_avatar: file_url });
      toast.success('Avatar uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.student_name || !formData.month || !formData.achievement) {
      toast.error('Name, month, and achievement are required');
      return;
    }

    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_name: student.student_name,
      student_email: student.student_email || '',
      student_avatar: student.student_avatar || '',
      month: student.month,
      achievement: student.achievement,
      testimonial: student.testimonial || '',
      is_current: student.is_current
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      student_name: '',
      student_email: '',
      student_avatar: '',
      month: '',
      achievement: '',
      testimonial: '',
      is_current: false
    });
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student of the Month</h1>
            <p className="text-gray-600">Recognize outstanding students</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-yellow-600">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {students.map((student) => (
            <Card key={student.id} className={`p-6 ${student.is_current ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}>
              <div className="flex items-start gap-4">
                <img src={student.student_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.student_name)}`} alt={student.student_name} className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{student.student_name}</h3>
                    {student.is_current && <Trophy className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{student.month}</p>
                  <p className="text-sm text-gray-700">{student.achievement}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                    if (confirm('Remove this student?')) deleteMutation.mutate(student.id);
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
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student of Month'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Student Name *</Label>
                <Input value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} />
              </div>
              <div>
                <Label>Student Email</Label>
                <Input type="email" value={formData.student_email} onChange={(e) => setFormData({ ...formData, student_email: e.target.value })} />
              </div>
              <div>
                <Label>Avatar</Label>
                <Input type="file" accept="image/*" onChange={handleUploadAvatar} />
                {formData.student_avatar && <img src={formData.student_avatar} alt="Avatar" className="mt-2 h-16 w-16 rounded-full" />}
              </div>
              <div>
                <Label>Month *</Label>
                <Input value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} placeholder="e.g., January 2026" />
              </div>
              <div>
                <Label>Achievement *</Label>
                <Textarea value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Testimonial</Label>
                <Textarea value={formData.testimonial} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })} />
                <Label>Current Student of Month</Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-yellow-600">{editingStudent ? 'Update' : 'Add'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}