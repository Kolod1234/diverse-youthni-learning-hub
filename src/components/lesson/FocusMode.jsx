import React, { useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusMode({ enabled, onToggle, children }) {
  useEffect(() => {
    if (enabled) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggle(true)}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Focus Mode
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto"
      >
        <div className="min-h-screen flex flex-col">
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10">
            <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Eye className="w-4 h-4" />
                <span>Focus Mode</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}