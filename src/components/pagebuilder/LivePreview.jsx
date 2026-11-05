import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LivePreview({ sections, deviceMode, onDeviceModeChange }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const deviceConfig = {
    mobile: { width: 375, height: 812, label: 'iPhone 12' },
    tablet: { width: 768, height: 1024, label: 'iPad' },
    desktop: { width: 1280, height: 800, label: 'Desktop' }
  };

  const config = deviceConfig[deviceMode];

  return (
    <motion.div
      className={`flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      }`}
    >
      {/* Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Preview</h3>
          <span className="text-xs text-gray-400">{config.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {Object.keys(deviceConfig).map(mode => {
            const icons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };
            const Icon = icons[mode];
            return (
              <Button
                key={mode}
                size="sm"
                variant={deviceMode === mode ? 'default' : 'ghost'}
                onClick={() => onDeviceModeChange(mode)}
                className="w-8 h-8 p-0"
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-gray-950">
        <motion.div
          key={deviceMode}
          style={{ width: config.width }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gray-50 min-h-screen p-4 space-y-4">
            {sections.filter(s => s.is_active).length > 0 ? (
              sections.filter(s => s.is_active).map((section, i) => (
                <motion.div
                  key={section.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 min-h-[100px] flex items-center justify-center text-gray-500"
                >
                  <div className="text-center">
                    <p className="font-semibold">{section.title || 'Section'}</p>
                    <p className="text-xs text-gray-400">{section.section_type}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-screen flex items-center justify-center text-gray-400">
                <p>Add sections to see preview</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}