import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, CheckCircle } from 'lucide-react';

export default function LessonScheduleManager({ lessons, onUpdateLesson }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dripDays, setDripDays] = useState(0);
  const [prerequisites, setPrerequisites] = useState([]);

  const handleSave = () => {
    if (!selectedLesson) return;
    
    onUpdateLesson(selectedLesson.id, {
      drip_schedule_days: dripDays,
      prerequisite_lesson_ids: prerequisites,
    });
    
    setSelectedLesson(null);
    setDripDays(0);
    setPrerequisites([]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lesson Access Control</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set drip schedules and prerequisites to control when students can access lessons
        </p>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedLesson?.id === lesson.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedLesson(lesson);
                setDripDays(lesson.drip_schedule_days || 0);
                setPrerequisites(lesson.prerequisite_lesson_ids || []);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    {lesson.drip_schedule_days > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Unlocks after {lesson.drip_schedule_days} days
                      </Badge>
                    )}
                    {lesson.prerequisite_lesson_ids?.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {lesson.prerequisite_lesson_ids.length} prerequisite(s)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedLesson && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Configure: {selectedLesson.title}
          </h3>

          <div className="space-y-6">
            {/* Drip Schedule */}
            <div>
              <Label htmlFor="drip-days">Drip Schedule (Days)</Label>
              <Input
                id="drip-days"
                type="number"
                min="0"
                value={dripDays}
                onChange={(e) => setDripDays(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Set to 0 for immediate access. Otherwise, lesson unlocks this many days after enrollment.
              </p>
            </div>

            {/* Prerequisites */}
            <div>
              <Label>Prerequisites</Label>
              <p className="text-sm text-gray-500 mb-3">
                Select lessons that must be completed before accessing this lesson
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lessons
                  .filter(l => l.id !== selectedLesson.id)
                  .map((lesson) => (
                    <label
                      key={lesson.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={prerequisites.includes(lesson.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPrerequisites([...prerequisites, lesson.id]);
                          } else {
                            setPrerequisites(prerequisites.filter(id => id !== lesson.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{lesson.title}</span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLesson(null);
                  setDripDays(0);
                  setPrerequisites([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}