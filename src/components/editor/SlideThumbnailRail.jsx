import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { sanitizeHtml } from '@/components/security/SafeHtml';
/**
 * SlideThumbnailRail
 * ------------------
 * Pure presentational rail used by SlideEditor in TWO places (desktop sidebar
 * AND mobile Sheet drawer). It owns NO slide state — selection, reorder,
 * duplicate and delete all delegate up to the parent SlideEditor so the
 * single source of truth (`slides` + `currentSlide`) stays intact.
 *
 * Props:
 *   slides        — current slide array
 *   currentSlide  — active slide index
 *   onSelect(i)   — set the active slide
 *   onDragEnd(r)  — react-beautiful-dnd compatible drag result handler
 *   onDuplicate(i)— duplicate slide at index i
 *   onDelete(i)   — delete slide at index i (caller handles confirm)
 */
export default function SlideThumbnailRail({
  slides = [],
  currentSlide = 0,
  onSelect,
  onDragEnd,
  onDuplicate,
  onDelete,
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="slides">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="p-3 space-y-2"
          >
            {slides.map((slide, index) => (
              <Draggable key={index} draggableId={`slide-${index}`} index={index}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    role="button"
                    tabIndex={0}
                    aria-current={currentSlide === index ? 'true' : undefined}
                    aria-label={`Open ${slide.title || `Slide ${index + 1}`}`}
                    className={`group relative cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      currentSlide === index
                        ? 'ring-2 ring-indigo-500'
                        : 'hover:ring-2 hover:ring-gray-300'
                    } ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105' : ''}`}
                    onClick={() => onSelect?.(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect?.(index);
                      }
                    }}
                  >
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 p-3 text-xs overflow-hidden">
                        <div className="bg-white rounded shadow-sm p-2 h-full overflow-hidden">
                          <div className="font-semibold text-gray-900 mb-1 truncate text-[10px]">
                            {slide.title || `Slide ${index + 1}`}
                          </div>
                          <div
                            className="text-gray-600 line-clamp-3 text-[9px]"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml((slide.content || '').replace(/<[^>]*>/g, ' ').substring(0, 80) + '...'),
                            }}
                          />
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                        </div>
                        {/* On touch devices opacity-0 hides actions; keep them always visible
                            below md so mobile authors can duplicate/delete from the drawer. */}
                        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-0"
                            aria-label="Duplicate slide"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicate?.(index);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-0 text-red-600 hover:text-red-700"
                            aria-label="Delete slide"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}