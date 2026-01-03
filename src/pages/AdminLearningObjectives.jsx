import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLearningObjectives() {
  const [updateResult, setUpdateResult] = useState(null);

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
      toast.success(`Successfully updated ${data.processed} lessons!`);
    },
    onError: (error) => {
      toast.error('Failed to update learning objectives');
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
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}