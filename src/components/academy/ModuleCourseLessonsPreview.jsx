import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function ModuleCourseLessonsPreview({ module, onReorderLessons }) {
  const { data: lessons = [] } = useQuery({
    queryKey: ['module-lessons', module.course_ids],
    queryFn: async () => {
      const grouped = await Promise.all(
        (module.course_ids || []).map(async (courseId) => {
          const items = await base44.entities.Lesson.filter({ course_id: courseId }, 'order', 200);
          return { courseId, lessons: items };
        })
      );
      return grouped;
    },
    enabled: !!module?.course_ids?.length,
  });

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lessons.map((group) => (
        <Paper key={group.courseId} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Lessons</Typography>
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;
              onReorderLessons(group.courseId, result.source.index, result.destination.index, group.lessons);
            }}
          >
            <Droppable droppableId={`lessons-${group.courseId}`}>
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.lessons.map((lesson, index) => (
                    <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                      {(dragProvided) => (
                        <Paper
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white' }}
                        >
                          <Box {...dragProvided.dragHandleProps} sx={{ display: 'flex', color: 'text.secondary', cursor: 'grab' }}>
                            <GripVertical size={16} />
                          </Box>
                          <Typography variant="body2">{index + 1}. {lesson.title}</Typography>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      ))}
    </Box>
  );
}