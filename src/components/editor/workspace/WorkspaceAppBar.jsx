import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft, Loader2, Save, Play, Settings2, MoreVertical, Sparkles,
} from 'lucide-react';

/**
 * WorkspaceAppBar
 * ----------------
 * Compact top app bar for the presentation-style workspace.
 *
 * Renders the SAME actions as the previous LessonEditor header (Back, title,
 * save status, Lesson settings, Present, Save) but in a tight 48px row that
 * sits above the ribbon — matching the reference proportion where the bar
 * does not dominate vertical space.
 *
 * No business logic — purely a presentational wrapper around handlers given
 * by the LessonEditor page. Save/Settings/Present semantics are unchanged.
 */
export default function WorkspaceAppBar({
  title,
  subtitle,
  saveLabel,
  saveDisabled,
  saving,
  onBack,
  onSettings,
  onPresent,
  presentDisabled,
  onSave,
  saveErrorId,
}) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex items-center gap-2 sm:gap-3 h-12 px-2 sm:px-4 bg-white border-b border-slate-200"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="shrink-0 text-slate-600 hover:text-slate-900 h-8 px-2"
      >
        <ArrowLeft className="w-4 h-4 sm:mr-1.5" />
        <span className="hidden sm:inline text-xs">Back</span>
      </Button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 truncate leading-tight">
          {title || 'Untitled lesson'}
        </div>
        {subtitle && (
          <div className="text-[11px] text-slate-500 truncate leading-tight">{subtitle}</div>
        )}
      </div>

      {/* Desktop / tablet inline actions */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          className="h-8 text-xs"
          title="Lesson settings"
        >
          <Settings2 className="w-3.5 h-3.5 mr-1.5" />
          Lesson settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPresent}
          disabled={presentDisabled}
          className="h-8 text-xs"
          title={presentDisabled ? 'Add slides to present' : 'Launch presenter'}
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Present
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saveDisabled}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
          aria-describedby={saveErrorId}
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saveLabel || 'Save lesson'}
            </>
          )}
        </Button>
      </div>

      {/* Mobile — compact Save + overflow */}
      <div className="flex sm:hidden items-center gap-1 shrink-0">
        <Button
          size="sm"
          onClick={onSave}
          disabled={saveDisabled}
          className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700"
          aria-label="Save lesson"
          aria-describedby={saveErrorId}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2" aria-label="More actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onSettings}>
              <Settings2 className="w-4 h-4 mr-2" />
              Lesson settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPresent} disabled={presentDisabled}>
              <Play className="w-4 h-4 mr-2" />
              Present
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}