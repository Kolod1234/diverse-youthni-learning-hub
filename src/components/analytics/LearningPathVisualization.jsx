import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function LearningPathVisualization({ enrollments, courses, userProgress }) {
  const enrichedEnrollments = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const totalHoursLearned = enrichedEnrollments.reduce((sum, e) => 
    sum + ((e.course?.duration_hours || 0) * (e.progress_percent || 0) / 100), 0
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/15 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-foreground">Learning Hours</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{totalHoursLearned.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground mt-1">Total hours invested</p>
        </Card>

        <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/15 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {enrollments.length > 0 
              ? Math.round((enrollments.filter(e => e.is_completed).length / enrollments.length) * 100)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Courses completed</p>
        </Card>

        <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/15 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/15 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-foreground">Active Courses</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {enrollments.filter(e => !e.is_completed).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Currently learning</p>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-6">Learning Journey Timeline</h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {enrichedEnrollments.map((enrollment, index) => {
              const isCompleted = enrollment.is_completed;
              const isInProgress = !isCompleted && enrollment.progress_percent > 0;
              
              return (
                <motion.div
                  key={enrollment.id}



                  className="relative pl-16"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-3.5 w-5 h-5 rounded-full border-4 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-200' 
                      : isInProgress 
                      ? 'bg-indigo-500 border-indigo-200' 
                      : 'bg-gray-300 border-border'
                  }`} />

                  <Card className={`p-4 ${
                    isCompleted 
                      ? 'bg-green-50 dark:bg-green-500/15 border-green-200' 
                      : isInProgress 
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200' 
                      : 'bg-muted border-border'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {enrollment.course?.title || 'Unknown Course'}
                          </h4>
                          {isCompleted ? (
                            <Badge className="bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : isInProgress ? (
                            <Badge className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-800 dark:text-indigo-300">
                              <Clock className="w-3 h-3 mr-1" />
                              In Progress
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-foreground">
                              <Lock className="w-3 h-3 mr-1" />
                              Not Started
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Started: {format(new Date(enrollment.created_date), 'MMM dd, yyyy')}
                          {isCompleted && enrollment.completed_date && (
                            <> • Completed: {format(new Date(enrollment.completed_date), 'MMM dd, yyyy')}</>
                          )}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground">
                              {enrollment.progress_percent || 0}%
                            </span>
                          </div>
                          <Progress 
                            value={enrollment.progress_percent || 0} 
                            className={`h-2 ${
                              isCompleted 
                                ? '[&>div]:bg-green-500' 
                                : isInProgress 
                                ? '[&>div]:bg-indigo-500' 
                                : '[&>div]:bg-gray-400'
                            }`}
                          />
                        </div>

                        {enrollment.completed_lessons?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {enrollment.completed_lessons.length} lessons completed
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {enrichedEnrollments.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">No courses enrolled yet</p>
                <p className="text-sm text-gray-400 mt-1">Start learning to see your journey</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}