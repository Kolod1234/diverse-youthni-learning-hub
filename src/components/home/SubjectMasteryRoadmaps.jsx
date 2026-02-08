import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubjectMasteryRoadmaps() {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-roadmap'],
    queryFn: () => base44.entities.Course.list(),
  });

  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'history', 'geography'];
  
  const subjectCourses = subjects.reduce((acc, subject) => {
    acc[subject] = courses
      .filter(c => c.category === subject)
      .sort((a, b) => {
        const levelOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
        return (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0);
      });
    return acc;
  }, {});

  const subjectLabels = {
    mathematics: '📐 Mathematics',
    english: '📚 English',
    biology: '🧬 Biology',
    chemistry: '⚗️ Chemistry',
    physics: '⚛️ Physics',
    history: '🏛️ History',
    geography: '🌍 Geography'
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-bold mb-4 border border-blue-500/30">
            <BookOpen className="w-4 h-4 inline-block mr-2" />
            Learning Paths
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Subject Mastery Roadmaps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Structured learning journeys from foundation to advanced mastery
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
              className={`p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                selectedSubject === subject
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : 'bg-card text-foreground border-border hover:border-blue-500 hover:shadow-md'
              }`}
            >
              {subjectLabels[subject]}
            </button>
          ))}
        </div>

        {selectedSubject && subjectCourses[selectedSubject].length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 dark:from-blue-950/20 to-purple-50 dark:to-purple-950/20 rounded-2xl p-8 border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              {subjectLabels[selectedSubject]}
              <span className="text-sm bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
                {subjectCourses[selectedSubject].length} courses
              </span>
            </h3>

            <div className="space-y-4">
              {subjectCourses[selectedSubject].map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-border hover:border-blue-500 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-lg mb-2">{course.title}</h4>
                        <p className="text-muted-foreground text-sm mb-3">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold capitalize">
                            {course.level}
                          </span>
                          {course.duration_hours && (
                            <span>⏱️ {course.duration_hours}h</span>
                          )}
                          {course.enrolled_count && (
                            <span>👥 {course.enrolled_count} students</span>
                          )}
                        </div>
                      </div>
                      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                        <Button size="sm" className="whitespace-nowrap">
                          Enroll <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}