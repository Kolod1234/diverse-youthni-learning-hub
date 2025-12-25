import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, X, Save, Users, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CollaborativeNotes({ sessionId, user, onClose }) {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(() => {
      fetchNotes();
      fetchActiveUsers();
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchNotes = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'get-notes',
        sessionId
      });
      if (response.data.content && response.data.content !== content) {
        setContent(response.data.content);
        setLastSaved(response.data.updated_at);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'get-notes-editors',
        sessionId
      });
      if (response.data.editors) {
        setActiveUsers(response.data.editors);
      }
    } catch (error) {
      console.error('Error fetching editors:', error);
    }
  };

  const saveNotes = async (text) => {
    setIsSaving(true);
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'update-notes',
        sessionId,
        content: text,
        editor: user?.full_name || 'Anonymous'
      });
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Error saving notes:', error);
    }
    setIsSaving(false);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounce auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveNotes(newContent);
    }, 2000);
  };

  const handleManualSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveNotes(content);
  };

  const downloadNotes = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-500 to-blue-500">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Collaborative Notes
            </h3>
            {activeUsers.length > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                <Users className="w-3 h-3 mr-1" />
                {activeUsers.length} editing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleManualSave}
              disabled={isSaving}
              className="text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={downloadNotes}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Editors */}
        {activeUsers.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">Currently editing:</span>
              <div className="flex -space-x-2">
                {activeUsers.map((editor, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    title={editor.name}
                  >
                    {editor.name?.charAt(0) || 'U'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes Editor */}
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start taking collaborative notes... All participants can edit this document in real-time."
            className="w-full h-full resize-none font-mono text-sm"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Auto-save enabled</span>
            {lastSaved && (
              <span>
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>{content.length} characters</span>
            <span>•</span>
            <span>{content.split(/\s+/).filter(w => w).length} words</span>
          </div>
        </div>
      </Card>
    </div>
  );
}