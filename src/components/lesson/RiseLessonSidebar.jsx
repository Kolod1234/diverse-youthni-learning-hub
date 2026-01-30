import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Circle, Search } from 'lucide-react';

export default function RiseLessonSidebar({ course, lessons, currentLessonId, enrollment, onLessonSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const completedLessons = enrollment?.completed_lessons || [];
  const progressPercent = enrollment?.progress_percent || 0;

  // Group lessons by section
  const lessonsBySection = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Lessons';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  const filteredSections = Object.entries(lessonsBySection).filter(([_, sectionLessons]) =>
    sectionLessons.some(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Course Header */}
      <div className="p-4 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <h2 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h2>
        <div className="mb-2">
          <div className="text-xs font-semibold mb-1">{progressPercent}% COMPLETE</div>
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.map(([section, sectionLessons]) => (
          <div key={section}>
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 text-left"
            >
              <span className="font-semibold text-sm text-gray-900 uppercase tracking-wide">{section}</span>
              <ChevronDown 
                className={`h-4 w-4 text-gray-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
              />
            </button>
            
            {expandedSections[section] && (
              <div className="bg-gray-50">
                {sectionLessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson.id)}
                      className={`w-full px-4 py-2.5 text-left flex items-start gap-2 transition-colors border-l-4 ${
                        isCurrent
                          ? 'bg-blue-50 border-l-blue-600'
                          : isCompleted
                          ? 'hover:bg-gray-100 border-l-green-500'
                          : 'hover:bg-gray-100 border-l-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}