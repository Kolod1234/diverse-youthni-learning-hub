import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Search, Type, Eraser, Loader2, Upload, Square, Pentagon, 
  Tag, Sparkles, Copy, Calculator, Subscript, Superscript, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { base44 } from '@/api/base44Client';

export default function OCRTextEditor({ imageUrl, onSave, onClose }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState('selector');
  const [loading, setLoading] = useState(false);
  
  // OCR & Selection
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [editingWord, setEditingWord] = useState('');
  const [selectionMode, setSelectionMode] = useState('word');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Annotations
  const [annotations, setAnnotations] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingStart, setDrawingStart] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  
  // Highlighting & Search
  const [searchText, setSearchText] = useState('');
  const [highlightedBoxes, setHighlightedBoxes] = useState([]);
  
  // Math & Formatting
  const [mathInput, setMathInput] = useState('');
  const [textFormat, setTextFormat] = useState('normal');
  const [insertMode, setInsertMode] = useState(false);
  const [insertText, setInsertText] = useState('');
  
  // Auto-save
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // --- Initialization ---

  useEffect(() => {
    if (!imageUrl) return;

    // Check for saved state
    const savedState = localStorage.getItem('ocr_editor_autosave');
    if (savedState) {
      const shouldRestore = window.confirm('Found auto-saved work. Restore it?');
      if (shouldRestore) {
        try {
          const state = JSON.parse(savedState);
          if (state.imageUrl === imageUrl) {
            setAnnotations(state.annotations || []);
            setOcrResult(state.ocrResult || null);
            toast.success('Work restored!');
          }
        } catch (e) {
          console.error('Failed to restore state:', e);
        }
      }
      localStorage.removeItem('ocr_editor_autosave');
    }

    const loadSecureImage = async () => {
      try {
        // Fetch image as blob to bypass CORS restrictions
        const response = await fetch(imageUrl, { 
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          imageRef.current = img;
          setImage(img);
          drawCanvas(img);
          performOCR(img);
          URL.revokeObjectURL(objectUrl);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          toast.error('Failed to load image');
        };
        
        img.src = objectUrl;
        
      } catch (error) {
        console.error('Image loading error:', error);
        toast.error('Could not load image due to security restrictions');
      }
    };

    loadSecureImage();

    // Auto-save every 30 seconds
    autoSaveTimerRef.current = setInterval(() => {
      autoSaveState();
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [imageUrl]);

  // --- Drawing Logic ---

  const drawCanvas = (img, overlayBoxes = [], drawAllWords = false) => {
    if (!img || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvas.width !== img.width) canvas.width = img.width;
    if (canvas.height !== img.height) canvas.height = img.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // 1. Draw Selection Boxes (OCR boundaries)
    if (drawAllWords && ocrResult) {
      const collection = selectionMode === 'character' ? ocrResult.symbols : ocrResult.words;
      collection.forEach(item => {
        const bbox = item.bbox;
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
      });
    }
    
    // 2. Draw Highlight Search Results
    overlayBoxes.forEach(box => {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    });

    // 3. Draw Active Selections
    selectedItems.forEach(item => {
      const bbox = item.bbox;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
    });

    // 4. Draw Annotations (Boxes/Polygons)
    annotations.forEach((annotation) => {
       drawAnnotation(ctx, annotation);
    });

    // 5. Draw Polygon in progress
    if (currentPolygon.length > 0) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      currentPolygon.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };

  const drawAnnotation = (ctx, annotation) => {
    if (annotation.type === 'box') {
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 3;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      if (annotation.label) drawLabel(ctx, annotation.label, annotation.x, annotation.y);
    } else if (annotation.type === 'polygon') {
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      annotation.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
      if (annotation.label && annotation.points.length > 0) {
        drawLabel(ctx, annotation.label, annotation.points[0].x, annotation.points[0].y);
      }
    } else if (annotation.type === 'math') {
        if(annotation.imgElement) {
            ctx.drawImage(annotation.imgElement, annotation.x, annotation.y);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        }
    }
  };

  const drawLabel = (ctx, label, x, y) => {
    ctx.font = '14px Arial';
    const width = ctx.measureText(label).width + 10;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x, y - 25, width, 25);
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + 5, y - 8);
  };

  // --- OCR Logic ---

  const performOCR = async (img) => {
    setLoading(true);
    try {
      const worker = await createWorker('eng');
      
      // 1. Preprocess with multiple techniques for colored text/backgrounds
      const processedCanvas = preprocessImage(img);
      
      // 2. Configure Tesseract for maximum detection with font info
      await worker.setParameters({ 
        tessedit_pageseg_mode: '11', // Sparse text mode
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:-(),%<>=/+*[]{}#@!?&$€£¥', 
        preserve_interword_spaces: '1',
        tessedit_enable_doc_dict: '0',
        classify_bln_numeric_mode: '0'
      });

      const { data: ocrData } = await worker.recognize(processedCanvas);
      
      const scaleFactor = 3; // Increased for better accuracy
      const charData = { words: [], symbols: [] };
      
      // 3. Extract text with font information
      ocrData.words.forEach(word => {
        const bbox = {
            x0: word.bbox.x0 / scaleFactor,
            y0: word.bbox.y0 / scaleFactor,
            x1: word.bbox.x1 / scaleFactor,
            y1: word.bbox.y1 / scaleFactor
        };

        // Lower threshold to catch more text
        if (word.confidence > 40) {
            charData.words.push({
                ...word,
                bbox: bbox,
                font_name: word.font_name || 'Unknown',
                font_size: Math.round((bbox.y1 - bbox.y0) * 0.9),
                is_bold: word.is_bold || false,
                is_italic: word.is_italic || false
            });
        }

        if (word.symbols) {
          word.symbols.forEach(symbol => {
            if (symbol.confidence > 40) {
              charData.symbols.push({ 
                  ...symbol, 
                  parentWord: word.text,
                  bbox: {
                      x0: symbol.bbox.x0 / scaleFactor,
                      y0: symbol.bbox.y0 / scaleFactor,
                      x1: symbol.bbox.x1 / scaleFactor,
                      y1: symbol.bbox.y1 / scaleFactor
                  }
              });
            }
          });
        }
      });
      
      const groupedWords = groupWordsByProximity(charData.words);
      charData.words = groupedWords;
      
      setOcrResult(charData);
      await worker.terminate();
      
      const count = charData.words.length;
      if (count > 0) toast.success(`Detected ${count} text regions with fonts`);
      else toast.warning("No text detected. Try a clearer image.");

    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to detect text');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Optimized Image Preprocessing for colored text/backgrounds
  const preprocessImage = (img) => {
    const scaleFactor = 3;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Pass 1: Enhanced contrast for colored text
    const contrastFactor = 1.8;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, ((data[i] - 128) * contrastFactor) + 128));
      data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - 128) * contrastFactor) + 128));
      data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - 128) * contrastFactor) + 128));
    }
    
    // Pass 2: Convert to grayscale with luminance
    const grayscale = new Uint8ClampedArray(data.length / 4);
    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    
    // Pass 3: Fast histogram-based adaptive thresholding (Otsu's method)
    const histogram = new Array(256).fill(0);
    grayscale.forEach(val => histogram[val]++);
    
    const total = grayscale.length;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * histogram[i];
    
    let sumB = 0, wB = 0, wF = 0, maxVariance = 0, threshold = 0;
    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;
      
      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * (mB - mF) * (mB - mF);
      
      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }
    
    // Pass 4: Apply threshold with slight bias for better text detection
    threshold = Math.max(threshold - 20, 80); // Lower threshold for colored backgrounds
    
    for (let i = 0; i < grayscale.length; i++) {
      const color = grayscale[i] > threshold ? 255 : 0;
      data[i * 4] = color;
      data[i * 4 + 1] = color;
      data[i * 4 + 2] = color;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Group words by spatial proximity
  const groupWordsByProximity = (words) => {
    if (!words || words.length === 0) return [];
    
    // Sort by vertical position, then horizontal
    const sorted = [...words].sort((a, b) => {
      const yDiff = a.bbox.y0 - b.bbox.y0;
      if (Math.abs(yDiff) < 20) {
        return a.bbox.x0 - b.bbox.x0;
      }
      return yDiff;
    });
    
    return sorted;
  };

  // --- Action Handlers ---

  // 1. Copy Functionality
  const handleCopyText = () => {
    if (selectedItems.length === 0) {
      toast.error("Select text on the image first");
      return;
    }
    const sortedItems = [...selectedItems].sort((a, b) => a.bbox.x0 - b.bbox.x0);
    const textToCopy = sortedItems.map(item => item.text).join(' ');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Text copied to clipboard!");
    });
  };

  // 2. Highlighting
  const handleHighlight = () => {
    if (!searchText.trim() || !ocrResult) return;
    const boxes = [];
    ocrResult.words.forEach(word => {
      if (word.text.toLowerCase().includes(searchText.toLowerCase())) {
        const bbox = word.bbox;
        boxes.push({ x: bbox.x0, y: bbox.y0, width: bbox.x1 - bbox.x0, height: bbox.y1 - bbox.y0 });
      }
    });
    setHighlightedBoxes(boxes);
    drawCanvas(imageRef.current, boxes);
    boxes.length > 0 ? toast.success(`Found ${boxes.length} matches`) : toast.warning('Text not found');
  };

  // 3. Edit Text (Superscript/Subscript Logic)
  const handleWordEdit = () => {
    const itemsToEdit = selectedItems.length > 0 ? selectedItems : (selectedWord ? [selectedWord] : []);
    if (itemsToEdit.length === 0 || !editingWord) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Whitewash original text
    itemsToEdit.forEach(item => {
      const bbox = item.bbox;
      ctx.fillStyle = 'white';
      ctx.fillRect(bbox.x0 - 2, bbox.y0 - 2, bbox.x1 - bbox.x0 + 4, bbox.y1 - bbox.y0 + 4);
    });

    const firstItem = itemsToEdit[0];
    const bbox = firstItem.bbox;
    let fontSize = Math.max(14, Math.floor(bbox.y1 - bbox.y0));
    let yPos = bbox.y1;
    let xPos = bbox.x0;

    // Apply Subscript/Superscript adjustments
    if (textFormat === 'sub') {
        fontSize = fontSize * 0.6;
        yPos = yPos + (fontSize * 0.5);
    } else if (textFormat === 'super') {
        fontSize = fontSize * 0.6;
        yPos = yPos - (fontSize * 0.8);
    }

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'bottom';
    ctx.fillText(editingWord, xPos, yPos);

    // Update main image ref
    const newUrl = canvas.toDataURL();
    const newImg = new Image();
    newImg.crossOrigin = 'anonymous';
    newImg.onload = () => {
        imageRef.current = newImg;
        setImage(newImg);
        setSelectedItems([]);
        setSelectedWord(null);
        setEditingWord('');
        toast.success('Text edited successfully!');
    };
    newImg.src = newUrl;
  };

  // 4. Math/LaTeX Insertion
  const handleInsertMath = async () => {
    if (!mathInput) {
        toast.error("Enter a LaTeX formula first");
        return;
    }
    setInsertMode('math');
    toast.info("Click on the canvas to place the equation");
  };

  // 5. Plain Text Insertion
  const handleInsertText = () => {
      if(!insertText) {
          toast.error("Enter text to insert");
          return;
      }
      setInsertMode('text');
      toast.info("Click on the canvas to paste text");
  };

  // --- Interaction Handlers ---

  const handleCanvasClick = (e) => {
    resetInactivityTimer();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // --- INSERT MODE (Math or Text) ---
    if (insertMode) {
        const ctx = canvas.getContext('2d');
        const img = imageRef.current;
        
        ctx.drawImage(img, 0, 0); 

        if (insertMode === 'math') {
            const encodedMath = encodeURIComponent(mathInput);
            const mathUrl = `https://latex.codecogs.com/png.latex?\\dpi{200}\\huge ${encodedMath}`;
            
            // Proxy the LaTeX image to avoid CORS issues
            toast.loading('Generating equation...');
            base44.functions.invoke('proxyImage', { url: mathUrl })
              .then(result => {
                const proxiedUrl = result.data.url;
                const mathImg = new Image();
                mathImg.crossOrigin = 'anonymous';
                mathImg.onload = () => {
                    ctx.drawImage(mathImg, x, y);
                    const newImg = new Image();
                    newImg.crossOrigin = 'anonymous';
                    newImg.onload = () => {
                        imageRef.current = newImg;
                        setImage(newImg);
                        toast.success('Equation inserted!');
                    };
                    newImg.src = canvas.toDataURL();
                };
                mathImg.src = proxiedUrl;
              })
              .catch(error => {
                toast.error('Failed to load equation');
              });
        } 
        else if (insertMode === 'text') {
            ctx.font = "bold 24px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(insertText, x, y);
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.onload = () => {
                imageRef.current = newImg;
                setImage(newImg);
                toast.success('Text inserted!');
            };
            newImg.src = canvas.toDataURL();
        }
        
        setInsertMode(false);
        setMathInput('');
        setInsertText('');
        return;
    }

    // --- SELECTION MODE ---
    if (activeTab !== 'selector') return;
    if (!ocrResult) return;

    let clickedItem = null;
    const collection = selectionMode === 'character' ? ocrResult.symbols : ocrResult.words;
    
    clickedItem = collection?.find(item => {
        const bbox = item.bbox;
        return x >= bbox.x0 && x <= bbox.x1 && y >= bbox.y0 && y <= bbox.y1;
    });

    if (clickedItem) {
      if (e.shiftKey) {
        const exists = selectedItems.includes(clickedItem);
        setSelectedItems(exists ? selectedItems.filter(i => i !== clickedItem) : [...selectedItems, clickedItem]);
      } else {
        setSelectedItems([clickedItem]);
        setSelectedWord(clickedItem);
        setEditingWord(clickedItem.text);
      }
      setTimeout(() => drawCanvas(image, highlightedBoxes, true), 0);
    } else {
        setSelectedItems([]);
        setSelectedWord(null);
        drawCanvas(image, highlightedBoxes, true);
    }
  };

  // Auto-save state
  const autoSaveState = () => {
    if (!canvasRef.current) return;
    
    setAutoSaving(true);
    try {
      const state = {
        imageUrl,
        annotations,
        ocrResult,
        timestamp: Date.now()
      };
      localStorage.setItem('ocr_editor_autosave', JSON.stringify(state));
      setLastSaved(new Date());
      setTimeout(() => setAutoSaving(false), 1000);
    } catch (e) {
      console.error('Auto-save failed:', e);
      setAutoSaving(false);
    }
  };

  // Trigger auto-save on inactivity
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      autoSaveState();
    }, 10000); // Save after 10 seconds of inactivity
  };

  // Save Final Result
  const handleSave = async () => {
     if (!canvasRef.current) return;
     
     // Clear auto-save when explicitly saving
     localStorage.removeItem('ocr_editor_autosave');
     
     const canvas = canvasRef.current;
     
     try {
       // Redraw canvas with final image to ensure it's clean
       const ctx = canvas.getContext('2d');
       const finalImage = imageRef.current;
       
       // Create a new clean canvas
       const cleanCanvas = document.createElement('canvas');
       cleanCanvas.width = canvas.width;
       cleanCanvas.height = canvas.height;
       const cleanCtx = cleanCanvas.getContext('2d');
       
       // Draw only the final image state
       cleanCtx.drawImage(canvas, 0, 0);
       
       // Convert to blob
       const blob = await new Promise((resolve, reject) => {
         cleanCanvas.toBlob((b) => {
           if (b) resolve(b);
           else reject(new Error('Failed to create blob'));
         }, 'image/png', 0.95);
       });
       
       const file = new File([blob], 'edited-ocr.png', { type: 'image/png' });
       
       toast.promise(
          base44.integrations.Core.UploadFile({ file }),
          {
              loading: 'Saving image...',
              success: (data) => {
                  onSave(data.file_url);
                  return 'Image saved successfully!';
              },
              error: 'Failed to save image'
          }
       );
     } catch (error) {
       console.error('Save error:', error);
       toast.error('Failed to save image. Please try again or re-upload the original.');
     }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Smart OCR Editor</h3>
            {autoSaving && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-xs text-gray-500">
                Auto-saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v); 
                drawCanvas(imageRef.current, highlightedBoxes, v === 'selector');
            }}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="selector">Edit</TabsTrigger>
                <TabsTrigger value="highlight">Find</TabsTrigger>
                <TabsTrigger value="math">Math</TabsTrigger>
                <TabsTrigger value="annotate">Draw</TabsTrigger>
              </TabsList>

              {/* 1. SELECTION & EDIT TAB */}
              <TabsContent value="selector" className="space-y-4">
                <div className="flex gap-2 mb-4">
                    <Button 
                        size="sm" variant={selectionMode === 'word' ? 'default' : 'outline'} 
                        onClick={() => setSelectionMode('word')} className="flex-1">Word</Button>
                    <Button 
                        size="sm" variant={selectionMode === 'character' ? 'default' : 'outline'} 
                        onClick={() => setSelectionMode('character')} className="flex-1">Char</Button>
                </div>

                {selectedItems.length > 0 ? (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                        <Label>Selected: {selectedItems.length} items</Label>
                        <div className="text-lg font-mono bg-white p-2 rounded border">
                            {selectedItems.map(i => i.text).join(' ')}
                        </div>
                        {selectedItems[0]?.font_name && (
                          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                            Font: {selectedItems[0].font_name} • 
                            Size: {selectedItems[0].font_size}px
                            {selectedItems[0].is_bold && ' • Bold'}
                            {selectedItems[0].is_italic && ' • Italic'}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" className="flex-1" onClick={handleCopyText}>
                                <Copy className="w-3 h-3 mr-2" /> Copy Text
                             </Button>
                        </div>

                        <hr className="border-blue-200" />
                        
                        <Label>Edit / Replace</Label>
                        <Input 
                            value={editingWord} 
                            onChange={e => setEditingWord(e.target.value)} 
                            placeholder="Type replacement..." 
                        />
                        
                        <div className="flex gap-1">
                             <Button 
                                size="sm" 
                                variant={textFormat === 'normal' ? 'default' : 'ghost'} 
                                onClick={() => setTextFormat('normal')} 
                                className="w-8 h-8 p-0"><Type className="w-4 h-4"/></Button>
                             <Button 
                                size="sm" 
                                variant={textFormat === 'super' ? 'default' : 'ghost'} 
                                onClick={() => setTextFormat('super')} 
                                className="w-8 h-8 p-0"><Superscript className="w-4 h-4"/></Button>
                             <Button 
                                size="sm" 
                                variant={textFormat === 'sub' ? 'default' : 'ghost'} 
                                onClick={() => setTextFormat('sub')} 
                                className="w-8 h-8 p-0"><Subscript className="w-4 h-4"/></Button>
                        </div>

                        <Button className="w-full" onClick={handleWordEdit}>Apply Edit</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div className="p-4 border rounded-lg bg-white">
                            <Label>Paste / Insert Text</Label>
                            <Input 
                                className="mt-2"
                                placeholder="Type text to insert..."
                                value={insertText}
                                onChange={(e) => setInsertText(e.target.value)}
                            />
                            <Button 
                                variant="outline" 
                                className="w-full mt-2"
                                onClick={handleInsertText}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Insert on Click
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">Click words in the image to select them. Hold Shift for multi-select.</p>
                    </div>
                )}
              </TabsContent>

              {/* 2. MATH TAB */}
              <TabsContent value="math" className="space-y-4">
                 <div className="p-4 border rounded-lg bg-white space-y-3">
                    <Label>Input LaTeX Equation</Label>
                    <Input 
                        value={mathInput}
                        onChange={(e) => setMathInput(e.target.value)}
                        placeholder="e.g. E = mc^2"
                    />
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        Try: \sqrt{"{x^2 + y^2}"}
                    </div>
                    <Button onClick={handleInsertMath} className="w-full">
                        <Calculator className="w-4 h-4 mr-2" />
                        Place Equation
                    </Button>
                 </div>
                 {insertMode === 'math' && (
                     <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                        Cursor active! Click anywhere on the image to drop the equation.
                     </div>
                 )}
              </TabsContent>

              {/* 3. HIGHLIGHT TAB */}
              <TabsContent value="highlight" className="space-y-4">
                <Label>Search & Highlight</Label>
                <div className="flex gap-2">
                    <Input 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        placeholder="Text to find..." 
                    />
                    <Button onClick={handleHighlight}><Search className="w-4 h-4" /></Button>
                </div>
                {highlightedBoxes.length > 0 && (
                     <Button variant="outline" className="w-full" onClick={() => {
                         setHighlightedBoxes([]);
                         drawCanvas(imageRef.current);
                     }}>Clear Highlights</Button>
                )}
              </TabsContent>

               {/* 4. ANNOTATE TAB */}
               <TabsContent value="annotate" className="space-y-4">
                    <Label>Drawing Tools</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant={drawingMode === 'box' ? 'default' : 'outline'} onClick={() => setDrawingMode('box')}>
                            <Square className="w-4 h-4 mr-2"/> Box
                        </Button>
                        <Button variant={drawingMode === 'polygon' ? 'default' : 'outline'} onClick={() => setDrawingMode('polygon')}>
                            <Pentagon className="w-4 h-4 mr-2"/> Polygon
                        </Button>
                    </div>
                    <Label>Label Text</Label>
                    <Input 
                        value={labelInput} 
                        onChange={e => setLabelInput(e.target.value)} 
                        placeholder="Annotation label..."
                    />
                    <p className="text-xs text-gray-500">Coming soon: Click and drag to create shapes</p>
               </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-8">
             <div className="relative shadow-xl border-4 border-white">
                <canvas 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`bg-white ${insertMode ? 'cursor-crosshair' : 'cursor-default'}`}
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}