import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Type, Image as ImageIcon, Square, AlignLeft, AlignCenter, 
  AlignRight, Trash2, Copy, Plus, Save, X, GripVertical,
  Heading1, Heading2, List, MessageSquare
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

const ELEMENT_TYPES = {
  textbox: { 
    name: 'Text Box', 
    icon: Type, 
    defaultContent: 'Enter your text here...',
    placeholder: true
  },
  heading: { 
    name: 'Heading', 
    icon: Heading1, 
    defaultContent: 'Heading Text',
    placeholder: true
  },
  subheading: { 
    name: 'Subheading', 
    icon: Heading2, 
    defaultContent: 'Subheading Text',
    placeholder: true
  },
  image: { 
    name: 'Image Placeholder', 
    icon: ImageIcon,
    defaultContent: 'https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Add+Image',
    placeholder: true
  },
  bulletList: { 
    name: 'Bullet List', 
    icon: List,
    defaultContent: '• Point 1\n• Point 2\n• Point 3',
    placeholder: true
  },
  contentBlock: { 
    name: 'Content Block', 
    icon: MessageSquare,
    defaultContent: 'Reusable content block - edit to customize',
    placeholder: false
  }
};

export default function AdvancedTemplateBuilder({ onSave, onClose, initialTemplate = null }) {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [templateIcon, setTemplateIcon] = useState(initialTemplate?.icon || '📐');
  const [elements, setElements] = useState(initialTemplate?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [gridColumns, setGridColumns] = useState(initialTemplate?.gridColumns || 1);

  const addElement = (type) => {
    const elementConfig = ELEMENT_TYPES[type];
    const newElement = {
      id: Date.now().toString(),
      type,
      content: elementConfig.defaultContent,
      isPlaceholder: elementConfig.placeholder,
      styles: {
        fontSize: type === 'heading' ? '32px' : type === 'subheading' ? '24px' : '16px',
        fontWeight: type === 'heading' || type === 'subheading' ? 'bold' : 'normal',
        color: '#1F2937',
        textAlign: 'left',
        padding: '12px',
        backgroundColor: type === 'contentBlock' ? '#F3F4F6' : 'transparent',
        borderRadius: '8px',
        minHeight: type === 'image' ? '200px' : 'auto'
      }
    };
    setElements([...elements, newElement]);
    toast.success(`${elementConfig.name} added`);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const newElement = {
      ...element,
      id: Date.now().toString()
    };
    setElements([...elements, newElement]);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setElements(items);
  };

  const generateTemplateHTML = () => {
    let html = `<div style="display: grid; grid-template-columns: repeat(${gridColumns}, 1fr); gap: 20px;">`;
    
    elements.forEach((element) => {
      const styles = Object.entries(element.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      if (element.type === 'image') {
        html += `<div style="${styles}; text-align: center;">`;
        html += `<img src="${element.content}" style="max-width: 100%; border-radius: 8px;" data-placeholder="${element.isPlaceholder}" />`;
        if (element.isPlaceholder) {
          html += `<p style="text-align: center; font-size: 12px; color: #6B7280; margin-top: 8px;">Click to replace image</p>`;
        }
        html += `</div>`;
      } else if (element.type === 'bulletList') {
        html += `<div style="${styles}">`;
        const items = element.content.split('\n').filter(l => l.trim());
        html += `<ul style="margin: 0; padding-left: 24px;">`;
        items.forEach(item => {
          html += `<li style="margin-bottom: 8px;">${item.replace(/^[•\-]\s*/, '')}</li>`;
        });
        html += `</ul></div>`;
      } else {
        const tag = element.type === 'heading' ? 'h2' : element.type === 'subheading' ? 'h3' : 'p';
        const placeholder = element.isPlaceholder ? ` data-placeholder="true"` : '';
        html += `<${tag} style="${styles}"${placeholder}>${element.content}</${tag}>`;
      }
    });
    
    html += '</div>';
    return html;
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (elements.length === 0) {
      toast.error('Add at least one element to the template');
      return;
    }

    const template = {
      name: templateName.trim(),
      icon: templateIcon,
      content: generateTemplateHTML(),
      elements: elements,
      gridColumns: gridColumns,
      isAdvanced: true
    };

    onSave(template);
    toast.success('Advanced template saved!');
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Template Builder</h2>
            <p className="text-sm text-gray-500 mt-1">Design custom layouts with reusable elements</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Elements */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-2 block">Template Info</Label>
              <Input
                placeholder="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="📐"
                value={templateIcon}
                onChange={(e) => setTemplateIcon(e.target.value)}
                maxLength={2}
              />
            </div>

            <div className="mb-6">
              <Label className="text-sm font-semibold mb-2 block">Layout Grid</Label>
              <div className="flex gap-2">
                {[1, 2, 3].map(cols => (
                  <Button
                    key={cols}
                    variant={gridColumns === cols ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGridColumns(cols)}
                    className="flex-1"
                  >
                    {cols} Col
                  </Button>
                ))}
              </div>
            </div>

            <Label className="text-sm font-semibold mb-2 block">Add Elements</Label>
            <div className="space-y-2">
              {Object.entries(ELEMENT_TYPES).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => addElement(key)}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {config.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <Card className="max-w-4xl mx-auto p-8 min-h-[600px] bg-white">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <Square className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Start Building Your Template</h3>
                  <p className="text-gray-500">Add elements from the sidebar to create your custom layout</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="template-elements">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                          gap: '20px'
                        }}
                      >
                        {elements.map((element, index) => {
                          const Icon = ELEMENT_TYPES[element.type].icon;
                          return (
                            <Draggable key={element.id} draggableId={element.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={() => setSelectedElement(element.id)}
                                  className={`relative group cursor-pointer transition-all ${
                                    selectedElement === element.id 
                                      ? 'ring-2 ring-indigo-500' 
                                      : 'hover:ring-2 hover:ring-gray-300'
                                  } ${snapshot.isDragging ? 'shadow-xl rotate-1' : ''}`}
                                  style={{
                                    ...element.styles,
                                    position: 'relative',
                                    border: element.isPlaceholder ? '2px dashed #E5E7EB' : 'none'
                                  }}
                                >
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-4 h-4 text-white" />
                                  </div>

                                  {/* Element Badge */}
                                  <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateElement(element.id);
                                      }}
                                      className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700"
                                    >
                                      <Copy className="w-3 h-3 text-white" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteElement(element.id);
                                      }}
                                      className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                                    >
                                      <Trash2 className="w-3 h-3 text-white" />
                                    </button>
                                  </div>

                                  {/* Content */}
                                  {element.type === 'image' ? (
                                    <div style={{ textAlign: 'center' }}>
                                      <img 
                                        src={element.content} 
                                        alt="Template placeholder"
                                        style={{ 
                                          maxWidth: '100%', 
                                          borderRadius: '8px',
                                          minHeight: element.styles.minHeight
                                        }}
                                      />
                                      {element.isPlaceholder && (
                                        <p className="text-xs text-gray-500 mt-2">
                                          <ImageIcon className="w-3 h-3 inline mr-1" />
                                          Image Placeholder
                                        </p>
                                      )}
                                    </div>
                                  ) : element.type === 'bulletList' ? (
                                    <ul className="list-disc list-inside space-y-2">
                                      {element.content.split('\n').map((item, i) => (
                                        <li key={i}>{item.replace(/^[•\-]\s*/, '')}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div>
                                      {element.content}
                                      {element.isPlaceholder && (
                                        <span className="ml-2 text-xs text-gray-400">
                                          <Icon className="w-3 h-3 inline" />
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            {selectedEl ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                    {React.createElement(ELEMENT_TYPES[selectedEl.type].icon, { className: 'w-4 h-4' })}
                    {ELEMENT_TYPES[selectedEl.type].name} Properties
                  </Label>
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Content</Label>
                  {selectedEl.type === 'image' ? (
                    <Input
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                      placeholder="Image URL"
                    />
                  ) : (
                    <Textarea
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                      rows={3}
                      placeholder="Enter content"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEl.isPlaceholder}
                    onChange={(e) => updateElement(selectedEl.id, { isPlaceholder: e.target.checked })}
                    id="placeholder-check"
                  />
                  <Label htmlFor="placeholder-check" className="text-xs cursor-pointer">
                    Editable placeholder (users can customize)
                  </Label>
                </div>

                {selectedEl.type !== 'image' && (
                  <>
                    <div>
                      <Label className="text-xs mb-1 block">Font Size</Label>
                      <Input
                        value={selectedEl.styles.fontSize}
                        onChange={(e) => updateElement(selectedEl.id, { 
                          styles: { ...selectedEl.styles, fontSize: e.target.value }
                        })}
                        placeholder="16px"
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">Text Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedEl.styles.color}
                          onChange={(e) => updateElement(selectedEl.id, { 
                            styles: { ...selectedEl.styles, color: e.target.value }
                          })}
                          className="h-10 w-full rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-1 block">Alignment</Label>
                      <div className="flex gap-2">
                        {['left', 'center', 'right'].map(align => (
                          <Button
                            key={align}
                            variant={selectedEl.styles.textAlign === align ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { 
                              styles: { ...selectedEl.styles, textAlign: align }
                            })}
                            className="flex-1"
                          >
                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-xs mb-1 block">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedEl.styles.backgroundColor === 'transparent' ? '#ffffff' : selectedEl.styles.backgroundColor}
                      onChange={(e) => updateElement(selectedEl.id, { 
                        styles: { ...selectedEl.styles, backgroundColor: e.target.value }
                      })}
                      className="h-10 flex-1 rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateElement(selectedEl.id, { 
                        styles: { ...selectedEl.styles, backgroundColor: 'transparent' }
                      })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1 block">Padding</Label>
                  <Input
                    value={selectedEl.styles.padding}
                    onChange={(e) => updateElement(selectedEl.id, { 
                      styles: { ...selectedEl.styles, padding: e.target.value }
                    })}
                    placeholder="12px"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Square className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select an element to edit its properties</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {elements.length} element{elements.length !== 1 ? 's' : ''} • {gridColumns} column layout
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!templateName.trim() || elements.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}