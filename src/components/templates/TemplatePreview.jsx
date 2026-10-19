import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

import { sanitizeHtml } from '@/components/security/SafeHtml';
export default function TemplatePreview({ template, onClose, onUse }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {template.created_by}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(template.created_date), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Used {template.usage_count || 0} times
            </div>
          </div>

          {template.tags?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {template.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Preview Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {template.category === 'lesson' && template.content?.slides?.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Lesson Preview ({template.content.slides.length} slides)
                </h3>
                <div className="space-y-4">
                  {template.content.slides.map((slide, i) => (
                    <Card key={i} className="p-4 border-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Slide {i + 1}</Badge>
                        <h4 className="font-semibold text-gray-900">{slide.title}</h4>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.content?.substring(0, 200) + '...') }}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No preview available for this template</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={onUse}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      </Card>
    </div>
  );
}