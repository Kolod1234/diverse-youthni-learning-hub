import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Undo2, Redo2, Copy, Trash2,
  Plus, LayoutTemplate, Image as ImageIcon, Code, Sparkles,
  Type, Palette, Grid3x3, Download, Wand2,
  Eye, ChevronDown,
} from 'lucide-react';

/**
 * WorkspaceRibbon
 * ---------------
 * A compact, presentation-style ribbon for the LessonEditor workspace.
 *
 * RULES (per Phase 1 spec):
 *  - Every control wires to an EXISTING action handler the parent already
 *    has implemented. No inert controls. No new business logic introduced.
 *  - Tabs: Home / Insert / Design / Arrange. Groups within each tab are
 *    labelled and dividers separate them.
 *  - Horizontally scrollable on small screens; collapsed to one row.
 *  - Tooltips via title=; aria-labels on icon-only buttons; focus rings via
 *    shadcn Button.
 *
 * Props: a single `actions` map of handler functions — all optional. A button
 * whose action is undefined is hidden (never disabled with no effect).
 */
const TABS = [
  { id: 'home',    label: 'Home' },
  { id: 'insert',  label: 'Insert' },
  { id: 'design',  label: 'Design' },
  { id: 'arrange', label: 'Arrange' },
];

function Group({ label, children }) {
  return (
    <div className="flex flex-col items-stretch shrink-0">
      <div className="flex items-center gap-0.5 px-1.5">
        {children}
      </div>
      <div className="text-[10px] text-slate-400 text-center mt-0.5 truncate px-1 select-none uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-slate-200 mx-1 my-1" aria-hidden="true" />;
}

function RibbonBtn({ icon: Icon, label, title, onClick, disabled, accent = false, compact = true }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={[
        'inline-flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors',
        compact ? 'h-8 px-2' : 'h-9 px-2.5',
        accent
          ? 'text-indigo-700 hover:bg-indigo-50'
          : 'text-slate-700 hover:bg-slate-100',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
      ].join(' ')}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="hidden md:inline whitespace-nowrap">{label}</span>
    </button>
  );
}

export default function WorkspaceRibbon({
  activeTab = 'home',
  onTabChange,
  collapsed = false,
  onToggleCollapsed,
  actions = {},
}) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[52px] z-10">
      {/* Tabs row */}
      <div className="flex items-center gap-1 px-3 pt-1.5 overflow-x-auto">
        {TABS.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange?.(t.id)}
              className={[
                'text-xs font-medium px-3 py-1.5 rounded-t-md transition-colors shrink-0',
                active
                  ? 'text-indigo-700 bg-slate-50 border border-slate-200 border-b-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              {t.label}
            </button>
          );
        })}
        <div className="flex-1" />
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 px-2 py-1 rounded shrink-0"
            aria-expanded={!collapsed}
            aria-controls="workspace-ribbon-row"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>

      {/* Ribbon row */}
      {!collapsed && (
        <div
          id="workspace-ribbon-row"
          className="flex items-stretch gap-0 px-2 pb-1.5 pt-1 overflow-x-auto border-t border-slate-100 bg-slate-50/60"
        >
          {activeTab === 'home' && (
            <>
              <Group label="Clipboard">
                <RibbonBtn icon={Undo2} label="Undo" title="Undo (Ctrl+Z)" onClick={actions.undo} disabled={actions.canUndo === false} />
                <RibbonBtn icon={Redo2} label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={actions.redo} disabled={actions.canRedo === false} />
              </Group>
              <Divider />
              <Group label="Slide">
                <RibbonBtn icon={Plus} label="Add" title="Add a new slide" onClick={actions.addSlide} accent />
                <RibbonBtn icon={Copy} label="Duplicate" title="Duplicate current slide" onClick={actions.duplicateSlide} />
                <RibbonBtn icon={Trash2} label="Delete" title="Delete current slide" onClick={actions.deleteSlide} />
              </Group>
              <Divider />
              <Group label="Layout">
                <RibbonBtn icon={LayoutTemplate} label="Templates" title="Choose a layout / template" onClick={actions.openTemplates} />
                <RibbonBtn icon={Grid3x3} label="Blocks" title="Insert a block template" onClick={actions.openBlocks} />
              </Group>
              <Divider />
              <Group label="Review">
                <RibbonBtn icon={Eye} label="Preview" title="Preview the lesson" onClick={actions.openPreview} accent />
              </Group>
            </>
          )}

          {activeTab === 'insert' && (
            <>
              <Group label="Media">
                <RibbonBtn icon={ImageIcon} label="Image" title="Insert / replace an image" onClick={actions.openImageManager} />
                <RibbonBtn icon={Type} label="Text" title="Edit slide text" onClick={actions.openTextEditor} />
                <RibbonBtn icon={Code} label="Code" title="Edit a code block" onClick={actions.openCodeEditor} />
              </Group>
              <Divider />
              <Group label="Templates">
                <RibbonBtn icon={LayoutTemplate} label="Templates" title="Slide templates" onClick={actions.openTemplates} />
                <RibbonBtn icon={Grid3x3} label="Blocks" title="Block templates" onClick={actions.openBlocks} />
              </Group>
              <Divider />
              <Group label="Import">
                <RibbonBtn icon={Download} label="Canva" title="Import from Canva" onClick={actions.openCanva} />
                <RibbonBtn icon={Download} label="Figma" title="Import from Figma" onClick={actions.openFigma} />
              </Group>
              <Divider />
              <Group label="AI">
                <RibbonBtn icon={Sparkles} label="AI" title="AI assistant" onClick={actions.openAI} accent />
                <RibbonBtn icon={Wand2} label="Rewrite" title="Rewrite this slide" onClick={actions.openAIRewrite} />
              </Group>
            </>
          )}

          {activeTab === 'design' && (
            <>
              <Group label="Theme">
                <RibbonBtn icon={Palette} label="Templates" title="Apply a verified template" onClick={actions.openTemplates} />
              </Group>
              <Divider />
              <Group label="Media">
                <RibbonBtn icon={ImageIcon} label="Image" title="Add or replace the slide image" onClick={actions.openImageManager} />
              </Group>
              <Divider />
              <Group label="Review">
                <RibbonBtn icon={Eye} label="Preview" title="Preview" onClick={actions.openPreview} accent />
              </Group>
            </>
          )}

          {activeTab === 'arrange' && (
            <>
              <Group label="Order">
                <RibbonBtn icon={Copy} label="Duplicate" title="Duplicate slide" onClick={actions.duplicateSlide} />
                <RibbonBtn icon={Trash2} label="Delete" title="Delete slide" onClick={actions.deleteSlide} />
              </Group>
              <Divider />
              <Group label="History">
                <RibbonBtn icon={Undo2} label="Undo" title="Undo (Ctrl+Z)" onClick={actions.undo} disabled={actions.canUndo === false} />
                <RibbonBtn icon={Redo2} label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={actions.redo} disabled={actions.canRedo === false} />
              </Group>
            </>
          )}
        </div>
      )}
    </div>
  );
}