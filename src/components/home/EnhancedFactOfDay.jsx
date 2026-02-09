import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Lightbulb, Beaker, BookOpen, Leaf, Zap, Sparkles, ArrowRight } from 'lucide-react';

const CATEGORY_CONFIG = {
  science: { icon: Beaker, color: '#3b82f6', gradient: 'from-blue-50 to-cyan-50', accent: 'text-blue-600' },
  history: { icon: BookOpen, color: '#8b5cf6', gradient: 'from-purple-50 to-pink-50', accent: 'text-purple-600' },
  nature: { icon: Leaf, color: '#10b981', gradient: 'from-green-50 to-emerald-50', accent: 'text-green-600' },
  technology: { icon: Zap, color: '#f59e0b', gradient: 'from-amber-50 to-orange-50', accent: 'text-amber-600' },
  general: { icon: Lightbulb, color: '#ec4899', gradient: 'from-pink-50 to-rose-50', accent: 'text-pink-600' }
};

export default function EnhancedFactOfDay() {
  const [selectedFact, setSelectedFact] = useState(null);
  const [animateCard, setAnimateCard] = useState(false);

  const { data: facts = [], isLoading } = useQuery({
    queryKey: ['daily-facts-widget'],
    queryFn: () => base44.entities.DailyFact.filter({ is_active: true }, '-created_date', 100),
  });

  useEffect(() => {
    if (facts.length > 0) {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setSelectedFact(randomFact);
      setAnimateCard(true);
    }
  }, [facts]);

  const handleRefresh = () => {
    setAnimateCard(false);
    setTimeout(() => {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setSelectedFact(randomFact);
      setAnimateCard(true);
    }, 300);
  };

  if (isLoading || !selectedFact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"
      />
    );
  }

  const config = CATEGORY_CONFIG[selectedFact.category] || CATEGORY_CONFIG.general;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`bg-gradient-to-br ${config.gradient} rounded-3xl overflow-hidden border border-gray-200/50 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300 w-full`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-32 -top-32 w-64 h-64 rounded-full opacity-5"
            style={{ background: config.color }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-32 -bottom-32 w-64 h-64 rounded-full opacity-5"
            style={{ background: config.color }}
          />
        </div>

        <div className="relative p-10 md:p-16">
           {/* Header */}
           <div className="flex items-center justify-between mb-8">
             <motion.div
               animate={{ y: [0, -4, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="flex items-center gap-4"
             >
               <div
                 className="w-16 h-16 rounded-lg flex items-center justify-center"
                 style={{ background: config.color + '20' }}
               >
                 <IconComponent className={`w-8 h-8 ${config.accent}`} />
               </div>
               <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Today's Fact</p>
                 <p className={`text-lg font-bold capitalize ${config.accent}`}>{selectedFact.category}</p>
               </div>
             </motion.div>
             <motion.button
               whileHover={{ rotate: 180 }}
               transition={{ duration: 0.5 }}
               onClick={handleRefresh}
               className="p-3 hover:bg-white/50 rounded-lg transition-colors"
             >
               <Sparkles className="w-6 h-6 text-gray-600" />
             </motion.button>
           </div>

           {/* Fact Content */}
           <motion.div
             key={selectedFact.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="mb-8"
           >
             <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
               {selectedFact.fact}
             </p>
           </motion.div>

          {/* Footer with source */}
          {selectedFact.source_url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between pt-6 border-t border-gray-300/20"
            >
              <p className="text-xs text-gray-600">Fact from trusted sources</p>
              <motion.div whileHover={{ x: 4 }} className="flex items-center gap-1 text-xs font-semibold text-gray-700 cursor-pointer">
                Learn more <ArrowRight className="w-3 h-3" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Progress indicator dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-1 bg-gradient-to-r"
          style={{
            background: `linear-gradient(to right, ${config.color}, transparent)`
          }}
        />
      </div>

      {/* Quick facts carousel hint */}
      {facts.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-500 mt-4"
        >
          Click refresh to see {facts.length} more facts
        </motion.p>
      )}
    </motion.div>
  );
}