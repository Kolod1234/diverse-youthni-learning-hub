import React, { useEffect } from 'react';
import { SCORMProvider } from '@code-by-dwayne/react-scorm-provider';

/**
 * Wrapper component that initializes SCORM provider for lessons
 */
export default function SCORMWrapper({ children, lesson, courseId }) {
  return (
    <SCORMProvider
      debug={false}
      scormVersion="2004"
      initialData={{
        'cmi.core.lesson_id': lesson?.id || 'unknown',
        'cmi.core.course_id': courseId || 'unknown',
        'cmi.interactions._children': 'id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description',
      }}
    >
      {children}
    </SCORMProvider>
  );
}