import React from 'react';
import {
  Plus, Copy, Trash2, Undo2, Redo2,
  Image as ImageIcon, Type, Heading1, List, Table, Code,
  LayoutTemplate, Grid3x3, Sparkles, Wand2, Download,
  Eye, Play, FileText, Wrench,
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

    // AI
    onOpenAI, onRewriteWithAI,

    // Review
    onPreview, onPresent,

    // Inspector / notes toggles
    onToggleInspector, onToggleNotes,
    inspectorOpen, notesOpen,
  } = props;

  // Pre-compute which tabs have at least one wired action so we can
  // hide empty ones rather than render dead headings.
  const tabHasActions = {
    home:    !!(onAddSlide || onDuplicateSlide || onDeleteSlide || onUndo || onRedo || onPreview || onPresent),
    insert:  !!(onAddImage || onAddText || onAddHeading || onAddList || onAddTable || onEditCode || onOpenTemplates || onOpenBlocks || onImportCanva || onImportFigma || onOpenAI),
    design:  !!(onOpenTemplates || onAddImage || onPreview),
    arrange: !!(onDuplicateSlide || onDeleteSlide || onUndo || onRedo),
  };
  const visibleTabs = TAB_DEFS.filter((t) => tabHasActions[t]);

  // If the currently selected tab has no actions (e.g. fresh draft
  // before any slide is added), default to the first visible tab.
  const tab = tabHasActions[activeTab] ? activeTab : (visibleTabs[0] || 'home');

  return (
    <div className="bg-white border-b border-slate-200 shrink-0">
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
        className="flex items-stretch px-2 py-1 overflow-x-auto bg-slate-50/60 border-t border-slate-100"
        style={{ minHeight: 76 }}
        role="toolbar"
        aria-label={`${tab} ribbon`}
      >
        {tab === 'home' && (
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
            <Group label="Layout">
              <Btn icon={LayoutTemplate} label="Templates" title="Slide templates" onClick={onOpenTemplates} />
              <Btn icon={Grid3x3} label="Blocks" title="Block templates" onClick={onOpenBlocks} />
            </Group>
            <Group label="Review">
              <Btn icon={Eye} label="Preview" title="Preview this slide" onClick={onPreview} />
              <Btn icon={Play} label="Present" title="Launch presenter" onClick={onPresent} accent />
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
              <Btn icon={LayoutTemplate} label="Templates" title="Apply a template" onClick={onOpenTemplates} />
            </Group>
            <Group label="Media">
              <Btn icon={ImageIcon} label="Image" title="Slide image" onClick={onAddImage} />
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
    </div>
  );
}