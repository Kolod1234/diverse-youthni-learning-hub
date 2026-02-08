import React from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function SectionPreview({
  section,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  isDragging
}) {
  const getTypeColor = (type) => {
    const colors = {
      hero_carousel: 'from-blue-500 to-purple-600',
      features: 'from-green-500 to-teal-600',
      ecosystem: 'from-cyan-500 to-blue-600',
      image_gallery: 'from-pink-500 to-rose-600',
      video_embed: 'from-red-500 to-orange-600',
      team_members: 'from-indigo-500 to-purple-600',
      faq_section: 'from-yellow-500 to-amber-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white border-2 rounded-lg overflow-hidden transition-all ${
        isDragging ? 'opacity-50 border-blue-400' : 'border-gray-200 hover:border-gray-300'
      } ${!section.is_active ? 'bg-gray-50 opacity-60' : ''}`}
    >
      {/* Section Preview Visual */}
      <div className={`bg-gradient-to-r ${getTypeColor(section.section_type)} h-20 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-pattern" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-xs font-semibold opacity-75">{section.section_type}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{section.title || 'Untitled'}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{section.description?.substring(0, 60)}</p>
          </div>
          {section.is_active && (
            <Badge className="bg-green-100 text-green-700 text-xs ml-2">Active</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(!section.is_active)}
            className="flex-1 h-8"
            title={section.is_active ? 'Hide' : 'Show'}
          >
            {section.is_active ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDuplicate()}
            className="flex-1 h-8"
            title="Duplicate section"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit()}
            className="flex-1 h-8"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete()}
            className="flex-1 h-8 text-red-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}