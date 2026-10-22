import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Layers, GraduationCap, Heart } from 'lucide-react';

export default function AboutUsSection() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  // Live figures from the courses themselves, never typed-in numbers: they stay true as courses are added.
  // (Learner numbers aren't shown: enrolments are private, so a public page can't count them honestly.)
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
    staleTime: 5 * 60 * 1000,
  });
  // Same rule as Home and Explore (a course shows unless it is explicitly hidden), so every figure on the page agrees.
  const published = courses.filter(c => c.is_published !== false);
  const fmt = (n) => (isLoading ? '…' : n.toLocaleString('en-GB'));
  const stats = [
    { icon: GraduationCap, label: 'Courses', value: fmt(published.length) },
    { icon: BookOpen, label: 'Lessons', value: fmt(published.reduce((sum, c) => sum + (Number(c.total_lessons) || 0), 0)) },
    { icon: Layers, label: 'Subjects', value: fmt(new Set(published.map(c => c.category).filter(Boolean)).size) },
    // The organisation's own fact, set by staff in site content.
    { icon: Heart, label: 'Working with young people', value: getContent('about_stat_years', 'Since 2017') },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-[14px] overflow-hidden border border-border"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-96 md:h-auto"
            >
              <img
                src={getContent('about_image', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80')}
                alt="About Diverse Youth NI"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 flex flex-col justify-center"
            >
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 w-fit">
                About Us
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {getContent('about_title', 'Providing The Platform For Young People To Thrive')}
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {getContent('about_description', 'Diverse Youth NI is dedicated to providing afterschool educational support and resources to young people across Northern Ireland. We believe in creating inclusive enabling environments where young people irrespective of colour, race or different cultural backgrounds can thrive and reach their full potential.')}
              </p>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {getContent('about_mission', 'Among our mission is to break down barriers to education and create opportunities for all young people, regardless of their background. Through our carefully tailored approaches, dedicated and experienced tutors, and support structure, we help young people from marginalised communities in their academic work through homework club, AfterSchool lessons and transfer test preparation, to boost confidence, promote learning and provide them with the platform to develop in their academic journey.')}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-muted/50 rounded-xl p-4 text-center"
                    >
                      <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}