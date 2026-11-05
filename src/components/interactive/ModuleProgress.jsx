import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModuleProgress({ sections, completedLessons = [], isEnrolled }) {
  const calculateSectionProgress = (sectionLessons) => {
    const completed = sectionLessons.filter(l => completedLessons.includes(l.id)).length;
    return {
      completed,
      total: sectionLessons.length,
      percentage: Math.round((completed / sectionLessons.length) * 100)
    };
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Module Progress</h3>
      <div className="space-y-4">
        {Object.entries(sections).map(([sectionName, sectionLessons], index) => {
          const progress = calculateSectionProgress(sectionLessons);
          const isUnlocked = index === 0 || isEnrolled;
          
          return (
            <motion.div
              key={sectionName}
              className={`${!isUnlocked && 'opacity-50'}`}
            >
              <div className="flex items-start gap-3 mb-2">
                {progress.percentage === 100 ? (
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                ) : isUnlocked ? (
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Circle className="w-4 h-4 text-indigo-600" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{sectionName}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {progress.completed}/{progress.total} lessons completed
                  </p>
                  <Progress 
                    value={progress.percentage} 
                    className="h-1.5 mt-2"
                  />
                </div>
                <span className={`text-xs font-medium ${
                  progress.percentage === 100 ? 'text-emerald-600' : 'text-gray-600'
                }`}>
                  {progress.percentage}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}