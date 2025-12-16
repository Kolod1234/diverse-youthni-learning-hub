import React from 'react';
import { Button } from '@/components/ui/button';
import { Code, Palette, Briefcase, TrendingUp, Database, Camera, Music, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All Courses', icon: null },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'data_science', name: 'Data Science', icon: Database },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'health', name: 'Health', icon: Heart },
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        const Icon = cat.icon;
        
        return (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSelect(cat.id)}
              className={`
                rounded-full px-5 transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 shadow-lg shadow-indigo-500/25' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }
              `}
            >
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              {cat.name}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}