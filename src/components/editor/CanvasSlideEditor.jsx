import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Image as ImageIcon, Type, Square, Circle, Video, 
  Upload, Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Palette, ZoomIn, ZoomOut,
  Layers, Lock, Unlock, ChevronUp, ChevronDown, Music,
  Triangle, Diamond, Star, ArrowRight, MessageSquare, StickyNote,
  BarChart3, PieChart, LineChart, TrendingUp, Minus, Grid3x3,
  FileText, Lightbulb, AlertCircle, CheckCircle, Sparkles, Clipboard
} from 'lucide-react';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const CANVAS_TEMPLATES = [
  {
    name: 'Blank',
    elements: []
  },
  {
    name: 'Title Slide',
    elements: [
      { 
        type: 'text', x: 100, y: 400, width: 1720, height: 150, 
        content: 'Your Title Here', fontSize: 80, fontWeight: 'bold', 
        textAlign: 'center', color: '#1F2937', backgroundColor: 'transparent', zIndex: 1 
      },
      { 
        type: 'text', x: 100, y: 600, width: 1720, height: 80, 
        content: 'Subtitle or tagline', fontSize: 40, fontWeight: 'normal', 
        textAlign: 'center', color: '#6B7280', backgroundColor: 'transparent', zIndex: 2 
      },
      { 
        type: 'shape', shape: 'rectangle', x: 60, y: 350, width: 1800, height: 400, 
        fill: '#F3F4F6', stroke: '#E5E7EB', strokeWidth: 2, opacity: 0.5, zIndex: 0 
      }
    ]
  },
  {
    name: 'Two Column',
    elements: [
      { 
        type: 'text', x: 100, y: 80, width: 1720, height: 100, 
        content: 'Section Title', fontSize: 60, fontWeight: 'bold', 
        textAlign: 'center', color: '#1F2937', backgroundColor: 'transparent', zIndex: 1 
      },
      { 
        type: 'card', cardType: 'default', x: 100, y: 250, width: 800, height: 700, 
        content: 'Left column content', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', zIndex: 2 
      },
      { 
        type: 'image', x: 1020, y: 250, width: 800, height: 700, 
        src: 'https://via.placeholder.com/800x700/4F46E5/FFFFFF?text=Click+to+Upload', 
        objectFit: 'cover', opacity: 1, zIndex: 3 
      }
    ]
  },
  {
    name: 'Image + Text',
    elements: [
      { 
        type: 'image', x: 100, y: 150, width: 800, height: 800, 
        src: 'https://via.placeholder.com/800x800/4F46E5/FFFFFF?text=Your+Image', 
        objectFit: 'cover', zIndex: 1 
      },
      { 
        type: 'text', x: 1000, y: 200, width: 800, height: 150, 
        content: 'Key Point Title', fontSize: 48, fontWeight: 'bold', 
        textAlign: 'left', color: '#1F2937', backgroundColor: 'transparent', zIndex: 2 
      },
      { 
        type: 'text', x: 1000, y: 400, width: 800, height: 500, 
        content: 'Description text goes here. Add your detailed explanation or key points.', 
        fontSize: 28, fontWeight: 'normal', textAlign: 'left', color: '#4B5563', 
        backgroundColor: 'transparent', zIndex: 3 
      }
    ]
  },
  {
    name: 'Process Flow',
    elements: [
      { 
        type: 'shape', shape: 'circle', x: 200, y: 400, width: 200, height: 200, 
        fill: '#3B82F6', stroke: '#1E40AF', strokeWidth: 3, opacity: 1, zIndex: 1 
      },
      { 
        type: 'shape', shape: 'arrow', x: 450, y: 475, width: 200, height: 50, 
        fill: '#6B7280', stroke: '#374151', strokeWidth: 2, opacity: 1, zIndex: 2 
      },
      { 
        type: 'shape', shape: 'circle', x: 700, y: 400, width: 200, height: 200, 
        fill: '#10B981', stroke: '#059669', strokeWidth: 3, opacity: 1, zIndex: 3 
      },
      { 
        type: 'shape', shape: 'arrow', x: 950, y: 475, width: 200, height: 50, 
        fill: '#6B7280', stroke: '#374151', strokeWidth: 2, opacity: 1, zIndex: 4 
      },
      { 
        type: 'shape', shape: 'circle', x: 1200, y: 400, width: 200, height: 200, 
        fill: '#F59E0B', stroke: '#D97706', strokeWidth: 3, opacity: 1, zIndex: 5 
      }
    ]
  },
  {
    name: 'Comparison',
    elements: [
      { 
        type: 'text', x: 100, y: 100, width: 1720, height: 100, 
        content: 'Comparison', fontSize: 60, fontWeight: 'bold', 
        textAlign: 'center', color: '#1F2937', backgroundColor: 'transparent', zIndex: 1 
      },
      { 
        type: 'card', cardType: 'success', x: 100, y: 300, width: 800, height: 650, 
        content: 'Option A\n\n✓ Benefit 1\n✓ Benefit 2\n✓ Benefit 3', 
        backgroundColor: '#D1FAE5', borderColor: '#10B981', zIndex: 2 
      },
      { 
        type: 'card', cardType: 'info', x: 1020, y: 300, width: 800, height: 650, 
        content: 'Option B\n\n✓ Feature 1\n✓ Feature 2\n✓ Feature 3', 
        backgroundColor: '#DBEAFE', borderColor: '#3B82F6', zIndex: 3 
      }
    ]
  }
];

export default function CanvasSlideEditor({ slide, onChange }) {
  const [elements, setElements] = useState(slide?.canvas_elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [copiedElement, setCopiedElement] = useState(null);

  const updateElements = (newElements) => {
    setElements(newElements);
    onChange({ ...slide, canvas_elements: newElements });
  };

  const addElement = (type, extraProps = {}) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : type === 'card' ? 500 : type === 'graph' ? 600 : 400,
      height: type === 'text' ? 60 : type === 'card' ? 400 : type === 'graph' ? 400 : 300,
      zIndex: elements.length,
      locked: false,
      ...(type === 'text' && {
        content: 'Double-click to edit',
        fontSize: 32,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        textBoxType: 'default',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.5,
        textShadow: 'none',
        letterSpacing: 0,
      }),
      ...(type === 'image' && {
        src: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Click+to+Upload',
        objectFit: 'cover',
        opacity: 1,
        filter: {
          grayscale: 0,
          sepia: 0,
          blur: 0,
          brightness: 100,
          contrast: 100,
          saturate: 100,
        },
      }),
      ...(type === 'video' && {
        src: '',
        controls: true,
      }),
      ...(type === 'shape' && {
        shape: 'rectangle',
        fill: '#4F46E5',
        stroke: '#000000',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        gradientType: 'none',
        gradientColor1: '#4F46E5',
        gradientColor2: '#9333EA',
        gradientDirection: 'to bottom',
      }),
      ...(type === 'card' && {
        cardType: 'default',
        content: 'Card content here',
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
        borderWidth: 2,
        padding: 20,
        borderRadius: 8,
        shadow: 'medium',
      }),
      ...(type === 'graph' && {
        graphType: 'bar',
        data: [
          { label: 'A', value: 30 },
          { label: 'B', value: 50 },
          { label: 'C', value: 70 },
          { label: 'D', value: 40 }
        ],
        primaryColor: '#3B82F6',
        secondaryColor: '#93C5FD',
      }),
      ...(type === 'icon' && {
        icon: 'star',
        iconColor: '#F59E0B',
        iconSize: 64,
      }),
      ...extraProps
    };
    updateElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const applyTemplate = (template) => {
    const templateElements = template.elements.map((el, idx) => ({
      ...el,
      id: `${Date.now()}-${idx}`,
      locked: false
    }));
    updateElements(templateElements);
    setSelectedElement(null);
    toast.success(`Applied ${template.name} template`);
  };

  const updateElement = (id, updates) => {
    updateElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id) => {
    updateElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const newElement = {
      ...element,
      id: Date.now().toString(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: elements.length,
    };
    updateElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: maxZ + 1 });
  };

  const sendToBack = (id) => {
    const minZ = Math.min(...elements.map(el => el.zIndex));
    updateElement(id, { zIndex: minZ - 1 });
  };

  const handleMouseDown = (e, element) => {
    if (element.locked) return;
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / zoom - element.x;
    const offsetY = (e.clientY - rect.top) / zoom - element.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - dragOffset.x;
    const y = (e.clientY - rect.top) / zoom - dragOffset.y;
    
    updateElement(selectedElement, {
      x: Math.max(0, Math.min(CANVAS_WIDTH - 50, x)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT - 50, y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageUpload = async (elementId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        updateElement(elementId, { src: file_url });
        toast.success('Image uploaded!');
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  const handleVideoUpload = async (elementId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        updateElement(elementId, { src: file_url });
        toast.success('Video uploaded!');
      } catch (error) {
        toast.error('Failed to upload video');
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  const handleCopy = () => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    setCopiedElement(element);
    toast.success('Element copied');
  };

  const handlePaste = (mode = 'normal') => {
    if (!copiedElement) {
      toast.error('Nothing to paste');
      return;
    }
    
    const selectedEl = elements.find(e => e.id === selectedElement);
    
    if (mode === 'merge' && selectedEl && copiedElement.type === selectedEl.type) {
      // Merge styles: copy visual properties but keep position/size
      const styleProps = {};
      
      if (copiedElement.type === 'text') {
        Object.assign(styleProps, {
          fontSize: copiedElement.fontSize,
          fontWeight: copiedElement.fontWeight,
          fontStyle: copiedElement.fontStyle,
          textAlign: copiedElement.textAlign,
          color: copiedElement.color,
          backgroundColor: copiedElement.backgroundColor,
          fontFamily: copiedElement.fontFamily,
          lineHeight: copiedElement.lineHeight,
          letterSpacing: copiedElement.letterSpacing,
          textShadow: copiedElement.textShadow,
        });
      } else if (copiedElement.type === 'shape') {
        Object.assign(styleProps, {
          fill: copiedElement.fill,
          stroke: copiedElement.stroke,
          strokeWidth: copiedElement.strokeWidth,
          strokeStyle: copiedElement.strokeStyle,
          gradientType: copiedElement.gradientType,
          gradientColor1: copiedElement.gradientColor1,
          gradientColor2: copiedElement.gradientColor2,
          gradientDirection: copiedElement.gradientDirection,
          opacity: copiedElement.opacity,
        });
      } else if (copiedElement.type === 'image') {
        Object.assign(styleProps, {
          opacity: copiedElement.opacity,
          filter: copiedElement.filter,
          objectFit: copiedElement.objectFit,
        });
      } else if (copiedElement.type === 'card') {
        Object.assign(styleProps, {
          backgroundColor: copiedElement.backgroundColor,
          borderColor: copiedElement.borderColor,
          borderWidth: copiedElement.borderWidth,
          borderRadius: copiedElement.borderRadius,
          shadow: copiedElement.shadow,
          padding: copiedElement.padding,
        });
      }
      
      updateElement(selectedEl.id, styleProps);
      toast.success('Styles merged');
    } else {
      // Normal paste: create new element
      const newElement = {
        ...copiedElement,
        id: Date.now().toString(),
        x: copiedElement.x + 20,
        y: copiedElement.y + 20,
        zIndex: elements.length,
      };
      
      updateElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Element pasted');
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex h-full gap-4">
      {/* Toolbar */}
      <Card className="w-24 p-3 flex flex-col gap-2 overflow-y-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('text')}
          title="Add Text"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <Type className="w-5 h-5" />
          <span className="text-xs">Text</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('image')}
          title="Add Image"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-xs">Image</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('video')}
          title="Add Video"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <Video className="w-5 h-5" />
          <span className="text-xs">Video</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('shape')}
          title="Add Shape"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <Square className="w-5 h-5" />
          <span className="text-xs">Shape</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('card')}
          title="Add Card"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <StickyNote className="w-5 h-5" />
          <span className="text-xs">Card</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('graph')}
          title="Add Graph"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">Graph</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => addElement('icon', { icon: 'star' })}
          title="Add Icon"
          className="h-14 w-full flex-col gap-1 p-2"
        >
          <Star className="w-5 h-5" />
          <span className="text-xs">Icon</span>
        </Button>
        
        <div className="h-px bg-gray-200 my-2" />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          title="Zoom In"
          className="h-10 w-full"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
          title="Zoom Out"
          className="h-10 w-full"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </Card>

      {/* Canvas */}
      <Card className="flex-1 bg-gray-100 overflow-auto relative">
        <div 
          ref={canvasRef}
          className="relative"
          style={{
            width: CANVAS_WIDTH * zoom,
            height: CANVAS_HEIGHT * zoom,
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
            backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Canvas Background */}
          <div 
            className="absolute inset-0 bg-white shadow-lg"
            onClick={() => setSelectedElement(null)}
          />

          {/* Elements */}
          {elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(element => (
              <div
                key={element.id}
                className={`absolute cursor-move ${element.locked ? 'cursor-not-allowed' : ''}`}
                style={{
                  left: element.x * zoom,
                  top: element.y * zoom,
                  width: element.width * zoom,
                  height: element.height * zoom,
                  transform: `rotate(${element.rotation || 0}deg)`,
                  outline: selectedElement === element.id ? '3px solid #6366F1' : 'none',
                  outlineOffset: '2px',
                  boxShadow: selectedElement === element.id ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
              >
                {/* Text Element */}
                {element.type === 'text' && (
                  <div
                    contentEditable={selectedElement === element.id && !element.locked}
                    suppressContentEditableWarning
                    onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
                    style={{
                      fontSize: element.fontSize * zoom,
                      fontWeight: element.fontWeight,
                      fontStyle: element.fontStyle,
                      textAlign: element.textAlign,
                      color: element.color,
                      backgroundColor: element.backgroundColor,
                      fontFamily: element.fontFamily || 'Arial, sans-serif',
                      lineHeight: element.lineHeight || 1.5,
                      letterSpacing: `${element.letterSpacing || 0}px`,
                      textShadow: element.textShadow === 'light' ? '2px 2px 4px rgba(0,0,0,0.1)' :
                                  element.textShadow === 'medium' ? '3px 3px 6px rgba(0,0,0,0.3)' :
                                  element.textShadow === 'strong' ? '4px 4px 8px rgba(0,0,0,0.5)' : 'none',
                      padding: 10 * zoom,
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                    }}
                    className="outline-none"
                  >
                    {element.content}
                  </div>
                )}

                {/* Image Element */}
                {element.type === 'image' && (
                  <div 
                    style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedElement === element.id) handleImageUpload(element.id);
                    }}
                  >
                    <img
                      src={element.src}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: element.objectFit || 'cover',
                        opacity: element.opacity !== undefined ? element.opacity : 1,
                        filter: element.filter ? 
                          `grayscale(${element.filter.grayscale || 0}%) sepia(${element.filter.sepia || 0}%) blur(${element.filter.blur || 0}px) brightness(${element.filter.brightness || 100}%) contrast(${element.filter.contrast || 100}%) saturate(${element.filter.saturate || 100}%)` 
                          : 'none',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#F3F4F6',
                        border: '2px dashed #D1D5DB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload style={{ width: '32px', height: '32px', color: '#9CA3AF' }} />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Click to upload image</span>
                    </div>
                  </div>
                )}

                {/* Video Element */}
                {element.type === 'video' && element.src && (
                  <video
                    src={element.src}
                    controls={element.controls}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}

                {element.type === 'video' && !element.src && (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedElement === element.id) handleVideoUpload(element.id);
                    }}
                  >
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload video</p>
                    </div>
                  </div>
                )}

                {/* Shape Element */}
                {element.type === 'shape' && (
                  <>
                    {element.shape === 'rectangle' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: element.gradientType === 'linear' 
                            ? `linear-gradient(${element.gradientDirection}, ${element.gradientColor1}, ${element.gradientColor2})`
                            : element.gradientType === 'radial'
                            ? `radial-gradient(circle, ${element.gradientColor1}, ${element.gradientColor2})`
                            : element.fill,
                          border: `${element.strokeWidth}px ${element.strokeStyle || 'solid'} ${element.stroke}`,
                          opacity: element.opacity,
                        }}
                      />
                    )}
                    {element.shape === 'circle' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: element.gradientType === 'linear' 
                            ? `linear-gradient(${element.gradientDirection}, ${element.gradientColor1}, ${element.gradientColor2})`
                            : element.gradientType === 'radial'
                            ? `radial-gradient(circle, ${element.gradientColor1}, ${element.gradientColor2})`
                            : element.fill,
                          border: `${element.strokeWidth}px ${element.strokeStyle || 'solid'} ${element.stroke}`,
                          borderRadius: '50%',
                          opacity: element.opacity,
                        }}
                      />
                    )}
                    {element.shape === 'triangle' && (
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: `${element.width * zoom / 2}px solid transparent`,
                          borderRight: `${element.width * zoom / 2}px solid transparent`,
                          borderBottom: `${element.height * zoom}px solid ${element.fill}`,
                          opacity: element.opacity,
                        }}
                      />
                    )}
                    {element.shape === 'diamond' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: element.fill,
                          border: `${element.strokeWidth}px solid ${element.stroke}`,
                          transform: 'rotate(45deg)',
                          opacity: element.opacity,
                        }}
                      />
                    )}
                    {element.shape === 'star' && (
                      <div style={{ fontSize: element.height * zoom, opacity: element.opacity, color: element.fill }}>⭐</div>
                    )}
                    {element.shape === 'arrow' && (
                      <div
                        style={{
                          width: '70%',
                          height: '40%',
                          backgroundColor: element.fill,
                          position: 'relative',
                          opacity: element.opacity,
                        }}
                      >
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderTop: `${element.height * zoom / 2}px solid transparent`,
                            borderBottom: `${element.height * zoom / 2}px solid transparent`,
                            borderLeft: `${element.width * zoom * 0.3}px solid ${element.fill}`,
                            position: 'absolute',
                            right: `-${element.width * zoom * 0.3}px`,
                            top: `-${element.height * zoom * 0.3}px`,
                          }}
                        />
                      </div>
                    )}
                    {element.shape === 'line' && (
                      <div
                        style={{
                          width: '100%',
                          height: `${element.strokeWidth}px`,
                          backgroundColor: element.fill,
                          opacity: element.opacity,
                        }}
                      />
                    )}
                  </>
                )}

                {/* Card Element */}
                {element.type === 'card' && (
                  <div
                    contentEditable={selectedElement === element.id && !element.locked}
                    suppressContentEditableWarning
                    onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: element.backgroundColor,
                      border: `${element.borderWidth}px solid ${element.borderColor}`,
                      borderRadius: `${element.borderRadius || 8}px`,
                      padding: element.padding * zoom,
                      fontSize: 18 * zoom,
                      color: '#1F2937',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      boxShadow: element.shadow === 'none' ? 'none' :
                                 element.shadow === 'small' ? '0 1px 3px rgba(0,0,0,0.1)' :
                                 element.shadow === 'medium' ? '0 4px 12px rgba(0,0,0,0.15)' :
                                 element.shadow === 'large' ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
                    }}
                    className="outline-none"
                  >
                    {element.content}
                  </div>
                )}

                {/* Graph Element */}
                {element.type === 'graph' && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'white',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: 20 * zoom,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-around',
                    }}
                  >
                    {element.graphType === 'bar' && element.data.map((item, idx) => (
                      <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                        <div
                          style={{
                            height: `${(item.value / 100) * (element.height * zoom - 60)}px`,
                            backgroundColor: element.primaryColor,
                            margin: '0 5px',
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                        <div style={{ fontSize: 12 * zoom, marginTop: 5 * zoom }}>{item.label}</div>
                      </div>
                    ))}
                    {element.graphType === 'line' && (
                      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <polyline
                          points={element.data.map((item, idx) => 
                            `${(idx / (element.data.length - 1)) * element.width * zoom},${element.height * zoom - (item.value / 100) * element.height * zoom}`
                          ).join(' ')}
                          fill="none"
                          stroke={element.primaryColor}
                          strokeWidth={3}
                        />
                      </svg>
                    )}
                  </div>
                )}

                {/* Icon Element */}
                {element.type === 'icon' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {element.icon === 'star' && <Star style={{ width: element.iconSize * zoom, height: element.iconSize * zoom, color: element.iconColor }} />}
                    {element.icon === 'lightbulb' && <Lightbulb style={{ width: element.iconSize * zoom, height: element.iconSize * zoom, color: element.iconColor }} />}
                    {element.icon === 'alert' && <AlertCircle style={{ width: element.iconSize * zoom, height: element.iconSize * zoom, color: element.iconColor }} />}
                    {element.icon === 'check' && <CheckCircle style={{ width: element.iconSize * zoom, height: element.iconSize * zoom, color: element.iconColor }} />}
                    {element.icon === 'sparkles' && <Sparkles style={{ width: element.iconSize * zoom, height: element.iconSize * zoom, color: element.iconColor }} />}
                  </div>
                )}

                {/* Selection Handles */}
                {selectedElement === element.id && !element.locked && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-lg" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-lg" />
                  </>
                )}
              </div>
            ))}
        </div>
      </Card>

      {/* Properties Panel */}
      <Card className="w-80 p-4 overflow-y-auto">
        <div className="space-y-4">
          {!selectedEl && (
            <div className="mb-4">
              <Label className="font-semibold mb-2 block">Canvas Templates</Label>
              <div className="grid grid-cols-1 gap-2">
                {CANVAS_TEMPLATES.map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="justify-start"
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {selectedEl ? (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Element Properties
                </h3>
              </div>

              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4 mt-4">
                  {selectedEl.type === 'text' && (
                    <>
                      <div>
                        <Label>Text Box Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['default', 'heading', 'subtitle', 'callout'].map(type => (
                            <Button
                              key={type}
                              variant={selectedEl.textBoxType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const updates = { textBoxType: type };
                                if (type === 'heading') {
                                  updates.fontSize = 60;
                                  updates.fontWeight = 'bold';
                                } else if (type === 'subtitle') {
                                  updates.fontSize = 36;
                                  updates.color = '#6B7280';
                                } else if (type === 'callout') {
                                  updates.backgroundColor = '#FEF3C7';
                                  updates.fontSize = 28;
                                }
                                updateElement(selectedEl.id, updates);
                              }}
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Font Family</Label>
                        <select
                          value={selectedEl.fontFamily || 'Arial, sans-serif'}
                          onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                          className="w-full mt-2 h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Verdana, sans-serif">Verdana</option>
                          <option value="'Comic Sans MS', cursive">Comic Sans</option>
                          <option value="Impact, sans-serif">Impact</option>
                          <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
                        </select>
                      </div>

                      <div>
                        <Label>Font Size</Label>
                        <Slider
                          value={[selectedEl.fontSize]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { fontSize: value })}
                          min={12}
                          max={120}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.fontSize}px</span>
                      </div>

                      <div>
                        <Label>Line Height</Label>
                        <Slider
                          value={[selectedEl.lineHeight || 1.5]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { lineHeight: value })}
                          min={1}
                          max={3}
                          step={0.1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{(selectedEl.lineHeight || 1.5).toFixed(1)}</span>
                      </div>

                      <div>
                        <Label>Letter Spacing</Label>
                        <Slider
                          value={[selectedEl.letterSpacing || 0]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { letterSpacing: value })}
                          min={-5}
                          max={20}
                          step={0.5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.letterSpacing || 0}px</span>
                      </div>

                      <div>
                        <Label>Text Shadow</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['none', 'light', 'medium', 'strong'].map(shadow => (
                            <Button
                              key={shadow}
                              variant={selectedEl.textShadow === shadow ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedEl.id, { textShadow: shadow })}
                            >
                              {shadow}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Text Color</Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="color"
                            value={selectedEl.color}
                            onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                            className="h-10 w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Background</Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="color"
                            value={selectedEl.backgroundColor === 'transparent' ? '#ffffff' : selectedEl.backgroundColor}
                            onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                            className="h-10 w-full"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { backgroundColor: 'transparent' })}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={selectedEl.fontWeight === 'bold' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => updateElement(selectedEl.id, { 
                            fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold' 
                          })}
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedEl.fontStyle === 'italic' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => updateElement(selectedEl.id, { 
                            fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' 
                          })}
                        >
                          <Italic className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={selectedEl.textAlign === 'left' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => updateElement(selectedEl.id, { textAlign: 'left' })}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedEl.textAlign === 'center' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => updateElement(selectedEl.id, { textAlign: 'center' })}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={selectedEl.textAlign === 'right' ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => updateElement(selectedEl.id, { textAlign: 'right' })}
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'shape' && (
                    <>
                      <div>
                        <Label>Gradient Fill</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button
                            variant={selectedEl.gradientType === 'none' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { gradientType: 'none' })}
                          >
                            None
                          </Button>
                          <Button
                            variant={selectedEl.gradientType === 'linear' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { gradientType: 'linear' })}
                          >
                            Linear
                          </Button>
                          <Button
                            variant={selectedEl.gradientType === 'radial' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { gradientType: 'radial' })}
                          >
                            Radial
                          </Button>
                        </div>
                      </div>

                      {selectedEl.gradientType !== 'none' && (
                        <>
                          <div>
                            <Label>Gradient Color 1</Label>
                            <input
                              type="color"
                              value={selectedEl.gradientColor1 || selectedEl.fill}
                              onChange={(e) => updateElement(selectedEl.id, { gradientColor1: e.target.value })}
                              className="h-10 w-full mt-2"
                            />
                          </div>
                          <div>
                            <Label>Gradient Color 2</Label>
                            <input
                              type="color"
                              value={selectedEl.gradientColor2 || '#9333EA'}
                              onChange={(e) => updateElement(selectedEl.id, { gradientColor2: e.target.value })}
                              className="h-10 w-full mt-2"
                            />
                          </div>
                          {selectedEl.gradientType === 'linear' && (
                            <div>
                              <Label>Direction</Label>
                              <select
                                value={selectedEl.gradientDirection || 'to bottom'}
                                onChange={(e) => updateElement(selectedEl.id, { gradientDirection: e.target.value })}
                                className="w-full mt-2 h-10 px-3 rounded-md border border-gray-300"
                              >
                                <option value="to right">→ Left to Right</option>
                                <option value="to left">← Right to Left</option>
                                <option value="to bottom">↓ Top to Bottom</option>
                                <option value="to top">↑ Bottom to Top</option>
                                <option value="to bottom right">↘ Diagonal</option>
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <Label>Shape</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button
                            variant={selectedEl.shape === 'rectangle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'rectangle' })}
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Rect
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'circle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'circle' })}
                          >
                            <Circle className="w-4 h-4 mr-1" />
                            Circle
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'triangle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'triangle' })}
                          >
                            <Triangle className="w-4 h-4 mr-1" />
                            Triangle
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'diamond' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'diamond' })}
                          >
                            <Diamond className="w-4 h-4 mr-1" />
                            Diamond
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'star' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'star' })}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Star
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'arrow' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'arrow' })}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Arrow
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'line' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { shape: 'line' })}
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Line
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Fill Color</Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="color"
                            value={selectedEl.fill}
                            onChange={(e) => updateElement(selectedEl.id, { fill: e.target.value })}
                            className="h-10 flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { fill: 'transparent', strokeWidth: Math.max(2, selectedEl.strokeWidth) })}
                            title="Make transparent"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Stroke Color</Label>
                        <input
                          type="color"
                          value={selectedEl.stroke}
                          onChange={(e) => updateElement(selectedEl.id, { stroke: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Stroke Width</Label>
                        <Slider
                          value={[selectedEl.strokeWidth]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { strokeWidth: value })}
                          min={0}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.strokeWidth}px</span>
                      </div>

                      <div>
                        <Label>Stroke Style</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button
                            variant={selectedEl.strokeStyle === 'solid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { strokeStyle: 'solid' })}
                          >
                            Solid
                          </Button>
                          <Button
                            variant={selectedEl.strokeStyle === 'dashed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { strokeStyle: 'dashed' })}
                          >
                            Dashed
                          </Button>
                          <Button
                            variant={selectedEl.strokeStyle === 'dotted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { strokeStyle: 'dotted' })}
                          >
                            Dotted
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Opacity</Label>
                        <Slider
                          value={[selectedEl.opacity * 100]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { opacity: value / 100 })}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{Math.round(selectedEl.opacity * 100)}%</span>
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'card' && (
                    <>
                      <div>
                        <Label>Card Preset</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { type: 'default', bg: '#F9FAFB', border: '#E5E7EB' },
                            { type: 'success', bg: '#D1FAE5', border: '#10B981' },
                            { type: 'info', bg: '#DBEAFE', border: '#3B82F6' },
                            { type: 'warning', bg: '#FEF3C7', border: '#F59E0B' },
                            { type: 'danger', bg: '#FEE2E2', border: '#EF4444' },
                            { type: 'purple', bg: '#F3E8FF', border: '#A855F7' }
                          ].map(preset => (
                            <Button
                              key={preset.type}
                              variant={selectedEl.cardType === preset.type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedEl.id, {
                                cardType: preset.type,
                                backgroundColor: preset.bg,
                                borderColor: preset.border
                              })}
                            >
                              {preset.type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Background Color</Label>
                        <input
                          type="color"
                          value={selectedEl.backgroundColor}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Border Color</Label>
                        <input
                          type="color"
                          value={selectedEl.borderColor}
                          onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Border Radius</Label>
                        <Slider
                          value={[selectedEl.borderRadius || 8]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { borderRadius: value })}
                          min={0}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.borderRadius || 8}px</span>
                      </div>

                      <div>
                        <Label>Shadow</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['none', 'small', 'medium', 'large'].map(shadow => (
                            <Button
                              key={shadow}
                              variant={selectedEl.shadow === shadow ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedEl.id, { shadow })}
                            >
                              {shadow}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'graph' && (
                    <>
                      <div>
                        <Label>Graph Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button
                            variant={selectedEl.graphType === 'bar' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { graphType: 'bar' })}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Bar
                          </Button>
                          <Button
                            variant={selectedEl.graphType === 'line' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedEl.id, { graphType: 'line' })}
                          >
                            <LineChart className="w-4 h-4 mr-1" />
                            Line
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Primary Color</Label>
                        <input
                          type="color"
                          value={selectedEl.primaryColor}
                          onChange={(e) => updateElement(selectedEl.id, { primaryColor: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'icon' && (
                    <>
                      <div>
                        <Label>Icon</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {['star', 'lightbulb', 'alert', 'check', 'sparkles'].map(icon => (
                            <Button
                              key={icon}
                              variant={selectedEl.icon === icon ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedEl.id, { icon })}
                            >
                              {icon === 'star' && <Star className="w-4 h-4" />}
                              {icon === 'lightbulb' && <Lightbulb className="w-4 h-4" />}
                              {icon === 'alert' && <AlertCircle className="w-4 h-4" />}
                              {icon === 'check' && <CheckCircle className="w-4 h-4" />}
                              {icon === 'sparkles' && <Sparkles className="w-4 h-4" />}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Icon Color</Label>
                        <input
                          type="color"
                          value={selectedEl.iconColor}
                          onChange={(e) => updateElement(selectedEl.id, { iconColor: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
                      </div>

                      <div>
                        <Label>Icon Size</Label>
                        <Slider
                          value={[selectedEl.iconSize]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { iconSize: value })}
                          min={24}
                          max={200}
                          step={4}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.iconSize}px</span>
                      </div>
                    </>
                  )}

                  {selectedEl.type === 'image' && (
                    <>
                      <Button
                        onClick={() => handleImageUpload(selectedEl.id)}
                        className="w-full"
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Change Image'}
                      </Button>

                      <div>
                        <Label>Object Fit</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {['cover', 'contain', 'fill'].map(fit => (
                            <Button
                              key={fit}
                              variant={selectedEl.objectFit === fit ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElement(selectedEl.id, { objectFit: fit })}
                            >
                              {fit}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Opacity</Label>
                        <Slider
                          value={[(selectedEl.opacity || 1) * 100]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { opacity: value / 100 })}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{Math.round((selectedEl.opacity || 1) * 100)}%</span>
                      </div>

                      <div>
                        <Label>Grayscale</Label>
                        <Slider
                          value={[selectedEl.filter?.grayscale || 0]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, grayscale: value }
                          })}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.grayscale || 0}%</span>
                      </div>

                      <div>
                        <Label>Sepia</Label>
                        <Slider
                          value={[selectedEl.filter?.sepia || 0]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, sepia: value }
                          })}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.sepia || 0}%</span>
                      </div>

                      <div>
                        <Label>Blur</Label>
                        <Slider
                          value={[selectedEl.filter?.blur || 0]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, blur: value }
                          })}
                          min={0}
                          max={10}
                          step={0.5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.blur || 0}px</span>
                      </div>

                      <div>
                        <Label>Brightness</Label>
                        <Slider
                          value={[selectedEl.filter?.brightness || 100]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, brightness: value }
                          })}
                          min={0}
                          max={200}
                          step={5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.brightness || 100}%</span>
                      </div>

                      <div>
                        <Label>Contrast</Label>
                        <Slider
                          value={[selectedEl.filter?.contrast || 100]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, contrast: value }
                          })}
                          min={0}
                          max={200}
                          step={5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.contrast || 100}%</span>
                      </div>

                      <div>
                        <Label>Saturation</Label>
                        <Slider
                          value={[selectedEl.filter?.saturate || 100]}
                          onValueChange={([value]) => updateElement(selectedEl.id, { 
                            filter: { ...selectedEl.filter, saturate: value }
                          })}
                          min={0}
                          max={200}
                          step={5}
                          className="mt-2"
                        />
                        <span className="text-xs text-gray-500">{selectedEl.filter?.saturate || 100}%</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateElement(selectedEl.id, { 
                          filter: { grayscale: 0, sepia: 0, blur: 0, brightness: 100, contrast: 100, saturate: 100 },
                          opacity: 1
                        })}
                        className="w-full"
                      >
                        Reset Filters
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="layout" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>X Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.width)}
                        onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 50 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={Math.round(selectedEl.height)}
                        onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 50 })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Rotation</Label>
                    <Slider
                      value={[selectedEl.rotation || 0]}
                      onValueChange={([value]) => updateElement(selectedEl.id, { rotation: value })}
                      min={0}
                      max={360}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-gray-500">{selectedEl.rotation || 0}°</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bringToFront(selectedEl.id)}
                      className="flex-1"
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      To Front
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendToBack(selectedEl.id)}
                      className="flex-1"
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      To Back
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElement(selectedEl.id, { locked: !selectedEl.locked })}
                    className="w-full"
                  >
                    {selectedEl.locked ? (
                      <><Unlock className="w-4 h-4 mr-2" /> Unlock</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Lock</>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaste('normal')}
                    disabled={!copiedElement}
                    className="w-full"
                  >
                    <Clipboard className="w-4 h-4 mr-1" />
                    Paste
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaste('merge')}
                    disabled={!copiedElement || copiedElement.type !== selectedEl.type}
                    className="w-full"
                    title="Merge styles from copied element"
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Merge
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateElement(selectedEl.id)}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteElement(selectedEl.id)}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select an element to edit its properties</p>
              <p className="text-sm mt-2">Or add elements from the toolbar</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}