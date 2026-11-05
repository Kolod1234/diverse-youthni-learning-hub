import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Columns, Maximize2 } from 'lucide-react';

export default function SplitViewLayout({ mainContent, sideContent, defaultSplit = false }) {
  const [isSplit, setIsSplit] = useState(defaultSplit);

  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSplit(!isSplit)}
          className="gap-2"
        >
          {isSplit ? <Maximize2 className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
          {isSplit ? 'Full Screen' : 'Split View'}
        </Button>
      </div>

      <div className={`flex gap-6 ${isSplit ? 'lg:flex-row' : 'flex-col'}`}>
        <motion.div
          layout
          className={isSplit ? 'lg:w-2/3' : 'w-full'}
        >
          {mainContent}
        </motion.div>

        {isSplit && (
          <motion.div
            layout


            className="lg:w-1/3 sticky top-20 self-start"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              {sideContent}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}