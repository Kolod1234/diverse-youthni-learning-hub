import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, Users, Target, Heart } from 'lucide-react';

export default function AboutUsSection() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  const stats = [
    { icon: Users, label: 'Active Students', value: getContent('about_stat_students', '500+') },
    { icon: Award, label: 'Courses Offered', value: getContent('about_stat_courses', '50+') },
    { icon: Target, label: 'Success Rate', value: getContent('about_stat_success', '95%') },
    { icon: Heart, label: 'Years Experience', value: getContent('about_stat_years', '10+') },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-3xl overflow-hidden shadow-xl border border-border"
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
                {getContent('about_title', 'Empowering Youth Through Education')}
              </h2>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {getContent('about_description', 'Diverse Youth NI is dedicated to providing high-quality educational resources and support to young people across Northern Ireland. We believe in creating inclusive learning environments where every student can thrive and reach their full potential.')}
              </p>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {getContent('about_mission', 'Our mission is to break down barriers to education and create opportunities for all young people, regardless of their background. Through innovative teaching methods, dedicated tutors, and comprehensive support, we help students achieve their academic goals and build confidence for their future.')}
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
                      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
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