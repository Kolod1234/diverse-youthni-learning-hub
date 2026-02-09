import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CurriculumImporter({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    examBoard: '',
    subject: '',
    courseLevel: 'GCSE',
    courseType: 'Academic'
  });
  const [importResult, setImportResult] = useState(null);

  const importMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('importCurriculum', data);
      return response.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries(['all-courses']);
      queryClient.invalidateQueries(['all-lessons']);
      toast.success(`Imported ${data.stats.lessons} lessons successfully!`);
    },
    onError: (error) => {
      toast.error('Failed to import curriculum');
      console.error(error);
    }
  });

  const handleImport = () => {
    if (!formData.examBoard || !formData.subject) {
      toast.error('Please fill in exam board and subject');
      return;
    }
    
    if (confirm(`Import ${formData.examBoard} ${formData.subject} ${formData.courseLevel} curriculum? This will search official websites and create course structure.`)) {
      setImportResult(null);
      importMutation.mutate(formData);
    }
  };

  const examBoards = [
    'CCEA', 'AQA', 'Edexcel', 'OCR', 'WJEC',
    'ILM', 'OCN', 'City & Guilds', 'BTEC', 'Pearson'
  ];

  const subjects = [
    'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Business Studies',
    'Economics', 'Psychology', 'Sociology', 'Health & Social Care',
    'Engineering', 'Leadership', 'Management', 'Youth Work'
  ];

  const levels = ['GCSE', 'A-Level', 'AS-Level', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Foundation'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Import Course Curriculum
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              This tool searches official curriculum websites (CCEA, AQA, Edexcel, OCN, ILM, etc.) 
              and automatically creates course structure with units, topics, lessons, and learning objectives.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Exam Board / Organization *</Label>
              <Select value={formData.examBoard} onValueChange={(value) => setFormData({ ...formData, examBoard: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select exam board" />
                </SelectTrigger>
                <SelectContent>
                  {examBoards.map(board => (
                    <SelectItem key={board} value={board}>{board}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={formData.examBoard}
                onChange={(e) => setFormData({ ...formData, examBoard: e.target.value })}
                placeholder="Or type custom..."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Subject / Course *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Or type custom..."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Level</Label>
              <Select value={formData.courseLevel} onValueChange={(value) => setFormData({ ...formData, courseLevel: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.courseType} onValueChange={(value) => setFormData({ ...formData, courseType: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Vocational">Vocational</SelectItem>
                  <SelectItem value="Professional">Professional (CPD/ILM)</SelectItem>
                  <SelectItem value="Youth Work">Youth Work (OCN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={importMutation.isPending || !formData.examBoard || !formData.subject}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
          >
            {importMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Searching and Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Curriculum
              </>
            )}
          </Button>

          {importResult && (
            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Import Successful!</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Course:</strong> {importResult.course_title}</p>
                    <p><strong>Units:</strong> {importResult.stats.units}</p>
                    <p><strong>Topics:</strong> {importResult.stats.topics}</p>
                    <p><strong>Lessons Created:</strong> {importResult.stats.lessons}</p>
                  </div>
                </div>
              </div>

              {importResult.sample_lessons && importResult.sample_lessons.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Sample Lessons:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.sample_lessons.map((lesson, idx) => (
                      <div key={idx} className="text-xs bg-white rounded p-2 border">
                        <p className="font-medium text-gray-900">{lesson.lesson}</p>
                        <p className="text-gray-600">{lesson.unit} → {lesson.topic}</p>
                        <p className="text-green-600">{lesson.objectives_count} objectives</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}