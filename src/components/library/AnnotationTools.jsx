import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material';
import { Highlighter, PenTool, Trash2, X, MessageSquare } from 'lucide-react';

export default function AnnotationTools({ 
  resourceId, 
  pageNumber, 
  onAnnotationCreate, 
  annotations = [],
  onAnnotationDelete 
}) {
  const [annotationMode, setAnnotationMode] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [drawColor, setDrawColor] = useState('#FF0000');
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const colors = [
    { name: 'Yellow', code: '#FFFF00' },
    { name: 'Green', code: '#00FF00' },
    { name: 'Blue', code: '#87CEEB' },
    { name: 'Pink', code: '#FFB6C1' },
    { name: 'Orange', code: '#FFA500' }
  ];

  // Setup canvas for drawing
  useEffect(() => {
    if (annotationMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 3;
      contextRef.current = context;
    }
  }, [annotationMode]);

  // Handle text selection for highlighting
  useEffect(() => {
    if (annotationMode === 'highlight') {
      document.addEventListener('mouseup', handleTextSelection);
      return () => document.removeEventListener('mouseup', handleTextSelection);
    }
  }, [annotationMode]);

  const handleTextSelection = () => {
    const selected = window.getSelection().toString();
    if (selected) {
      setSelectedText(selected);
      setShowNoteDialog(true);
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.strokeStyle = drawColor;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const endDrawing = async () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    if (canvasRef.current) {
      const drawingData = canvasRef.current.toDataURL();
      await onAnnotationCreate({
        annotation_type: 'drawing',
        drawing_data: drawingData,
        color: drawColor,
        page_number: pageNumber
      });
      
      // Clear canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleHighlight = async () => {
    if (!selectedText) return;
    
    await onAnnotationCreate({
      annotation_type: 'highlight',
      highlighted_text: selectedText,
      color: highlightColor,
      page_number: pageNumber
    });
    
    setSelectedText('');
    setShowNoteDialog(false);
  };

  const handleAddNote = async () => {
    if (!noteContent) return;
    
    await onAnnotationCreate({
      annotation_type: 'note',
      content: noteContent,
      highlighted_text: selectedText,
      page_number: pageNumber
    });
    
    setNoteContent('');
    setSelectedText('');
    setShowNoteDialog(false);
  };

  const pageAnnotations = annotations.filter(a => a.page_number === pageNumber);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Annotation Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
        <Button
          size="sm"
          onClick={() => setAnnotationMode(annotationMode === 'highlight' ? null : 'highlight')}
          className={`gap-2 ${annotationMode === 'highlight' ? 'bg-yellow-500 text-white' : 'bg-white'}`}
          title="Highlight text"
        >
          <Highlighter className="w-4 h-4" />
          Highlight
        </Button>

        <Button
          size="sm"
          onClick={() => setAnnotationMode(annotationMode === 'draw' ? null : 'draw')}
          className={`gap-2 ${annotationMode === 'draw' ? 'bg-red-500 text-white' : 'bg-white'}`}
          title="Draw on PDF"
        >
          <PenTool className="w-4 h-4" />
          Draw
        </Button>

        <Button
          size="sm"
          onClick={() => setShowNoteDialog(true)}
          className="bg-white gap-2"
          title="Add note"
        >
          <MessageSquare className="w-4 h-4" />
          Add Note
        </Button>

        {annotationMode && (
          <Button
            size="sm"
            onClick={() => setAnnotationMode(null)}
            variant="outline"
            className="ml-auto"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </Box>

      {/* Highlight Color Picker */}
      {annotationMode === 'highlight' && (
        <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
          <span className="text-sm font-medium text-gray-600">Color:</span>
          {colors.map(color => (
            <button
              key={color.code}
              onClick={() => setHighlightColor(color.code)}
              className={`w-6 h-6 rounded border-2 ${
                highlightColor === color.code ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </Box>
      )}

      {/* Drawing Color Picker */}
      {annotationMode === 'draw' && (
        <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
          <span className="text-sm font-medium text-gray-600">Color:</span>
          {colors.map(color => (
            <button
              key={color.code}
              onClick={() => setDrawColor(color.code)}
              className={`w-6 h-6 rounded border-2 ${
                drawColor === color.code ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </Box>
      )}

      {/* Drawing Canvas */}
      {annotationMode === 'draw' && (
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          style={{
            border: '2px dashed #ccc',
            cursor: 'crosshair',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            height: '300px'
          }}
        />
      )}

      {/* Annotations List */}
      {pageAnnotations.length > 0 && (
        <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Annotations on this page</h3>
          <div className="space-y-2">
            {pageAnnotations.map(annotation => (
              <Box
                key={annotation.id}
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2
                }}
              >
                <div className="flex-1">
                  {annotation.annotation_type === 'highlight' && (
                    <div>
                      <Chip
                        label={annotation.annotation_type}
                        size="small"
                        sx={{ mb: 1, backgroundColor: annotation.color, opacity: 0.7 }}
                      />
                      {annotation.highlighted_text && (
                        <p className="text-sm text-gray-600 italic">"{annotation.highlighted_text}"</p>
                      )}
                    </div>
                  )}
                  {annotation.annotation_type === 'note' && (
                    <div>
                      <Chip label="Note" size="small" sx={{ mb: 1 }} />
                      <p className="text-sm text-gray-700">{annotation.content}</p>
                      {annotation.highlighted_text && (
                        <p className="text-xs text-gray-500 italic mt-1">"{annotation.highlighted_text}"</p>
                      )}
                    </div>
                  )}
                  {annotation.annotation_type === 'drawing' && (
                    <div>
                      <Chip label="Drawing" size="small" sx={{ mb: 1 }} />
                      {annotation.drawing_data && (
                        <img
                          src={annotation.drawing_data}
                          alt="Drawing annotation"
                          className="max-w-xs max-h-20 rounded border"
                        />
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onAnnotationDelete(annotation.id)}
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                  title="Delete annotation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Box>
            ))}
          </div>
        </Box>
      )}

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onClose={() => setShowNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedText ? 'Highlight & Add Note' : 'Add Note'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {selectedText && (
            <Box>
              <label className="text-xs font-semibold text-gray-600">Selected Text</label>
              <p className="text-sm text-gray-700 italic p-2 bg-gray-50 rounded mt-1">"{selectedText}"</p>
            </Box>
          )}
          <TextField
            autoFocus
            placeholder="Add your note here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
            Cancel
          </Button>
          {selectedText && (
            <Button
              onClick={handleHighlight}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Highlight Only
            </Button>
          )}
          <Button
            onClick={handleAddNote}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {selectedText ? 'Highlight & Add Note' : 'Add Note'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}