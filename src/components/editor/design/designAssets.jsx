// Curated palette of design assets used by the DesignLibraryDialog.
// Everything is pure data so the dialog stays lightweight and easy to test.
//
// Each asset has a `kind` so the dialog can decide whether to insert it
// as an image block (overlays, icons, banners, illustrations) or as
// raw HTML (lines, shapes, arrows, cards, divider templates).
//
// All URLs are inline SVG data URIs so the assets render instantly
// without any external request and remain editable through the normal
// ImageBlock controls (resize, alignment, alt text, etc.).

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const svg = (markup, w = 400, h = 200) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${markup}</svg>`
  )}`;

// ---------------------------------------------------------------
// Social media icons
// ---------------------------------------------------------------
const socialIcon = (label, bg, glyph) =>
  svg(
    `<rect width="120" height="120" rx="24" fill="${bg}"/>` +
      `<text x="60" y="78" font-family="Arial, sans-serif" font-size="56" font-weight="700" text-anchor="middle" fill="#fff">${glyph}</text>`,
    120,
    120
  );

export const SOCIAL_ICONS = [
  { id: 'soc-fb', name: 'Facebook', url: socialIcon('Facebook', '#1877F2', 'f') },
  { id: 'soc-ig', name: 'Instagram', url: socialIcon('Instagram', '#E1306C', '◎') },
  { id: 'soc-tw', name: 'X / Twitter', url: socialIcon('Twitter', '#000000', '𝕏') },
  { id: 'soc-yt', name: 'YouTube', url: socialIcon('YouTube', '#FF0000', '▶') },
  { id: 'soc-li', name: 'LinkedIn', url: socialIcon('LinkedIn', '#0A66C2', 'in') },
  { id: 'soc-tt', name: 'TikTok', url: socialIcon('TikTok', '#000000', '♪') },
  { id: 'soc-wa', name: 'WhatsApp', url: socialIcon('WhatsApp', '#25D366', '✆') },
  { id: 'soc-em', name: 'Email', url: socialIcon('Email', '#475569', '✉') },
];

// ---------------------------------------------------------------
// Banners (full-width images)
// ---------------------------------------------------------------
const banner = (markup) => svg(markup, 1200, 240);

export const BANNERS = [
  {
    id: 'banner-sunrise',
    name: 'Sunrise gradient',
    url: banner(
      `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs>` +
        `<rect width="1200" height="240" fill="url(#g)"/>` +
        `<text x="600" y="135" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" text-anchor="middle" fill="#fff">Section title</text>`
    ),
  },
  {
    id: 'banner-ocean',
    name: 'Ocean gradient',
    url: banner(
      `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>` +
        `<rect width="1200" height="240" fill="url(#g)"/>` +
        `<text x="600" y="135" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" text-anchor="middle" fill="#fff">Section title</text>`
    ),
  },
  {
    id: 'banner-forest',
    name: 'Forest gradient',
    url: banner(
      `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>` +
        `<rect width="1200" height="240" fill="url(#g)"/>` +
        `<text x="600" y="135" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" text-anchor="middle" fill="#fff">Section title</text>`
    ),
  },
  {
    id: 'banner-mono',
    name: 'Monochrome',
    url: banner(
      `<rect width="1200" height="240" fill="#0f172a"/>` +
        `<text x="600" y="135" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" text-anchor="middle" fill="#fff">Section title</text>`
    ),
  },
];

// ---------------------------------------------------------------
// Shapes (inserted as images so they can be resized / aligned)
// ---------------------------------------------------------------
const shape = (markup) => svg(markup, 200, 200);

export const SHAPES = [
  { id: 'shape-circle', name: 'Circle', url: shape(`<circle cx="100" cy="100" r="80" fill="#6366f1"/>`) },
  { id: 'shape-square', name: 'Square', url: shape(`<rect x="20" y="20" width="160" height="160" rx="8" fill="#0ea5e9"/>`) },
  { id: 'shape-rounded', name: 'Rounded', url: shape(`<rect x="10" y="40" width="180" height="120" rx="40" fill="#f59e0b"/>`) },
  { id: 'shape-triangle', name: 'Triangle', url: shape(`<polygon points="100,20 180,180 20,180" fill="#10b981"/>`) },
  { id: 'shape-star', name: 'Star', url: shape(`<polygon points="100,15 122,78 190,78 135,118 156,182 100,142 44,182 65,118 10,78 78,78" fill="#ef4444"/>`) },
  { id: 'shape-hex', name: 'Hexagon', url: shape(`<polygon points="100,15 173,57 173,143 100,185 27,143 27,57" fill="#8b5cf6"/>`) },
  { id: 'shape-blob', name: 'Blob', url: shape(`<path d="M 60 20 C 130 0 200 60 170 130 C 150 195 60 200 30 140 C -10 80 10 35 60 20 Z" fill="#ec4899"/>`) },
  { id: 'shape-ring', name: 'Ring', url: shape(`<circle cx="100" cy="100" r="80" fill="none" stroke="#0f172a" stroke-width="16"/>`) },
];

// ---------------------------------------------------------------
// Lines & arrows (HTML so they sit inline at any width)
// ---------------------------------------------------------------
export const LINES = [
  {
    id: 'line-solid',
    name: 'Solid line',
    html: '<hr style="border:0;border-top:2px solid #0f172a;margin:1rem 0;" />',
  },
  {
    id: 'line-dashed',
    name: 'Dashed line',
    html: '<hr style="border:0;border-top:2px dashed #475569;margin:1rem 0;" />',
  },
  {
    id: 'line-dotted',
    name: 'Dotted line',
    html: '<hr style="border:0;border-top:3px dotted #94a3b8;margin:1rem 0;" />',
  },
  {
    id: 'line-thick',
    name: 'Thick line',
    html: '<hr style="border:0;border-top:6px solid #6366f1;border-radius:3px;margin:1.5rem 0;" />',
  },
  {
    id: 'line-double',
    name: 'Double line',
    html: '<hr style="border:0;border-top:1px solid #0f172a;border-bottom:1px solid #0f172a;height:5px;margin:1rem 0;" />',
  },
  {
    id: 'line-gradient',
    name: 'Gradient line',
    html: '<div style="height:3px;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:2px;margin:1rem 0;"></div>',
  },
];

const arrow = (markup) => svg(markup, 240, 80);

export const ARROWS = [
  { id: 'arrow-right', name: 'Arrow right', url: arrow(`<path d="M 20 40 L 200 40 M 180 20 L 220 40 L 180 60" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: 'arrow-left', name: 'Arrow left', url: arrow(`<path d="M 220 40 L 40 40 M 60 20 L 20 40 L 60 60" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: 'arrow-curve', name: 'Curved arrow', url: arrow(`<path d="M 20 60 Q 120 -20 210 50 M 190 30 L 215 55 L 190 70" stroke="#6366f1" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: 'arrow-double', name: 'Double arrow', url: arrow(`<path d="M 30 40 L 210 40 M 50 20 L 20 40 L 50 60 M 190 20 L 220 40 L 190 60" stroke="#ef4444" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
];

// ---------------------------------------------------------------
// Card colour swatches — HTML callouts the tutor can drop and edit.
// ---------------------------------------------------------------
const card = (bg, border, fg, label) =>
  `<div style="background:${bg};border:1px solid ${border};color:${fg};border-radius:12px;padding:1.25rem 1.5rem;margin:0.75rem 0;">` +
    `<strong style="display:block;margin-bottom:0.25rem;font-size:1.05rem;">${label}</strong>` +
    '<span>Click to edit. Add the message, key idea, or call to action you want learners to focus on.</span>' +
  '</div>';

export const CARDS = [
  { id: 'card-indigo', name: 'Indigo card', html: card('#eef2ff', '#c7d2fe', '#1e1b4b', 'Indigo card') },
  { id: 'card-sky', name: 'Sky card', html: card('#e0f2fe', '#bae6fd', '#0c4a6e', 'Sky card') },
  { id: 'card-emerald', name: 'Emerald card', html: card('#ecfdf5', '#a7f3d0', '#064e3b', 'Emerald card') },
  { id: 'card-amber', name: 'Amber card', html: card('#fffbeb', '#fde68a', '#78350f', 'Amber card') },
  { id: 'card-rose', name: 'Rose card', html: card('#fff1f2', '#fecdd3', '#881337', 'Rose card') },
  { id: 'card-slate', name: 'Slate card', html: card('#f8fafc', '#e2e8f0', '#0f172a', 'Slate card') },
  { id: 'card-violet', name: 'Violet card', html: card('#f5f3ff', '#ddd6fe', '#3b0764', 'Violet card') },
  { id: 'card-dark', name: 'Dark card', html: card('#0f172a', '#1e293b', '#f8fafc', 'Dark card') },
];

// ---------------------------------------------------------------
// Background templates — full-bleed slide backgrounds.
// Applied to the slide directly (separate API), not inserted as a block.
// ---------------------------------------------------------------
export const BACKGROUNDS = [
  { id: 'bg-white', name: 'White', value: '#ffffff', preview: '#ffffff' },
  { id: 'bg-cream', name: 'Cream', value: '#fef3c7', preview: '#fef3c7' },
  { id: 'bg-slate', name: 'Slate', value: '#0f172a', preview: '#0f172a' },
  { id: 'bg-indigo', name: 'Indigo', value: 'linear-gradient(135deg,#312e81,#6366f1)', preview: 'linear-gradient(135deg,#312e81,#6366f1)' },
  { id: 'bg-sunset', name: 'Sunset', value: 'linear-gradient(135deg,#f97316,#db2777)', preview: 'linear-gradient(135deg,#f97316,#db2777)' },
  { id: 'bg-ocean', name: 'Ocean', value: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', preview: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' },
  { id: 'bg-forest', name: 'Forest', value: 'linear-gradient(135deg,#065f46,#10b981)', preview: 'linear-gradient(135deg,#065f46,#10b981)' },
  { id: 'bg-paper', name: 'Paper', value: '#f8fafc', preview: '#f8fafc' },
];

// ---------------------------------------------------------------
// Tab definitions — drives the dialog's sidebar.
// ---------------------------------------------------------------
export const DESIGN_TABS = [
  { id: 'backgrounds', label: 'Backgrounds', items: BACKGROUNDS, kind: 'background' },
  { id: 'banners', label: 'Banners', items: BANNERS, kind: 'image' },
  { id: 'cards', label: 'Card styles', items: CARDS, kind: 'html' },
  { id: 'shapes', label: 'Shapes', items: SHAPES, kind: 'image' },
  { id: 'lines', label: 'Lines', items: LINES, kind: 'html' },
  { id: 'arrows', label: 'Arrows', items: ARROWS, kind: 'image' },
  { id: 'social', label: 'Social icons', items: SOCIAL_ICONS, kind: 'image' },
];