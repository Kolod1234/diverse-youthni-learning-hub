import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight, LayoutTemplate, GripVertical, Maximize2, Image as ImageIcon, Save, FileText, Sparkles, Wand2, Loader2, Presentation, X, Grid3x3, Type, Download, Code, LayoutList, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import VisualLessonBuilder from '@/components/editor/lessonBuilder/VisualLessonBuilder';
import PresentationMode from '@/components/editor/PresentationMode';
import CanvasSlideEditor from '@/components/editor/CanvasSlideEditor';
import AdvancedTemplateBuilder from '@/components/editor/AdvancedTemplateBuilder';
import TemplateBlocks from '@/components/editor/TemplateBlocks';
import ImageManager from '@/components/editor/ImageManager';
import ImageTextOverlay from '@/components/editor/ImageTextOverlay';
import CanvaIntegration from '@/components/editor/CanvaIntegration';
import CanvaImporter from '@/components/editor/CanvaImporter';
import FigmaImporter from '@/components/editor/FigmaImporter';
import ImageEditorModal from '@/components/editor/ImageEditorModal';
import InlineCodeEditor from '@/components/editor/InlineCodeEditor';
import InlineTextEditor from '@/components/editor/InlineTextEditor';
import SlideThumbnailRail from '@/components/editor/SlideThumbnailRail';
import ApplyTemplateConfirmDialog from '@/components/editor/lessonBuilder/ApplyTemplateConfirmDialog.jsx';
import WorkspaceShell from '@/components/editor/workspace/WorkspaceShell';
import WorkspaceModals from '@/components/editor/workspace/WorkspaceModals';
import { NATIVE_TEMPLATES } from '@/components/editor/lessonBuilder/nativeTemplates';
import { blocksToHtml } from '@/components/editor/lessonBuilder/htmlSerializer';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ---------------------------------------------------------------------------
// SLIDE_TEMPLATES — built from native block trees defined in `nativeTemplates.js`.
//
// Each entry's `content` field is generated at module-load time by serialising
// a native block tree through `blocksToHtml`. The output carries canonical
// `data-lesson-block="…"` markers so `htmlToBlocks` reconstructs the same
// native blocks on reload — meaning every heading, paragraph, list item,
// quote, image, caption, column child and table cell stays individually
// editable inside the Visual Lesson Builder. ZERO legacy-html blocks are
// produced by any template.
//
// Builders the user explicitly asked for are all included in the native
// templates registry: Blank, Title, Single-column article, Two-column
// article, Three-column editorial, Image left + text right, Text left +
// image right, Image top + text, Full-width image with caption, Newspaper
// front page, Newspaper article, Tabloid cover, Tabloid story, Blog hero,
// Blog article, Feature profile/interview, Quote/highlight, Definition/
// explainer, Comparison/before-after, Data/table report.
const SLIDE_TEMPLATES = Object.fromEntries(
  Object.entries(NATIVE_TEMPLATES).map(([key, t]) => [
    key,
    {
      name: t.name,
      icon: t.icon,
      category: t.category,
      // Serialise the native block tree → canonical HTML. The HTML carries
      // `data-lesson-block` markers so htmlToBlocks round-trips it back
      // into individually editable native blocks on reload.
      content: blocksToHtml(t.buildBlocks()),
    },
  ])
);

// Removed-from-this-release templates kept here as a documented list for the
// next task that re-adds them with native parser support. Do not re-enable
// without verifying round-trip first.
//
// twoColumn — needs a {data-block="two-columns"} parser branch
// definition / formulaSlide — needs a {data-block="definition"} parser branch
// imageText / imageTop / textOnImage / textLeftImageRight / textRightImageLeft / annotatedImage
//   — needs an {data-block="image-text"} parser branch
// threeImages / imageGallery / multiImageText — need a new gallery block
// beforeAfter / risksEthics / infoCardsGrid / diagramWithCards — need
//   a card-grid block.
//
// The old raw-HTML implementations of these templates have been deleted
// from this file. They lived under `_REMOVED_PLACEHOLDER` for a few commits
// during the transition; nothing references them now.

// `isPersisted` tells the inner Visual Lesson Builder whether the lesson this
// slide belongs to has actually been written to the Lesson entity. It is
// forwarded down so the builder's save status badge can show "Saved" only
// when there is a real saved lesson, never on a brand-new draft.
export default function SlideEditor({ slides = [], onChange, isPersisted = false, builderFlushRef }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  // 'builder' = Visual Lesson Builder (new default).
  // 'canvas' = original advanced Canvas mode (kept for power users).
  const [editorMode, setEditorMode] = useState('builder');
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customSlideTemplates') || '{}');
    } catch {
      return {};
    }
  });
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateIcon, setTemplateIcon] = useState('📄');
  const [showManageTemplates, setShowManageTemplates] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAction, setAiAction] = useState('generate'); // 'generate', 'rewrite', 'images', 'generate-image'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [showTemplateBlocks, setShowTemplateBlocks] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState('');
  const [showCanva, setShowCanva] = useState(false);
  const [showCanvaImporter, setShowCanvaImporter] = useState(false);
  const [showFigmaImporter, setShowFigmaImporter] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [showInlineCodeEditor, setShowInlineCodeEditor] = useState(false);
  const [inlineCode, setInlineCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showInlineTextEditor, setShowInlineTextEditor] = useState(false);
  // Mobile/tablet slide rail — collapsed by default so the active canvas/title/toolbar
  // appears immediately after the toolbar at 390px. Desktop (≥lg) still shows the
  // persistent rail and ignores this state. No duplicated slide state — the drawer
  // hosts the SAME rail JSX as the inline desktop rail.
  const [slidesDrawerOpen, setSlidesDrawerOpen] = useState(false);
  // Editor tools disclosure — collapses the secondary action row (Builder /
  // Canvas / Blocks / Import / Present / AI / Fullscreen) behind a single
  // accessible button. Closed by default so the active slide canvas is the
  // primary focus on every viewport. EPHEMERAL only — never serialised.
  const [editorToolsOpen, setEditorToolsOpen] = useState(false);
  // Pending template application — only set when the slide already has
  // content and applying the template would OVERWRITE the tutor's work.
  // Empty slides skip the confirm and apply directly. EPHEMERAL only.
  const [pendingTemplate, setPendingTemplate] = useState(null);
  // Bumped after a successful template apply so VerifiedTemplateGallery
  // can collapse itself and the canvas re-focuses on the new content.
  const [templateApplyTick, setTemplateApplyTick] = useState(0);

  const addSlide = (template = 'blank') => {
    const templateData = SLIDE_TEMPLATES[template] || customTemplates[template];
    if (!templateData) {
      toast.error('Template not found');
      return;
    }
    const newSlides = [
      ...slides,
      {
        title: `Slide ${slides.length + 1}`,
        content: templateData.content,
        order: slides.length + 1
      }
    ];
    onChange(newSlides);
    setCurrentSlide(slides.length);
    toast.success(`${templateData.name} added!`);
  };

  const duplicateSlide = (index) => {
    const slideToDupe = slides[index];
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, {
      ...slideToDupe,
      title: `${slideToDupe.title} (Copy)`,
      order: index + 2
    });
    // Reorder
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });
    onChange(newSlides);
    setCurrentSlide(index + 1);
    toast.success('Slide duplicated!');
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange(newSlides);
  };

  const deleteSlide = (index) => {
    if (slides.length === 1) {
      toast.error('You need at least one slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index).map((slide, i) => ({
      ...slide,
      order: i + 1
    }));
    onChange(newSlides);
    setCurrentSlide(Math.max(0, Math.min(currentSlide, newSlides.length - 1)));
    toast.success('Slide deleted');
  };

  const moveSlide = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });

    onChange(newSlides);
    setCurrentSlide(newIndex);
    toast.success('Slide moved');
  };

  // True if the slide currently has no meaningful content (no text and no
  // structural tags other than wrapper whitespace). Used to skip the
  // "Replace slide content?" confirm on empty slides — applying a template
  // to a fresh blank slide should be a one-click action.
  const isEmptySlideContent = (html) => {
    if (!html) return true;
    const stripped = html
      .replace(/<\s*p\s*>\s*<\s*\/\s*p\s*>/gi, '')   // empty <p></p>
      .replace(/<br\s*\/?>/gi, '')                    // bare breaks
      .replace(/<[^>]+>/g, '')                        // all tags
      .replace(/&nbsp;/gi, ' ')
      .trim();
    return stripped.length === 0;
  };

  // Apply a verified template to the current slide.
  // - If the slide is empty: apply immediately (the documented initial path).
  // - Otherwise: open the Replace/Cancel confirm dialog and only commit
  //   after explicit confirmation. This is what protects existing block work
  //   from being silently wiped by a stray template click.
  const handleTemplateApply = (content, name) => {
    if (isEmptySlideContent(currentSlideData?.content)) {
      commitTemplateApply(content, name);
      return;
    }
    setPendingTemplate({ content, name: name || 'this template' });
  };

  const commitTemplateApply = (content, name) => {
    updateSlide(currentSlide, 'content', content);
    setPendingTemplate(null);
    // Bump the tick so VerifiedTemplateGallery collapses itself.
    setTemplateApplyTick((t) => t + 1);
    toast.success(`${name || 'Template'} applied to draft — Save Lesson to persist`);
  };

  const extractCodeFromSlide = (content) => {
    // Try to extract code from <pre><code> or <code> tags
    const codeMatch = content.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i) ||
                     content.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
    if (codeMatch) {
      const code = codeMatch[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return code;
    }
    return '';
  };

  const handleEditCode = () => {
    const content = currentSlideData?.content || '';
    const code = extractCodeFromSlide(content);
    
    if (!code) {
      toast.error('No code block found in this slide');
      return;
    }

    // Try to detect language from class attribute
    const langMatch = content.match(/class="language-(\w+)"/i);
    const detectedLang = langMatch ? langMatch[1] : 'javascript';
    
    setCodeLanguage(detectedLang);
    setInlineCode(code);
    setShowInlineCodeEditor(true);
  };

  const handleSaveCode = (newCode) => {
    const content = currentSlideData?.content || '';
    const isWebCode = ['html', 'css'].includes(codeLanguage.toLowerCase());
    
    let newContent;
    if (isWebCode) {
      // For HTML/CSS, create split view
      newContent = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h3 style="color: #4f46e5; margin-bottom: 10px;">Code:</h3>
          <pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;"><code class="language-${codeLanguage}">${newCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
        <div>
          <h3 style="color: #4f46e5; margin-bottom: 10px;">Preview:</h3>
          <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; background: white; min-height: 200px;">
            ${newCode}
          </div>
        </div>
      </div>`;
    } else {
      // For other languages, just show formatted code
      newContent = content.replace(
        /<pre[^>]*><code[^>]*>[\s\S]*?<\/code><\/pre>/i,
        `<pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6;"><code class="language-${codeLanguage}">${newCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
      );
    }
    
    updateSlide(currentSlide, 'content', newContent);
    setShowInlineCodeEditor(false);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((slide, i) => {
      slide.order = i + 1;
    });

    onChange(items);
    setCurrentSlide(result.destination.index);
    toast.success('Slides reordered');
  };

  const saveCustomTemplate = () => {
    if (!templateName.trim() || !currentSlideData) return;
    
    const newTemplate = {
      name: templateName.trim(),
      icon: templateIcon,
      content: currentSlideData.content
    };
    
    const updated = {
      ...customTemplates,
      [Date.now().toString()]: newTemplate
    };
    
    setCustomTemplates(updated);
    localStorage.setItem('customSlideTemplates', JSON.stringify(updated));
    setShowSaveTemplate(false);
    setTemplateName('');
    setTemplateIcon('📄');
    toast.success('Template saved!');
  };

  const saveAdvancedTemplate = (template) => {
    const updated = {
      ...customTemplates,
      [Date.now().toString()]: template
    };
    
    setCustomTemplates(updated);
    localStorage.setItem('customSlideTemplates', JSON.stringify(updated));
    setShowAdvancedBuilder(false);
    toast.success('Advanced template saved!');
  };

  const deleteCustomTemplate = (key) => {
    const updated = { ...customTemplates };
    delete updated[key];
    setCustomTemplates(updated);
    localStorage.setItem('customSlideTemplates', JSON.stringify(updated));
    toast.success('Template deleted');
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic or prompt');
      return;
    }

    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive, educational slide content for: "${aiPrompt}". 
        
Include:
- A clear, engaging title
- Well-structured HTML content with headings, paragraphs, lists, and emphasis
- Educational explanations suitable for students
- Use proper HTML formatting with inline styles for visual appeal
- Make it engaging and easy to understand

Return ONLY the HTML content, starting with an <h2> title tag.`,
        add_context_from_internet: false
      });

      const newSlide = {
        title: aiPrompt,
        content: result,
        order: slides.length + 1
      };

      onChange([...slides, newSlide]);
      setCurrentSlide(slides.length);
      setShowAIDialog(false);
      setAiPrompt('');
      toast.success('AI-generated slide added!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIRewrite = async () => {
    if (!currentSlideData) return;

    setAiLoading(true);
    try {
      const currentContent = currentSlideData.content || '';
      const plainText = currentContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Rewrite and improve the following educational content to be ${aiPrompt || 'clearer, more concise, and more engaging'}:

"${plainText}"

Requirements:
- Maintain the educational value
- Use proper HTML formatting with inline styles
- Make it more ${aiPrompt || 'clear and engaging'}
- Keep the same general structure but improve readability
- Use headings, paragraphs, lists as appropriate

Return ONLY the improved HTML content.`,
        add_context_from_internet: false
      });

      updateSlide(currentSlide, 'content', result);
      setShowAIDialog(false);
      setAiPrompt('');
      toast.success('Content rewritten successfully!');
    } catch (error) {
      toast.error('Failed to rewrite content');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the image you want to generate');
      return;
    }

    setAiLoading(true);
    try {
      toast.info('Generating educational image with Stable Diffusion...');

      const imageResult = await base44.functions.invoke('generateImagenAI', {
        prompt: `Educational illustration: ${aiPrompt}. Style: Clean, professional, suitable for educational materials and student learning. Purpose: Support understanding of educational concepts through clear visuals.`,
        aspectRatio: 'landscape'
      });

      // Insert the generated image into the current slide
      const currentContent = currentSlideData?.content || '';
      const resultUrl = imageResult.data?.url || imageResult.url;

      // Open image editor for the generated image
      setImageToEdit(resultUrl);
      setShowImageEditor(true);
      setShowAIDialog(false);
    } catch (error) {
      toast.error('Failed to generate image');
    } finally {
      setAiLoading(false);
    }
  };

  const [imageSuggestions, setImageSuggestions] = useState([]);

  const handleAISuggestImages = async () => {
    if (!currentSlideData) return;

    setAiLoading(true);
    setImageSuggestions([]);
    try {
      const slideTitle = currentSlideData.title || '';
      const currentContent = currentSlideData.content || '';
      const plainText = currentContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Build focused search query: prioritize title, then first 100 chars of content
      const searchQuery = slideTitle || plainText.substring(0, 100);

      // Use AI to generate a better search term
      const aiSearchTerm = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this slide title: "${slideTitle}" and content: "${plainText.substring(0, 300)}"

Generate ONE specific search query (3-6 words) to find the most relevant educational diagram, illustration, or image. Just return the search query, nothing else.`,
        add_context_from_internet: false
      });

      // Search for relevant images using AI-generated term
      const searchResult = await base44.functions.invoke('searchImageOnline', {
        query: aiSearchTerm.trim() || searchQuery,
        slideTitle: slideTitle,
        slideContent: plainText.substring(0, 200)
      });

      const imageResults = searchResult.data?.images || [];
      setImageSuggestions(imageResults);

      setAiPrompt(`Search query used: "${aiSearchTerm.trim() || searchQuery}"`);
      toast.success(`Found ${imageResults.length} matching images!`);
      
    } catch (error) {
      toast.error('Failed to search for images');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleInsertImage = (imageUrl) => {
    const currentContent = currentSlideData?.content || '';
    const imageHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Educational image" /></div>`;
    updateSlide(currentSlide, 'content', currentContent + imageHtml);
    setShowAIDialog(false);
    setImageSuggestions([]);
    setAiPrompt('');
    toast.success('Image added to slide!');
  };

  const handleReplaceImage = (imageUrl) => {
    let currentContent = currentSlideData?.content || '';
    
    // Find and replace the first image in the content
    const imgRegex = /<img[^>]+src="[^">]+"[^>]*>/i;
    if (imgRegex.test(currentContent)) {
      const newImageTag = `<img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Educational image" />`;
      currentContent = currentContent.replace(imgRegex, newImageTag);
      updateSlide(currentSlide, 'content', currentContent);
      toast.success('Image replaced successfully!');
    } else {
      // No image found, add it
      const imageHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Educational image" /></div>`;
      updateSlide(currentSlide, 'content', currentContent + imageHtml);
      toast.success('Image added to slide!');
    }
    
    setShowAIDialog(false);
    setImageSuggestions([]);
    setAiPrompt('');
  };

  const allTemplates = {
    ...SLIDE_TEMPLATES,
    ...customTemplates
  };

  const currentSlideData = slides[currentSlide] || null;

  if (slides.length === 0) {
    // Wrap the empty-state in a scrollable container. The parent LessonEditor
    // sets `overflow-y-hidden` on the page so the workspace ribbon/status bar
    // stay pinned; without an inner `overflow-y-auto` here, the template grid
    // gets clipped on shorter viewports and the tutor cannot reach the
    // templates below the fold.
    return (
      <div className="h-full w-full min-h-0 overflow-y-auto p-4 sm:p-6">
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="max-w-2xl mx-auto">
          <LayoutTemplate className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your First Slide</h3>
          <p className="text-gray-500 mb-8">Choose from professional templates to get started with your lesson</p>
          
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Choose a template to get started</p>
            {Object.keys(customTemplates).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManageTemplates(!showManageTemplates)}
              >
                Manage Templates
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => addSlide(key)}
                className="h-auto py-6 flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{template.icon}</span>
                <span className="font-medium text-sm">{template.name}</span>
              </Button>
            ))}

            {Object.entries(customTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => addSlide(key)}
                className="h-auto py-6 flex-col gap-3 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all relative group"
              >
                <span className="text-3xl">{template.icon}</span>
                <span className="font-medium text-sm">{template.name}</span>
                <span className="absolute top-1 right-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Custom</span>
              </Button>
            ))}
          </div>

          {showManageTemplates && Object.keys(customTemplates).length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold mb-3 text-sm">Your Custom Templates</h4>
              <div className="space-y-2">
                {Object.entries(customTemplates).map(([key, template]) => (
                  <div key={key} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCustomTemplate(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>
    );
  }

  // Shared modal renderer for both the Phase 1 WorkspaceShell branch and the
  // legacy Canvas branch. Lives in WorkspaceModals.jsx so this file stays
  // under the 2000-line cap; behaviour is identical to the inline modals
  // that appear later in this file.
  const renderWorkspaceModals = () => (
    <WorkspaceModals
      SLIDE_TEMPLATES={SLIDE_TEMPLATES}
      customTemplates={customTemplates}
      showSaveTemplate={showSaveTemplate} setShowSaveTemplate={setShowSaveTemplate}
      templateName={templateName} setTemplateName={setTemplateName}
      templateIcon={templateIcon} setTemplateIcon={setTemplateIcon}
      saveCustomTemplate={saveCustomTemplate}
      showAIDialog={showAIDialog} setShowAIDialog={setShowAIDialog}
      aiAction={aiAction} aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} aiLoading={aiLoading}
      handleAIGenerate={handleAIGenerate} handleAIRewrite={handleAIRewrite} handleAIGenerateImage={handleAIGenerateImage}
      showManageTemplates={showManageTemplates} setShowManageTemplates={setShowManageTemplates}
      handleTemplateApply={handleTemplateApply}
      showAdvancedBuilder={showAdvancedBuilder} setShowAdvancedBuilder={setShowAdvancedBuilder}
      saveAdvancedTemplate={saveAdvancedTemplate}
      showTemplateBlocks={showTemplateBlocks} setShowTemplateBlocks={setShowTemplateBlocks}
      currentSlideData={currentSlideData} updateSlide={updateSlide} currentSlide={currentSlide}
      showPresentation={showPresentation} setShowPresentation={setShowPresentation}
      slides={slides} onChange={onChange} setCurrentSlide={setCurrentSlide}
      showImageManager={showImageManager} setShowImageManager={setShowImageManager}
      showImageOverlay={showImageOverlay} setShowImageOverlay={setShowImageOverlay}
      overlayImageUrl={overlayImageUrl} setOverlayImageUrl={setOverlayImageUrl}
      showCanva={showCanva} setShowCanva={setShowCanva}
      showCanvaImporter={showCanvaImporter} setShowCanvaImporter={setShowCanvaImporter}
      showFigmaImporter={showFigmaImporter} setShowFigmaImporter={setShowFigmaImporter}
      showImageEditor={showImageEditor} setShowImageEditor={setShowImageEditor}
      imageToEdit={imageToEdit} setImageToEdit={setImageToEdit}
      showInlineCodeEditor={showInlineCodeEditor} setShowInlineCodeEditor={setShowInlineCodeEditor}
      inlineCode={inlineCode} codeLanguage={codeLanguage} handleSaveCode={handleSaveCode}
      showInlineTextEditor={showInlineTextEditor} setShowInlineTextEditor={setShowInlineTextEditor}
      pendingTemplate={pendingTemplate} setPendingTemplate={setPendingTemplate}
      commitTemplateApply={commitTemplateApply}
    />
  );

  // ────────────────────────────────────────────────────────────────────────
  // PHASE 1 WORKSPACE SHELL
  // ────────────────────────────────────────────────────────────────────────
  // When the editor is in the default `builder` mode, render the new
  // presentation-style workspace shell (ribbon · thumbnail rail · pasteboard ·
  // status bar) around the EXISTING VisualLessonBuilder. All slide state and
  // mutation continues to flow through this SlideEditor component — the shell
  // is a pure layout/presentation wrapper that delegates every action back
  // up. No serializer, player, entity or save logic is altered.
  if (editorMode === 'builder') {
    // Repaired Phase-1 workspace invocation.
    //
    // The previous build passed legacy prop names (onSelect / onAdd / actions
    // / inspector) that `WorkspaceShell` no longer accepts — the result was a
    // workspace with broken slide updates, a missing status bar, an empty
    // ribbon, and the rail collapsed to ~128 px. We now pass the workspace
    // ONLY the fully-supported contract (slides + onChange + isPersisted +
    // builderFlushRef). All other ribbon actions remain available because
    // PresentationWorkspace wires its own block insertion / preview / undo /
    // redo handlers to the shared VisualLessonBuilder.
    // CRITICAL — height chain: the parent LessonEditor allocates the
    // workspace its remaining viewport via `flex-1 min-h-0`. For
    // `h-full` inside WorkspaceShell / PresentationWorkspace / Stage to
    // resolve to a real pixel height, EVERY intermediate wrapper must
    // also be `h-full` + a flex/min-h-0 context. When this wrapper was
    // just `<div className="">` the chain broke and the workspace
    // collapsed to its intrinsic content height (~313px in the
    // builder's reported bug).
    return (
      <div
        className={
          fullscreenEdit
            ? 'fixed inset-0 z-50 bg-white flex flex-col min-h-0 min-w-0'
            : 'h-full w-full flex flex-col min-h-0 min-w-0'
        }
      >
        <WorkspaceShell
          slides={slides}
          onChange={onChange}
          isPersisted={isPersisted}
          builderFlushRef={builderFlushRef}
        />
      </div>
    );
  }

  return (
    <div className={`${fullscreenEdit ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Top toolbar — at ≥sm: flex-wrap as before (desktop/tablet behaviour unchanged).
          Below sm (390px): the action row becomes a single horizontally-scrollable
          strip so it never causes outer-page overflow and Save Lesson in the page
          header stays unclipped. Title block stays compact and shrinkable. */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <LayoutTemplate className="w-6 h-6 text-indigo-600 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Slide Editor</h3>
            <p className="text-sm text-gray-500">{slides.length} slide{slides.length !== 1 ? 's' : ''} total</p>
          </div>
          {/* Disclosure for the secondary action row. Sits next to the title
              so it is always reachable, even when the action row itself is
              collapsed. Works on every viewport so the canvas can be the
              primary visual on desktop too if the tutor wants. */}
          <button
            type="button"
            onClick={() => setEditorToolsOpen(o => !o)}
            aria-expanded={editorToolsOpen}
            aria-controls="slide-editor-tools"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 ml-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Wrench className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Editor tools</span>
            {editorToolsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        <div
          id="slide-editor-tools"
          hidden={!editorToolsOpen}
          className={`${editorToolsOpen ? 'flex' : 'hidden'} sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 sm:pb-0 [&>*]:shrink-0 sm:[&>*]:shrink`}
        >
          <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
            <Button
              variant={editorMode === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setEditorMode('builder')}
              className="min-h-[44px]"
              title="Visual Lesson Builder (default)"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Builder
            </Button>
            <Button
              variant={editorMode === 'canvas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setEditorMode('canvas')}
              className="min-h-[44px]"
              title="Advanced canvas mode"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Canvas
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateBlocks(true)}
            className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 min-h-[44px]"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Blocks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCanvaImporter(true)}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 min-h-[44px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Import Canva
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFigmaImporter(true)}
            className="bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100 min-h-[44px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Import Figma
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresentation(true)}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 min-h-[44px]"
          >
            <Presentation className="w-4 h-4 mr-2" />
            Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAiAction('generate');
              setAiPrompt('');
              setShowAIDialog(true);
            }}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreenEdit(!fullscreenEdit)}
            className="min-h-[44px]"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            {fullscreenEdit ? 'Exit' : 'Fullscreen'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-[500px] overflow-y-auto">
              {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => addSlide(key)}
                  className="cursor-pointer py-3"
                >
                  <span className="text-xl mr-3">{template.icon}</span>
                  <span className="font-medium">{template.name}</span>
                </DropdownMenuItem>
              ))}

              {Object.keys(customTemplates).length > 0 && (
                <>
                  <div className="border-t my-2" />
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500">CUSTOM TEMPLATES</div>
                  {Object.entries(customTemplates).map(([key, template]) => (
                    <DropdownMenuItem 
                      key={key}
                      onClick={() => addSlide(key)}
                      className="cursor-pointer py-3 bg-green-50"
                    >
                      <span className="text-xl mr-3">{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Shared thumbnail rail JSX — rendered inline on desktop (≥lg) AND inside
          the mobile Sheet drawer. Same `slides` / `currentSlide` / `onChange` —
          no duplicated state, reorder & selection behave identically. */}
      <div className={`flex flex-col lg:flex-row gap-4 lg:gap-6 w-full ${fullscreenEdit ? 'h-[calc(100vh-80px)] p-6' : 'min-h-[600px]'}`}>
        {/* Desktop rail — hidden below lg. At <lg, the active canvas appears
            immediately after the toolbar; thumbnails are accessed via the
            "Slides (N)" button below. */}
        <Card className={`hidden lg:flex ${fullscreenEdit ? 'lg:w-72' : 'lg:w-[280px] xl:w-72'} shrink-0 flex-col border-2 min-h-0`}>
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">All Slides</p>
          </div>
          <ScrollArea className="flex-1">
            <SlideThumbnailRail
              slides={slides}
              currentSlide={currentSlide}
              onSelect={(i) => setCurrentSlide(i)}
              onDragEnd={handleDragEnd}
              onDuplicate={(i) => duplicateSlide(i)}
              onDelete={(i) => { if (confirm('Delete this slide?')) deleteSlide(i); }}
            />
          </ScrollArea>
        </Card>

        {/* Main Editor — min-w-0 is critical: without it, flex-1 cannot shrink
            below the intrinsic min-content width of the toolbar row, causing
            horizontal overflow + the "blank right half" the user reported. */}
        <div className="flex-1 min-w-0 w-full flex flex-col">
          {currentSlideData && (
            <>
              {/* Navigation — flex-wrap so the button row reflows below 1024px
                  instead of forcing horizontal overflow on the parent. At <sm the
                  inner action cluster becomes horizontally scrollable so 390px
                  never produces page overflow. */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-gray-50 rounded-lg p-3 max-w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex sm:flex-wrap items-center gap-2 min-w-0 flex-1 overflow-x-auto sm:overflow-visible [&>*]:shrink-0 sm:[&>*]:shrink">
                  <span className="text-sm font-medium text-gray-700">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                  {/* Mobile/tablet only — opens the slide thumbnail drawer. Hidden ≥lg
                      because the persistent desktop rail is already visible. */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSlidesDrawerOpen(true)}
                    className="lg:hidden bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 min-h-[44px]"
                    aria-label={`Open slide list, ${slides.length} slides`}
                  >
                    <LayoutList className="w-4 h-4 mr-1" />
                    Slides ({slides.length})
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save as Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowSaveTemplate(true)}>
                        <Save className="w-4 h-4 mr-2" />
                        Quick Save
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowAdvancedBuilder(true)}>
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Advanced Builder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Tools
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setAiAction('rewrite');
                          setAiPrompt('');
                          setShowAIDialog(true);
                        }}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Rewrite Content
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setAiAction('images');
                          setAiPrompt('');
                          handleAISuggestImages();
                          setShowAIDialog(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Suggest Images
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setAiAction('generate-image');
                          setAiPrompt('');
                          setShowAIDialog(true);
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Image
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowImageManager(true)}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add/Replace Image
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const content = currentSlideData?.content || '';
                          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
                          if (imgMatch) {
                            setImageToEdit(imgMatch[1]);
                            setShowImageEditor(true);
                          } else {
                            toast.error('No image found in current slide');
                          }
                        }}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Edit Current Image
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowCanva(true)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Design with Canva
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          // Extract first image from current slide
                          const content = currentSlideData?.content || '';
                          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
                          if (imgMatch) {
                            setOverlayImageUrl(imgMatch[1]);
                            setShowImageOverlay(true);
                          } else {
                            toast.error('No image found in current slide');
                          }
                        }}
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Add Labels to Image
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInlineTextEditor(true)}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Edit Content
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCode}
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Edit Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateSlide(currentSlide)}
                    className="min-h-[44px]"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this slide?')) deleteSlide(currentSlide);
                    }}
                    className="text-red-600 hover:text-red-700 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="min-h-[44px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Editor Area */}
              <Card className="flex-1 overflow-hidden border-2">
                {editorMode === 'canvas' ? (
                  <CanvasSlideEditor
                    slide={currentSlideData}
                    onChange={(updatedSlide) => {
                      const newSlides = [...slides];
                      newSlides[currentSlide] = updatedSlide;
                      onChange(newSlides);
                    }}
                  />
                ) : (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Visual Lesson Builder — block-based, drag/drop,
                        inline editing, autosave + preview. Serialises back
                        to slide.content HTML for player compatibility. */}
                    <VisualLessonBuilder
                      slide={currentSlideData}
                      isPersisted={isPersisted}
                      flushRef={builderFlushRef}
                      onChange={(updatedSlide) => {
                        const newSlides = [...slides];
                        newSlides[currentSlide] = updatedSlide;
                        onChange(newSlides);
                      }}
                    />

                    {/* Verified template gallery — collapsible disclosure.
                        Lists only the 6 templates audited to round-trip
                        through htmlToBlocks ↔ blocksToHtml without falling
                        into legacy-html. Auto-collapses when the slide
                        already has content so the canvas stays the primary
                        focus on every viewport. The `collapseTick` prop is
                        bumped after a successful template apply so the
                        gallery closes without us having to lift its open
                        state — keeps disclosure UI fully local. */}
                    <VerifiedTemplateGallery
                      hasContent={Boolean(currentSlideData?.content) && !isEmptySlideContent(currentSlideData?.content)}
                      customTemplates={customTemplates}
                      collapseTick={templateApplyTick}
                      onApply={(content, name) => handleTemplateApply(content, name)}
                      onManageCustom={Object.keys(customTemplates).length > 0
                        ? () => setShowManageTemplates(true)
                        : null}
                    />

                    <div>
                      <Label className="text-base font-semibold mb-2 block">Slide Title</Label>
                      <Input
                        value={currentSlideData.title || ''}
                        onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                        placeholder={`Slide ${currentSlide + 1} title`}
                        className="text-lg font-medium"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Preview Image if available */}
                    {currentSlideData.imageUrl && (
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-5 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ImageIcon className="w-5 h-5 text-indigo-600" />
                          <Label className="text-base font-semibold">Slide Image</Label>
                        </div>
                        <img 
                          src={currentSlideData.imageUrl} 
                          alt={currentSlideData.title}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            const newSlides = [...slides];
                            delete newSlides[currentSlide].imageUrl;
                            onChange(newSlides);
                            toast.success('Image removed');
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}

                    {/* Slide content is now edited by the Visual Lesson Builder
                        at the top of this panel — Rich Text mode has been
                        replaced with block-based editing. */}
                  </div>
                </ScrollArea>
                )}
              </Card>
            </>
          )}
        </div>
        </div>

        {/* Mobile/tablet slide thumbnail drawer — opens via the "Slides (N)" button.
            Hosts the SAME SlideThumbnailRail component the desktop sidebar uses, so
            selection, reorder, duplicate and delete behave identically and there is
            NO duplicated slide state. Closed by default at all sizes. */}
        <Sheet open={slidesDrawerOpen} onOpenChange={setSlidesDrawerOpen}>
          <SheetContent side="left" className="w-[88vw] sm:w-[360px] p-0 flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-3 border-b">
              <SheetTitle className="flex items-center gap-2 text-base">
                <LayoutList className="w-4 h-4 text-indigo-600" />
                Slides ({slides.length})
              </SheetTitle>
              <p className="text-xs text-slate-500">Tap to open. Drag to reorder.</p>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <SlideThumbnailRail
                slides={slides}
                currentSlide={currentSlide}
                onSelect={(i) => { setCurrentSlide(i); setSlidesDrawerOpen(false); }}
                onDragEnd={handleDragEnd}
                onDuplicate={(i) => duplicateSlide(i)}
                onDelete={(i) => { if (confirm('Delete this slide?')) deleteSlide(i); }}
              />
            </div>
            <div className="border-t p-3 bg-slate-50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add slide
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 max-h-[60vh] overflow-y-auto">
                  {Object.entries(SLIDE_TEMPLATES).map(([key, template]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => { addSlide(key); setSlidesDrawerOpen(false); }}
                      className="cursor-pointer py-3"
                    >
                      <span className="text-xl mr-3">{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSaveTemplate(false)}>
            <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Save as Template</h3>
              <div className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="My Custom Template"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={templateIcon}
                    onChange={(e) => setTemplateIcon(e.target.value)}
                    placeholder="📝"
                    className="mt-1"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose an emoji to represent your template</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={saveCustomTemplate} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!templateName.trim()}
                >
                  Save Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                    setTemplateIcon('📄');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant Modal */}
        {showAIDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !aiLoading && setShowAIDialog(false)}>
            <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Assistant</h3>
                  <p className="text-sm text-gray-500">
                    {aiAction === 'generate' && 'Generate slide content from a topic'}
                    {aiAction === 'rewrite' && 'Rewrite and improve slide content'}
                    {aiAction === 'images' && 'Visual suggestions for your slide'}
                    {aiAction === 'generate-image' && 'Generate custom educational images with AI'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {aiAction === 'generate' && (
                  <div>
                    <Label>Topic or Prompt</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 'Introduction to Photosynthesis' or 'The Water Cycle explained for students'"
                      className="mt-1 h-24"
                      disabled={aiLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Describe what you want the slide to cover
                    </p>
                  </div>
                )}

                {aiAction === 'rewrite' && (
                  <div>
                    <Label>How should we improve it?</Label>
                    <Input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 'more concise', 'simpler language', 'more engaging'"
                      className="mt-1"
                      disabled={aiLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Leave blank for general improvement, or specify tone/style
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium mb-1">Current content preview:</p>
                      <p className="text-xs text-gray-500 line-clamp-3">
                        {currentSlideData?.content?.replace(/<[^>]*>/g, ' ').substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                )}

                {aiAction === 'images' && (
                  <div>
                    <Label>Image Suggestions with Online Search</Label>
                    {imageSuggestions.length > 0 ? (
                      <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                        {imageSuggestions.map((img, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden bg-white">
                            <img 
                              src={img.url} 
                              alt={img.description || 'Suggested image'} 
                              className="w-full h-40 object-cover"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/400x200/E5E7EB/9CA3AF?text=Image+Not+Available'}
                            />
                            <div className="p-3 space-y-2">
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">{img.description || 'Educational image'}</p>
                              <p className="text-xs text-gray-500 truncate">{img.url}</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReplaceImage(img.url)}
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Replace Image
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleInsertImage(img.url)}
                                  className="flex-1"
                                >
                                  Add as New
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 p-8 border-2 border-dashed rounded-lg text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          {aiLoading ? 'Searching for relevant images...' : 'Click the button below to search for images'}
                        </p>
                      </div>
                    )}
                    
                    {aiPrompt && !aiLoading && (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-xs font-semibold text-purple-900 mb-2">💡 AI Search Suggestions:</p>
                        <p className="text-xs text-purple-700 whitespace-pre-line">{aiPrompt}</p>
                      </div>
                    )}
                  </div>
                )}

                {aiAction === 'generate-image' && (
                  <div>
                    <Label>Describe the Image</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 'A labeled diagram showing the parts of a plant cell' or 'A graph comparing renewable vs non-renewable energy sources'"
                      className="mt-1 h-32"
                      disabled={aiLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Describe the educational image, diagram, graph, or illustration you need
                    </p>
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-xs font-semibold text-purple-900 mb-2">💡 Tips for better results:</p>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• Be specific about what should be shown</li>
                        <li>• Mention if it's a diagram, chart, graph, or illustration</li>
                        <li>• Include labels or annotations if needed</li>
                        <li>• Specify educational context (e.g., "for biology students")</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {aiAction === 'images' ? (
                  <>
                    <Button 
                      onClick={handleAISuggestImages}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={aiLoading}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {imageSuggestions.length > 0 ? 'Search Again' : 'Search & Suggest Images'}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (!aiLoading) {
                          setShowAIDialog(false);
                          setAiPrompt('');
                          setImageSuggestions([]);
                        }
                      }}
                      className="flex-1"
                      disabled={aiLoading}
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={
                        aiAction === 'generate' ? handleAIGenerate : 
                        aiAction === 'rewrite' ? handleAIRewrite :
                        aiAction === 'generate-image' ? handleAIGenerateImage :
                        null
                      }
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={aiLoading || ((aiAction === 'generate' || aiAction === 'generate-image') && !aiPrompt.trim())}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {aiAction === 'generate-image' ? 'Generating Image...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {aiAction === 'generate' ? 'Generate Slide' : 
                           aiAction === 'rewrite' ? 'Rewrite Content' :
                           aiAction === 'generate-image' ? 'Generate Image' : 'Process'}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (!aiLoading) {
                          setShowAIDialog(false);
                          setAiPrompt('');
                        }
                      }}
                      className="flex-1"
                      disabled={aiLoading}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manage Templates Modal */}
        {showManageTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowManageTemplates(false)}>
            <div className="bg-white rounded-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">My Custom Templates</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowManageTemplates(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {Object.keys(customTemplates).length === 0 ? (
                <div className="text-center py-12">
                  <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No custom templates yet</p>
                  <p className="text-sm text-gray-400">Create a slide you like and save it as a template</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(customTemplates).map(([key, template]) => (
                    <Card key={key} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 border-2 border-green-200">
                          <span className="text-3xl">{template.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                          <div 
                            className="text-xs text-gray-500 line-clamp-2 mb-2"
                            dangerouslySetInnerHTML={{ 
                              __html: template.content?.replace(/<[^>]*>/g, ' ').substring(0, 120) + '...' 
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateSlide(currentSlide, 'content', template.content);
                                toast.success(`${template.name} applied!`);
                                setShowManageTemplates(false);
                              }}
                              className="h-7 text-xs"
                            >
                              Apply to Current Slide
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                addSlide(key);
                                setShowManageTemplates(false);
                              }}
                              className="h-7 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add New Slide
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete template "${template.name}"?`)) {
                              deleteCustomTemplate(key);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Save className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900 mb-1">How to create templates</p>
                    <p className="text-sm text-green-700">Design a slide you like, then click "Save as Template" to reuse it anytime!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Template Builder */}
        {showAdvancedBuilder && (
          <AdvancedTemplateBuilder
            onSave={saveAdvancedTemplate}
            onClose={() => setShowAdvancedBuilder(false)}
            initialTemplate={null}
          />
        )}

        {/* Template Blocks */}
        {showTemplateBlocks && (
          <TemplateBlocks
            onInsert={(html) => {
              const currentContent = currentSlideData?.content || '';
              updateSlide(currentSlide, 'content', currentContent + html);
            }}
            onConvertToColumns={(cols) => {
              const currentContent = currentSlideData?.content || '';
              
              // Parse content into chunks (images, paragraphs, headings, etc.)
              const parser = new DOMParser();
              const doc = parser.parseFromString(currentContent, 'text/html');
              const elements = Array.from(doc.body.children);
              
              // Distribute elements across columns
              const columnsContent = Array(cols).fill('').map(() => []);
              elements.forEach((el, idx) => {
                const columnIndex = idx % cols;
                // Ensure images are responsive within columns and add resize control
                if (el.tagName === 'IMG') {
                  const imgSrc = el.src;
                  const wrappedImg = `<div style="position: relative; margin: 10px 0;"><div style="position: absolute; top: -30px; right: 0; background: white; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px; z-index: 10;"><span style="font-size: 11px; color: #6B7280; font-weight: 600;">Size:</span><input type="range" min="30" max="100" value="100" oninput="this.nextElementSibling.textContent = this.value + '%'; const img = this.closest('div').nextElementSibling; img.style.width = this.value + '%';" style="width: 80px; height: 4px; cursor: pointer;" /><span style="font-size: 11px; color: #1F2937; font-weight: 600; min-width: 35px;">100%</span></div><img src="${imgSrc}" style="width: 100%; height: auto; max-width: 100%; display: block; border-radius: 8px;" /></div>`;
                  columnsContent[columnIndex].push(wrappedImg);
                } else {
                  // Check for images inside divs
                  const images = el.querySelectorAll('img');
                  images.forEach(img => {
                    const imgSrc = img.src;
                    const wrappedImg = document.createElement('div');
                    wrappedImg.style.position = 'relative';
                    wrappedImg.style.margin = '10px 0';
                    wrappedImg.innerHTML = `<div style="position: absolute; top: -30px; right: 0; background: white; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px; z-index: 10;"><span style="font-size: 11px; color: #6B7280; font-weight: 600;">Size:</span><input type="range" min="30" max="100" value="100" oninput="this.nextElementSibling.textContent = this.value + '%'; const img = this.closest('div').nextElementSibling; img.style.width = this.value + '%';" style="width: 80px; height: 4px; cursor: pointer;" /><span style="font-size: 11px; color: #1F2937; font-weight: 600; min-width: 35px;">100%</span></div><img src="${imgSrc}" style="width: 100%; height: auto; max-width: 100%; display: block; border-radius: 8px;" />`;
                    img.parentNode.replaceChild(wrappedImg, img);
                  });
                  columnsContent[columnIndex].push(el.outerHTML);
                }
              });
              
              // Build column HTML with explicit equal widths
              let columnHtml = '<div style="margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; table-layout: fixed;"><tr>';
              
              const colWidth = (100 / cols).toFixed(2);
              const padding = cols === 2 ? '15px' : cols === 3 ? '10px' : '8px';
              
              columnsContent.forEach((content, idx) => {
                const borderStyle = idx < cols - 1 ? ' border-right: 2px solid #E5E7EB;' : '';
                const paddingRight = idx < cols - 1 ? ` padding-right: ${padding};` : '';
                const paddingLeft = idx > 0 ? ` padding-left: ${padding};` : '';
                
                columnHtml += `<td style="width: ${colWidth}%; vertical-align: top;${paddingRight}${paddingLeft}${borderStyle}">`;
                columnHtml += content.length > 0 ? content.join('') : '<p style="color: #9CA3AF; font-size: 14px;">Add content here</p>';
                columnHtml += '</td>';
              });
              
              columnHtml += '</tr></table></div>';
              
              updateSlide(currentSlide, 'content', columnHtml);
              toast.success(`Content organized into ${cols} columns!`);
            }}
            onClose={() => setShowTemplateBlocks(false)}
          />
        )}

        {/* Presentation Mode */}
        {showPresentation && (
          <PresentationMode 
            slides={slides}
            onClose={() => setShowPresentation(false)}
          />
        )}

        {/* Image Manager */}
        {showImageManager && (
          <ImageManager
            onImageSelected={(url) => {
              const currentContent = currentSlideData?.content || '';
              const imageHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${url}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Selected image" /></div>`;
              updateSlide(currentSlide, 'content', currentContent + imageHtml);
            }}
            onClose={() => setShowImageManager(false)}
            slideTitle={currentSlideData?.title}
            slideContent={currentSlideData?.content}
          />
        )}

        {/* Image Text Overlay */}
        {showImageOverlay && overlayImageUrl && (
          <ImageTextOverlay
            imageUrl={overlayImageUrl}
            onSave={(html) => {
              updateSlide(currentSlide, 'content', html);
              setShowImageOverlay(false);
              setOverlayImageUrl('');
            }}
            onClose={() => {
              setShowImageOverlay(false);
              setOverlayImageUrl('');
            }}
          />
        )}

        {/* Canva Integration */}
        {showCanva && (
          <CanvaIntegration
            onImageImported={(imageUrl) => {
              const currentContent = currentSlideData?.content || '';
              const imageHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Canva design" /></div>`;
              updateSlide(currentSlide, 'content', currentContent + imageHtml);
            }}
            onClose={() => setShowCanva(false)}
          />
        )}

        {/* Canva Importer */}
        {showCanvaImporter && (
          <CanvaImporter
            onImport={(importedSlides) => {
              const newSlides = [...slides, ...importedSlides.map((slide, idx) => ({
                ...slide,
                order: slides.length + idx + 1
              }))];
              onChange(newSlides);
              setCurrentSlide(slides.length);
            }}
            onClose={() => setShowCanvaImporter(false)}
          />
        )}

        {/* Figma Importer */}
        {showFigmaImporter && (
          <FigmaImporter
            onImport={(importedSlides) => {
              const newSlides = [...slides, ...importedSlides.map((slide, idx) => ({
                ...slide,
                order: slides.length + idx + 1
              }))];
              onChange(newSlides);
              setCurrentSlide(slides.length);
            }}
            onClose={() => setShowFigmaImporter(false)}
          />
        )}

        {/* Image Editor */}
        {showImageEditor && imageToEdit && (
          <ImageEditorModal
            imageUrl={imageToEdit}
            onSave={(editedImageUrl) => {
              const currentContent = currentSlideData?.content || '';
              const imageHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${editedImageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Edited image" /></div>`;
              updateSlide(currentSlide, 'content', currentContent + imageHtml);
              setShowImageEditor(false);
              setImageToEdit(null);
              toast.success('Edited image added to slide!');
            }}
            onClose={() => {
              setShowImageEditor(false);
              setImageToEdit(null);
            }}
          />
        )}

        {/* Inline Code Editor */}
        {showInlineCodeEditor && (
          <InlineCodeEditor
            initialCode={inlineCode}
            language={codeLanguage}
            onSave={handleSaveCode}
            onCancel={() => setShowInlineCodeEditor(false)}
          />
        )}

        {/* Inline Text Editor */}
        {showInlineTextEditor && (
          <InlineTextEditor
            initialContent={currentSlideData?.content || ''}
            onSave={(newContent) => {
              updateSlide(currentSlide, 'content', newContent);
              setShowInlineTextEditor(false);
            }}
            onCancel={() => setShowInlineTextEditor(false)}
          />
        )}

        {/* Apply-template confirm — only mounted when pendingTemplate is set
            (i.e. the slide already has content and a template button was
            clicked). Empty slides bypass this entirely. */}
        <ApplyTemplateConfirmDialog
          open={Boolean(pendingTemplate)}
          templateName={pendingTemplate?.name || ''}
          onConfirm={() => pendingTemplate && commitTemplateApply(pendingTemplate.content, pendingTemplate.name)}
          onCancel={() => setPendingTemplate(null)}
        />
        </div>
        );
        }

// ---------------------------------------------------------------------------
// VerifiedTemplateGallery — small collapsible disclosure that lists the
// 6 verified built-in templates plus any user-saved custom templates.
//
// Defined inline because:
//   • It is tightly coupled to SLIDE_TEMPLATES + addSlide/onApply semantics
//     of the parent SlideEditor.
//   • It has no reusable surface area outside this file.
//
// Disclosure state is EPHEMERAL — never persisted. Default starts collapsed
// when the slide already has content (so the canvas remains the visual
// primary), expanded when the slide is empty (so a tutor sees the choices).
function VerifiedTemplateGallery({ hasContent, customTemplates, onApply, onManageCustom, collapseTick = 0 }) {
  const [open, setOpen] = React.useState(!hasContent);
  // Collapse on every successful template apply (parent bumps collapseTick).
  // Initial render (collapseTick === 0) is ignored so we don't override the
  // hasContent-driven default open state.
  React.useEffect(() => {
    if (collapseTick > 0) setOpen(false);
  }, [collapseTick]);
  const builtIns = Object.entries(SLIDE_TEMPLATES);
  const customs = Object.entries(customTemplates || {});

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="verified-template-gallery"
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-t-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-900">
          <LayoutTemplate className="w-4 h-4 text-indigo-600" />
          Slide templates
          <span className="text-[11px] font-normal text-indigo-700/70">
            ({builtIns.length} verified{customs.length ? ` · ${customs.length} custom` : ''})
          </span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-indigo-700" /> : <ChevronDown className="w-4 h-4 text-indigo-700" />}
      </button>

      {open && (
        <div id="verified-template-gallery" className="px-3 pb-3 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {builtIns.map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => onApply(t.content, t.name)}
                title={`Apply ${t.name} to this slide`}
                className="h-20 bg-white border border-indigo-100 rounded-md hover:border-indigo-400 hover:shadow-sm flex flex-col items-center justify-center gap-1 p-2 text-center transition-colors"
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">{t.name}</span>
              </button>
            ))}
            {customs.map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => onApply(t.content, t.name)}
                title={`Apply ${t.name} to this slide`}
                className="h-20 bg-emerald-50 border border-emerald-200 rounded-md hover:border-emerald-400 hover:shadow-sm flex flex-col items-center justify-center gap-1 p-2 text-center transition-colors relative"
              >
                <span className="text-2xl leading-none">{t.icon || '📄'}</span>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">{t.name}</span>
                <span className="absolute top-0.5 right-0.5 text-[8px] bg-emerald-600 text-white px-1 py-0.5 rounded-full font-semibold leading-none">MY</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-indigo-700/80">
              Click a template to replace this slide's content. Only audited
              layouts are shown here; build any other layout block-by-block
              above.
            </p>
            {onManageCustom && (
              <Button variant="ghost" size="sm" onClick={onManageCustom} className="h-6 text-[11px] shrink-0">
                Manage custom
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}