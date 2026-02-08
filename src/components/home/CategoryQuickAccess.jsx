import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BookOpen, Microscope, Globe, Clock, PenTool, Lightbulb } from 'lucide-react';

const categories = [
  { name: 'Mathematics', icon: PenTool, color: 'from-blue-500 to-blue-600', image: 'https://images.unsplash.com/photo-1520997894817-7ba015e33e51?w=500&h=500&fit=crop', query: 'mathematics' },
  { name: 'Biology', icon: Microscope, color: 'from-green-500 to-emerald-600', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg', query: 'biology' },
  { name: 'English', icon: BookOpen, color: 'from-purple-500 to-purple-600', image: 'https://images.unsplash.com/photo-1495446815901-a7297e60ffe1?w=500&h=500&fit=crop', query: 'english' },
  { name: 'History', icon: Clock, color: 'from-rose-500 to-rose-600', image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500&h=500&fit=crop', query: 'history' },
  { name: 'Geography', icon: Globe, color: 'from-teal-500 to-teal-600', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&h=500&fit=crop', query: 'geography' },
  { name: 'Physics', icon: Lightbulb, color: 'from-yellow-500 to-orange-600', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop', query: 'physics' },
];

export default function CategoryQuickAccess() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">Explore by Subject</h2>
        <p className="text-muted-foreground">Choose a subject to get started</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((category, idx) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.08, y: -4 }}
            >
              <Link to={createPageUrl('Explore') + `?category=${category.query}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-50 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-white/25 backdrop-blur-sm rounded-full p-3 mb-3 group-hover:bg-white/35 transition-all">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-sm leading-tight">
                      {category.name}
                    </h3>
                    <div className="text-white/90 text-xs mt-2 group-hover:text-white transition-colors">
                      Explore →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}