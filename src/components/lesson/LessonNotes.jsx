import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonNotes({ lessonId }) {
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(`lesson-notes-${lessonId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed.current || '');
      setSavedNotes(parsed.history || []);
    }
  }, [lessonId]);

  useEffect(() => {
    if (!autoSave || !notes.trim()) return;

    const timer = setTimeout(() => {
      saveNotes();
    }, 2000);

    return () => clearTimeout(timer);
  }, [notes, autoSave]);

  const saveNotes = () => {
    const data = {
      current: notes,
      history: savedNotes,
      lastSaved: Date.now()
    };
    localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(data));
    toast.success('Notes saved', { duration: 1000 });
  };

  const addToHistory = () => {
    if (!notes.trim()) return;
    
    const newNote = {
      id: Date.now(),
      content: notes,
      timestamp: Date.now()
    };
    
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    
    const data = {
      current: '',
      history: updated,
      lastSaved: Date.now()
    };
    
    localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(data));
    setNotes('');
    toast.success('Note saved to history');
  };

  const deleteNote = (id) => {
    const updated = savedNotes.filter(n => n.id !== id);
    setSavedNotes(updated);
    
    const data = {
      current: notes,
      history: updated,
      lastSaved: Date.now()
    };
    
    localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(data));
    toast.success('Note deleted');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Notes
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
              Auto-save
            </label>
          </div>
        </div>
        
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take notes while learning..."
          className="min-h-32"
        />
        
        <div className="flex gap-2">
          <Button onClick={saveNotes} size="sm" variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button onClick={addToHistory} size="sm" variant="outline">
            Save to History
          </Button>
        </div>
      </div>

      {savedNotes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Note History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-gray-50 rounded-lg text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}