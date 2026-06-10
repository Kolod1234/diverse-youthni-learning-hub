import React from 'react';
import { Plus, Copy, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * WorkspaceThumbnailRail
 * ----------------------
 * Persistent 230-270px left rail that lists every slide as a numbered 16:9
 * thumbnail. Independently scrollable, keyboard navigable, drag-to-reorder.
 *
 * This is a separate component from the legacy SlideThumbnailRail because:
 *  - the rail needs sticky positioning + its own scroll context inside the
 *    workspace shell (the legacy rail relies on a parent ScrollArea), and
 *  - the thumbnail tile renders a sanitised slide preview, not a text-only
 *    summary, to match the presentation-editor references.
 *
 * Owns NO state — selection, reorder, add, duplicate and delete delegate up.
 * The single source of truth (`slides` + `currentSlide`) lives in SlideEditor.
 */
export default function WorkspaceThumbnailRail({
  slides = [],
  currentSlide = 0,
  onSelect,
  onDragEnd,
  onDuplicate,
  onDelete,
  onAdd,
}) {
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Slides ({slides.length})
        </p>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            title="Add a new slide"
            aria-label="Add a new slide"
            className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="workspace-slides">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-2 space-y-2"
              >
                {slides.map((slide, index) => (
                  <Draggable key={index} draggableId={`ws-slide-${index}`} index={index}>
                    {(dragProvided, snapshot) => {
                      const isActive = currentSlide === index;
                      return (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={[
                            'group relative rounded-md overflow-hidden transition-shadow outline-none',
                            isActive
                              ? 'ring-2 ring-indigo-500 shadow-md'
                              : 'ring-1 ring-slate-200 hover:ring-slate-300',
                            snapshot.isDragging ? 'shadow-2xl' : '',
                          ].join(' ')}
                        >
                          {/* Number gutter */}
                          <div className="flex items-stretch">
                            <div className="w-7 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col items-center pt-1.5 gap-1">
                              <span
                                className={`text-[11px] font-semibold ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}
                              >
                                {index + 1}
                              </span>
                              <span
                                {...dragProvided.dragHandleProps}
                                aria-label="Drag to reorder"
                                title="Drag to reorder"
                                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700"
                              >
                                <GripVertical className="w-3 h-3" />
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onSelect?.(index)}
                              aria-current={isActive ? 'true' : undefined}
                              aria-label={`Open slide ${index + 1}${slide.title ? `: ${slide.title}` : ''}`}
                              className="flex-1 min-w-0 text-left bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            >
                              {/* 16:9 thumbnail */}
                              <div className="aspect-video bg-white relative overflow-hidden">
                                {/* Scaled preview of slide.content. Pointer-events disabled so
                                    drag/select on the tile is not blocked by inner elements. */}
                                <div
                                  className="absolute inset-0 origin-top-left pointer-events-none"
                                  style={{
                                    width: '1280px',
                                    height: '720px',
                                    transform: 'scale(0.165)',
                                    transformOrigin: 'top left',
                                  }}
                                >
                                  <div className="w-full h-full p-8 overflow-hidden">
                                    {slide.title && (
                                      <div className="text-[28px] font-bold text-slate-900 mb-4 truncate">
                                        {slide.title}
                                      </div>
                                    )}
                                    <div
                                      className="text-[16px] text-slate-700 leading-relaxed"
                                      style={{ maxHeight: '520px', overflow: 'hidden' }}
                                      dangerouslySetInnerHTML={{
                                        __html: slide.content || '<p style="color:#94a3b8">Empty slide</p>',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="px-2 py-1 border-t border-slate-100">
                                <div className="text-[11px] font-medium text-slate-700 truncate">
                                  {slide.title || `Slide ${index + 1}`}
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Hover actions */}
                          <div className="absolute top-1 right-1 flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {onDuplicate && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDuplicate(index); }}
                                title="Duplicate slide"
                                aria-label="Duplicate slide"
                                className="w-6 h-6 rounded bg-white/95 border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center justify-center"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                title="Delete slide"
                                aria-label="Delete slide"
                                className="w-6 h-6 rounded bg-white/95 border border-slate-200 hover:bg-red-50 text-red-600 inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}