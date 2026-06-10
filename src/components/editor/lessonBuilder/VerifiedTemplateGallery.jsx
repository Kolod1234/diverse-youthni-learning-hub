import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutTemplate, ChevronDown, ChevronUp } from 'lucide-react';

// VerifiedTemplateGallery
// ----------------------------------------------------------------------------
// Compact, collapsible gallery rendered BELOW the Visual Lesson Builder on a
// slide that already has content. Only used in SlideEditor — kept as a small
// dedicated component because the surrounding SlideEditor file is already
// very large and this UI is fully self-contained.
//
// Behaviour:
//   - Auto-collapses once `hasContent` is true (so it doesn't visually
//     compete with the active slide preview). The tutor can still toggle it
//     open whenever they want to swap the slide for a template.
//   - Manual toggle preserves the tutor's explicit choice for the rest of
//     the session — auto-collapse only happens the FIRST time content
//     appears (we don't fight the user's intent).
//   - Disclosure state is EPHEMERAL. We never write it into slide data.
//
// Templates are the verified set from SlideEditor (blank/title/content/
// bullets/steps/quote). The parent (SlideEditor) is the source of truth for
// that set — we just render whatever map it passes in.
export default function VerifiedTemplateGallery({ templates, hasContent, onApply }) {
  // Start open on empty slides, closed on slides with content.
  const [open, setOpen] = useState(!hasContent);
  // Track whether the user has explicitly toggled — if so, we leave their
  // choice alone instead of auto-collapsing.
  const [userTouched, setUserTouched] = useState(false);

  useEffect(() => {
    if (userTouched) return;
    setOpen(!hasContent);
  }, [hasContent, userTouched]);

  const handleToggle = () => {
    setUserTouched(true);
    setOpen((o) => !o);
  };

  const entries = Object.entries(templates || {});

  return (
    <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="verified-template-gallery-panel"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
      >
        <span className="flex items-center gap-2 min-w-0">
          <LayoutTemplate className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-sm font-semibold text-indigo-900 truncate">
            Apply a template
          </span>
          <span className="text-xs text-indigo-700/80 hidden sm:inline">
            ({entries.length} verified)
          </span>
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-indigo-700 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-indigo-700 shrink-0" />
        )}
      </button>

      {open && (
        <div
          id="verified-template-gallery-panel"
          className="px-4 pb-4 pt-1"
        >
          <p className="text-xs text-indigo-700/80 mb-3">
            These templates apply as editable blocks. Applying one replaces the current slide's content.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {entries.map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => onApply(template.content, template.name)}
                className="h-20 bg-white hover:bg-indigo-50 hover:border-indigo-400 flex-col gap-1 p-2"
              >
                <span className="text-2xl">{template.icon}</span>
                <span className="text-[11px] font-medium text-center leading-tight text-gray-700">
                  {template.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}