import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Download, FileText, BookOpen, Lightbulb, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FreeResourcesCenter() {
  const { data: user } = useQuery({
    queryKey: ['user-free-resources'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments-free-resources'],
    queryFn: () => base44.entities.Enrollment.list(),
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 100),
    initialData: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Only show to enrolled students
  if (!user || enrollments.length === 0) {
    return null;
  }

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'gcse_past_questions', label: 'Past Papers' },
    { id: 'gcse_books', label: 'Study Guides' },
    { id: 'workbooks_logbooks', label: 'Workbooks' }
  ];

  const filteredResources = selectedCategory === 'all'
    ? resources.slice(0, 12)
    : resources.filter(r => r.category === selectedCategory).slice(0, 12);

  const resourceIcons = {
    'gcse_past_questions': FileText,
    'gcse_books': BookOpen,
    'workbooks_logbooks': Lightbulb,
    'default': Download
  };

  if (resources.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Free Study Resources</h2>
          <p className="text-muted-foreground">Resources coming soon</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-bold mb-4 border border-amber-500/30">
            <Download className="w-4 h-4 inline-block mr-2" />
            Free Materials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Free Study Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Download study guides, past papers, and revision materials—completely free
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-foreground border-2 border-border hover:border-amber-500'
              }`}
            >
              <Filter className="w-4 h-4 inline-block mr-2" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredResources.map((resource, idx) => {
            const IconComponent = resourceIcons[resource.category] || resourceIcons.default;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border border-border group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {resource.cover_image ? (
                    <div className="mb-4 h-32 overflow-hidden rounded-lg">
                      <img
                        src={resource.cover_image}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}

                  <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {resource.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {resource.author && (
                    <p className="text-xs text-muted-foreground mb-4">
                      By <span className="font-semibold">{resource.author}</span>
                    </p>
                  )}

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            Browse All Resources ({resources.length})
          </Button>
        </motion.div>
      </div>
    </section>
  );
}