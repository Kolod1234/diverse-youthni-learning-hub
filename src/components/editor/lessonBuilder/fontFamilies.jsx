// Shared font family configuration for the Visual Lesson Builder.
//
// Single source of truth used by:
//   - InlineToolbar's Font family picker (writes font-family inline)
//   - FontFamilyPicker (searchable, grouped UI)
//   - injectFontStylesheet() — adds @import for the Google web fonts used so
//     the family selected in the editor renders consistently in the
//     contenteditable, the PreviewModal, the LessonPlayer, and presentation.
//
// Design rules:
//   - System fonts use a system stack only (no @import) so Windows/macOS
//     mismatches degrade gracefully to the actual installed family.
//   - Web fonts use a `webFont` flag → injectFontStylesheet emits a single
//     Google Fonts @import with all required families.
//   - `value` (the CSS font-family stack) is what gets written into
//     style="font-family:…" and round-trips through the serializer's
//     sanitiseInline() (font-family is already in ALLOWED_CSS).
//   - sanitiseFontFamily() guards against arbitrary values (e.g. tampered
//     paste) — only stacks we ship are accepted.

export const FONT_FAMILIES = [
  // Reset
  { label: 'Default', value: '', category: 'Reset' },

  // ── Sans ────────────────────────────────────────────────────────────────
  { label: 'Arial',                 category: 'Sans',  value: 'Arial, Helvetica, sans-serif' },
  { label: 'Arial Black',           category: 'Sans',  value: '"Arial Black", Arial, sans-serif' },
  { label: 'Arial Narrow',          category: 'Sans',  value: '"Arial Narrow", Arial, sans-serif' },
  { label: 'Calibri',               category: 'Sans',  value: 'Calibri, "Segoe UI", Tahoma, sans-serif' },
  { label: 'Candara',               category: 'Sans',  value: 'Candara, "Segoe UI", Tahoma, sans-serif' },
  { label: 'Century Gothic',        category: 'Sans',  value: '"Century Gothic", "Apple Gothic", sans-serif' },
  { label: 'Franklin Gothic Medium',category: 'Sans',  value: '"Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif' },
  { label: 'Gill Sans',             category: 'Sans',  value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'Helvetica',             category: 'Sans',  value: 'Helvetica, Arial, sans-serif' },
  { label: 'Segoe UI',              category: 'Sans',  value: '"Segoe UI", Tahoma, Geneva, sans-serif' },
  { label: 'Tahoma',                category: 'Sans',  value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS',          category: 'Sans',  value: '"Trebuchet MS", Tahoma, sans-serif' },
  { label: 'Verdana',               category: 'Sans',  value: 'Verdana, Geneva, sans-serif' },
  { label: 'Roboto',                category: 'Sans',  value: '"Roboto", system-ui, sans-serif', webFont: 'Roboto:wght@300;400;500;700' },
  { label: 'Open Sans',             category: 'Sans',  value: '"Open Sans", system-ui, sans-serif', webFont: 'Open+Sans:wght@400;600;700' },
  { label: 'Lato',                  category: 'Sans',  value: '"Lato", system-ui, sans-serif', webFont: 'Lato:wght@400;700' },
  { label: 'Montserrat',            category: 'Sans',  value: '"Montserrat", system-ui, sans-serif', webFont: 'Montserrat:wght@400;600;700' },
  { label: 'Poppins',               category: 'Sans',  value: '"Poppins", system-ui, sans-serif', webFont: 'Poppins:wght@400;600;700' },
  { label: 'Nunito',                category: 'Sans',  value: '"Nunito", system-ui, sans-serif', webFont: 'Nunito:wght@400;600;700' },
  { label: 'Raleway',               category: 'Sans',  value: '"Raleway", system-ui, sans-serif', webFont: 'Raleway:wght@400;600;700' },

  // ── Serif ───────────────────────────────────────────────────────────────
  { label: 'Times New Roman',       category: 'Serif', value: '"Times New Roman", Times, serif' },
  { label: 'Times',                 category: 'Serif', value: 'Times, "Times New Roman", serif' },
  { label: 'Georgia',               category: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Garamond',              category: 'Serif', value: 'Garamond, "Times New Roman", serif' },
  { label: 'Cambria',               category: 'Serif', value: 'Cambria, Georgia, serif' },
  { label: 'Constantia',            category: 'Serif', value: 'Constantia, Georgia, serif' },
  { label: 'Baskerville',           category: 'Serif', value: 'Baskerville, "Baskerville Old Face", Georgia, serif' },
  { label: 'Book Antiqua',          category: 'Serif', value: '"Book Antiqua", "Palatino Linotype", Palatino, serif' },
  { label: 'Palatino Linotype',     category: 'Serif', value: '"Palatino Linotype", Palatino, "Book Antiqua", serif' },
  { label: 'Merriweather',          category: 'Serif', value: '"Merriweather", Georgia, serif', webFont: 'Merriweather:wght@400;700' },
  { label: 'Playfair Display',      category: 'Serif', value: '"Playfair Display", Georgia, serif', webFont: 'Playfair+Display:wght@400;700' },
  { label: 'Libre Baskerville',     category: 'Serif', value: '"Libre Baskerville", Baskerville, Georgia, serif', webFont: 'Libre+Baskerville:wght@400;700' },
  { label: 'Lora',                  category: 'Serif', value: '"Lora", Georgia, serif', webFont: 'Lora:wght@400;600;700' },

  // ── Display / Gothic ────────────────────────────────────────────────────
  { label: 'Impact',                category: 'Display', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Rockwell',              category: 'Display', value: 'Rockwell, "Courier Bold", Georgia, serif' },
  { label: 'Copperplate',           category: 'Display', value: 'Copperplate, "Copperplate Gothic Light", serif' },
  { label: 'Cinzel',                category: 'Display', value: '"Cinzel", Georgia, serif', webFont: 'Cinzel:wght@400;600;700' },
  { label: 'Bebas Neue',            category: 'Display', value: '"Bebas Neue", Impact, sans-serif', webFont: 'Bebas+Neue' },
  { label: 'Oswald',                category: 'Display', value: '"Oswald", Impact, sans-serif', webFont: 'Oswald:wght@400;600;700' },

  // ── Handwriting ─────────────────────────────────────────────────────────
  { label: 'Comic Sans MS',         category: 'Handwriting', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: 'Brush Script MT',       category: 'Handwriting', value: '"Brush Script MT", "Brush Script Std", cursive' },
  { label: 'Dancing Script',        category: 'Handwriting', value: '"Dancing Script", "Brush Script MT", cursive', webFont: 'Dancing+Script:wght@400;600;700' },
  { label: 'Pacifico',              category: 'Handwriting', value: '"Pacifico", "Brush Script MT", cursive', webFont: 'Pacifico' },

  // ── Monospace ───────────────────────────────────────────────────────────
  { label: 'Courier New',           category: 'Monospace', value: '"Courier New", Courier, monospace' },
  { label: 'Consolas',              category: 'Monospace', value: 'Consolas, "Courier New", monospace' },
  { label: 'Lucida Console',        category: 'Monospace', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Source Code Pro',       category: 'Monospace', value: '"Source Code Pro", Consolas, "Courier New", monospace', webFont: 'Source+Code+Pro:wght@400;600;700' },
];

// Stable list of allowed family stacks for the sanitiser. We compare on the
// trimmed/lower-cased value so saved HTML matches what the picker emits.
const ALLOWED_STACKS = new Set(
  FONT_FAMILIES.map(f => (f.value || '').trim().toLowerCase()).filter(Boolean)
);

// Return the original family stack if it matches one of our shipped options.
// Anything else returns '' so the editor falls back to the inherited family.
// Called from the serializer/sanitiseStyle path to keep saved slides safe.
export function sanitiseFontFamily(value) {
  if (!value) return '';
  const v = String(value).trim().toLowerCase();
  if (ALLOWED_STACKS.has(v)) {
    // Return the canonical (cased) value from FONT_FAMILIES for stability.
    const match = FONT_FAMILIES.find(f => (f.value || '').trim().toLowerCase() === v);
    return match ? match.value : '';
  }
  return '';
}

// Group the FONT_FAMILIES list by category (preserves insertion order).
export function groupedFontFamilies() {
  const groups = new Map();
  for (const f of FONT_FAMILIES) {
    const key = f.category || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  return Array.from(groups, ([category, fonts]) => ({ category, fonts }));
}

// Build the Google Fonts @import URL for every webFont in our list.
// We emit ONE combined URL so the network cost is a single request.
let injected = false;
export function injectFontStylesheet() {
  if (typeof document === 'undefined') return;
  if (injected) return;
  const families = FONT_FAMILIES
    .map(f => f.webFont)
    .filter(Boolean);
  if (!families.length) { injected = true; return; }
  const href = `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`;
  // Skip if some other code already injected the same link.
  if (document.querySelector(`link[data-lb-fonts="1"]`)) { injected = true; return; }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-lb-fonts', '1');
  document.head.appendChild(link);
  injected = true;
}