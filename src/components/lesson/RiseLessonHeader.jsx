import React from 'react';
import { ArrowLeft, X, Download } from 'lucide-react';

export default function RiseLessonHeader({ course, lesson, currentIndex, totalLessons, onBackClick, onExitClick }) {
  const handleOpenPopup = () => {
    window.open(window.location.href, 'lesson_popup', 'width=1200,height=800,resizable=yes');
  };

  return (
    <div className="bg-gray-900 text-white border-b border-gray-800">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
            title="Back to course"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="border-l border-gray-700 pl-4">
            <p className="text-xs text-gray-400 mb-0.5">{lesson.title}</p>
            <p className="text-xs text-gray-500">Lesson {currentIndex + 1} of {totalLessons}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenPopup}
            className="px-3 py-2 text-sm hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
            title="Open in new window"
          >
            <Download className="h-4 w-4" />
            <span>Open in Popup</span>
          </button>
          <button
            onClick={onExitClick}
            className="px-4 py-2 text-sm font-semibold hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
            title="Exit course"
          >
            <X className="h-4 w-4" />
            <span>EXIT COURSE</span>
          </button>
        </div>
      </div>
    </div>
  );
}