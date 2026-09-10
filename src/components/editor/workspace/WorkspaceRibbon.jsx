import React, { useContext, useRef, useState } from 'react';
import { LessonFormattingContext } from '@/components/editor/lessonBuilder/LessonFormattingContext';
import { LessonAuthoringToolbarContent, ToolDialog } from '@/components/editor/lessonBuilder/LessonAuthoringToolbar';
import {
  Plus, Copy, Trash2, Undo2, Redo2,
  Image as ImageIcon, Type, Heading1, List, Table, Code,
  LayoutTemplate, Grid3x3, Sparkles, Wand2, Download,
  Eye, Play, FileText, Wrench,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Columns2, Columns3, Square,
  Palette, Flag, CreditCard, Shapes, Minus, ArrowRight, Share2, Upload,
} from 'lucide-react';

/**
 * WorkspaceRibbon
 * ---------------
 * Compact, presentation-style ribbon. Phase-1 REPAIR build.
 *
 * Critical fix vs the previous build: this component now accepts the
 * EXACT prop names that PresentationWorkspace passes (onAddSlide,
 * onAddImage, onPreview, etc.). Previously it expected `actions={...}`
 * and silently rendered empty groups because every handler was
 * undefined.
 *
 * Each tab renders ONLY when at least one of its commands is wired.
 * Each command renders ONLY when its handler is wired. There are no
 * inert buttons, ever.
 */

function Btn({ icon: Icon, label, title, onClick, disabled, accent }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={[
        'inline-flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors',
        'h-[56px] min-w-[56px] px-2 text-[11px] font-medium leading-tight',
        accent
          ? 'text-indigo-700 hover:bg-indigo-50 ring-1 ring-transparent hover:ring-indigo-200'
          : 'text-slate-700 hover:bg-slate-100',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
      ].join(' ')}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function Group({ label, children }) {
  // Strip undefined children before counting.
  const kids = React.Children.toArray(children).filter(Boolean);
  if (kids.length === 0) return null;
  return (
    <div className="flex flex-col items-stretch shrink-0 px-1.5 border-r border-slate-200 last:border-r-0">
      <div className="flex items-center gap-0.5">
        {kids}
      </div>
      <div className="text-[10px] text-slate-400 text-center mt-0.5 truncate select-none uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

const TAB_DEFS = ['home', 'insert', 'design', 'arrange'];

export default function WorkspaceRibbon(props) {
  const formatting = useContext(LessonFormattingContext);
  const emptyEditor = useRef(null);
  const optionsDialog = useRef(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const closeOptions = () => { optionsDialog.current?.close(); setOptionsOpen(false); };
  const optionAction = action => () => { closeOptions(); action?.(); };
  const {
    activeTab = 'home',
    onTabChange,

    // Slide CRUD
    onAddSlide, onDuplicateSlide, onDeleteSlide,
    onUndo, canUndo, onRedo, canRedo,

    // Insert
    onAddImage, onAddText, onAddHeading, onAddList, onAddTable,
    onEditCode,
    onOpenTemplates, onOpenBlocks,
    onImportCanva, onImportFigma,

    // Format (inline rich-text commands — execCommand based)
    onBold, onItalic, onUnderline,
    onAlignLeft, onAlignCenter, onAlignRight,

    // Quick layouts
    onAddOneColumn, onAddTwoColumns, onAddThreeColumns,

    // AI
    onOpenAI, onRewriteWithAI,

    // Design library (per-category entry points)
    onOpenDesignBackgrounds, onOpenDesignBanners, onOpenDesignCards,
    onOpenDesignShapes, onOpenDesignLines, onOpenDesignArrows,
    onOpenDesignSocial, onImportDesignImage,

    // Review
    onPreview, onPresent, onExportPptx,

    // Inspector / notes toggles
    onToggleInspector, onToggleNotes,
    inspectorOpen, notesOpen,
  } = props;

  // Pre-compute which tabs have at least one wired action so we can
  // hide empty ones rather than render dead headings.
  const tabHasActions = {
    home:    !!(onAddSlide || onDuplicateSlide || onDeleteSlide || onUndo || onRedo || onPreview || onPresent || onExportPptx || onBold || onItalic || onAddTwoColumns),
    insert:  !!(onAddImage || onAddText || onAddHeading || onAddList || onAddTable || onEditCode || onOpenTemplates || onOpenBlocks || onImportCanva || onImportFigma || onOpenAI),
    design:  !!(onOpenTemplates || onAddImage || onPreview ||
                 onOpenDesignBackgrounds || onOpenDesignBanners || onOpenDesignCards ||
                 onOpenDesignShapes || onOpenDesignLines || onOpenDesignArrows ||
                 onOpenDesignSocial || onImportDesignImage),
    arrange: !!(onDuplicateSlide || onDeleteSlide || onUndo || onRedo),
  };
  const visibleTabs = TAB_DEFS.filter((t) => tabHasActions[t]);

  // If the currently selected tab has no actions (e.g. fresh draft
  // before any slide is added), default to the first visible tab.
  const tab = tabHasActions[activeTab] ? activeTab : (visibleTabs[0] || 'home');

  return (
    <div className="bg-white border-b border-slate-200 shrink-0 relative z-30" data-workspace-ribbon="true">
      {/* Tabs row */}
      <div className="flex items-center gap-0 px-3 pt-1 overflow-x-auto">
        {visibleTabs.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange?.(t)}
              className={[
                'text-[12px] font-medium px-3 py-1.5 rounded-t-md transition-colors shrink-0 capitalize',
                active
                  ? 'text-indigo-700 bg-slate-50 border border-slate-200 border-b-transparent -mb-px'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              {t}
            </button>
          );
        })}
        <div className="flex-1" />

        {/* Right-aligned toggles — Notes + Inspector. Always visible
            when wired so the workspace chrome is reachable in any tab. */}
        {onToggleNotes && (
          <button
            type="button"
            onClick={onToggleNotes}
            className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded shrink-0 ${notesOpen ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            title="Toggle speaker notes"
          >
            <FileText className="w-3.5 h-3.5" />
            Notes
          </button>
        )}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded shrink-0 ${inspectorOpen ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            title="Toggle slide inspector"
          >
            <Wrench className="w-3.5 h-3.5" />
            Inspector
          </button>
        )}
      </div>

      {/* Ribbon row — 76 px tall (56 button + 20 group label). */}
      <div
        className={`flex items-stretch px-2 py-1 bg-slate-50/60 border-t border-slate-100 ${tab === 'home' && formatting ? 'flex-wrap gap-y-1' : 'overflow-x-auto'}`}
        style={{ minHeight: 76 }}
        role="toolbar"
        aria-label={`${tab} ribbon`}
      >
        {tab === 'home' && formatting && <>
          <Group label="History">
            <Btn icon={Undo2} label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={canUndo === false}/>
            <Btn icon={Redo2} label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={canRedo === false}/>
          </Group>
          <LessonAuthoringToolbarContent key={formatting.activeEditor?.id || 'idle'} editableRef={formatting.activeEditor?.ref || emptyEditor} disabled={!formatting.activeEditor}/>
          <Group label="Lesson">
            <Btn icon={LayoutTemplate} label="More options" onClick={()=>setOptionsOpen(true)}/>
          </Group>
        </>}
        {tab === 'home' && !formatting && (
          <>
            <Group label="Clipboard">
              <Btn icon={Undo2} label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={canUndo === false} />
              <Btn icon={Redo2} label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={canRedo === false} />
            </Group>
            <Group label="Slide">
              <Btn icon={Plus} label="New" title="Add a new slide" onClick={onAddSlide} accent />
              <Btn icon={Copy} label="Duplicate" title="Duplicate current slide" onClick={onDuplicateSlide} />
              <Btn icon={Trash2} label="Delete" title="Delete current slide" onClick={onDeleteSlide} />
            </Group>
            <Group label="Format">
              <Btn icon={Bold} label="Bold" title="Bold (Ctrl+B)" onClick={onBold} />
              <Btn icon={Italic} label="Italic" title="Italic (Ctrl+I)" onClick={onItalic} />
              <Btn icon={Underline} label="Underline" title="Underline (Ctrl+U)" onClick={onUnderline} />
              <Btn icon={AlignLeft} label="Left" title="Align left" onClick={onAlignLeft} />
              <Btn icon={AlignCenter} label="Center" title="Align center" onClick={onAlignCenter} />
              <Btn icon={AlignRight} label="Right" title="Align right" onClick={onAlignRight} />
            </Group>
            <Group label="Layout">
              <Btn icon={Square} label="1 col" title="Insert single column" onClick={onAddOneColumn} />
              <Btn icon={Columns2} label="2 cols" title="Insert two columns" onClick={onAddTwoColumns} />
              <Btn icon={Columns3} label="3 cols" title="Insert three columns" onClick={onAddThreeColumns} />
              <Btn icon={LayoutTemplate} label="Templates" title="Slide templates" onClick={onOpenTemplates} />
              <Btn icon={Grid3x3} label="Blocks" title="Block templates" onClick={onOpenBlocks} />
            </Group>
            <Group label="Review">
              <Btn icon={Eye} label="Preview" title="Preview this slide" onClick={onPreview} />
              <Btn icon={Play} label="Present" title="Launch presenter" onClick={onPresent} accent />
              <Btn icon={Download} label="Export PPTX" title="Download as PowerPoint (.pptx)" onClick={onExportPptx} />
            </Group>
          </>
        )}

        {tab === 'insert' && (
          <>
            <Group label="Text">
              <Btn icon={Heading1} label="Heading" title="Insert heading" onClick={onAddHeading} />
              <Btn icon={Type} label="Text" title="Insert paragraph" onClick={onAddText} />
              <Btn icon={List} label="List" title="Insert bullet list" onClick={onAddList} />
            </Group>
            <Group label="Media">
              <Btn icon={ImageIcon} label="Image" title="Insert / replace image" onClick={onAddImage} />
              <Btn icon={Table} label="Table" title="Insert table" onClick={onAddTable} />
              <Btn icon={Code} label="Code" title="Edit code block" onClick={onEditCode} />
            </Group>
            <Group label="Templates">
              <Btn icon={LayoutTemplate} label="Templates" title="Slide templates" onClick={onOpenTemplates} />
              <Btn icon={Grid3x3} label="Blocks" title="Block templates" onClick={onOpenBlocks} />
            </Group>
            <Group label="Import">
              <Btn icon={Download} label="Canva" title="Import Canva design" onClick={onImportCanva} />
              <Btn icon={Download} label="Figma" title="Import Figma design" onClick={onImportFigma} />
            </Group>
            <Group label="AI">
              <Btn icon={Sparkles} label="Assist" title="AI assistant" onClick={onOpenAI} accent />
              <Btn icon={Wand2} label="Rewrite" title="Rewrite this slide" onClick={onRewriteWithAI} />
            </Group>
          </>
        )}

        {tab === 'design' && (
          <>
            <Group label="Theme">
              <Btn icon={Palette} label="Backgrounds" title="Slide background templates" onClick={onOpenDesignBackgrounds} accent />
              <Btn icon={LayoutTemplate} label="Templates" title="Apply a slide template" onClick={onOpenTemplates} />
            </Group>
            <Group label="Elements">
              <Btn icon={Flag} label="Banners" title="Banners and headers" onClick={onOpenDesignBanners} />
              <Btn icon={CreditCard} label="Cards" title="Coloured cards and callouts" onClick={onOpenDesignCards} />
              <Btn icon={Shapes} label="Shapes" title="Circles, squares, blobs and more" onClick={onOpenDesignShapes} />
            </Group>
            <Group label="Lines & Arrows">
              <Btn icon={Minus} label="Lines" title="Dividers and rules" onClick={onOpenDesignLines} />
              <Btn icon={ArrowRight} label="Arrows" title="Arrows and connectors" onClick={onOpenDesignArrows} />
            </Group>
            <Group label="Social">
              <Btn icon={Share2} label="Icons" title="Social media icons" onClick={onOpenDesignSocial} />
            </Group>
            <Group label="Media">
              <Btn icon={ImageIcon} label="Image" title="Insert image" onClick={onAddImage} />
              <Btn icon={Upload} label="Import" title="Import your own image or design" onClick={onImportDesignImage} />
            </Group>
            <Group label="Review">
              <Btn icon={Eye} label="Preview" title="Preview" onClick={onPreview} />
              <Btn icon={Play} label="Present" title="Launch presenter" onClick={onPresent} accent />
            </Group>
          </>
        )}

        {tab === 'arrange' && (
          <>
            <Group label="Order">
              <Btn icon={Copy} label="Duplicate" title="Duplicate slide" onClick={onDuplicateSlide} />
              <Btn icon={Trash2} label="Delete" title="Delete slide" onClick={onDeleteSlide} />
            </Group>
            <Group label="History">
              <Btn icon={Undo2} label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={canUndo === false} />
              <Btn icon={Redo2} label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={canRedo === false} />
            </Group>
          </>
        )}
      </div>
      {optionsOpen && <ToolDialog title="Slide, layout and preview options" onClose={closeOptions} dialogRef={optionsDialog}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div><h3 className="mb-2 text-sm font-semibold">Slide</h3><div className="flex flex-wrap"><Btn icon={Plus} label="New" onClick={onAddSlide && optionAction(onAddSlide)}/><Btn icon={Copy} label="Duplicate" onClick={onDuplicateSlide && optionAction(onDuplicateSlide)}/><Btn icon={Trash2} label="Delete" onClick={onDeleteSlide && optionAction(onDeleteSlide)}/></div></div>
          <div><h3 className="mb-2 text-sm font-semibold">Layout</h3><div className="flex flex-wrap"><Btn icon={Square} label="1 col" onClick={onAddOneColumn && optionAction(onAddOneColumn)}/><Btn icon={Columns2} label="2 cols" onClick={onAddTwoColumns && optionAction(onAddTwoColumns)}/><Btn icon={Columns3} label="3 cols" onClick={onAddThreeColumns && optionAction(onAddThreeColumns)}/><Btn icon={LayoutTemplate} label="Templates" onClick={onOpenTemplates && optionAction(onOpenTemplates)}/><Btn icon={Grid3x3} label="Blocks" onClick={onOpenBlocks && optionAction(onOpenBlocks)}/></div></div>
          <div><h3 className="mb-2 text-sm font-semibold">Preview and export</h3><div className="flex flex-wrap"><Btn icon={Eye} label="Preview" onClick={onPreview && optionAction(onPreview)}/><Btn icon={Play} label="Present" onClick={onPresent && optionAction(onPresent)}/><Btn icon={Download} label="Export PPTX" onClick={onExportPptx && optionAction(onExportPptx)}/></div></div>
        </div>
      </ToolDialog>}
    </div>
  );
}
