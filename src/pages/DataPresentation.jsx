import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database, Sparkles, BarChart3, Download, Save } from 'lucide-react';
import FileUploadMode from '@/components/presentation/FileUploadMode';
import EntityDataMode from '@/components/presentation/EntityDataMode';
import AIGenerateMode from '@/components/presentation/AIGenerateMode';
import SlideEditor from '@/components/editor/SlideEditor';
import { toast } from 'sonner';

export default function DataPresentation() {
  const [generatedSlides, setGeneratedSlides] = useState([]);
  const [activeMode, setActiveMode] = useState('upload');

  const saveAsTemplate = async () => {
    if (generatedSlides.length === 0) {
      toast.error('No slides to save');
      return;
    }

    const name = prompt('Enter template name:');
    if (!name) return;

    try {
      await base44.entities.Template.create({
        name,
        description: 'Generated from data',
        category: 'slide',
        content: { slides: generatedSlides },
        is_public: false,
        tags: ['auto-generated', 'data-driven']
      });
      toast.success('Saved as template!');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data to Presentation</h1>
              <p className="text-gray-500">Transform your data into beautiful slides</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Data Input */}
          <div>
            <Card className="p-6">
              <Tabs value={activeMode} onValueChange={setActiveMode}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="entity" className="gap-2">
                    <Database className="w-4 h-4" />
                    From Data
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Generate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <FileUploadMode onSlidesGenerated={setGeneratedSlides} />
                </TabsContent>

                <TabsContent value="entity">
                  <EntityDataMode onSlidesGenerated={setGeneratedSlides} />
                </TabsContent>

                <TabsContent value="ai">
                  <AIGenerateMode onSlidesGenerated={setGeneratedSlides} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Generated Slides {generatedSlides.length > 0 && `(${generatedSlides.length})`}
                </h2>
                {generatedSlides.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={saveAsTemplate}
                      variant="outline"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                )}
              </div>

              {generatedSlides.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No slides generated yet</p>
                  <p className="text-sm text-gray-400">Choose a data source to get started</p>
                </div>
              ) : (
                <SlideEditor
                  slides={generatedSlides}
                  onChange={setGeneratedSlides}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}