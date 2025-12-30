import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Download, RotateCw, Eraser, Type, Crop, Maximize2, Wand2, Loader2, Undo, Redo, Droplet, Palette, Circle, Square, Layers, Eye, EyeOff, ChevronUp, ChevronDown, Trash2, Copy, Sparkles, Search } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { createWorker } from 'tesseract.js';

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
  const [highlightTool, setHighlightTool] = useState('rectangle'); // 'rectangle' or 'brush'
  const [highlightBrushSize, setHighlightBrushSize] = useState(30);
  const [textRegions, setTextRegions] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [eraseMaskCanvas, setEraseMaskCanvas] = useState(null);
  
  // AI Object Removal
  const [objectRemovalMode, setObjectRemovalMode] = useState(false);
  const [removalTool, setRemovalTool] = useState('rectangle'); // 'rectangle' or 'brush'
  const [removalBrushSize, setRemovalBrushSize] = useState(40);
  const [removalRegions, setRemovalRegions] = useState([]);
  const [currentRemovalRegion, setCurrentRemovalRegion] = useState(null);
  const [removalMaskCanvas, setRemovalMaskCanvas] = useState(null);
  
  // Liquify/Warp tool
  const [liquifyMode, setLiquifyMode] = useState(false);
  const [warpStrength, setWarpStrength] = useState(30);
  
  // Color replacement
  const [colorPickerMode, setColorPickerMode] = useState(false);
  const [targetColor, setTargetColor] = useState('#000000');
  const [replacementColor, setReplacementColor] = useState('#ff0000');
  const [colorTolerance, setColorTolerance] = useState(30);
  
  // Vignette
  const [vignetteIntensity, setVignetteIntensity] = useState(0);
  
  // Text tool
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textOutline, setTextOutline] = useState(false);
  const [textShadow, setTextShadow] = useState(false);
  
  // Shape tools
  const [shapeMode, setShapeMode] = useState('');
  const [shapeColor, setShapeColor] = useState('#4F46E5');
  const [shapeFilled, setShapeFilled] = useState(false);
  const [shapeLineWidth, setShapeLineWidth] = useState(2);
  const [shapeStart, setShapeStart] = useState(null);
  const [shapeEnd, setShapeEnd] = useState(null);
  
  // Layers system
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [nextLayerId, setNextLayerId] = useState(1);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // OCR text editing
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSearchText, setOcrSearchText] = useState('');
  const [ocrTargetText, setOcrTargetText] = useState('');
  const [ocrReplacementText, setOcrReplacementText] = useState('');
  const [ocrRemoveText, setOcrRemoveText] = useState('');
  const [ocrHighlightBoxes, setOcrHighlightBoxes] = useState([]);
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [ocrPreprocess, setOcrPreprocess] = useState(true);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [ocrHistory, setOcrHistory] = useState([]);
  const [ocrFontFamily, setOcrFontFamily] = useState('Arial');
  const [ocrFontBold, setOcrFontBold] = useState(false);
  const [ocrFontItalic, setOcrFontItalic] = useState(false);
  const [ocrFontUnderline, setOcrFontUnderline] = useState(false);
  const [ocrTextColor, setOcrTextColor] = useState('#000000');
  const [ocrAutoCorrect, setOcrAutoCorrect] = useState(true);
  const [copiedText, setCopiedText] = useState('');
  const [ocrFontSize, setOcrFontSize] = useState(16);
  const [cursorMode, setCursorMode] = useState('default'); // 'default', 'text-select', 'edit', 'drag'
  const [selectedTextBox, setSelectedTextBox] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextContent, setEditingTextContent] = useState('');
  const [ocrTextOpacity, setOcrTextOpacity] = useState(100);
  const [ocrBackgroundColor, setOcrBackgroundColor] = useState('transparent');
  const [ocrBackgroundOpacity, setOcrBackgroundOpacity] = useState(0);
  const [ocrSubscript, setOcrSubscript] = useState(false);
  const [ocrSuperscript, setOcrSuperscript] = useState(false);
  const [showMathEditor, setShowMathEditor] = useState(false);
  const [mathSymbols, setMathSymbols] = useState(['∑', '∫', '∏', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', 'π', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', '∂', '∇', '∈', '∉', '⊂', '⊃', '∪', '∩', '∀', '∃']);
  const [greekSymbols, setGreekSymbols] = useState(['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω']);
  const [commonSymbols, setCommonSymbols] = useState(['°', '©', '®', '™', '€', '£', '¥', '¢', '¶', '§', '†', '‡', '•', '…', '‰', '‱']);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setResizeWidth(img.width);
      setResizeHeight(img.height);
      
      // Initialize with background layer
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext('2d');
      bgCtx.drawImage(img, 0, 0);
      
      const bgLayer = {
        id: 0,
        name: 'Background',
        canvas: bgCanvas,
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        locked: false
      };
      
      setLayers([bgLayer]);
      setActiveLayerId(0);
      setNextLayerId(1);
      compositeAllLayers([bgLayer]);
      saveToHistory();

      // Initialize erase mask canvas for text highlighting
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      setEraseMaskCanvas(maskCanvas);

      // Initialize removal mask canvas for object removal
      const removalCanvas = document.createElement('canvas');
      removalCanvas.width = img.width;
      removalCanvas.height = img.height;
      setRemovalMaskCanvas(removalCanvas);

      // Perform OCR
      performOCR(img);
      };
      img.src = imageUrl;
  }, [imageUrl]);

  const compositeAllLayers = (layersToComposite = layers) => {
    if (!canvasRef.current || layersToComposite.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const firstLayer = layersToComposite[0];
    canvas.width = firstLayer.canvas.width;
    canvas.height = firstLayer.canvas.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filters and rotation
    ctx.save();
    
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    
    // Composite all visible layers
    layersToComposite.forEach(layer => {
      if (!layer.visible) return;
      
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;
      ctx.drawImage(layer.canvas, 0, 0);
    });
    
    ctx.restore();
    
    // Apply vignette on top
    if (vignetteIntensity > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteIntensity / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawCanvas = (img = image, applyFilters = true) => {
    if (layers.length > 0) {
      compositeAllLayers();
      return;
    }
    
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
    
    if (vignetteIntensity > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteIntensity / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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
    if (layers.length > 0) {
      compositeAllLayers();
    } else {
      drawCanvas();
    }
  }, [brightness, contrast, saturation, blur, rotation, vignetteIntensity, layers]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // OCR text selection mode
    if (cursorMode === 'text-select' && ocrResult) {
      const clickedWord = ocrResult.words.find(word => {
        const bbox = word.bbox;
        return x >= bbox.x0 && x <= bbox.x1 && y >= bbox.y0 && y <= bbox.y1;
      });
      
      if (clickedWord) {
        setSelectedTextBox({
          bbox: clickedWord.bbox,
          text: clickedWord.text,
          originalWord: clickedWord,
          type: 'text'
        });
        setOcrTargetText(clickedWord.text);
        setOcrReplacementText(clickedWord.text);
        setEditingTextContent(clickedWord.text);
        
        // Estimate font size from bbox height
        const estimatedSize = Math.max(12, clickedWord.bbox.y1 - clickedWord.bbox.y0);
        setOcrFontSize(estimatedSize);
        
        drawSelectedTextBox(clickedWord.bbox);
        toast.success('Text selected! Edit in the panel →');
      }
      return;
    }
    
    // Object/Shape selection mode
    if (cursorMode === 'shape-select') {
      setIsDrawing(true);
      setShapeStart({ x, y });
      return;
    }
    
    if (eraseMode) {
      setIsDrawing(true);
      erase(e);
    } else if (cropMode) {
      setCropStart({ x, y });
    } else if (highlightMode) {
      if (highlightTool === 'rectangle') {
        setCurrentRegion({ startX: x, startY: y, endX: x, endY: y });
      } else if (highlightTool === 'brush') {
        setIsDrawing(true);
        paintEraseMask(x, y);
      }
    } else if (objectRemovalMode) {
      if (removalTool === 'rectangle') {
        setCurrentRemovalRegion({ startX: x, startY: y, endX: x, endY: y });
      } else if (removalTool === 'brush') {
        setIsDrawing(true);
        paintRemovalMask(x, y);
      }
    } else if (liquifyMode) {
      setIsDrawing(true);
      applyLiquify(e);
    } else if (colorPickerMode) {
      pickAndReplaceColor(x, y);
    } else if (textMode) {
      addText(x, y);
    } else if (shapeMode) {
      setShapeStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (eraseMode && isDrawing) {
      erase(e);
    } else if (cropMode && cropStart) {
      setCropEnd({ x, y });
      drawCropRect();
    } else if (highlightMode) {
      if (highlightTool === 'rectangle' && currentRegion) {
        setCurrentRegion({ ...currentRegion, endX: x, endY: y });
        drawTextRegions();
      } else if (highlightTool === 'brush' && isDrawing) {
        paintEraseMask(x, y);
      }
    } else if (objectRemovalMode) {
      if (removalTool === 'rectangle' && currentRemovalRegion) {
        setCurrentRemovalRegion({ ...currentRemovalRegion, endX: x, endY: y });
        drawRemovalRegions();
      } else if (removalTool === 'brush' && isDrawing) {
        paintRemovalMask(x, y);
      }
    } else if (liquifyMode && isDrawing) {
      applyLiquify(e);
    } else if (shapeMode && shapeStart) {
      setShapeEnd({ x, y });
      drawShapePreview();
    }
  };

  const handleMouseUp = () => {
    if (eraseMode) {
      setIsDrawing(false);
      saveToHistory();
    } else if (cropMode && cropStart && cropEnd) {
      applyCrop();
    } else if (highlightMode) {
      if (highlightTool === 'rectangle' && currentRegion) {
        const width = Math.abs(currentRegion.endX - currentRegion.startX);
        const height = Math.abs(currentRegion.endY - currentRegion.startY);
        if (width > 10 && height > 10) {
          setTextRegions([...textRegions, currentRegion]);
          toast.success('Text region highlighted!');
        }
        setCurrentRegion(null);
      } else if (highlightTool === 'brush') {
        setIsDrawing(false);
        drawTextRegions();
      }
    } else if (objectRemovalMode) {
      if (removalTool === 'rectangle' && currentRemovalRegion) {
        const width = Math.abs(currentRemovalRegion.endX - currentRemovalRegion.startX);
        const height = Math.abs(currentRemovalRegion.endY - currentRemovalRegion.startY);
        if (width > 10 && height > 10) {
          setRemovalRegions([...removalRegions, currentRemovalRegion]);
          toast.success('Object area marked!');
        }
        setCurrentRemovalRegion(null);
      } else if (removalTool === 'brush') {
        setIsDrawing(false);
        drawRemovalRegions();
      }
    } else if (liquifyMode) {
      setIsDrawing(false);
      saveToHistory();
    } else if (shapeMode && shapeStart && shapeEnd) {
      drawShape();
      setShapeStart(null);
      setShapeEnd(null);
      saveToHistory();
    }
  };

  const getActiveLayer = () => {
    return layers.find(l => l.id === activeLayerId);
  };

  const updateActiveLayer = () => {
    const layer = getActiveLayer();
    if (layer) {
      const newLayers = [...layers];
      const idx = newLayers.findIndex(l => l.id === activeLayerId);
      newLayers[idx] = { ...layer };
      setLayers(newLayers);
      compositeAllLayers(newLayers);
    }
  };

  const erase = (e) => {
    const layer = getActiveLayer();
    if (!layer || layer.locked) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = layer.canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    updateActiveLayer();
  };

  const drawCropRect = () => {
    if (!cropStart || !cropEnd) return;
    
    compositeAllLayers();
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

  const paintEraseMask = (x, y) => {
    if (!eraseMaskCanvas) return;
    
    const ctx = eraseMaskCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, highlightBrushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    drawTextRegions();
  };

  const paintRemovalMask = (x, y) => {
    if (!removalMaskCanvas) return;
    
    const ctx = removalMaskCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, removalBrushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    drawRemovalRegions();
  };

  const drawRemovalRegions = () => {
    compositeAllLayers();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw rectangle regions
    removalRegions.forEach((region) => {
      const x = Math.min(region.startX, region.endX);
      const y = Math.min(region.startY, region.endY);
      const width = Math.abs(region.endX - region.startX);
      const height = Math.abs(region.endY - region.startY);
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
    
    // Draw current rectangle region being drawn
    if (currentRemovalRegion) {
      const x = Math.min(currentRemovalRegion.startX, currentRemovalRegion.endX);
      const y = Math.min(currentRemovalRegion.startY, currentRemovalRegion.endY);
      const width = Math.abs(currentRemovalRegion.endX - currentRemovalRegion.startX);
      const height = Math.abs(currentRemovalRegion.endY - currentRemovalRegion.startY);
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Draw brush-painted mask overlay
    if (removalMaskCanvas && removalTool === 'brush') {
      ctx.globalAlpha = 0.4;
      ctx.drawImage(removalMaskCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
  };

  const drawTextRegions = () => {
    compositeAllLayers();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw rectangle regions
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
    
    // Draw current rectangle region being drawn
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
    
    // Draw brush-painted mask overlay
    if (eraseMaskCanvas && highlightTool === 'brush') {
      ctx.globalAlpha = 0.4;
      ctx.drawImage(eraseMaskCanvas, 0, 0);
      ctx.globalAlpha = 1;
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

  const handleAIObjectRemoval = async () => {
    if (removalRegions.length === 0 && (!removalMaskCanvas || removalTool !== 'brush')) {
      toast.error('Please mark object areas first');
      return;
    }
    
    setLoading(true);
    try {
      toast.info('Preparing image...');
      const tempCanvas = document.createElement('canvas');
      const firstLayer = layers[0];
      tempCanvas.width = firstLayer.canvas.width;
      tempCanvas.height = firstLayer.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Composite all visible layers onto temp canvas
      layers.forEach(layer => {
        if (!layer.visible) return;
        tempCtx.globalAlpha = layer.opacity;
        tempCtx.globalCompositeOperation = layer.blendMode;
        tempCtx.drawImage(layer.canvas, 0, 0);
      });
      
      tempCtx.globalAlpha = 1;
      tempCtx.globalCompositeOperation = 'source-over';
      
      // Erase marked object areas
      toast.info('Erasing marked objects...');
      tempCtx.globalCompositeOperation = 'destination-out';
      removalRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        tempCtx.fillRect(x, y, width, height);
      });
      tempCtx.globalCompositeOperation = 'source-over';
      
      // Create mask
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = tempCanvas.width;
      maskCanvas.height = tempCanvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      maskCtx.fillStyle = 'white';
      
      removalRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        maskCtx.fillRect(x, y, width, height);
      });
      
      if (removalMaskCanvas && removalTool === 'brush') {
        maskCtx.drawImage(removalMaskCanvas, 0, 0);
      }
      
      const imageBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
      const maskBlob = await new Promise(resolve => maskCanvas.toBlob(resolve, 'image/png'));
      
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
      const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
      
      toast.info('Uploading to AI...');
      const imageUpload = await base44.integrations.Core.UploadFile({ file: imageFile });
      const maskUpload = await base44.integrations.Core.UploadFile({ file: maskFile });
      
      toast.info('Removing objects with AI...');
      const result = await base44.functions.invoke('inpaintImage', {
        imageUrl: imageUpload.file_url,
        maskUrl: maskUpload.file_url,
        prompt: `Clean, natural background. Remove the selected object completely and fill the area with contextually appropriate background that matches the surrounding environment. High quality inpainting.`
      });
      
      if (result?.data?.url) {
        const resultImg = new Image();
        resultImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          resultImg.onload = resolve;
          resultImg.onerror = reject;
          resultImg.src = result.data.url;
        });
        
        const bgLayer = layers.find(l => l.id === 0);
        if (bgLayer) {
          const bgCtx = bgLayer.canvas.getContext('2d');
          bgCtx.clearRect(0, 0, bgLayer.canvas.width, bgLayer.canvas.height);
          bgCtx.drawImage(resultImg, 0, 0);
          
          const newLayers = [...layers];
          const bgIdx = newLayers.findIndex(l => l.id === 0);
          newLayers[bgIdx] = { ...bgLayer };
          setLayers(newLayers);
          compositeAllLayers(newLayers);
        }
        
        setRemovalRegions([]);
        setObjectRemovalMode(false);
        
        if (removalMaskCanvas) {
          const maskCtx = removalMaskCanvas.getContext('2d');
          maskCtx.clearRect(0, 0, removalMaskCanvas.width, removalMaskCanvas.height);
        }
        
        saveToHistory();
        toast.success('Object removed successfully!');
      } else {
        throw new Error('No image returned from AI');
      }
      
    } catch (error) {
      console.error('Object removal error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
      toast.error('Failed to remove object: ' + errorMsg);
    } finally {
      setLoading(false);
    }
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
      // Step 1: Create temporary composite canvas (won't be recomposited)
      toast.info('Preparing image...');
      const tempCanvas = document.createElement('canvas');
      const firstLayer = layers[0];
      tempCanvas.width = firstLayer.canvas.width;
      tempCanvas.height = firstLayer.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Composite all visible layers onto temp canvas
      layers.forEach(layer => {
        if (!layer.visible) return;
        tempCtx.globalAlpha = layer.opacity;
        tempCtx.globalCompositeOperation = layer.blendMode;
        tempCtx.drawImage(layer.canvas, 0, 0);
      });
      
      // Reset composite operation
      tempCtx.globalAlpha = 1;
      tempCtx.globalCompositeOperation = 'source-over';
      
      // Step 2: Erase the highlighted text areas from temp canvas
      toast.info('Erasing highlighted text...');
      tempCtx.globalCompositeOperation = 'destination-out';
      textRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        tempCtx.fillRect(x, y, width, height);
      });
      tempCtx.globalCompositeOperation = 'source-over';
      
      // Step 3: Create mask for AI to fill in the erased areas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = tempCanvas.width;
      maskCanvas.height = tempCanvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      maskCtx.fillStyle = 'white';
      
      // Add rectangle regions to mask
      textRegions.forEach(region => {
        const x = Math.min(region.startX, region.endX);
        const y = Math.min(region.startY, region.endY);
        const width = Math.abs(region.endX - region.startX);
        const height = Math.abs(region.endY - region.startY);
        maskCtx.fillRect(x, y, width, height);
      });
      
      // Add brush-painted areas to mask
      if (eraseMaskCanvas && highlightTool === 'brush') {
        maskCtx.drawImage(eraseMaskCanvas, 0, 0);
      }
      
      // Convert to blobs
      const imageBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
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
        
        // Update the background layer with AI result
        const bgLayer = layers.find(l => l.id === 0);
        if (bgLayer) {
          const bgCtx = bgLayer.canvas.getContext('2d');
          bgCtx.clearRect(0, 0, bgLayer.canvas.width, bgLayer.canvas.height);
          bgCtx.drawImage(resultImg, 0, 0);
          
          const newLayers = [...layers];
          const bgIdx = newLayers.findIndex(l => l.id === 0);
          newLayers[bgIdx] = { ...bgLayer };
          setLayers(newLayers);
          compositeAllLayers(newLayers);
        }
        
        setTextRegions([]);
        setReplacementText('');
        setHighlightMode(false);
        
        // Clear erase mask
        if (eraseMaskCanvas) {
          const maskCtx = eraseMaskCanvas.getContext('2d');
          maskCtx.clearRect(0, 0, eraseMaskCanvas.width, eraseMaskCanvas.height);
        }
        
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
    setVignetteIntensity(0);
    toast.success('Filters reset!');
  };

  const applyLiquify = (e) => {
    const layer = getActiveLayer();
    if (!layer || layer.locked) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = layer.canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    const radius = warpStrength;
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const factor = (1 - distance / radius) * 0.5;
          const srcX = Math.floor(x + dx - dx * factor);
          const srcY = Math.floor(y + dy - dy * factor);
          const destX = Math.floor(x + dx);
          const destY = Math.floor(y + dy);

          if (srcX >= 0 && srcX < layer.canvas.width && srcY >= 0 && srcY < layer.canvas.height &&
              destX >= 0 && destX < layer.canvas.width && destY >= 0 && destY < layer.canvas.height) {
            const srcIdx = (srcY * layer.canvas.width + srcX) * 4;
            const destIdx = (destY * layer.canvas.width + destX) * 4;

            imageData.data[destIdx] = imageData.data[srcIdx];
            imageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            imageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            imageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const pickAndReplaceColor = (x, y) => {
    const layer = getActiveLayer();
    if (!layer || layer.locked) return;
    
    const ctx = layer.canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    const data = imageData.data;
    
    // Get target color from image
    const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    const tr = data[idx];
    const tg = data[idx + 1];
    const tb = data[idx + 2];
    
    // Parse replacement color
    const hex = replacementColor.replace('#', '');
    const rr = parseInt(hex.substring(0, 2), 16);
    const rg = parseInt(hex.substring(2, 4), 16);
    const rb = parseInt(hex.substring(4, 6), 16);
    
    // Replace similar colors
    for (let i = 0; i < data.length; i += 4) {
      const colorDiff = Math.sqrt(
        Math.pow(data[i] - tr, 2) +
        Math.pow(data[i + 1] - tg, 2) +
        Math.pow(data[i + 2] - tb, 2)
      );
      
      if (colorDiff <= colorTolerance) {
        data[i] = rr;
        data[i + 1] = rg;
        data[i + 2] = rb;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    updateActiveLayer();
    saveToHistory();
    toast.success('Color replaced!');
  };

  const addText = (x, y) => {
    if (!textInput.trim()) {
      toast.error('Please enter text first');
      return;
    }
    
    const layer = getActiveLayer();
    if (!layer || layer.locked) return;
    
    const ctx = layer.canvas.getContext('2d');
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (textShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    if (textOutline) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(textInput, x, y);
    }
    
    ctx.fillText(textInput, x, y);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    updateActiveLayer();
    saveToHistory();
    toast.success('Text added!');
  };

  const drawShapePreview = () => {
    if (!shapeStart || !shapeEnd) return;
    
    compositeAllLayers();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = shapeColor;
    ctx.fillStyle = shapeColor;
    ctx.lineWidth = shapeLineWidth;
    ctx.setLineDash([5, 5]);
    
    const width = shapeEnd.x - shapeStart.x;
    const height = shapeEnd.y - shapeStart.y;
    
    if (shapeMode === 'rectangle') {
      if (shapeFilled) {
        ctx.fillRect(shapeStart.x, shapeStart.y, width, height);
      } else {
        ctx.strokeRect(shapeStart.x, shapeStart.y, width, height);
      }
    } else if (shapeMode === 'circle') {
      const radius = Math.sqrt(width * width + height * height) / 2;
      const centerX = shapeStart.x + width / 2;
      const centerY = shapeStart.y + height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      if (shapeFilled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
    
    ctx.setLineDash([]);
  };

  const drawShape = () => {
    if (!shapeStart || !shapeEnd) return;
    
    const layer = getActiveLayer();
    if (!layer || layer.locked) return;
    
    const ctx = layer.canvas.getContext('2d');
    
    ctx.strokeStyle = shapeColor;
    ctx.fillStyle = shapeColor;
    ctx.lineWidth = shapeLineWidth;
    
    const width = shapeEnd.x - shapeStart.x;
    const height = shapeEnd.y - shapeStart.y;
    
    if (shapeMode === 'rectangle') {
      if (shapeFilled) {
        ctx.fillRect(shapeStart.x, shapeStart.y, width, height);
      } else {
        ctx.strokeRect(shapeStart.x, shapeStart.y, width, height);
      }
    } else if (shapeMode === 'circle') {
      const radius = Math.sqrt(width * width + height * height) / 2;
      const centerX = shapeStart.x + width / 2;
      const centerY = shapeStart.y + height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      if (shapeFilled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
    
    updateActiveLayer();
    toast.success('Shape added!');
  };

  // Layer management functions
  const addNewLayer = (type = 'empty') => {
    if (layers.length === 0) return;
    
    const firstLayer = layers[0];
    const newCanvas = document.createElement('canvas');
    newCanvas.width = firstLayer.canvas.width;
    newCanvas.height = firstLayer.canvas.height;
    
    const newLayer = {
      id: nextLayerId,
      name: `Layer ${nextLayerId}`,
      canvas: newCanvas,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false
    };
    
    setLayers([...layers, newLayer]);
    setActiveLayerId(nextLayerId);
    setNextLayerId(nextLayerId + 1);
    toast.success('New layer added!');
  };

  const deleteLayer = (layerId) => {
    if (layers.length === 1) {
      toast.error('Cannot delete the last layer');
      return;
    }
    
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    
    if (activeLayerId === layerId) {
      setActiveLayerId(newLayers[newLayers.length - 1].id);
    }
    
    compositeAllLayers(newLayers);
    toast.success('Layer deleted!');
  };

  const duplicateLayer = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const newCanvas = document.createElement('canvas');
    newCanvas.width = layer.canvas.width;
    newCanvas.height = layer.canvas.height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(layer.canvas, 0, 0);
    
    const newLayer = {
      id: nextLayerId,
      name: `${layer.name} Copy`,
      canvas: newCanvas,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      locked: false
    };
    
    const layerIndex = layers.findIndex(l => l.id === layerId);
    const newLayers = [...layers];
    newLayers.splice(layerIndex + 1, 0, newLayer);
    
    setLayers(newLayers);
    setActiveLayerId(nextLayerId);
    setNextLayerId(nextLayerId + 1);
    compositeAllLayers(newLayers);
    toast.success('Layer duplicated!');
  };

  const moveLayer = (layerId, direction) => {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;
    
    if (direction === 'up' && index === layers.length - 1) return;
    if (direction === 'down' && index === 0) return;
    
    const newLayers = [...layers];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
    
    setLayers(newLayers);
    compositeAllLayers(newLayers);
  };

  const toggleLayerVisibility = (layerId) => {
    const newLayers = layers.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
    setLayers(newLayers);
    compositeAllLayers(newLayers);
  };

  const updateLayerOpacity = (layerId, opacity) => {
    const newLayers = layers.map(l => 
      l.id === layerId ? { ...l, opacity } : l
    );
    setLayers(newLayers);
    compositeAllLayers(newLayers);
  };

  const updateLayerBlendMode = (layerId, blendMode) => {
    const newLayers = layers.map(l => 
      l.id === layerId ? { ...l, blendMode } : l
    );
    setLayers(newLayers);
    compositeAllLayers(newLayers);
  };

  const renameLayer = (layerId, newName) => {
    const newLayers = layers.map(l => 
      l.id === layerId ? { ...l, name: newName } : l
    );
    setLayers(newLayers);
  };

  const mergeLayers = (layerId1, layerId2) => {
    const layer1 = layers.find(l => l.id === layerId1);
    const layer2 = layers.find(l => l.id === layerId2);
    
    if (!layer1 || !layer2) return;
    
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = layer1.canvas.width;
    mergedCanvas.height = layer1.canvas.height;
    const mergedCtx = mergedCanvas.getContext('2d');
    
    mergedCtx.globalAlpha = layer1.opacity;
    mergedCtx.globalCompositeOperation = layer1.blendMode;
    mergedCtx.drawImage(layer1.canvas, 0, 0);
    
    mergedCtx.globalAlpha = layer2.opacity;
    mergedCtx.globalCompositeOperation = layer2.blendMode;
    mergedCtx.drawImage(layer2.canvas, 0, 0);
    
    const mergedLayer = {
      id: nextLayerId,
      name: 'Merged Layer',
      canvas: mergedCanvas,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false
    };
    
    const newLayers = layers.filter(l => l.id !== layerId1 && l.id !== layerId2);
    newLayers.push(mergedLayer);
    
    setLayers(newLayers);
    setActiveLayerId(nextLayerId);
    setNextLayerId(nextLayerId + 1);
    compositeAllLayers(newLayers);
    toast.success('Layers merged!');
  };

  const preprocessImageForOCR = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    if (ocrPreprocess) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Enhance contrast and convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Increase contrast
        const contrast = 1.5;
        let val = ((avg - 128) * contrast) + 128;
        val = Math.max(0, Math.min(255, val));
        
        // Apply threshold for better text detection
        val = val > 128 ? 255 : 0;
        
        data[i] = data[i + 1] = data[i + 2] = val;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    return canvas;
  };

  const performOCR = async (img) => {
    setOcrLoading(true);
    try {
      const worker = await createWorker(ocrLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      await worker.setParameters({
        tessedit_char_whitelist: '',
        tessedit_pageseg_mode: '3', // Fully automatic page segmentation
        preserve_interword_spaces: '1',
      });
      
      const canvas = preprocessImageForOCR(img);
      const { data } = await worker.recognize(canvas);
      
      setOcrResult(data);
      const avgConfidence = Math.round(data.confidence);
      setOcrConfidence(avgConfidence);
      await worker.terminate();
      
      toast.success(`OCR detected ${data.words.length} words (${avgConfidence}% confidence)`);
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('OCR text detection failed');
    } finally {
      setOcrLoading(false);
    }
  };

  const rerunOCR = () => {
    if (image) {
      performOCR(image);
    }
  };

  const handleOCRHighlight = () => {
    if (!ocrSearchText.trim() || !ocrResult) {
      toast.error('Please enter text to search');
      return;
    }

    const boxes = [];
    ocrResult.words.forEach(word => {
      if (word.text.toLowerCase().includes(ocrSearchText.toLowerCase())) {
        const bbox = word.bbox;
        boxes.push({
          x: bbox.x0,
          y: bbox.y0,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
          text: word.text
        });
      }
    });

    if (boxes.length > 0) {
      setOcrHighlightBoxes(boxes);
      drawOCRHighlights(boxes);
      toast.success(`Found ${boxes.length} match(es)`);
    } else {
      toast.warning('Text not found in image');
    }
  };

  const drawOCRHighlights = (boxes) => {
    compositeAllLayers();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    boxes.forEach(box => {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    });
  };

  const drawSelectedTextBox = (bbox) => {
    compositeAllLayers();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
    
    // Draw resize handles
    const handleSize = 6;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(bbox.x1 - handleSize/2, bbox.y0 - handleSize/2, handleSize, handleSize);
    ctx.fillRect(bbox.x1 - handleSize/2, bbox.y1 - handleSize/2, handleSize, handleSize);
    ctx.fillRect(bbox.x0 - handleSize/2, bbox.y0 - handleSize/2, handleSize, handleSize);
    ctx.fillRect(bbox.x0 - handleSize/2, bbox.y1 - handleSize/2, handleSize, handleSize);
  };

  const autoCorrectText = (text) => {
    if (!ocrAutoCorrect) return text;
    
    // Simple auto-correct dictionary
    const corrections = {
      'teh': 'the',
      'adn': 'and',
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
      'wiht': 'with',
      'thier': 'their',
      'acheive': 'achieve',
      'beleive': 'believe'
    };
    
    return text.split(' ').map(word => {
      const lower = word.toLowerCase();
      return corrections[lower] || word;
    }).join(' ');
  };

  const saveOCRHistory = (layer) => {
    const canvas = document.createElement('canvas');
    canvas.width = layer.canvas.width;
    canvas.height = layer.canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(layer.canvas, 0, 0);
    
    setOcrHistory([...ocrHistory, canvas.toDataURL()]);
  };

  const undoOCRChange = () => {
    if (ocrHistory.length === 0) {
      toast.error('No OCR changes to undo');
      return;
    }

    const layer = getActiveLayer();
    if (!layer) return;

    const lastState = ocrHistory[ocrHistory.length - 1];
    const img = new Image();
    img.onload = () => {
      const ctx = layer.canvas.getContext('2d');
      ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      ctx.drawImage(img, 0, 0);
      updateActiveLayer();
      setOcrHistory(ocrHistory.slice(0, -1));
      toast.success('Undid last OCR change');
    };
    img.src = lastState;
  };

  const applyTextReplacement = (bbox, replacementText) => {
    const layer = getActiveLayer();
    if (!layer) return;

    const ctx = layer.canvas.getContext('2d');
    
    const correctedText = autoCorrectText(replacementText);
    
    if (correctedText !== replacementText && ocrAutoCorrect) {
      toast.info(`Auto-corrected to: "${correctedText}"`);
    }
    const width = bbox.x1 - bbox.x0;
    const height = bbox.y1 - bbox.y0;
    
    // Advanced inpainting - blend with surrounding colors
    const surroundingData = ctx.getImageData(
      Math.max(0, bbox.x0 - 5),
      Math.max(0, bbox.y0 - 5),
      Math.min(10, layer.canvas.width - bbox.x0),
      Math.min(10, layer.canvas.height - bbox.y0)
    );
    
    const avgColor = { r: 0, g: 0, b: 0 };
    const pixels = surroundingData.data.length / 4;
    for (let i = 0; i < surroundingData.data.length; i += 4) {
      avgColor.r += surroundingData.data[i];
      avgColor.g += surroundingData.data[i + 1];
      avgColor.b += surroundingData.data[i + 2];
    }
    avgColor.r = Math.round(avgColor.r / pixels);
    avgColor.g = Math.round(avgColor.g / pixels);
    avgColor.b = Math.round(avgColor.b / pixels);
    
    // Fill with blended background
    ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
    ctx.fillRect(bbox.x0 - 2, bbox.y0 - 2, width + 4, height + 4);
    
    // Apply background if set
    if (ocrBackgroundOpacity > 0 && ocrBackgroundColor !== 'transparent') {
      const bgAlpha = ocrBackgroundOpacity / 100;
      const bgColorWithAlpha = ocrBackgroundColor.startsWith('#') 
        ? `${ocrBackgroundColor}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`
        : ocrBackgroundColor;
      
      ctx.fillStyle = bgColorWithAlpha;
      const padding = 4;
      ctx.fillRect(bbox.x0 - padding, bbox.y0 - padding, width + padding * 2, height + padding * 2);
    }
    
    // Apply new text with styling
    let fontSize = ocrFontSize || Math.max(12, height);
    
    // Adjust for subscript/superscript
    if (ocrSubscript || ocrSuperscript) {
      fontSize = fontSize * 0.7; // Smaller font for sub/super script
    }
    
    let fontStyle = '';
    if (ocrFontItalic) fontStyle += 'italic ';
    if (ocrFontBold) fontStyle += 'bold ';
    
    ctx.font = `${fontStyle}${fontSize}px ${ocrFontFamily}`;
    
    // Apply opacity
    ctx.globalAlpha = ocrTextOpacity / 100;
    ctx.fillStyle = ocrTextColor;
    
    // Adjust baseline for subscript/superscript
    if (ocrSubscript) {
      ctx.textBaseline = 'bottom';
      ctx.fillText(correctedText, bbox.x0, bbox.y1 + (fontSize * 0.3));
    } else if (ocrSuperscript) {
      ctx.textBaseline = 'bottom';
      ctx.fillText(correctedText, bbox.x0, bbox.y1 - (fontSize * 0.5));
    } else {
      ctx.textBaseline = 'bottom';
      // Add shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(correctedText, bbox.x0, bbox.y1);
    }
    
    if (ocrFontUnderline && !ocrSubscript && !ocrSuperscript) {
      const textWidth = ctx.measureText(correctedText).width;
      ctx.beginPath();
      ctx.moveTo(bbox.x0, bbox.y1 + 2);
      ctx.lineTo(bbox.x0 + textWidth, bbox.y1 + 2);
      ctx.strokeStyle = ocrTextColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;
    updateActiveLayer();
    saveToHistory();
  };

  const handleOCRReplace = async () => {
    if (!ocrReplacementText.trim() || !ocrResult) {
      toast.error('Please enter replacement text');
      return;
    }

    const layer = getActiveLayer();
    if (!layer) return;

    saveOCRHistory(layer);
    
    if (selectedTextBox) {
      // Replace selected text only
      applyTextReplacement(selectedTextBox.bbox, ocrReplacementText);
      setSelectedTextBox(null);
      compositeAllLayers();
      toast.success('Text replaced!');
    } else if (ocrTargetText.trim()) {
      // Search and replace all matches
      const matchingBoxes = [];
      ocrResult.words.forEach(word => {
        if (word.text.toLowerCase().includes(ocrTargetText.toLowerCase())) {
          matchingBoxes.push(word.bbox);
        }
      });

      if (matchingBoxes.length === 0) {
        toast.warning('Target text not found');
        return;
      }

      matchingBoxes.forEach(bbox => {
        applyTextReplacement(bbox, ocrReplacementText);
      });

      toast.success(`Replaced ${matchingBoxes.length} occurrence(s)!`);
    } else {
      toast.error('Please select text or enter text to find');
    }
  };

  const handleOCRRemove = () => {
    if (!ocrRemoveText.trim() || !ocrResult) {
      toast.error('Please enter text to remove');
      return;
    }

    const layer = getActiveLayer();
    if (!layer) return;

    saveOCRHistory(layer);

    const ctx = layer.canvas.getContext('2d');
    
    const matchingBoxes = [];
    ocrResult.words.forEach(word => {
      if (word.text.toLowerCase().includes(ocrRemoveText.toLowerCase())) {
        matchingBoxes.push(word.bbox);
      }
    });

    if (matchingBoxes.length === 0) {
      toast.warning('Text not found');
      return;
    }

    matchingBoxes.forEach(bbox => {
      // Advanced inpainting for removal
      const width = bbox.x1 - bbox.x0;
      const height = bbox.y1 - bbox.y0;
      
      const surroundingData = ctx.getImageData(
        Math.max(0, bbox.x0 - 10),
        Math.max(0, bbox.y0 - 10),
        Math.min(20, layer.canvas.width - bbox.x0),
        Math.min(20, layer.canvas.height - bbox.y0)
      );
      
      const avgColor = { r: 0, g: 0, b: 0 };
      const pixels = surroundingData.data.length / 4;
      for (let i = 0; i < surroundingData.data.length; i += 4) {
        avgColor.r += surroundingData.data[i];
        avgColor.g += surroundingData.data[i + 1];
        avgColor.b += surroundingData.data[i + 2];
      }
      avgColor.r = Math.round(avgColor.r / pixels);
      avgColor.g = Math.round(avgColor.g / pixels);
      avgColor.b = Math.round(avgColor.b / pixels);
      
      ctx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
      ctx.fillRect(bbox.x0 - 2, bbox.y0 - 2, width + 4, height + 4);
    });

    updateActiveLayer();
    saveToHistory();
    toast.success(`Removed ${matchingBoxes.length} text occurrence(s)!`);
  };

  const handleCopyText = () => {
    if (!ocrTargetText.trim()) {
      toast.error('Please enter text to copy');
      return;
    }
    setCopiedText(ocrTargetText);
    navigator.clipboard.writeText(ocrTargetText);
    toast.success('Text copied to clipboard!');
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setOcrReplacementText(text);
      toast.success('Text pasted from clipboard!');
    } catch (error) {
      if (copiedText) {
        setOcrReplacementText(copiedText);
        toast.success('Text pasted from internal clipboard!');
      } else {
        toast.error('No text in clipboard');
      }
    }
  };

  const flattenImage = () => {
    const flatCanvas = document.createElement('canvas');
    const firstLayer = layers[0];
    flatCanvas.width = firstLayer.canvas.width;
    flatCanvas.height = firstLayer.canvas.height;
    const flatCtx = flatCanvas.getContext('2d');
    
    layers.forEach(layer => {
      if (!layer.visible) return;
      flatCtx.globalAlpha = layer.opacity;
      flatCtx.globalCompositeOperation = layer.blendMode;
      flatCtx.drawImage(layer.canvas, 0, 0);
    });
    
    const flatLayer = {
      id: 0,
      name: 'Flattened',
      canvas: flatCanvas,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false
    };
    
    setLayers([flatLayer]);
    setActiveLayerId(0);
    setNextLayerId(1);
    compositeAllLayers([flatLayer]);
    saveToHistory();
    toast.success('Image flattened!');
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
          {/* Layers Panel */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </h4>
              <Button size="sm" onClick={() => addNewLayer()} className="h-7 px-2">
                Add Layer
              </Button>
            </div>
            
            <div className="space-y-2 mb-4">
              {[...layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  className={`border rounded-lg p-2 bg-white ${
                    activeLayerId === layer.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={layer.name}
                      onChange={(e) => renameLayer(layer.id, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                      >
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <Label className="text-xs">Opacity: {Math.round(layer.opacity * 100)}%</Label>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={(v) => updateLayerOpacity(layer.id, v[0] / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <Label className="text-xs">Blend Mode</Label>
                    <select
                      value={layer.blendMode}
                      onChange={(e) => updateLayerBlendMode(layer.id, e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                      <option value="darken">Darken</option>
                      <option value="lighten">Lighten</option>
                      <option value="color-dodge">Color Dodge</option>
                      <option value="color-burn">Color Burn</option>
                      <option value="hard-light">Hard Light</option>
                      <option value="soft-light">Soft Light</option>
                      <option value="difference">Difference</option>
                      <option value="exclusion">Exclusion</option>
                      <option value="hue">Hue</option>
                      <option value="saturation">Saturation</option>
                      <option value="color">Color</option>
                      <option value="luminosity">Luminosity</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, 'up');
                      }}
                      disabled={layers.indexOf(layer) === layers.length - 1}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer.id, 'down');
                      }}
                      disabled={layers.indexOf(layer) === 0}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this layer?')) deleteLayer(layer.id);
                      }}
                      disabled={layers.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={flattenImage}
                disabled={layers.length === 1}
              >
                Flatten All Layers
              </Button>
            </div>
          </div>

          {/* Tools Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
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

                <div>
                  <Label>Vignette</Label>
                  <Slider value={[vignetteIntensity]} onValueChange={(v) => setVignetteIntensity(v[0])} min={0} max={100} step={1} className="mt-2" />
                  <span className="text-xs text-gray-600">{vignetteIntensity}%</span>
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
                      <>
                        <div className="flex gap-2 mb-2">
                          <Button
                            size="sm"
                            variant={highlightTool === 'rectangle' ? 'default' : 'outline'}
                            onClick={() => setHighlightTool('rectangle')}
                            className="flex-1"
                          >
                            <Square className="w-3 h-3 mr-1" />
                            Rectangle
                          </Button>
                          <Button
                            size="sm"
                            variant={highlightTool === 'brush' ? 'default' : 'outline'}
                            onClick={() => setHighlightTool('brush')}
                            className="flex-1"
                          >
                            <Eraser className="w-3 h-3 mr-1" />
                            Brush
                          </Button>
                        </div>
                        
                        {highlightTool === 'brush' && (
                          <div>
                            <Label className="text-xs">Brush Size</Label>
                            <Slider 
                              value={[highlightBrushSize]} 
                              onValueChange={(v) => setHighlightBrushSize(v[0])} 
                              min={10} 
                              max={100} 
                              step={5} 
                              className="mt-2" 
                            />
                            <span className="text-xs text-gray-600">{highlightBrushSize}px</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                          {highlightTool === 'rectangle' 
                            ? 'Click and drag to select text areas' 
                            : 'Paint over text/letters to mark for replacement'}
                        </p>
                      </>
                    )}
                    
                    {(textRegions.length > 0 || (eraseMaskCanvas && highlightTool === 'brush')) && (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-xs text-green-700">
                          {textRegions.length > 0 && `${textRegions.length} region(s) `}
                          {highlightTool === 'brush' && 'Painted areas '}
                          marked
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTextRegions([]);
                            if (eraseMaskCanvas) {
                              const maskCtx = eraseMaskCanvas.getContext('2d');
                              maskCtx.clearRect(0, 0, eraseMaskCanvas.width, eraseMaskCanvas.height);
                            }
                            compositeAllLayers();
                            toast.success('Markings cleared');
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
                      disabled={loading || (textRegions.length === 0 && highlightTool !== 'brush')}
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
                    <p className="text-xs text-gray-500">
                      {highlightTool === 'rectangle' 
                        ? 'Select text areas with rectangle, then enter new text' 
                        : 'Paint over letters/words, then enter replacement text'}
                    </p>
                  </div>
                </div>

                {/* AI Object Removal */}
                <div className="p-4 border rounded-lg bg-white">
                  <Label className="text-base font-semibold mb-3 block">AI Object Removal</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Step 1: Mark Object</Label>
                      <Button
                        size="sm"
                        variant={objectRemovalMode ? 'default' : 'outline'}
                        onClick={() => {
                          setObjectRemovalMode(!objectRemovalMode);
                          setEraseMode(false);
                          setCropMode(false);
                          setHighlightMode(false);
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {objectRemovalMode ? 'Active' : 'Activate'}
                      </Button>
                    </div>
                    
                    {objectRemovalMode && (
                      <>
                        <div className="flex gap-2 mb-2">
                          <Button
                            size="sm"
                            variant={removalTool === 'rectangle' ? 'default' : 'outline'}
                            onClick={() => setRemovalTool('rectangle')}
                            className="flex-1"
                          >
                            <Square className="w-3 h-3 mr-1" />
                            Rectangle
                          </Button>
                          <Button
                            size="sm"
                            variant={removalTool === 'brush' ? 'default' : 'outline'}
                            onClick={() => setRemovalTool('brush')}
                            className="flex-1"
                          >
                            <Eraser className="w-3 h-3 mr-1" />
                            Brush
                          </Button>
                        </div>
                        
                        {removalTool === 'brush' && (
                          <div>
                            <Label className="text-xs">Brush Size</Label>
                            <Slider 
                              value={[removalBrushSize]} 
                              onValueChange={(v) => setRemovalBrushSize(v[0])} 
                              min={15} 
                              max={120} 
                              step={5} 
                              className="mt-2" 
                            />
                            <span className="text-xs text-gray-600">{removalBrushSize}px</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                          {removalTool === 'rectangle' 
                            ? 'Select object areas to remove' 
                            : 'Paint over objects to remove'}
                        </p>
                      </>
                    )}
                    
                    {(removalRegions.length > 0 || (removalMaskCanvas && removalTool === 'brush')) && (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-xs text-green-700">
                          {removalRegions.length > 0 && `${removalRegions.length} area(s) `}
                          {removalTool === 'brush' && 'Painted areas '}
                          marked
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRemovalRegions([]);
                            if (removalMaskCanvas) {
                              const maskCtx = removalMaskCanvas.getContext('2d');
                              maskCtx.clearRect(0, 0, removalMaskCanvas.width, removalMaskCanvas.height);
                            }
                            compositeAllLayers();
                            toast.success('Markings cleared');
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleAIObjectRemoval} 
                      size="sm" 
                      className="w-full bg-red-500 hover:bg-red-600" 
                      disabled={loading || (removalRegions.length === 0 && removalTool !== 'brush')}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Remove Object with AI
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500">
                      {removalTool === 'rectangle' 
                        ? 'Select object areas, AI will remove them and regenerate background' 
                        : 'Paint over objects, AI will intelligently remove them'}
                    </p>
                  </div>
                </div>

                {/* OCR Text Tools */}
                <div className="p-4 border rounded-lg bg-white">
                  <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    OCR Text Tools
                  </Label>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <Label className="text-xs">Language</Label>
                      <select 
                        value={ocrLanguage} 
                        onChange={(e) => setOcrLanguage(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm mt-1"
                        disabled={ocrLoading}
                      >
                        <option value="eng">English</option>
                        <option value="spa">Spanish</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="ita">Italian</option>
                        <option value="por">Portuguese</option>
                        <option value="rus">Russian</option>
                        <option value="ara">Arabic</option>
                        <option value="chi_sim">Chinese (Simplified)</option>
                        <option value="chi_tra">Chinese (Traditional)</option>
                        <option value="jpn">Japanese</option>
                        <option value="kor">Korean</option>
                        <option value="hin">Hindi</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ocr-preprocess"
                        checked={ocrPreprocess}
                        onChange={(e) => setOcrPreprocess(e.target.checked)}
                        className="rounded"
                        disabled={ocrLoading}
                      />
                      <Label htmlFor="ocr-preprocess" className="text-xs cursor-pointer">
                        Enhance image quality (for low quality/complex layouts)
                      </Label>
                    </div>
                    
                    <Button size="sm" onClick={rerunOCR} variant="outline" className="w-full" disabled={ocrLoading || !image}>
                      {ocrLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Type className="w-3 h-3 mr-1" />
                          Re-run OCR
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {ocrLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-800">Detecting text with enhanced recognition...</span>
                      </div>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                      <div className="text-xs text-green-800">
                        <div>✅ Detected {ocrResult.words.length} words</div>
                        <div className="mt-1">📊 Confidence: {ocrConfidence}%</div>
                      </div>
                    </div>
                  )}

                  {/* Cursor Mode Selector */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                    <Label className="text-xs font-semibold mb-2 block">Cursor Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={cursorMode === 'default' ? 'default' : 'outline'}
                        onClick={() => setCursorMode('default')}
                        className="text-xs"
                      >
                        🖱️ Default
                      </Button>
                      <Button
                        size="sm"
                        variant={cursorMode === 'text-select' ? 'default' : 'outline'}
                        onClick={() => setCursorMode('text-select')}
                        className="text-xs"
                        disabled={!ocrResult}
                      >
                        📝 Select Text
                      </Button>
                      <Button
                        size="sm"
                        variant={cursorMode === 'drag' ? 'default' : 'outline'}
                        onClick={() => setCursorMode('drag')}
                        className="text-xs"
                      >
                        ✋ Drag
                      </Button>
                      <Button
                        size="sm"
                        variant={cursorMode === 'zoom' ? 'default' : 'outline'}
                        onClick={() => setCursorMode('zoom')}
                        className="text-xs"
                      >
                        🔍 Zoom
                      </Button>
                      <Button
                        size="sm"
                        variant={cursorMode === 'shape-select' ? 'default' : 'outline'}
                        onClick={() => setCursorMode('shape-select')}
                        className="text-xs col-span-2"
                      >
                        🔷 Select Shape/Object
                      </Button>
                    </div>
                    {cursorMode === 'text-select' && (
                      <p className="text-xs text-blue-700 mt-2">
                        Click on any text in the image to select and edit it
                      </p>
                    )}
                    {cursorMode === 'shape-select' && (
                      <p className="text-xs text-blue-700 mt-2">
                        Click and drag to select shapes, objects, or regions
                      </p>
                    )}
                  </div>

                  {selectedTextBox && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs font-semibold">
                          Selected {selectedTextBox.type === 'text' ? 'Text' : 'Object'}
                        </Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTextBox(null);
                            compositeAllLayers();
                          }}
                          className="h-6 text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                      {selectedTextBox.type === 'text' && (
                        <div className="text-xs text-green-800 bg-white p-2 rounded">
                          "{selectedTextBox.text}"
                        </div>
                      )}
                      
                      {/* Quick size adjusters */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOcrFontSize(Math.max(8, ocrFontSize - 2))}
                          className="flex-1 h-7 text-xs"
                        >
                          A- Size
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOcrFontSize(Math.min(200, ocrFontSize + 2))}
                          className="flex-1 h-7 text-xs"
                        >
                          A+ Size
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Highlight */}
                    <div>
                      <Label className="text-sm">Highlight Text</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={ocrSearchText}
                          onChange={(e) => setOcrSearchText(e.target.value)}
                          placeholder="Search text"
                          className="text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleOCRHighlight()}
                          disabled={!ocrResult}
                        />
                        <Button size="sm" onClick={handleOCRHighlight} disabled={!ocrResult}>
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {ocrHighlightBoxes.length > 0 && (
                      <div className="bg-amber-50 p-2 rounded text-xs text-amber-800">
                        Found {ocrHighlightBoxes.length} match(es)
                        <Button size="sm" variant="ghost" onClick={() => { setOcrHighlightBoxes([]); compositeAllLayers(); }} className="ml-2 h-6">
                          Clear
                        </Button>
                      </div>
                    )}

                    {/* Replace */}
                    <div>
                      <Label className="text-sm">Replace Text</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={ocrTargetText}
                          onChange={(e) => setOcrTargetText(e.target.value)}
                          placeholder="Find text"
                          className="text-sm flex-1"
                          disabled={!ocrResult}
                        />
                        <Button size="sm" onClick={handleCopyText} variant="outline" disabled={!ocrTargetText.trim()}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={ocrReplacementText}
                          onChange={(e) => setOcrReplacementText(e.target.value)}
                          placeholder="Replace with"
                          className="text-sm flex-1"
                          disabled={!ocrResult}
                        />
                        <Button size="sm" onClick={handlePasteText} variant="outline">
                          📋
                        </Button>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        <div>
                          <Label className="text-xs">Font Size</Label>
                          <div className="flex gap-2 items-center mt-1">
                            <Input
                              type="number"
                              value={ocrFontSize}
                              onChange={(e) => setOcrFontSize(Number(e.target.value))}
                              min="8"
                              max="200"
                              className="text-xs"
                            />
                            <span className="text-xs text-gray-500">px</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Font Family</Label>
                          <select 
                            value={ocrFontFamily} 
                            onChange={(e) => setOcrFontFamily(e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Impact">Impact</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                            <option value="Palatino">Palatino</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ocrFontBold} 
                              onChange={(e) => setOcrFontBold(e.target.checked)}
                              className="rounded"
                            />
                            <span className="font-bold">Bold</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ocrFontItalic} 
                              onChange={(e) => setOcrFontItalic(e.target.checked)}
                              className="rounded"
                            />
                            <span className="italic">Italic</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ocrFontUnderline} 
                              onChange={(e) => setOcrFontUnderline(e.target.checked)}
                              className="rounded"
                            />
                            <span className="underline">Underline</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ocrSubscript} 
                              onChange={(e) => {
                                setOcrSubscript(e.target.checked);
                                if (e.target.checked) setOcrSuperscript(false);
                              }}
                              className="rounded"
                            />
                            <span>X<sub>2</sub></span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ocrSuperscript} 
                              onChange={(e) => {
                                setOcrSuperscript(e.target.checked);
                                if (e.target.checked) setOcrSubscript(false);
                              }}
                              className="rounded"
                            />
                            <span>X<sup>2</sup></span>
                          </label>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Text Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input 
                              type="color" 
                              value={ocrTextColor} 
                              onChange={(e) => setOcrTextColor(e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Input 
                              type="text" 
                              value={ocrTextColor} 
                              onChange={(e) => setOcrTextColor(e.target.value)}
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Text Opacity: {ocrTextOpacity}%</Label>
                          <Slider 
                            value={[ocrTextOpacity]} 
                            onValueChange={(v) => setOcrTextOpacity(v[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Background Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input 
                              type="color" 
                              value={ocrBackgroundColor === 'transparent' ? '#ffffff' : ocrBackgroundColor} 
                              onChange={(e) => setOcrBackgroundColor(e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOcrBackgroundColor('transparent')}
                              className="flex-1 text-xs"
                            >
                              Clear BG
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Background Opacity: {ocrBackgroundOpacity}%</Label>
                          <Slider 
                            value={[ocrBackgroundOpacity]} 
                            onValueChange={(v) => setOcrBackgroundOpacity(v[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                        
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={ocrAutoCorrect} 
                            onChange={(e) => setOcrAutoCorrect(e.target.checked)}
                            className="rounded"
                          />
                          Auto-correct spelling
                        </label>
                        
                        {/* Math & Symbols Editor */}
                        <div className="border-t pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowMathEditor(!showMathEditor)}
                            className="w-full text-xs"
                          >
                            {showMathEditor ? '✖️ Close' : '➕'} Math & Symbols
                          </Button>
                          
                          {showMathEditor && (
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                              <div>
                                <Label className="text-xs font-semibold">Math Symbols</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {mathSymbols.map((symbol, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setOcrReplacementText(ocrReplacementText + symbol)}
                                      className="h-7 w-7 p-0 text-sm"
                                    >
                                      {symbol}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs font-semibold">Greek Letters</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {greekSymbols.map((symbol, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setOcrReplacementText(ocrReplacementText + symbol)}
                                      className="h-7 w-7 p-0 text-sm"
                                    >
                                      {symbol}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs font-semibold">Common Symbols</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {commonSymbols.map((symbol, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setOcrReplacementText(ocrReplacementText + symbol)}
                                      className="h-7 w-7 p-0 text-sm"
                                    >
                                      {symbol}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs font-semibold">Formula Templates</Label>
                                <div className="space-y-1 mt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOcrReplacementText('x² + y² = r²')}
                                    className="w-full text-xs justify-start"
                                  >
                                    Pythagorean: x² + y² = r²
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOcrReplacementText('E = mc²')}
                                    className="w-full text-xs justify-start"
                                  >
                                    Einstein: E = mc²
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOcrReplacementText('∫f(x)dx')}
                                    className="w-full text-xs justify-start"
                                  >
                                    Integral: ∫f(x)dx
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOcrReplacementText('∑(n=1 to ∞)')}
                                    className="w-full text-xs justify-start"
                                  >
                                    Summation: ∑(n=1 to ∞)
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setOcrReplacementText('lim(x→∞)')}
                                    className="w-full text-xs justify-start"
                                  >
                                    Limit: lim(x→∞)
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleOCRReplace} className="flex-1" disabled={!ocrResult}>
                          Replace
                        </Button>
                        <Button size="sm" onClick={undoOCRChange} variant="outline" disabled={ocrHistory.length === 0}>
                          <Undo className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove */}
                    <div>
                      <Label className="text-sm">Remove Text</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={ocrRemoveText}
                          onChange={(e) => setOcrRemoveText(e.target.value)}
                          placeholder="Text to remove"
                          className="text-sm"
                          disabled={!ocrResult}
                        />
                        <Button size="sm" onClick={handleOCRRemove} variant="destructive" disabled={!ocrResult}>
                          <Eraser className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* Liquify Tool */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Liquify/Warp</Label>
                    <Button
                      size="sm"
                      variant={liquifyMode ? 'default' : 'outline'}
                      onClick={() => {
                        setLiquifyMode(!liquifyMode);
                        setEraseMode(false);
                        setCropMode(false);
                        setHighlightMode(false);
                        setColorPickerMode(false);
                        setTextMode(false);
                        setShapeMode('');
                      }}
                    >
                      <Droplet className="w-4 h-4 mr-1" />
                      {liquifyMode ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                  {liquifyMode && (
                    <div>
                      <Label>Warp Strength</Label>
                      <Slider value={[warpStrength]} onValueChange={(v) => setWarpStrength(v[0])} min={10} max={80} step={5} className="mt-2" />
                      <span className="text-xs text-gray-600">{warpStrength}px</span>
                      <p className="text-xs text-gray-500 mt-2">Click and drag to distort the image</p>
                    </div>
                  )}
                </div>

                {/* Color Replacement */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Color Replace</Label>
                    <Button
                      size="sm"
                      variant={colorPickerMode ? 'default' : 'outline'}
                      onClick={() => {
                        setColorPickerMode(!colorPickerMode);
                        setLiquifyMode(false);
                        setEraseMode(false);
                        setCropMode(false);
                        setHighlightMode(false);
                        setTextMode(false);
                        setShapeMode('');
                      }}
                    >
                      <Palette className="w-4 h-4 mr-1" />
                      {colorPickerMode ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                  {colorPickerMode && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">New Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" value={replacementColor} onChange={(e) => setReplacementColor(e.target.value)} className="w-16 h-10" />
                          <Input type="text" value={replacementColor} onChange={(e) => setReplacementColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Tolerance</Label>
                        <Slider value={[colorTolerance]} onValueChange={(v) => setColorTolerance(v[0])} min={1} max={100} step={1} className="mt-2" />
                        <span className="text-xs text-gray-600">{colorTolerance}</span>
                      </div>
                      <p className="text-xs text-gray-500">Click a color on the image to replace it</p>
                    </div>
                  )}
                </div>

                {/* Text Tool */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Text Tool</Label>
                    <Button
                      size="sm"
                      variant={textMode ? 'default' : 'outline'}
                      onClick={() => {
                        setTextMode(!textMode);
                        setLiquifyMode(false);
                        setColorPickerMode(false);
                        setEraseMode(false);
                        setCropMode(false);
                        setHighlightMode(false);
                        setShapeMode('');
                      }}
                    >
                      <Type className="w-4 h-4 mr-1" />
                      {textMode ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                  {textMode && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Text</Label>
                        <Input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter text" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Font</Label>
                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Impact">Impact</option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Size</Label>
                        <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={200} step={1} className="mt-2" />
                        <span className="text-xs text-gray-600">{fontSize}px</span>
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-16 h-10" />
                          <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={textOutline} onChange={(e) => setTextOutline(e.target.checked)} className="rounded" />
                          Outline
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={textShadow} onChange={(e) => setTextShadow(e.target.checked)} className="rounded" />
                          Shadow
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">Click on image to place text</p>
                    </div>
                  )}
                </div>

                {/* Shape Tools */}
                <div className="p-4 border rounded-lg bg-white">
                  <Label className="text-base font-semibold mb-3 block">Shape Tools</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={shapeMode === 'rectangle' ? 'default' : 'outline'}
                        onClick={() => {
                          setShapeMode(shapeMode === 'rectangle' ? '' : 'rectangle');
                          setLiquifyMode(false);
                          setColorPickerMode(false);
                          setTextMode(false);
                          setEraseMode(false);
                          setCropMode(false);
                          setHighlightMode(false);
                        }}
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Rectangle
                      </Button>
                      <Button
                        size="sm"
                        variant={shapeMode === 'circle' ? 'default' : 'outline'}
                        onClick={() => {
                          setShapeMode(shapeMode === 'circle' ? '' : 'circle');
                          setLiquifyMode(false);
                          setColorPickerMode(false);
                          setTextMode(false);
                          setEraseMode(false);
                          setCropMode(false);
                          setHighlightMode(false);
                        }}
                        className="flex-1"
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Circle
                      </Button>
                    </div>
                    {shapeMode && (
                      <>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} className="w-16 h-10" />
                            <Input type="text" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} className="flex-1" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Line Width</Label>
                          <Slider value={[shapeLineWidth]} onValueChange={(v) => setShapeLineWidth(v[0])} min={1} max={20} step={1} className="mt-2" />
                          <span className="text-xs text-gray-600">{shapeLineWidth}px</span>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={shapeFilled} onChange={(e) => setShapeFilled(e.target.checked)} className="rounded" />
                          Filled
                        </label>
                        <p className="text-xs text-gray-500">Click and drag to draw shape</p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
            <div className="relative" style={{ 
              cursor: 
                eraseMode || cropMode || highlightMode || objectRemovalMode || liquifyMode || colorPickerMode || shapeMode ? 'crosshair' :
                textMode ? 'text' :
                cursorMode === 'text-select' ? 'text' :
                cursorMode === 'shape-select' ? 'crosshair' :
                cursorMode === 'drag' ? 'move' :
                cursorMode === 'zoom' ? 'zoom-in' :
                'default'
            }}>
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
              {objectRemovalMode && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                  Object Removal Mode - Mark Objects
                </div>
              )}
              {liquifyMode && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs">
                  Liquify Mode - Click & Drag
                </div>
              )}
              {colorPickerMode && (
                <div className="absolute top-2 left-2 bg-pink-600 text-white px-3 py-1 rounded-full text-xs">
                  Color Replace - Click Color
                </div>
              )}
              {textMode && (
                <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs">
                  Text Mode - Click to Place
                </div>
              )}
              {shapeMode && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                  {shapeMode === 'rectangle' ? 'Rectangle' : 'Circle'} - Click & Drag
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}