import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, BookOpen, Bookmark, MessageSquare, Share2, Download, BarChart3 } from 'lucide-react';

export default function CommandPalette({ open, onOpenChange, actions }) {
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { actions?.onSearch?.(); onOpenChange(false); }}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search lessons</span>
          </CommandItem>
          <CommandItem onSelect={() => { actions?.onBookmark?.(); onOpenChange(false); }}>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Add bookmark</span>
          </CommandItem>
          <CommandItem onSelect={() => { actions?.onNotes?.(); onOpenChange(false); }}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Open notes</span>
          </CommandItem>
          <CommandItem onSelect={() => { actions?.onDiscussion?.(); onOpenChange(false); }}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Discussion forum</span>
          </CommandItem>
          <CommandItem onSelect={() => { actions?.onShare?.(); onOpenChange(false); }}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share lesson</span>
          </CommandItem>
          <CommandItem onSelect={() => { actions?.onAnalytics?.(); onOpenChange(false); }}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>View analytics</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}