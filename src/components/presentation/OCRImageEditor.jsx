import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, Search, Type, Eraser, Loader2, Upload, Square, Pentagon, 
  Tag, Sparkles, Copy, Calculator, Subscript, Superscript, Plus,
  Settings, RefreshCw, Globe, LayoutGrid, CheckCircle2, Edit2,
  Trash2, Filter, List, Check, Bold, Italic, Underline, Palette,
  TextCursorInput, Wand2
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
  
  // Advanced OCR Settings
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [layoutMode, setLayoutMode] = useState('11'); // PSM mode
  const [correctionMode, setCorrectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Annotations
  const [annotations, setAnnotations] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingStart, setDrawingStart] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [annotationFilter, setAnnotationFilter] = useState('');
  const [annotationTypeFilter, setAnnotationTypeFilter] = useState('all');
  const [showAnnotationSummary, setShowAnnotationSummary] = useState(false);
  
  // Highlighting & Search
  const [searchText, setSearchText] = useState('');
  const [highlightedBoxes, setHighlightedBoxes] = useState([]);
  
  // Math & Formatting
  const [mathInput, setMathInput] = useState('');
  const [textFormat, setTextFormat] = useState('normal');
  const [insertMode, setInsertMode] = useState(false);
  const [insertText, setInsertText] = useState('');
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [checkingSpelling, setCheckingSpelling] = useState(false);
  
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
      const isCorrected = item.corrected;
      ctx.fillStyle = isCorrected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
      ctx.strokeStyle = isCorrected ? '#22C55E' : '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
      
      // Draw checkmark for corrected text
      if (isCorrected) {
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('✓', bbox.x1 - 12, bbox.y0 + 12);
      }
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
      const worker = await createWorker(ocrLanguage);
      
      // 1. Preprocess with multiple techniques for colored text/backgrounds
      const processedCanvas = preprocessImage(img);
      
      // 2. Configure Tesseract with user-selected layout mode
      await worker.setParameters({ 
        tessedit_pageseg_mode: layoutMode,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:-(),%<>=/+*[]{}#@!?&$€£¥', 
        preserve_interword_spaces: '1',
        tessedit_enable_doc_dict: '0',
        classify_bln_numeric_mode: '0'
      });

      const { data: ocrData } = await worker.recognize(processedCanvas);
      
      const scaleFactor = 3.5; // Matches preprocessing
      const charData = { words: [], symbols: [] };
      
      // 3. Extract text with font information
      ocrData.words.forEach(word => {
        const bbox = {
            x0: word.bbox.x0 / scaleFactor,
            y0: word.bbox.y0 / scaleFactor,
            x1: word.bbox.x1 / scaleFactor,
            y1: word.bbox.y1 / scaleFactor
        };

        // Ultra-low threshold for deep detection
        if (word.confidence > 30) {
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
            if (symbol.confidence > 30) {
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
      if (count > 0) toast.success(`Detected ${count} text regions (${ocrLanguage.toUpperCase()})`);
      else toast.warning("No text detected. Try a clearer image or different settings.");

    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to detect text');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Advanced Multi-Pass Preprocessing for 100% Text Detection
  const preprocessImage = (img) => {
    const scaleFactor = 3.5; // Aggressive upscaling
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // === MULTI-CHANNEL COLOR SEPARATION ===
    // Extract RGB channels separately to detect colored text on colored backgrounds
    const rChannel = new Uint8ClampedArray(data.length / 4);
    const gChannel = new Uint8ClampedArray(data.length / 4);
    const bChannel = new Uint8ClampedArray(data.length / 4);
    
    for (let i = 0; i < data.length; i += 4) {
      rChannel[i / 4] = data[i];
      gChannel[i / 4] = data[i + 1];
      bChannel[i / 4] = data[i + 2];
    }
    
    // === PASS 1: AGGRESSIVE CONTRAST & SHARPENING ===
    const sharpenKernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
    const sharpened = new Uint8ClampedArray(data);
    
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * canvas.width + (x + kx)) * 4 + c;
              sum += data[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          sharpened[(y * canvas.width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
        }
      }
    }
    
    // === PASS 2: MULTI-METHOD GRAYSCALE CONVERSION ===
    // Method 1: Standard luminance
    const gray1 = new Uint8ClampedArray(data.length / 4);
    // Method 2: Channel difference (detects colored text better)
    const gray2 = new Uint8ClampedArray(data.length / 4);
    // Method 3: Maximum contrast across channels
    const gray3 = new Uint8ClampedArray(data.length / 4);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = sharpened[i];
      const g = sharpened[i + 1];
      const b = sharpened[i + 2];
      
      // Standard luminance
      gray1[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      // Channel difference emphasizes color contrast
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      gray2[i / 4] = maxChannel - minChannel;
      
      // Edge-based grayscale
      const edgeIntensity = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      gray3[i / 4] = Math.min(255, edgeIntensity * 2);
    }
    
    // === PASS 3: MULTI-THRESHOLD BINARIZATION ===
    // Otsu's method on each grayscale version
    const getOtsuThreshold = (gray) => {
      const histogram = new Array(256).fill(0);
      gray.forEach(val => histogram[val]++);
      
      const total = gray.length;
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
      return threshold;
    };
    
    const t1 = Math.max(getOtsuThreshold(gray1) - 30, 60);
    const t2 = Math.max(getOtsuThreshold(gray2) - 10, 40);
    const t3 = Math.max(getOtsuThreshold(gray3) - 10, 50);
    
    // === PASS 4: COMBINE ALL METHODS (UNION) ===
    // If ANY method detects text, mark as text
    for (let i = 0; i < gray1.length; i++) {
      const isText1 = gray1[i] < t1; // Inverted for dark text
      const isText2 = gray2[i] > t2; // Color difference
      const isText3 = gray3[i] > t3; // Edge detection
      
      // Also check individual RGB channels for extreme contrasts
      const rDark = rChannel[i] < 100;
      const gDark = gChannel[i] < 100;
      const bDark = bChannel[i] < 100;
      const rBright = rChannel[i] > 180;
      const gBright = gChannel[i] > 180;
      const bBright = bChannel[i] > 180;
      
      const hasContrast = (rDark || gDark || bDark) || (rBright || gBright || bBright);
      
      const isText = isText1 || isText2 || isText3 || hasContrast;
      const color = isText ? 0 : 255; // Inverted: text is black
      
      data[i * 4] = color;
      data[i * 4 + 1] = color;
      data[i * 4 + 2] = color;
    }
    
    // === PASS 5: MORPHOLOGICAL CLEANUP ===
    // Remove noise and connect text components
    const cleaned = new Uint8ClampedArray(data);
    const radius = 2;
    
    for (let y = radius; y < canvas.height - radius; y++) {
      for (let x = radius; x < canvas.width - radius; x++) {
        let blackCount = 0, totalCount = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
            if (data[idx] === 0) blackCount++;
            totalCount++;
          }
        }
        
        const idx = (y * canvas.width + x) * 4;
        // If majority is text in neighborhood, keep as text
        if (blackCount > totalCount * 0.4) {
          cleaned[idx] = 0;
          cleaned[idx + 1] = 0;
          cleaned[idx + 2] = 0;
        }
      }
    }
    
    // Apply cleaned data
    for (let i = 0; i < cleaned.length; i++) {
      data[i] = cleaned[i];
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

  // Re-run OCR with new settings
  const handleReRunOCR = () => {
    if (imageRef.current) {
      performOCR(imageRef.current);
    }
  };

  // Annotation Management
  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    drawCanvas(imageRef.current, highlightedBoxes);
    toast.success('Annotation deleted');
  };

  const handleEditAnnotation = (annotation) => {
    setEditingAnnotation(annotation);
    setLabelInput(annotation.label);
  };

  const handleUpdateAnnotation = () => {
    if (!editingAnnotation) return;
    
    setAnnotations(annotations.map(a => 
      a.id === editingAnnotation.id 
        ? { ...a, label: labelInput, type: editingAnnotation.type }
        : a
    ));
    setEditingAnnotation(null);
    setLabelInput('');
    drawCanvas(imageRef.current, highlightedBoxes);
    toast.success('Annotation updated');
  };

  const handleFinishPolygon = () => {
    if (currentPolygon.length < 3) {
      toast.error('Polygon needs at least 3 points');
      return;
    }

    const newAnnotation = {
      id: Date.now(),
      type: 'polygon',
      points: currentPolygon,
      label: labelInput || 'Annotation'
    };

    setAnnotations([...annotations, newAnnotation]);
    setCurrentPolygon([]);
    setDrawingMode(null);
    setLabelInput('');
    drawCanvas(imageRef.current, highlightedBoxes);
    toast.success('Polygon annotation added');
  };

  const handleGroupAnnotations = (label) => {
    const grouped = annotations.filter(a => a.label === label);
    if (grouped.length < 2) {
      toast.error('Need at least 2 annotations with this label to group');
      return;
    }
    
    toast.success(`Grouped ${grouped.length} annotations with label "${label}"`);
  };

  const getFilteredAnnotations = () => {
    return annotations.filter(a => {
      const matchesLabel = !annotationFilter || a.label.toLowerCase().includes(annotationFilter.toLowerCase());
      const matchesType = annotationTypeFilter === 'all' || a.type === annotationTypeFilter;
      return matchesLabel && matchesType;
    });
  };

  const getAnnotationSummary = () => {
    const summary = {};
    annotations.forEach(a => {
      if (!summary[a.label]) {
        summary[a.label] = { count: 0, types: {} };
      }
      summary[a.label].count++;
      summary[a.label].types[a.type] = (summary[a.label].types[a.type] || 0) + 1;
    });
    return summary;
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

  // Spell Check & Grammar Correction
  const handleSpellCheck = async () => {
    if (!editingWord) {
      toast.error('No text to check');
      return;
    }

    setCheckingSpelling(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Check spelling and grammar for this text and return ONLY the corrected version with no explanations: "${editingWord}"`,
        response_json_schema: {
          type: 'object',
          properties: {
            corrected: { type: 'string' },
            changes: { type: 'string' }
          }
        }
      });

      if (result.corrected && result.corrected !== editingWord) {
        setEditingWord(result.corrected);
        toast.success(result.changes || 'Text corrected');
      } else {
        toast.success('No corrections needed');
      }
    } catch (error) {
      toast.error('Spell check failed');
    } finally {
      setCheckingSpelling(false);
    }
  };

  // 3. Edit Text with Rich Formatting
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
    let baseFontSize = fontSize || Math.max(14, Math.floor(bbox.y1 - bbox.y0));
    let yPos = bbox.y1;
    let xPos = bbox.x0;

    // Apply Subscript/Superscript adjustments
    if (textFormat === 'sub') {
        baseFontSize = baseFontSize * 0.6;
        yPos = yPos + (baseFontSize * 0.5);
    } else if (textFormat === 'super') {
        baseFontSize = baseFontSize * 0.6;
        yPos = yPos - (baseFontSize * 0.8);
    }

    // Build font string with formatting
    let fontStyle = '';
    if (textItalic) fontStyle += 'italic ';
    if (textBold) fontStyle += 'bold ';
    
    ctx.font = `${fontStyle}${baseFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'bottom';
    ctx.fillText(editingWord, xPos, yPos);
    
    // Draw underline if needed
    if (textUnderline) {
      const textWidth = ctx.measureText(editingWord).width;
      ctx.strokeStyle = textColor;
      ctx.lineWidth = Math.max(1, baseFontSize / 20);
      ctx.beginPath();
      ctx.moveTo(xPos, yPos + 2);
      ctx.lineTo(xPos + textWidth, yPos + 2);
      ctx.stroke();
    }

    // Update OCR result with corrected text
    if (correctionMode && ocrResult) {
      const newOcrResult = { ...ocrResult };
      newOcrResult.words = newOcrResult.words.map(word => {
        const match = itemsToEdit.find(item => item === word);
        return match ? { ...word, text: editingWord, corrected: true } : word;
      });
      setOcrResult(newOcrResult);
    }

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
        toast.success(correctionMode ? 'Text corrected!' : 'Text edited successfully!');
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

  const handleCanvasMouseDown = (e) => {
    resetInactivityTimer();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Drawing mode - start shape
    if (drawingMode === 'box' && activeTab === 'annotate') {
      setDrawingStart({ x, y });
      return;
    }

    if (drawingMode === 'polygon' && activeTab === 'annotate') {
      setCurrentPolygon([...currentPolygon, { x, y }]);
      drawCanvas(imageRef.current, highlightedBoxes);
      return;
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (drawingMode === 'box' && drawingStart && activeTab === 'annotate') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const newAnnotation = {
        id: Date.now(),
        type: 'box',
        x: Math.min(drawingStart.x, x),
        y: Math.min(drawingStart.y, y),
        width: Math.abs(x - drawingStart.x),
        height: Math.abs(y - drawingStart.y),
        label: labelInput || 'Annotation'
      };

      setAnnotations([...annotations, newAnnotation]);
      setDrawingStart(null);
      setDrawingMode(null);
      setLabelInput('');
      drawCanvas(imageRef.current, highlightedBoxes);
      toast.success('Box annotation added');
    }
  };

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
            {correctionMode && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Correction Mode
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-1" />
              OCR Settings
            </Button>
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* OCR Settings Panel */}
        {showSettings && (
          <div className="border-b bg-blue-50 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1 mb-2">
                  <Globe className="w-3 h-3" />
                  Language
                </Label>
                <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng">English</SelectItem>
                    <SelectItem value="spa">Spanish</SelectItem>
                    <SelectItem value="fra">French</SelectItem>
                    <SelectItem value="deu">German</SelectItem>
                    <SelectItem value="chi_sim">Chinese (Simplified)</SelectItem>
                    <SelectItem value="ara">Arabic</SelectItem>
                    <SelectItem value="rus">Russian</SelectItem>
                    <SelectItem value="jpn">Japanese</SelectItem>
                    <SelectItem value="kor">Korean</SelectItem>
                    <SelectItem value="por">Portuguese</SelectItem>
                    <SelectItem value="ita">Italian</SelectItem>
                    <SelectItem value="hin">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1 mb-2">
                  <LayoutGrid className="w-3 h-3" />
                  Layout Analysis
                </Label>
                <Select value={layoutMode} onValueChange={setLayoutMode}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Auto Layout</SelectItem>
                    <SelectItem value="3">Auto (No OSD)</SelectItem>
                    <SelectItem value="4">Single Column</SelectItem>
                    <SelectItem value="5">Vertical Text</SelectItem>
                    <SelectItem value="6">Uniform Block</SelectItem>
                    <SelectItem value="11">Sparse Text</SelectItem>
                    <SelectItem value="12">OSD Only</SelectItem>
                    <SelectItem value="13">Raw Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col justify-between">
                <Label className="text-xs font-semibold mb-2">Actions</Label>
                <Button 
                  size="sm" 
                  onClick={handleReRunOCR}
                  disabled={loading}
                  className="h-8"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Re-run OCR
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <input 
                type="checkbox" 
                id="correctionMode"
                checked={correctionMode}
                onChange={(e) => setCorrectionMode(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="correctionMode" className="text-sm cursor-pointer">
                Enable manual correction mode (track changes for critical text)
              </Label>
            </div>
            
            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
              <strong>Layout Modes:</strong> Auto Layout (general docs) • Single Column (articles) • Vertical Text (Asian languages) • Sparse Text (diagrams/images)
            </div>
          </div>
        )}

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
                            {selectedItems[0].corrected && ' • ✓ Corrected'}
                          </div>
                        )}

                        {correctionMode && (
                          <div className="text-xs bg-green-50 text-green-700 p-2 rounded border border-green-200">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Correction mode: Changes will be tracked
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" className="flex-1" onClick={handleCopyText}>
                                <Copy className="w-3 h-3 mr-2" /> Copy Text
                             </Button>
                        </div>

                        <hr className="border-blue-200" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Edit / Replace Text</Label>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleSpellCheck}
                              disabled={checkingSpelling}
                              className="h-7"
                            >
                              {checkingSpelling ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Wand2 className="w-3 h-3 mr-1" />
                              )}
                              Spell Check
                            </Button>
                          </div>

                          <Input 
                              value={editingWord} 
                              onChange={e => setEditingWord(e.target.value)} 
                              placeholder="Type replacement..." 
                          />

                          <div className="space-y-2">
                            <Label className="text-xs">Text Style</Label>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant={textBold ? 'default' : 'ghost'} 
                                onClick={() => setTextBold(!textBold)} 
                                className="w-8 h-8 p-0"
                                title="Bold"
                              >
                                <Bold className="w-4 h-4"/>
                              </Button>
                              <Button 
                                size="sm" 
                                variant={textItalic ? 'default' : 'ghost'} 
                                onClick={() => setTextItalic(!textItalic)} 
                                className="w-8 h-8 p-0"
                                title="Italic"
                              >
                                <Italic className="w-4 h-4"/>
                              </Button>
                              <Button 
                                size="sm" 
                                variant={textUnderline ? 'default' : 'ghost'} 
                                onClick={() => setTextUnderline(!textUnderline)} 
                                className="w-8 h-8 p-0"
                                title="Underline"
                              >
                                <Underline className="w-4 h-4"/>
                              </Button>
                              <Button 
                                size="sm" 
                                variant={textFormat === 'super' ? 'default' : 'ghost'} 
                                onClick={() => setTextFormat(textFormat === 'super' ? 'normal' : 'super')} 
                                className="w-8 h-8 p-0"
                                title="Superscript"
                              >
                                <Superscript className="w-4 h-4"/>
                              </Button>
                              <Button 
                                size="sm" 
                                variant={textFormat === 'sub' ? 'default' : 'ghost'} 
                                onClick={() => setTextFormat(textFormat === 'sub' ? 'normal' : 'sub')} 
                                className="w-8 h-8 p-0"
                                title="Subscript"
                              >
                                <Subscript className="w-4 h-4"/>
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Font Size</Label>
                              <Input 
                                type="number" 
                                value={fontSize}
                                onChange={(e) => setFontSize(Math.max(8, Math.min(72, parseInt(e.target.value) || 24)))}
                                className="h-8"
                                min="8"
                                max="72"
                              />
                            </div>
                            <div>
                              <Label className="text-xs flex items-center gap-1">
                                <Palette className="w-3 h-3" />
                                Color
                              </Label>
                              <div className="flex gap-1">
                                <Input 
                                  type="color" 
                                  value={textColor}
                                  onChange={(e) => setTextColor(e.target.value)}
                                  className="h-8 w-12 p-1 cursor-pointer"
                                />
                                <Input 
                                  type="text" 
                                  value={textColor}
                                  onChange={(e) => setTextColor(e.target.value)}
                                  className="h-8 flex-1 text-xs"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>
                          </div>

                          <Button className="w-full" onClick={handleWordEdit}>
                            <TextCursorInput className="w-4 h-4 mr-2" />
                            Apply Formatted Text
                          </Button>
                        </div>
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
                    {editingAnnotation ? (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                        <Label className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                          Editing Annotation
                        </Label>
                        <Input 
                          value={labelInput} 
                          onChange={e => setLabelInput(e.target.value)} 
                          placeholder="Label..."
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={editingAnnotation.type === 'box' ? 'default' : 'outline'}
                            onClick={() => setEditingAnnotation({...editingAnnotation, type: 'box'})}
                            className="flex-1"
                          >
                            <Square className="w-3 h-3 mr-1"/> Box
                          </Button>
                          <Button 
                            size="sm" 
                            variant={editingAnnotation.type === 'polygon' ? 'default' : 'outline'}
                            onClick={() => setEditingAnnotation({...editingAnnotation, type: 'polygon'})}
                            className="flex-1"
                          >
                            <Pentagon className="w-3 h-3 mr-1"/> Polygon
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={handleUpdateAnnotation}>
                            <Check className="w-3 h-3 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                            setEditingAnnotation(null);
                            setLabelInput('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Label>Drawing Tools</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant={drawingMode === 'box' ? 'default' : 'outline'} onClick={() => setDrawingMode('box')}>
                                <Square className="w-4 h-4 mr-2"/> Box
                            </Button>
                            <Button variant={drawingMode === 'polygon' ? 'default' : 'outline'} onClick={() => setDrawingMode('polygon')}>
                                <Pentagon className="w-4 h-4 mr-2"/> Polygon
                            </Button>
                        </div>
                        {drawingMode === 'polygon' && currentPolygon.length > 0 && (
                          <Button size="sm" className="w-full" onClick={handleFinishPolygon}>
                            <Check className="w-4 h-4 mr-2" />
                            Finish Polygon ({currentPolygon.length} points)
                          </Button>
                        )}
                        <Label>Label Text</Label>
                        <Input 
                            value={labelInput} 
                            onChange={e => setLabelInput(e.target.value)} 
                            placeholder="Annotation label..."
                        />
                        {drawingMode === 'box' && <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">Click and drag to draw a box</p>}
                        {drawingMode === 'polygon' && <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">Click points to create polygon, then click "Finish"</p>}
                      </>
                    )}

                    <hr className="border-gray-200" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <List className="w-4 h-4" />
                          Annotations ({annotations.length})
                        </Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowAnnotationSummary(!showAnnotationSummary)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          Summary
                        </Button>
                      </div>

                      {showAnnotationSummary && (
                        <div className="bg-gray-50 p-3 rounded-lg border space-y-2 text-xs">
                          {Object.entries(getAnnotationSummary()).map(([label, data]) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="font-semibold">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {data.count} × ({Object.entries(data.types).map(([t, c]) => `${c} ${t}`).join(', ')})
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => handleGroupAnnotations(label)}
                                >
                                  Group
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input 
                            placeholder="Filter by label..."
                            value={annotationFilter}
                            onChange={(e) => setAnnotationFilter(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Select value={annotationTypeFilter} onValueChange={setAnnotationTypeFilter}>
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {getFilteredAnnotations().map((annotation) => (
                          <div key={annotation.id} className="bg-white p-2 rounded border text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1">
                                {annotation.type === 'box' ? <Square className="w-3 h-3" /> : <Pentagon className="w-3 h-3" />}
                                {annotation.label}
                              </span>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditAnnotation(annotation)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500"
                                  onClick={() => handleDeleteAnnotation(annotation.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-gray-500">
                              Type: {annotation.type}
                              {annotation.type === 'polygon' && ` (${annotation.points.length} points)`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
               </TabsContent>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-8">
             <div className="relative shadow-xl border-4 border-white">
               <canvas 
                   ref={canvasRef}
                   onClick={handleCanvasClick}
                   onMouseDown={handleCanvasMouseDown}
                   onMouseUp={handleCanvasMouseUp}
                   className={`bg-white ${insertMode || drawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
               />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}