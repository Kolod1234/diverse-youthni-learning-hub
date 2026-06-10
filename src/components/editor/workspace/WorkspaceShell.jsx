import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import PresentationWorkspace from './PresentationWorkspace';
import { blocksToHtml, htmlToBlocks } from '@/components/editor/lessonBuilder/htmlSerializer';
import { createBlock } from '@/components/editor/lessonBuilder/blockTypes';

// Existing dialog/modal components that the workspace ribbon delegates to.
// All of these are pre-existing surfaces — we don't fork them, we just open
// them from the ribbon instead of from a row of buttons stacked above the
// canvas.
import PresentationMode from '@/components/editor/PresentationMode';
import TemplateBlocks from '@/components/editor/TemplateBlocks';
import CanvaImporter from '@/components/editor/CanvaImporter';
import FigmaImporter from '@/components/editor/FigmaImporter';
import ImageManager from '@/components/editor/ImageManager';
import InlineCodeEditor from '@/components/editor/InlineCodeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * WorkspaceShell
 * ---------------
 * Bridges the new PresentationWorkspace UI with the *exact same* set of
 * dialogs the legacy SlideEditor used: Templates, AI assistant, Canva
 * importer, Figma importer, Image manager, Inline code editor, fullscreen
 * Presentation mode. All handlers below are copy-equivalents of their
 * SlideEditor twins so behaviour is preserved 1:1.
 *
 * This file is NEW and routes around SlideEditor; SlideEditor itself is
 * left untouched so any other caller (e.g. AdminCourseBuilder) keeps
 * working unchanged.
 */
export default function WorkspaceShell({
  slides = [],
  onChange,
  isPersisted = false,
  builderFlushRef,
  saving,
  saveError,
  appBarSlot,
  settingsSlot,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showTemplateBlocks, setShowTemplateBlocks] = useState(false);
  const [showCanvaImporter, setShowCanvaImporter] = useState(false);
  const [showFigmaImporter, setShowFigmaImporter] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showInlineCodeEditor, setShowInlineCodeEditor] = useState(false);
  const [inlineCode, setInlineCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  // AI dialog state — same shape as the legacy SlideEditor, reused verbatim.
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAction, setAiAction] = useState('generate');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const currentSlideData = slides[currentSlide] || null;

  const updateSlide = useCallback((index, field, value) => {
    const next = [...slides];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }, [slides, onChange]);

  // ───────────────── Image manager → insert image into current slide ─────
  // Append a NATIVE lessonBuilder image block (NOT a raw <img>/<div> HTML
  // string). Previously we wrote `<div><img .../></div>` straight into
  // slide.content — htmlToBlocks couldn't recognise that as anything other
  // than a top-level <div>, so the next time the editor loaded it the
  // image surfaced as a "Legacy HTML" block, losing alt/caption/credit/
  // width/alignment/fit/aspect-lock controls.
  //
  // Fix: parse current content → blocks, push a native `image` block with
  // the full ImageBlock schema, then re-serialise. The editor now reloads
  // it as a real image block with all controls intact.
  const handleImageSelected = useCallback((url) => {
    if (!currentSlideData) return;
    if (!url) return;
    const existingBlocks = htmlToBlocks(currentSlideData.content || '');
    const imageBlock = createBlock('image', {
      url,
      alt: '',
      caption: '',
      credit: '',
      align: 'center',
      widthUnit: 'percent',
      width: 100,
      aspect: null,
      lockAspect: true,
      fit: 'contain',
    });
    const html = blocksToHtml([...existingBlocks, imageBlock]);
    updateSlide(currentSlide, 'content', html);
  }, [currentSlideData, currentSlide, updateSlide]);

  // ───────────────── Edit code helper ──────────────────────────────────
  const extractCodeFromSlide = (content) => {
    const m = content.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i)
      || content.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
    if (!m) return '';
    return m[1]
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  const handleEditCode = useCallback(() => {
    const content = currentSlideData?.content || '';
    const code = extractCodeFromSlide(content);
    if (!code) {
      toast.error('No code block found in this slide');
      return;
    }
    const langMatch = content.match(/class="language-(\w+)"/i);
    setCodeLanguage(langMatch ? langMatch[1] : 'javascript');
    setInlineCode(code);
    setShowInlineCodeEditor(true);
  }, [currentSlideData]);

  const handleSaveCode = useCallback((newCode) => {
    if (!currentSlideData) return;
    const content = currentSlideData.content || '';
    const replaced = content.replace(
      /<pre[^>]*><code[^>]*>[\s\S]*?<\/code><\/pre>/i,
      `<pre style="background:#1e1e1e;color:#d4d4d4;padding:20px;border-radius:8px;overflow-x:auto;font-family:'Courier New',monospace;font-size:14px;line-height:1.6;"><code class="language-${codeLanguage}">${newCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    );
    updateSlide(currentSlide, 'content', replaced);
    setShowInlineCodeEditor(false);
  }, [currentSlideData, currentSlide, codeLanguage, updateSlide]);

  // ───────────────── AI: generate slide content ────────────────────────
  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic or prompt');
      return;
    }
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive, educational slide content for: "${aiPrompt}". Include a clear engaging title, well-structured HTML with headings, paragraphs and lists, educational explanations suitable for students, and proper inline styles. Return ONLY the HTML, starting with an <h2> title tag.`,
        add_context_from_internet: false,
      });
      const newSlide = { title: aiPrompt, content: result, order: slides.length + 1 };
      onChange([...slides, newSlide]);
      setCurrentSlide(slides.length);
      setShowAIDialog(false);
      setAiPrompt('');
      toast.success('AI-generated slide added');
    } catch {
      toast.error('Failed to generate content');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, slides, onChange]);

  const handleAIRewrite = useCallback(async () => {
    if (!currentSlideData) return;
    setAiLoading(true);
    try {
      const plain = (currentSlideData.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Rewrite and improve the following educational content to be ${aiPrompt || 'clearer, more concise, and more engaging'}: "${plain}". Maintain educational value, use proper HTML with inline styles, keep similar structure. Return ONLY the improved HTML.`,
        add_context_from_internet: false,
      });
      updateSlide(currentSlide, 'content', result);
      setShowAIDialog(false);
      setAiPrompt('');
      toast.success('Content rewritten');
    } catch {
      toast.error('Failed to rewrite content');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, currentSlideData, currentSlide, updateSlide]);

  // Empty-state: if the draft has no slides, show a tight first-slide picker
  // INSIDE the workspace stage area so we keep the app-bar + ribbon visible
  // and the tutor never sees a blank screen. Picking any option creates a
  // single slide; the workspace then mounts the regular VisualLessonBuilder.
  const isEmpty = slides.length === 0;
  const seedFirstSlide = (content = '', title = 'Slide 1') => {
    onChange([{ title, content, order: 1 }]);
    setCurrentSlide(0);
  };

  if (isEmpty) {
    return (
      <div
        className="flex flex-col bg-slate-50 h-full w-full"
        style={{ maxWidth: '100vw', overflow: 'hidden' }}
      >
        {appBarSlot}
        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-6 bg-[#e9edf2]">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Start your first slide</h2>
            <p className="text-sm text-slate-500 mb-5">
              Pick a starter or open Lesson settings to add metadata first.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => seedFirstSlide('', 'Title slide')} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">📌</span>
                <span className="text-xs">Title</span>
              </Button>
              <Button variant="outline" onClick={() => seedFirstSlide('<h2>Section heading</h2><p>Add content…</p>', 'Content')} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">📝</span>
                <span className="text-xs">Content</span>
              </Button>
              <Button variant="outline" onClick={() => seedFirstSlide('<h2>Key points</h2><ul><li>Point one</li><li>Point two</li></ul>', 'Bullets')} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">📋</span>
                <span className="text-xs">Bullets</span>
              </Button>
              <Button variant="outline" onClick={() => seedFirstSlide('', 'Blank')} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">📄</span>
                <span className="text-xs">Blank</span>
              </Button>
              <Button variant="outline" onClick={() => { setShowImageManager(true); seedFirstSlide('', 'Image slide'); }} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">🖼️</span>
                <span className="text-xs">Image</span>
              </Button>
              <Button variant="outline" onClick={() => { setShowCanvaImporter(true); }} className="h-20 flex flex-col gap-1">
                <span className="text-2xl">⬇️</span>
                <span className="text-xs">Import Canva</span>
              </Button>
            </div>
          </div>
        </div>
        {settingsSlot}
        {showCanvaImporter && (
          <CanvaImporter
            onImport={(imported) => {
              const merged = imported.map((s, i) => ({ ...s, order: i + 1 }));
              onChange(merged);
              setCurrentSlide(0);
              setShowCanvaImporter(false);
            }}
            onClose={() => setShowCanvaImporter(false)}
          />
        )}
        {showImageManager && (
          <ImageManager
            onImageSelected={(url) => handleImageSelected(url)}
            onClose={() => setShowImageManager(false)}
          />
        )}
      </div>
    );
  }

  // Wrap PresentationWorkspace in a height-bearing flex column so the
  // height chain reaches PresentationWorkspace's `h-full`. A fragment
  // would silently break the chain — `h-full` resolves against the
  // nearest sized ancestor, and a fragment provides none. The dialogs
  // below the workspace are siblings of this wrapper so they keep their
  // `fixed inset-0` overlay semantics unchanged.
  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col w-full h-full">
      <PresentationWorkspace
        slides={slides}
        currentSlide={currentSlide}
        onSlidesChange={onChange}
        onCurrentSlideChange={setCurrentSlide}
        builderFlushRef={builderFlushRef}
        isPersisted={isPersisted}
        saving={saving}
        saveError={saveError}
        appBarSlot={appBarSlot}
        settingsSlot={settingsSlot}
        presentSlot={null}
        onAddImage={() => setShowImageManager(true)}
        onOpenTemplates={() => setShowTemplateBlocks(true)}
        onOpenBlocks={() => setShowTemplateBlocks(true)}
        onOpenAI={() => { setAiAction('generate'); setAiPrompt(''); setShowAIDialog(true); }}
        onRewriteWithAI={() => { setAiAction('rewrite'); setAiPrompt(''); setShowAIDialog(true); }}
        onEditCode={handleEditCode}
        onImportCanva={() => setShowCanvaImporter(true)}
        onImportFigma={() => setShowFigmaImporter(true)}
        onPresent={() => setShowPresentation(true)}
        presentDisabled={slides.length === 0}
      />

      {showPresentation && (
        <PresentationMode
          slides={slides}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {showTemplateBlocks && (
        <TemplateBlocks
          onInsert={(html) => {
            if (!currentSlideData) return;
            updateSlide(currentSlide, 'content', (currentSlideData.content || '') + html);
          }}
          onConvertToColumns={() => {
            toast.info('Multi-column conversion stays available — open the legacy editor for that flow.');
          }}
          onClose={() => setShowTemplateBlocks(false)}
        />
      )}

      {showCanvaImporter && (
        <CanvaImporter
          onImport={(imported) => {
            const merged = [...slides, ...imported.map((s, i) => ({ ...s, order: slides.length + i + 1 }))];
            onChange(merged);
            setCurrentSlide(slides.length);
          }}
          onClose={() => setShowCanvaImporter(false)}
        />
      )}

      {showFigmaImporter && (
        <FigmaImporter
          onImport={(imported) => {
            const merged = [...slides, ...imported.map((s, i) => ({ ...s, order: slides.length + i + 1 }))];
            onChange(merged);
            setCurrentSlide(slides.length);
          }}
          onClose={() => setShowFigmaImporter(false)}
        />
      )}

      {showImageManager && (
        <ImageManager
          onImageSelected={(url) => handleImageSelected(url)}
          onClose={() => setShowImageManager(false)}
          slideTitle={currentSlideData?.title}
          slideContent={currentSlideData?.content}
        />
      )}

      {showInlineCodeEditor && (
        <InlineCodeEditor
          initialCode={inlineCode}
          language={codeLanguage}
          onSave={handleSaveCode}
          onCancel={() => setShowInlineCodeEditor(false)}
        />
      )}

      {showAIDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]"
          onClick={() => !aiLoading && setShowAIDialog(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Assistant</h3>
                <p className="text-xs text-gray-500">
                  {aiAction === 'generate' ? 'Generate slide content from a topic' : 'Rewrite and improve slide content'}
                </p>
              </div>
            </div>

            {aiAction === 'generate' ? (
              <div>
                <Label>Topic or prompt</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., 'Introduction to Photosynthesis'"
                  className="mt-1 h-24"
                  disabled={aiLoading}
                />
              </div>
            ) : (
              <div>
                <Label>How should we improve it?</Label>
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'more concise', 'simpler language'"
                  className="mt-1"
                  disabled={aiLoading}
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={aiAction === 'generate' ? handleAIGenerate : handleAIRewrite}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={aiLoading || (aiAction === 'generate' && !aiPrompt.trim())}
              >
                {aiLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />{aiAction === 'generate' ? 'Generate slide' : 'Rewrite content'}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { if (!aiLoading) { setShowAIDialog(false); setAiPrompt(''); } }}
                className="flex-1"
                disabled={aiLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}