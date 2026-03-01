import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function BreadcrumbNav({ course, section, lesson }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <Link to={createPageUrl('Dashboard')} className="hover:text-gray-900 flex items-center gap-1">
        <Home className="w-4 h-4" />
        Dashboard
      </Link>
      <ChevronRight className="w-4 h-4" />
      {course && (
        <>
          <Link to={`${createPageUrl('CourseDetails')}?id=${course.id}`} className="hover:text-gray-900 truncate max-w-[150px]">
            {course.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
        </>
      )}
      {section && (
        <>
          <span className="text-gray-500 truncate max-w-[100px]">{section}</span>
          <ChevronRight className="w-4 h-4" />
        </>
      )}
      {lesson && (
        <span className="font-medium text-gray-900 truncate max-w-[200px]">{lesson.title}</span>
      )}
    </nav>
  );
}