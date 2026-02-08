import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonBookmarks({ lessonId, onNavigate }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`lesson-bookmarks-${lessonId}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, [lessonId]);

  const saveBookmarks = (newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(`lesson-bookmarks-${lessonId}`, JSON.stringify(newBookmarks));
  };

  const addBookmark = () => {
    const newBookmark = {
      id: Date.now(),
      timestamp: Date.now(),
      position: window.scrollY,
      note: ''
    };
    const updated = [...bookmarks, newBookmark];
    saveBookmarks(updated);
    toast.success('Bookmark added!');
  };

  const removeBookmark = (id) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
    toast.success('Bookmark removed');
  };

  const jumpToBookmark = (position) => {
    window.scrollTo({ top: position, behavior: 'smooth' });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={addBookmark}
        size="sm"
        variant="outline"
        className="w-full gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Add Bookmark
      </Button>
      
      {bookmarks.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs"
            >
              <button
                onClick={() => jumpToBookmark(bookmark.position)}
                className="flex-1 text-left hover:text-primary"
              >
                <BookmarkCheck className="w-3 h-3 inline mr-1" />
                {new Date(bookmark.timestamp).toLocaleTimeString()}
              </button>
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}