/**
 * LessonPlayerSharedUI
 *
 * Shared dialogs / panels used by both LessonPlayerPowerPoint and
 * LessonPlayerClassic (and any future player).
 *
 * Props come directly from the `useLessonPlayer` hook return value.
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  StickyNote, Sparkles, Bookmark, Download,
  FileText, BookOpen, Languages, Loader2,
} from 'lucide-react';

// ── Notes Dialog ──────────────────────────────────────────────────────────────
export function NotesDialog({ open, onOpenChange, slideKey, notes, onSave, onExport }) {
  const [text, setText] = useState(notes[slideKey] || '');

  // Sync text when slide changes
  React.useEffect(() => { setText(notes[slideKey] || ''); }, [slideKey, notes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-blue-500" />
            Notes — Slide {slideKey}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your notes for this slide…"
            className="min-h-[140px]"
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => { onSave(slideKey, text); onOpenChange(false); }}>
              Save Note
            </Button>
            {Object.keys(notes).length > 0 && (
              <Button variant="outline" onClick={onExport} title="Export all notes">
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── AI Assistant Dialog ───────────────────────────────────────────────────────
export function AIAssistantDialog({
  open, onOpenChange,
  aiTab, setAiTab,
  aiLoading,
  aiResponse, setAiResponse,
  aiSummary,
  aiTranslation,
  targetLanguage, setTargetLanguage,
  onAsk,
  onSummarise,
  onDefine,
  onTranslate,
  slideLabel = '',
}) {
  const [question, setQuestion] = useState('');
  const [defineWord, setDefineWord] = useState('');

  const LANGUAGES = [
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ur', label: 'Urdu' },
    { value: 'pl', label: 'Polish' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI Assistant {slideLabel && `— ${slideLabel}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={aiTab} onValueChange={setAiTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ask">Ask</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="define">Define</TabsTrigger>
            <TabsTrigger value="translate">Translate</TabsTrigger>
          </TabsList>

          {/* Ask */}
          <TabsContent value="ask" className="space-y-3 mt-3">
            <Textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask a question about this lesson…"
              className="min-h-[90px]"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAsk(question); setQuestion(''); } }}
            />
            <Button
              className="w-full"
              onClick={() => { onAsk(question); setQuestion(''); }}
              disabled={aiLoading || !question.trim()}
            >
              {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Thinking…</> : 'Ask AI'}
            </Button>
            {aiResponse && (
              <ScrollArea className="h-48 rounded-md border p-3 bg-purple-50 dark:bg-purple-950/20">
                <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Summary */}
          <TabsContent value="summary" className="space-y-3 mt-3">
            <Button className="w-full" onClick={onSummarise} disabled={aiLoading}>
              {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><FileText className="w-4 h-4 mr-2" />Generate Summary</>}
            </Button>
            {aiSummary && (
              <ScrollArea className="h-56 rounded-md border p-3 bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm whitespace-pre-wrap">{aiSummary}</p>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Define */}
          <TabsContent value="define" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a word to define…"
                value={defineWord}
                onChange={e => setDefineWord(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && defineWord.trim()) { onDefine(defineWord.trim()); setDefineWord(''); } }}
              />
              <Button
                onClick={() => { onDefine(defineWord.trim()); setDefineWord(''); }}
                disabled={aiLoading || !defineWord.trim()}
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              </Button>
            </div>
            {aiTab === 'define' && aiResponse && (
              <ScrollArea className="h-48 rounded-md border p-3 bg-green-50 dark:bg-green-950/20">
                <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Translate */}
          <TabsContent value="translate" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <select
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-input bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <Button onClick={onTranslate} disabled={aiLoading} className="whitespace-nowrap">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Languages className="w-4 h-4 mr-1" />Translate</>}
              </Button>
            </div>
            {aiTranslation && (
              <ScrollArea className="h-56 rounded-md border p-3 bg-orange-50 dark:bg-orange-950/20">
                <p className="text-sm whitespace-pre-wrap">{aiTranslation}</p>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ── Bookmarks Panel ───────────────────────────────────────────────────────────
export function BookmarksPanel({ open, onOpenChange, bookmarks, onJump }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-yellow-500" />
            Bookmarked Slides
          </DialogTitle>
        </DialogHeader>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No bookmarks yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {[...bookmarks].sort((a, b) => Number(a) - Number(b)).map(key => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                onClick={() => { onJump(key); onOpenChange(false); }}
              >
                Slide {key}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}