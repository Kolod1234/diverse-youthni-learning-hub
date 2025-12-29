import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Type, Trash2, Image as ImageIcon, Crop, RotateCw, Sun, Droplet, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ImageTextOverlay({ imageUrl, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'labels'
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Image editing state
  const [editedImageUrl, setEditedImageUrl] = useState(imageUrl);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const canvasRef = React.useRef(null);

  // Apply image edits to canvas
  const applyImageEdits = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Apply preset filter
    if (filter === 'grayscale') {
      ctx.filter += ' grayscale(100%)';
    } else if (filter === 'sepia') {
      ctx.filter += ' sepia(100%)';
    } else if (filter === 'invert') {
      ctx.filter += ' invert(100%)';
    } else if (filter === 'blur') {
      ctx.filter += ' blur(3px)';
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Apply crop if needed
    if (cropMode && (cropArea.width < 100 || cropArea.height < 100)) {
      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;
      
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      
      return croppedCanvas.toDataURL('image/png');
    }
    
    return canvas.toDataURL('image/png');
  };

  const handleApplyEdits = async () => {
    toast.info('Applying edits...');
    const editedUrl = await applyImageEdits();
    setEditedImageUrl(editedUrl);
    setActiveTab('labels');
    toast.success('Edits applied! Now add labels.');
  };

  const handleResetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFilter('none');
    setCropMode(false);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setEditedImageUrl(imageUrl);
  };

  const addTextBox = () => {
    const newBox = {
      id: Date.now(),
      text: 'Label',
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      fontSize: 18,
      color: '#000000',
      backgroundColor: '#FFFFFF',
      opacity: 1,
      bold: true,
      padding: 8,
      shape: 'rectangle' // rectangle, rounded, circle, pill
    };
    setTextBoxes([...textBoxes, newBox]);
    setSelectedBox(newBox.id);
    toast.success('Text label added');
  };

  const updateTextBox = (id, updates) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, ...updates } : box
    ));
  };

  const deleteTextBox = (id) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
    if (selectedBox === id) setSelectedBox(null);
  };

  const handleMouseDown = (e, box, resizeHandle = null) => {
    e.stopPropagation();
    setSelectedBox(box.id);
    setIsDragging(resizeHandle ? resizeHandle : true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedBox) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const box = textBoxes.find(b => b.id === selectedBox);
    if (!box) return;

    if (isDragging === true) {
      // Moving
      const x = ((e.clientX - container.left - dragOffset.x) / container.width) * 100;
      const y = ((e.clientY - container.top - dragOffset.y) / container.height) * 100;
      
      updateTextBox(selectedBox, {
        x: Math.max(0, Math.min(95, x)),
        y: Math.max(0, Math.min(95, y))
      });
    } else {
      // Resizing
      const boxLeft = (box.x / 100) * container.width;
      const boxTop = (box.y / 100) * container.height;
      const mouseX = e.clientX - container.left;
      const mouseY = e.clientY - container.top;

      let newWidth = box.width;
      let newHeight = box.height;
      let newX = box.x;
      let newY = box.y;

      if (isDragging.includes('e')) {
        newWidth = ((mouseX - boxLeft) / container.width) * 100;
      }
      if (isDragging.includes('w')) {
        const deltaX = mouseX - boxLeft;
        newWidth = box.width - (deltaX / container.width) * 100;
        newX = box.x + (deltaX / container.width) * 100;
      }
      if (isDragging.includes('s')) {
        newHeight = ((mouseY - boxTop) / container.height) * 100;
      }
      if (isDragging.includes('n')) {
        const deltaY = mouseY - boxTop;
        newHeight = box.height - (deltaY / container.height) * 100;
        newY = box.y + (deltaY / container.height) * 100;
      }

      updateTextBox(selectedBox, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: Math.max(5, newWidth),
        height: Math.max(3, newHeight)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getShapeStyle = (shape) => {
    switch (shape) {
      case 'rounded': return '12px';
      case 'circle': return '50%';
      case 'pill': return '999px';
      default: return '4px';
    }
  };

  const generateHTML = () => {
    const overlays = textBoxes.map(box => {
      const rgbaMatch = box.backgroundColor.match(/^#([0-9a-f]{6})$/i);
      const bgColor = rgbaMatch 
        ? `rgba(${parseInt(rgbaMatch[1].substr(0,2), 16)}, ${parseInt(rgbaMatch[1].substr(2,2), 16)}, ${parseInt(rgbaMatch[1].substr(4,2), 16)}, ${box.opacity})`
        : box.backgroundColor;
      
      return `<div style="position: absolute; left: ${box.x}%; top: ${box.y}%; width: ${box.width}%; height: ${box.height}%; font-size: ${box.fontSize}px; color: ${box.color}; background-color: ${bgColor}; padding: ${box.padding}px; border-radius: ${getShapeStyle(box.shape)}; font-weight: ${box.bold ? '700' : '400'}; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; text-align: center; pointer-events: none;">${box.text}</div>`;
    }).join('');

    return `<div style="position: relative; margin: 20px auto; max-width: 100%; text-align: center;"><img src="${imageUrl}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: block;" alt="Labeled diagram" />${overlays}</div>`;
  };

  const handleSave = async () => {
    try {
      toast.info('Generating labeled image...');
      
      // Create a canvas to render the image with labels
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load the edited image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = editedImageUrl;
      });
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Draw each text box
      textBoxes.forEach(box => {
        const x = (box.x / 100) * canvas.width;
        const y = (box.y / 100) * canvas.height;
        const width = (box.width / 100) * canvas.width;
        const height = (box.height / 100) * canvas.height;
        
        // Parse background color with opacity
        const rgbaMatch = box.backgroundColor.match(/^#([0-9a-f]{6})$/i);
        const bgColor = rgbaMatch 
          ? `rgba(${parseInt(rgbaMatch[1].substr(0,2), 16)}, ${parseInt(rgbaMatch[1].substr(2,2), 16)}, ${parseInt(rgbaMatch[1].substr(4,2), 16)}, ${box.opacity})`
          : box.backgroundColor;
        
        // Draw background shape
        ctx.fillStyle = bgColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        const borderRadius = box.shape === 'circle' ? Math.min(width, height) / 2 :
                            box.shape === 'pill' ? height / 2 :
                            box.shape === 'rounded' ? 12 : 4;
        
        if (box.shape === 'circle') {
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const radius = Math.min(width, height) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x + borderRadius, y);
          ctx.lineTo(x + width - borderRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
          ctx.lineTo(x + width, y + height - borderRadius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
          ctx.lineTo(x + borderRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
          ctx.lineTo(x, y + borderRadius);
          ctx.quadraticCurveTo(x, y, x + borderRadius, y);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Draw text
        ctx.fillStyle = box.color;
        ctx.font = `${box.bold ? 'bold' : 'normal'} ${box.fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Word wrap text if needed
        const words = box.text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - box.padding * 2 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        const lineHeight = box.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = centerY - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, i) => {
          ctx.fillText(line, centerX, startY + i * lineHeight);
        });
      });
      
      // Convert canvas to blob and upload
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'labeled-image.png', { type: 'image/png' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create HTML with the new labeled image
      const html = `<div style="text-align: center; margin: 20px auto; max-width: 100%;"><img src="${file_url}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Labeled diagram" /></div>`;
      
      onSave(html);
      toast.success('Labels saved on image!');
      onClose();
    } catch (error) {
      console.error('Failed to save labeled image:', error);
      toast.error('Failed to save image. Error: ' + error.message);
    }
  };

  const selectedBoxData = textBoxes.find(box => box.id === selectedBox);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-lg">Edit Image & Add Labels</h3>
              <p className="text-sm text-gray-500">
                {activeTab === 'edit' ? 'Adjust image before adding labels' : 'Click and drag to position labels'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'labels' && (
              <Button onClick={addTextBox} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Label
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs for Edit vs Labels */}
        <div className="px-4 pt-4 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <ImageIcon className="w-4 h-4 mr-2" />
                Edit Image
              </TabsTrigger>
              <TabsTrigger value="labels">
                <Type className="w-4 h-4 mr-2" />
                Add Labels
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto bg-gray-100">
            {activeTab === 'edit' ? (
              /* Image Editing View */
              <div className="relative mx-auto max-w-4xl bg-white rounded-lg shadow-lg p-4">
                <div 
                  className="relative"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img 
                    src={imageUrl} 
                    alt="Edit" 
                    className={`w-full h-auto rounded-lg block ${
                      filter === 'grayscale' ? 'grayscale' :
                      filter === 'sepia' ? 'sepia' :
                      filter === 'invert' ? 'invert' :
                      filter === 'blur' ? 'blur-sm' : ''
                    }`}
                    draggable={false}
                  />

                  {/* Crop overlay */}
                  {cropMode && (
                    <div 
                      className="absolute border-4 border-indigo-500 border-dashed cursor-move"
                      style={{
                        left: `${cropArea.x}%`,
                        top: `${cropArea.y}%`,
                        width: `${cropArea.width}%`,
                        height: `${cropArea.height}%`,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scissors className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Label Editing View */
              <div 
                className="relative mx-auto max-w-4xl bg-white rounded-lg shadow-lg"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                  src={editedImageUrl} 
                  alt="Edit" 
                  className="w-full h-auto rounded-lg block"
                  draggable={false}
                />
                {textBoxes.map(box => (
                <div key={box.id}>
                  <div
                  className={`absolute transition-shadow ${
                    selectedBox === box.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                  }`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    fontSize: `${box.fontSize}px`,
                    color: box.color,
                    backgroundColor: box.backgroundColor,
                    opacity: box.opacity,
                    padding: `${box.padding}px`,
                    borderRadius: getShapeStyle(box.shape),
                    fontWeight: box.bold ? '700' : '400',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    userSelect: 'none',
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, box)}
                  >
                  {box.text}
                  </div>
                  
                  {selectedBox === box.id && (
                    <>
                      {/* Resize handles */}
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-nw-resize" 
                           style={{ left: `calc(${box.x}% - 6px)`, top: `calc(${box.y}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'nw')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-ne-resize" 
                           style={{ left: `calc(${box.x + box.width}% - 6px)`, top: `calc(${box.y}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'ne')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-sw-resize" 
                           style={{ left: `calc(${box.x}% - 6px)`, top: `calc(${box.y + box.height}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'sw')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-se-resize" 
                           style={{ left: `calc(${box.x + box.width}% - 6px)`, top: `calc(${box.y + box.height}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'se')} />
                      
                      {/* Edge handles */}
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-n-resize" 
                           style={{ left: `calc(${box.x + box.width / 2}% - 6px)`, top: `calc(${box.y}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'n')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-s-resize" 
                           style={{ left: `calc(${box.x + box.width / 2}% - 6px)`, top: `calc(${box.y + box.height}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 's')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-w-resize" 
                           style={{ left: `calc(${box.x}% - 6px)`, top: `calc(${box.y + box.height / 2}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'w')} />
                      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full cursor-e-resize" 
                           style={{ left: `calc(${box.x + box.width}% - 6px)`, top: `calc(${box.y + box.height / 2}% - 6px)` }}
                           onMouseDown={(e) => handleMouseDown(e, box, 'e')} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-auto">
            {activeTab === 'edit' ? (
              /* Image Editing Controls */
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Sun className="w-4 h-4 mr-2" />
                    Adjustments
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">Brightness</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Slider
                          value={[brightness]}
                          onValueChange={(v) => setBrightness(v[0])}
                          min={0}
                          max={200}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-xs font-medium w-12">{brightness}%</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Contrast</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Slider
                          value={[contrast]}
                          onValueChange={(v) => setContrast(v[0])}
                          min={0}
                          max={200}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-xs font-medium w-12">{contrast}%</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Saturation</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Slider
                          value={[saturation]}
                          onValueChange={(v) => setSaturation(v[0])}
                          min={0}
                          max={200}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-xs font-medium w-12">{saturation}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotation
                  </h4>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[rotation]}
                      onValueChange={(v) => setRotation(v[0])}
                      min={-180}
                      max={180}
                      step={15}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-12">{rotation}°</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setRotation(r => r - 90)} className="flex-1">
                      ↶ 90°
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRotation(r => r + 90)} className="flex-1">
                      90° ↷
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Droplet className="w-4 h-4 mr-2" />
                    Filters
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'grayscale', label: 'B&W' },
                      { value: 'sepia', label: 'Sepia' },
                      { value: 'invert', label: 'Invert' },
                      { value: 'blur', label: 'Blur' }
                    ].map(f => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFilter(f.value)}
                        className={`p-2 text-xs border rounded transition-colors ${
                          filter === f.value
                            ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Crop className="w-4 h-4 mr-2" />
                    Crop
                  </h4>
                  <Button
                    variant={cropMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCropMode(!cropMode)}
                    className="w-full"
                  >
                    {cropMode ? 'Disable Crop' : 'Enable Crop'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    {cropMode ? 'Drag to define crop area' : 'Enable to crop image'}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={handleApplyEdits} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Apply Edits & Continue
                  </Button>
                  <Button onClick={handleResetEdits} variant="outline" className="w-full">
                    Reset All
                  </Button>
                </div>
              </div>
            ) : selectedBoxData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Edit Label</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTextBox(selectedBoxData.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label>Text</Label>
                  <Input
                    value={selectedBoxData.text}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { text: e.target.value })}
                    placeholder="Enter label text"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={selectedBoxData.fontSize}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { fontSize: parseInt(e.target.value) || 16 })}
                    min={10}
                    max={48}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedBoxData.color}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={selectedBoxData.color}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedBoxData.backgroundColor}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { backgroundColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={selectedBoxData.backgroundColor}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { backgroundColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Padding</Label>
                  <Input
                    type="number"
                    value={selectedBoxData.padding}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { padding: parseInt(e.target.value) || 8 })}
                    min={0}
                    max={24}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Opacity / Blending</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedBoxData.opacity}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { opacity: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{Math.round(selectedBoxData.opacity * 100)}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lower opacity blends better with the image</p>
                </div>

                <div>
                  <Label>Shape</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { value: 'rectangle', label: 'Rectangle' },
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'pill', label: 'Pill' },
                      { value: 'circle', label: 'Circle' }
                    ].map(shape => (
                      <button
                        key={shape.value}
                        type="button"
                        onClick={() => updateTextBox(selectedBoxData.id, { shape: shape.value })}
                        className={`p-2 text-xs border rounded transition-colors ${
                          selectedBoxData.shape === shape.value
                            ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bold"
                    checked={selectedBoxData.bold}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { bold: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="bold" className="cursor-pointer">Bold Text</Label>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Type className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Click "Add Label" to start</p>
                <p className="text-gray-400 text-xs mt-2">Add labels with correct spelling to your image</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          {activeTab === 'edit' ? (
            <>
              <p className="text-sm text-gray-600">Adjust image settings</p>
              <Button onClick={handleApplyEdits} className="bg-indigo-600 hover:bg-indigo-700">
                Apply & Add Labels
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {textBoxes.length} label{textBoxes.length !== 1 ? 's' : ''} added
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setActiveTab('edit')}>
                  ← Back to Edit
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                  Save Final Image
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}