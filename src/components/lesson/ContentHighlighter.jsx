import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Highlighter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = [
  { name: 'yellow', class: 'bg-yellow-200', label: 'Yellow' },
  { name: 'green', class: 'bg-green-200', label: 'Green' },
  { name: 'blue', class: 'bg-blue-200', label: 'Blue' },
  { name: 'pink', class: 'bg-pink-200', label: 'Pink' },
  { name: 'purple', class: 'bg-purple-200', label: 'Purple' },
];

export default function ContentHighlighter({ lessonId, contentRef }) {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [isEnabled, setIsEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights', lessonId],
    queryFn: () => base44.entities.LessonHighlight.filter({ lesson_id: lessonId }),
  });

  const createHighlightMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonHighlight.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['highlights', lessonId]);
      toast.success('Text highlighted!');
    },
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: (id) => base44.entities.LessonHighlight.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['highlights', lessonId]);
      toast.success('Highlight removed');
    },
  });

  useEffect(() => {
    if (!contentRef?.current || !isEnabled) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0) {
        createHighlightMutation.mutate({
          lesson_id: lessonId,
          text: text,
          color: selectedColor,
        });
        selection.removeAllRanges();
      }
    };

    const element = contentRef.current;
    element.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isEnabled, selectedColor, lessonId]);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Highlighter className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold">Text Highlighter</span>
        </div>
        <Button
          size="sm"
          variant={isEnabled ? 'default' : 'outline'}
          onClick={() => setIsEnabled(!isEnabled)}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>

      {isEnabled && (
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`w-8 h-8 rounded ${color.class} ${
                selectedColor === color.name ? 'ring-2 ring-gray-600' : ''
              }`}
              title={color.label}
            />
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="text-sm font-medium text-gray-600">Your Highlights</div>
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded text-sm"
            >
              <div className="flex-1">
                <span className={`px-1 ${COLORS.find(c => c.name === highlight.color)?.class}`}>
                  {highlight.text.substring(0, 50)}...
                </span>
              </div>
              <button
                onClick={() => deleteHighlightMutation.mutate(highlight.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}