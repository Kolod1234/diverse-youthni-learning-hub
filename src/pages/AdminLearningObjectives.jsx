import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Plus, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLearningObjectives() {
  const [updateResult, setUpdateResult] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [manualObjectives, setManualObjectives] = useState([]);
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('created_date', 500)
  });

  const lessonsWithoutObjectives = lessons.filter(l => 
    !l.learning_objectives || l.learning_objectives.length === 0
  );

  const updateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateLearningObjectives', {});
      return response.data;
    },
    onSuccess: (data) => {
      setUpdateResult(data);
      queryClient.invalidateQueries(['all-lessons']);
      toast.success(`Successfully updated ${data.processed} lessons!`);
    },
    onError: (error) => {
      toast.error('Failed to update learning objectives');
      console.error(error);
    }
  });

  const saveManualMutation = useMutation({
    mutationFn: async ({ lessonId, objectives }) => {
      await base44.entities.Lesson.update(lessonId, {
        learning_objectives: objectives
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      setEditingLesson(null);
      setManualObjectives([]);
      toast.success('Learning objectives saved!');
    },
    onError: (error) => {
      toast.error('Failed to save objectives');
      console.error(error);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Objectives Manager</h1>
          <p className="text-gray-600">Update CCEA-aligned learning objectives for all lessons</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Status Overview</h2>
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-600">{lessons.length}</span> total lessons
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-orange-600">{lessonsWithoutObjectives.length}</span> lessons need objectives
              </p>
            </div>
            <Button
              onClick={() => updateAllMutation.mutate()}
              disabled={updateAllMutation.isPending || lessonsWithoutObjectives.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
              size="lg"
            >
              {updateAllMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Update All Learning Objectives
                </>
              )}
            </Button>
          </div>

          {lessonsWithoutObjectives.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">All lessons have learning objectives!</p>
            </div>
          )}
        </Card>

        {updateResult && (
          <Card className="p-6 mb-6 border-green-200 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Update Complete
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Total lessons processed:</span> {updateResult.total_lessons}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Successfully updated:</span> {updateResult.processed}
              </p>
              {updateResult.failed > 0 && (
                <p className="text-red-600">
                  <span className="font-semibold">Failed:</span> {updateResult.failed}
                </p>
              )}
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4 gap-2"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons Without Objectives</h3>
          {lessonsWithoutObjectives.length === 0 ? (
            <p className="text-gray-500 text-center py-8">All lessons have learning objectives! 🎉</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lessonsWithoutObjectives.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                    <p className="text-xs text-gray-500 truncate">{lesson.course_id}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingLesson(lesson);
                      setManualObjectives(lesson.learning_objectives || ['']);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Manual Objectives Editor Dialog */}
      <Dialog open={!!editingLesson} onOpenChange={() => {
        setEditingLesson(null);
        setManualObjectives([]);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Learning Objectives: {editingLesson?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {manualObjectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2">
                <Textarea
                  value={obj}
                  onChange={(e) => {
                    const updated = [...manualObjectives];
                    updated[idx] = e.target.value;
                    setManualObjectives(updated);
                  }}
                  placeholder={`Learning objective ${idx + 1}`}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setManualObjectives(manualObjectives.filter((_, i) => i !== idx));
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setManualObjectives([...manualObjectives, ''])}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Objective
            </Button>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setEditingLesson(null);
                  setManualObjectives([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const filtered = manualObjectives.filter(o => o.trim());
                  if (filtered.length === 0) {
                    toast.error('Please add at least one objective');
                    return;
                  }
                  saveManualMutation.mutate({
                    lessonId: editingLesson.id,
                    objectives: filtered
                  });
                }}
                disabled={saveManualMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {saveManualMutation.isPending ? 'Saving...' : 'Save Objectives'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}