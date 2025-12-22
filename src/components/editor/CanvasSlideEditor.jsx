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
  Layers, Lock, Unlock, ChevronUp, ChevronDown, Music
} from 'lucide-react';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export default function CanvasSlideEditor({ slide, onChange }) {
  const [elements, setElements] = useState(slide?.canvas_elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const updateElements = (newElements) => {
    setElements(newElements);
    onChange({ ...slide, canvas_elements: newElements });
  };

  const addElement = (type) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 400,
      height: type === 'text' ? 60 : 300,
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
      }),
      ...(type === 'image' && {
        src: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Click+to+Upload',
        objectFit: 'cover',
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
      }),
    };
    updateElements([...elements, newElement]);
    setSelectedElement(newElement.id);
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

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex h-full gap-4">
      {/* Toolbar */}
      <Card className="w-20 p-3 flex flex-col gap-2">
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
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                } ${element.locked ? 'cursor-not-allowed' : ''}`}
                style={{
                  left: element.x * zoom,
                  top: element.y * zoom,
                  width: element.width * zoom,
                  height: element.height * zoom,
                  transform: `rotate(${element.rotation || 0}deg)`,
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
                  <img
                    src={element.src}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: element.objectFit,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedElement === element.id) handleImageUpload(element.id);
                    }}
                  />
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
                          backgroundColor: element.fill,
                          border: `${element.strokeWidth}px solid ${element.stroke}`,
                          opacity: element.opacity,
                        }}
                      />
                    )}
                    {element.shape === 'circle' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: element.fill,
                          border: `${element.strokeWidth}px solid ${element.stroke}`,
                          borderRadius: '50%',
                          opacity: element.opacity,
                        }}
                      />
                    )}
                  </>
                )}

                {/* Selection Handles */}
                {selectedElement === element.id && !element.locked && (
                  <>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                  </>
                )}
              </div>
            ))}
        </div>
      </Card>

      {/* Properties Panel */}
      <Card className="w-80 p-4 overflow-y-auto">
        <div className="space-y-4">
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
                        <Label>Shape</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button
                            variant={selectedEl.shape === 'rectangle' ? 'default' : 'outline'}
                            onClick={() => updateElement(selectedEl.id, { shape: 'rectangle' })}
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Rectangle
                          </Button>
                          <Button
                            variant={selectedEl.shape === 'circle' ? 'default' : 'outline'}
                            onClick={() => updateElement(selectedEl.id, { shape: 'circle' })}
                          >
                            <Circle className="w-4 h-4 mr-2" />
                            Circle
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Fill Color</Label>
                        <input
                          type="color"
                          value={selectedEl.fill}
                          onChange={(e) => updateElement(selectedEl.id, { fill: e.target.value })}
                          className="h-10 w-full mt-2"
                        />
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
                        <div className="grid grid-cols-2 gap-2 mt-2">
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