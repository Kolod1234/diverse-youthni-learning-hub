import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, AlertTriangle, CheckCircle, Info, MessageSquare, 
  BookOpen, Target, Zap, Award, Code, FileText, Image as ImageIcon,
  Plus, X, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const TEMPLATE_BLOCKS = {
  callouts: {
    name: 'Callouts',
    icon: MessageSquare,
    blocks: [
      {
        name: 'Tip Box',
        icon: Lightbulb,
        color: 'blue',
        html: '<div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-left: 5px solid #3B82F6; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">💡</div><div style="flex: 1;"><h4 style="color: #1E40AF; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Pro Tip</h4><p style="color: #1E3A8A; font-size: 15px; line-height: 1.6; margin: 0;">Add your helpful tip or advice here. This helps students remember key points.</p></div></div></div>'
      },
      {
        name: 'Important Notice',
        icon: AlertTriangle,
        color: 'red',
        html: '<div style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-left: 5px solid #EF4444; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #EF4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">⚠️</div><div style="flex: 1;"><h4 style="color: #991B1B; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Important</h4><p style="color: #7F1D1D; font-size: 15px; line-height: 1.6; margin: 0;">Highlight critical information students need to remember.</p></div></div></div>'
      },
      {
        name: 'Key Concept',
        icon: CheckCircle,
        color: 'green',
        html: '<div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-left: 5px solid #10B981; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">✓</div><div style="flex: 1;"><h4 style="color: #065F46; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Key Concept</h4><p style="color: #064E3B; font-size: 15px; line-height: 1.6; margin: 0;">Emphasize essential concepts and learning objectives.</p></div></div></div>'
      },
      {
        name: 'Info Box',
        icon: Info,
        color: 'purple',
        html: '<div style="background: linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%); border-left: 5px solid #A855F7; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #A855F7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">ℹ️</div><div style="flex: 1;"><h4 style="color: #6B21A8; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Did You Know?</h4><p style="color: #581C87; font-size: 15px; line-height: 1.6; margin: 0;">Share interesting facts or additional context.</p></div></div></div>'
      }
    ]
  },
  definitions: {
    name: 'Definitions',
    icon: BookOpen,
    blocks: [
      {
        name: 'Term Definition',
        icon: BookOpen,
        color: 'indigo',
        html: '<div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 24px; margin: 20px 0;"><h3 style="color: #0369A1; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Term or Concept</h3><p style="color: #0C4A6E; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">Clear definition goes here. Explain the term in simple, understandable language.</p></div>'
      },
      {
        name: 'Formula Box',
        icon: Code,
        color: 'cyan',
        html: '<div style="background: #F0FDFA; border: 2px solid #14B8A6; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;"><div style="background: white; border: 1px solid #5EEAD4; border-radius: 8px; padding: 16px; margin-bottom: 16px;"><h3 style="color: #0F766E; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace;">Formula = A + B</h3></div><p style="color: #134E4A; font-size: 15px; line-height: 1.6; margin: 0;">Where A represents... and B represents...</p></div>'
      }
    ]
  },
  examples: {
    name: 'Examples',
    icon: Target,
    blocks: [
      {
        name: 'Example Block',
        icon: Zap,
        color: 'yellow',
        html: '<div style="background: white; border: 2px solid #FCD34D; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);"><div style="display: inline-block; background: #FEF3C7; color: #92400E; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 16px;">EXAMPLE</div><h4 style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Example Title</h4><p style="color: #78350F; font-size: 15px; line-height: 1.7; margin: 0;">Walk through a specific example step-by-step to illustrate the concept.</p></div>'
      },
      {
        name: 'Practice Problem',
        icon: Award,
        color: 'orange',
        html: '<div style="background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%); border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><div style="background: #EA580C; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700;">TRY IT</div></div><h4 style="color: #7C2D12; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Practice Question</h4><p style="color: #9A3412; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Present a problem for students to solve on their own.</p><div style="background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); border-radius: 8px; padding: 16px;"><p style="color: #7C2D12; font-size: 14px; margin: 0; font-style: italic;">💡 Solution: Click to reveal answer or provide hints.</p></div></div>'
      }
    ]
  },
  content: {
    name: 'Content',
    icon: FileText,
    blocks: [
      {
        name: 'Quote Box',
        icon: MessageSquare,
        color: 'pink',
        html: '<div style="background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); border-radius: 12px; padding: 32px; margin: 20px 0; text-align: center;"><div style="font-size: 48px; color: #DB2777; margin-bottom: 16px; line-height: 1;">"</div><blockquote style="color: #831843; font-size: 20px; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0 0 16px 0; max-width: 700px; margin-left: auto; margin-right: auto;">"Insert meaningful quote or key statement here"</blockquote><p style="color: #9F1239; font-size: 14px; font-weight: 600; margin: 0;">— Source or Author</p></div>'
      },
      {
        name: 'Summary Box',
        icon: CheckCircle,
        color: 'teal',
        html: '<div style="background: white; border: 2px dashed #14B8A6; border-radius: 12px; padding: 24px; margin: 20px 0;"><h4 style="color: #0F766E; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;"><span style="background: #14B8A6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">📝</span>Summary</h4><ul style="margin: 0; padding-left: 24px; color: #134E4A; font-size: 15px; line-height: 2;"><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul></div>'
      },
      {
        name: 'Image Placeholder',
        icon: ImageIcon,
        color: 'gray',
        html: '<div style="margin: 20px 0; text-align: center;"><img src="https://via.placeholder.com/800x400/6366F1/FFFFFF?text=Click+to+Replace+Image" style="width: 100%; max-width: 800px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" /><p style="margin-top: 12px; color: #6B7280; font-size: 14px; font-style: italic;">Click image to replace - Add descriptive caption here</p></div>'
      }
    ]
  }
};

export default function TemplateBlocks({ onInsert, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('callouts');

  const filteredBlocks = searchTerm 
    ? Object.values(TEMPLATE_BLOCKS).flatMap(category => 
        category.blocks.filter(block => 
          block.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : TEMPLATE_BLOCKS[selectedCategory]?.blocks || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card 
        className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Template Blocks</h2>
              <p className="text-sm text-gray-500 mt-1">Click any block to insert it into your slide</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Category Sidebar */}
          {!searchTerm && (
            <div className="w-48 border-r bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Categories</p>
              <div className="space-y-1">
                {Object.entries(TEMPLATE_BLOCKS).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        selectedCategory === key
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blocks Grid */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {searchTerm && (
                <p className="text-sm text-gray-500 mb-4">
                  Found {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBlocks.map((block, index) => {
                  const Icon = block.icon;
                  return (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-indigo-300 group"
                      onClick={() => {
                        onInsert(block.html);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-${block.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${block.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {block.name}
                          </h4>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      
                      <div 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-hidden"
                        dangerouslySetInnerHTML={{ 
                          __html: block.html.replace(/style="[^"]*"/g, 'style="transform: scale(0.7); transform-origin: top left; width: 142%; pointer-events: none;"')
                        }}
                      />
                    </Card>
                  );
                })}
              </div>

              {filteredBlocks.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No blocks found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}