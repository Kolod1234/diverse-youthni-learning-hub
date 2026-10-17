import React from 'react';
import { ChevronDown } from 'lucide-react';
import DocumentViewer from '@/components/lesson/DocumentViewer';

import { sanitizeHtml } from '@/components/security/SafeHtml';
export default function RiseLessonContent({ lesson, expandedSections, onToggleSection }) {
  const slides = lesson.slides || [];

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Lesson Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
      <p className="text-gray-600 mb-8">
        Lesson {lesson.order || 1} of {lesson.total_lessons || 1}
      </p>

      {/* Content Blocks */}
      {slides && slides.length > 0 ? (
        <div className="space-y-4">
          {slides.map((slide, index) => {
            const blockKey = `slide-${index}`;
            const isExpanded = expandedSections[blockKey] !== false; // Default expanded

            return (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => onToggleSection(blockKey)}
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors border-l-4 border-l-blue-600"
                >
                  <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-6 py-6 border-t border-gray-200 bg-white">
                    {slide.content ? (
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.content) }}
                      />
                    ) : (
                      <p className="text-gray-600">No content available</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : lesson.file_url ? (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 p-4 text-center">
            <DocumentViewer 
              fileUrl={lesson.file_url}
              fileType={lesson.file_type}
              className="max-h-96"
            />
          </div>
        </div>
      ) : lesson.google_slides_url ? (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <iframe
            src={lesson.google_slides_url}
            width="100%"
            height="600"
            className="border-0"
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No content available for this lesson</p>
        </div>
      )}

      {/* Learning Objectives */}
      {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {lesson.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}