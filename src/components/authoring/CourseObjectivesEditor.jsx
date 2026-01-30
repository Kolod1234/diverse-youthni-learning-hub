import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function CourseObjectivesEditor({ courseId, lessons, onUpdate }) {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (lessonId, objs) => {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        await base44.entities.Lesson.update(lessonId, {
          learning_objectives: objs,
        });
      }
    },
  });

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(selectedLessonId, objectives);
      onUpdate();
      alert('Learning objectives saved');
    } catch (error) {
      alert('Error saving objectives: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Lesson Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Lesson</label>
        <select
          value={selectedLessonId}
          onChange={(e) => {
            setSelectedLessonId(e.target.value);
            const lesson = lessons.find(l => l.id === e.target.value);
            setObjectives(lesson?.learning_objectives || []);
          }}
          className="w-full border border-input rounded-md p-2"
        >
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {/* Add Objective */}
      <div className="flex gap-2">
        <Input
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
          placeholder="e.g., Understand key mathematical principles"
          className="flex-1"
        />
        <Button onClick={handleAddObjective} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Objectives List */}
      <div className="space-y-2">
        {objectives.map((objective, index) => (
          <Card key={index}>
            <CardContent className="pt-4 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm">{objective}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveObjective(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {objectives.length === 0 && (
          <p className="text-gray-500 text-sm italic">No learning objectives added yet</p>
        )}
      </div>

      {/* Save Button */}
      {objectives.length > 0 && (
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Objectives'}
        </Button>
      )}
    </div>
  );
}