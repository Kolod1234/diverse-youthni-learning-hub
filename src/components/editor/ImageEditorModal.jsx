import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Download, RotateCw, Eraser, Type, Crop, Maximize2, Wand2, Loader2, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ImageEditorModal({ imageUrl, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState('filters');
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  // Erase tool
  const [eraseMode, setEraseMode] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  
  // Crop
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  
  // Resize
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  
  // AI Text Replacement
  const [textToReplace, setTextToReplace] = useState('');
  const [replacementText, setReplacementText] = useState('');
  const [highlightMode, setHighlightMode] = useState(false);
  const [textRegions, setTextRegions] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setResizeWidth(img.width);
      setResizeHeight(img.height);
      drawCanvas(img);
      saveToHistory();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawCanvas = (img = image, applyFilters = true) => {
    if (!img || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.save();
    
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    if (applyFilters) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    }
    
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex + 1];
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [brightness, contrast, saturation, blur, rotation]);

  const handleMouseDown = (e) => {
    if (eraseMode) {
      setIsDrawing(true);
      erase(e);
    } else if (cropMode) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCropStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    } else if (highlightMode) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCurrentRegion({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (eraseMode && isDrawing) {
      erase(e);
    } else if (cropMode && cropStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCropEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      drawCropRect();
    } else if (highlightMode && currentRegion) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCurrentRegion({
        ...currentRegion,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
      drawTextRegions();
    }
  };

  const handleMouseUp = () => {
    if (eraseMode) {
      setIsDrawing(false);
      saveToHistory();
    } else if (cropMode && cropStart && cropEnd) {
      applyCrop();
    } else if (highlightMode && currentRegion) {
      const width = Math.abs(currentRegion.endX - currentRegion.startX);
      const height = Math.abs(currentRegion.endY - currentRegion.startY);
      if (width > 10 && height > 10) {
        setTextRegions([...textRegions, currentRegion]);
        toast.success('Text region highlighted!');
      }
      setCurrentRegion(null);
    }
  };

  const erase = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawCropRect = () => {
    if (!cropStart || !cropEnd) return;
    
    drawCanvas(image, true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      cropStart.x,
      cropStart.y,
      cropEnd.x - cropStart.x,
      cropEnd.y - cropStart.y
    );
    ctx.setLineDash([]);
  };

  const drawTextRegions = () => {
    drawCanvas(image, true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw existing regions
    textRegions.forEach((region) => {
      const x = Math.min(region.startX, region.endX);
      const y = Math.min(region.startY, region.endY);
      const width = Math.abs(region.endX - region.startX);
      const height = Math.abs(region.endY - region.startY);
      
      ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
    
    // Draw current region being drawn
    if (currentRegion) {
      const x = Math.min(currentRegion.startX, currentRegion.endX);
      const y = Math.min(currentRegion.startY, currentRegion.endY);
      const width = Math.abs(currentRegion.endX - currentRegion.startX);
      const height = Math.abs(currentRegion.endY - currentRegion.startY);
      
      ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  };

  const applyCrop = () => {
    if (!cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    const imageData = ctx.getImageData(x, y, width, height);
    
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
    
    setCropStart(null);
    setCropEnd(null);
    setCropMode(false);
    setResizeWidth(width);
    setResizeHeight(height);
    saveToHistory();
    toast.success('Image cropped!');
  };

  const applyResize = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    canvas.width = resizeWidth;
    canvas.height = resizeHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tempCanvas, 0, 0, resizeWidth, resizeHeight);
    
    saveToHistory();
    toast.success('Image resized!');
  };

  const handleAITextReplace = async () => {
    if (textRegions.length === 0) {
      toast.error('Please highlight text areas first');
      return;
    }
    
    if (!replacementText.trim()) {
      toast.error('Please enter replacement text');
      return;
    }
    
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Step 1: Erase the highlighted text areas
      toast.info('Erasing highlighted text...');
      ctx.globalCompositeOperation = 'destination-out';
      textRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        ctx.fillRect(x, y, width, height);
      });
      ctx.globalCompositeOperation = 'source-over';
      
      // Step 2: Create mask for AI to fill in the erased areas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      maskCtx.fillStyle = 'white';
      textRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        maskCtx.fillRect(x, y, width, height);
      });
      
      // Convert to blobs
      const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const maskBlob = await new Promise(resolve => maskCanvas.toBlob(resolve, 'image/png'));
      
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
      const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
      
      toast.info('Uploading to AI...');
      const imageUpload = await base44.integrations.Core.UploadFile({ file: imageFile });
      const maskUpload = await base44.integrations.Core.UploadFile({ file: maskFile });
      
      toast.info('Generating new text with AI...');
      const result = await base44.functions.invoke('inpaintImage', {
        imageUrl: imageUpload.file_url,
        maskUrl: maskUpload.file_url,
        prompt: `Clean, professional, legible text that says "${replacementText}". High quality typography, clear font.`
      });
      
      if (result?.data?.url) {
        const resultImg = new Image();
        resultImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          resultImg.onload = resolve;
          resultImg.onerror = reject;
          resultImg.src = result.data.url;
        });
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(resultImg, 0, 0);
        
        setTextRegions([]);
        setReplacementText('');
        setHighlightMode(false);
        saveToHistory();
        toast.success('Text replaced successfully!');
      } else {
        throw new Error('No image returned from AI');
      }
      
    } catch (error) {
      console.error('Text replacement error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
      toast.error('Failed to replace text: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const finalDataUrl = canvas.toDataURL('image/png');
    onSave(finalDataUrl);
    toast.success('Image saved!');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Image downloaded!');
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    toast.success('Filters reset!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Image Editor</h3>
            <p className="text-sm text-gray-600">Edit, crop, and enhance your image</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tools Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="filters" className="space-y-4">
                <div>
                  <Label>Brightness</Label>
                  <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} min={0} max={200} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{brightness}%</span>
                </div>

                <div>
                  <Label>Contrast</Label>
                  <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} min={0} max={200} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{contrast}%</span>
                </div>

                <div>
                  <Label>Saturation</Label>
                  <Slider value={[saturation]} onValueChange={(v) => setSaturation(v[0])} min={0} max={200} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{saturation}%</span>
                </div>

                <div>
                  <Label>Blur</Label>
                  <Slider value={[blur]} onValueChange={(v) => setBlur(v[0])} min={0} max={20} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{blur}px</span>
                </div>

                <div>
                  <Label>Rotation</Label>
                  <Slider value={[rotation]} onValueChange={(v) => setRotation(v[0])} min={0} max={360} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{rotation}°</span>
                </div>

                <Button onClick={resetFilters} variant="outline" className="w-full">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                {/* Erase Tool */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Erase Tool</Label>
                    <Button
                      size="sm"
                      variant={eraseMode ? 'default' : 'outline'}
                      onClick={() => {
                        setEraseMode(!eraseMode);
                        setCropMode(false);
                      }}
                    >
                      <Eraser className="w-4 h-4 mr-1" />
                      {eraseMode ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                  {eraseMode && (
                    <div>
                      <Label>Brush Size</Label>
                      <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={5} max={100} step={1} className="mt-2" />
                      <span className="text-xs text-gray-600">{brushSize}px</span>
                    </div>
                  )}
                </div>

                {/* Crop Tool */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Crop Tool</Label>
                    <Button
                      size="sm"
                      variant={cropMode ? 'default' : 'outline'}
                      onClick={() => {
                        setCropMode(!cropMode);
                        setEraseMode(false);
                        setCropStart(null);
                        setCropEnd(null);
                      }}
                    >
                      <Crop className="w-4 h-4 mr-1" />
                      {cropMode ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                  {cropMode && (
                    <p className="text-xs text-gray-600">Click and drag on the image to select crop area</p>
                  )}
                </div>

                {/* Resize Tool */}
                <div className="p-4 border rounded-lg bg-white">
                  <Label className="text-base font-semibold mb-3 block">Resize Image</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Width (px)</Label>
                      <Input type="number" value={resizeWidth} onChange={(e) => setResizeWidth(Number(e.target.value))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Height (px)</Label>
                      <Input type="number" value={resizeHeight} onChange={(e) => setResizeHeight(Number(e.target.value))} className="mt-1" />
                    </div>
                    <Button onClick={applyResize} size="sm" className="w-full">
                      <Maximize2 className="w-4 h-4 mr-1" />
                      Apply Resize
                    </Button>
                  </div>
                </div>

                {/* AI Text Replacement */}
                <div className="p-4 border rounded-lg bg-white">
                  <Label className="text-base font-semibold mb-3 block">AI Text Replace</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Step 1: Highlight Text</Label>
                      <Button
                        size="sm"
                        variant={highlightMode ? 'default' : 'outline'}
                        onClick={() => {
                          setHighlightMode(!highlightMode);
                          setEraseMode(false);
                          setCropMode(false);
                        }}
                      >
                        <Type className="w-4 h-4 mr-1" />
                        {highlightMode ? 'Active' : 'Activate'}
                      </Button>
                    </div>
                    {highlightMode && (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        Click and drag over text areas to highlight them
                      </p>
                    )}
                    {textRegions.length > 0 && (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-xs text-green-700">{textRegions.length} region(s) highlighted</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTextRegions([]);
                            drawCanvas(image, true);
                            toast.success('Regions cleared');
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Label className="text-sm">Step 2: Enter New Text</Label>
                      <Input
                        placeholder="Enter replacement text"
                        value={replacementText}
                        onChange={(e) => setReplacementText(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={handleAITextReplace} 
                      size="sm" 
                      className="w-full bg-amber-500 hover:bg-amber-600" 
                      disabled={loading || textRegions.length === 0}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Replacing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-1" />
                          Replace Text with AI
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500">Highlight text areas, then enter new text to replace them</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
            <div className="relative" style={{ cursor: eraseMode ? 'crosshair' : cropMode ? 'crosshair' : highlightMode ? 'crosshair' : 'default' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="max-w-full max-h-full border-2 border-gray-300 shadow-xl rounded-lg bg-white"
              />
              {eraseMode && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  Erase Mode Active
                </div>
              )}
              {cropMode && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                  Crop Mode - Click & Drag
                </div>
              )}
              {highlightMode && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs">
                  Highlight Text Mode - Click & Drag
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}