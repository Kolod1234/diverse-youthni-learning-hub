import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Beaker, BookOpen, Leaf, Zap, ExternalLink } from 'lucide-react';

const CATEGORY_CONFIG = {
  science: { icon: Beaker, color: '#3b82f6', bgColor: '#dbeafe', textColor: 'text-blue-700' },
  history: { icon: BookOpen, color: '#8b5cf6', bgColor: '#ede9fe', textColor: 'text-purple-700' },
  nature: { icon: Leaf, color: '#10b981', bgColor: '#dcfce7', textColor: 'text-green-700' },
  technology: { icon: Zap, color: '#f59e0b', bgColor: '#fef3c7', textColor: 'text-amber-700' },
  general: { icon: Lightbulb, color: '#ec4899', bgColor: '#fce7f3', textColor: 'text-pink-700' }
};

export default function FactCard({ fact, index = 0 }) {
  const config = CATEGORY_CONFIG[fact.category] || CATEGORY_CONFIG.general;
  const IconComponent = config.icon;

  return (
    <motion.div
      whileHover={{ y: -4, shadow: 'lg' }}
      className="h-full"
    >
      <div className="h-full bg-card rounded-xl border border-gray-200/50 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        {/* Category header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ backgroundColor: config.bgColor }}
        >
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: config.color + '20' }}
          >
            <IconComponent className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <span className={`text-sm font-bold capitalize ${config.textColor}`}>
            {fact.category}
          </span>
        </div>

        {/* Fact content */}
        <div className="p-6 flex flex-col h-full">
          <p className="text-foreground font-medium leading-relaxed flex-1 mb-4">
            {fact.fact}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-muted-foreground">
              {new Date(fact.created_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {fact.source_url && (
              <motion.a
                href={fact.source_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 2 }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}