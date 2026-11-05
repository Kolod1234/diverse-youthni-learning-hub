import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';

export default function StudentSuccessStories() {
  const { data: successStories = [] } = useQuery({
    queryKey: ['student-success-stories'],
    queryFn: () => base44.entities.StudentOfMonth.list('-created_date', 6),
    initialData: []
  });

  if (successStories.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-4 border border-emerald-500/30">
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Real Results
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our students achieved their goals and improved their grades
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {successStories.map((story, idx) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-border"
            >
              {story.photo_url && (
                <div className="mb-6 relative">
                  <img
                    src={story.photo_url}
                    alt={story.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-4 left-8 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Student of Month
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{story.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{story.subject_or_course}</p>
                
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 mb-4">
                  <p className="text-emerald-900 dark:text-emerald-300 font-semibold text-lg">
                    {story.achievement || `Improved grades and achieved exam success`}
                  </p>
                </div>

                <p className="text-foreground/80 mb-6 leading-relaxed">
                  {story.story || story.description}
                </p>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}