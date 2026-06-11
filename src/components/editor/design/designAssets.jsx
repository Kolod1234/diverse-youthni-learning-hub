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
// React-icons imports (must live at the top of the module).
// ---------------------------------------------------------------
// Social brand icons (Simple Icons + Font Awesome + Material).
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiTiktok,
  SiWhatsapp,
  SiPinterest,
  SiSnapchat,
  SiReddit,
  SiDiscord,
  SiTelegram,
  SiGithub,
} from 'react-icons/si';
import {
  FaLinkedinIn,
  FaRegCircle,
  FaRegSquare,
  FaLongArrowAltRight,
  FaLongArrowAltLeft,
  FaArrowsAltH,
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import {
  BsCircleFill,
  BsSquareFill,
  BsTriangleFill,
  BsStarFill,
  BsHexagonFill,
  BsPentagonFill,
  BsOctagonFill,
  BsDiamondFill,
  BsHeartFill,
  BsCloudFill,
  BsLightningChargeFill,
  BsArrowRight,
  BsArrowLeft,
  BsArrowUp,
  BsArrowDown,
  BsArrowUpRight,
  BsArrowDownRight,
  BsArrowReturnRight,
  BsArrowRepeat,
} from 'react-icons/bs';
import { TbArrowCurveRight, TbArrowWaveRightUp } from 'react-icons/tb';

// React-icons exposes each icon as a React component whose first child is
// the raw SVG <path>. Extract those paths (respecting the icon's own
// viewBox) so we can wrap them in our own branded rounded-square tile.
const extractIcon = (IconComponent, color = '#fff') => {
  const rendered = IconComponent({});
  const viewBox = rendered.props?.attr?.viewBox || '0 0 24 24';
  const node = rendered.props.children;
  const children = Array.isArray(node) ? node : [node];
  const paths = children
    .map((child) => {
      if (!child || !child.props) return '';
      const { d, fill, fillRule, clipRule } = child.props;
      if (!d) return '';
      // Skip transparent placeholder paths (Material icons include one).
      if (fill === 'none') return '';
      const attrs = [`d="${d}"`];
      if (fillRule) attrs.push(`fill-rule="${fillRule}"`);
      if (clipRule) attrs.push(`clip-rule="${clipRule}"`);
      return `<path ${attrs.join(' ')} fill="${color}"/>`;
    })
    .join('');
  return { viewBox, paths };
};

const brandIcon = (IconComponent, bg) => {
  const { viewBox, paths } = extractIcon(IconComponent, '#fff');
  // Render a nested SVG so the icon's native viewBox is honoured and it
  // is centred at ~64px inside the 120px branded tile.
  return svg(
    `<rect width="120" height="120" rx="24" fill="${bg}"/>` +
      `<svg x="28" y="28" width="64" height="64" viewBox="${viewBox}">${paths}</svg>`,
    120,
    120
  );
};

export const SOCIAL_ICONS = [
  { id: 'soc-fb', name: 'Facebook', url: brandIcon(SiFacebook, '#1877F2') },
  { id: 'soc-ig', name: 'Instagram', url: brandIcon(SiInstagram, '#E4405F') },
  { id: 'soc-x', name: 'X / Twitter', url: brandIcon(SiX, '#000000') },
  { id: 'soc-yt', name: 'YouTube', url: brandIcon(SiYoutube, '#FF0000') },
  { id: 'soc-li', name: 'LinkedIn', url: brandIcon(FaLinkedinIn, '#0A66C2') },
  { id: 'soc-tt', name: 'TikTok', url: brandIcon(SiTiktok, '#000000') },
  { id: 'soc-wa', name: 'WhatsApp', url: brandIcon(SiWhatsapp, '#25D366') },
  { id: 'soc-tg', name: 'Telegram', url: brandIcon(SiTelegram, '#26A5E4') },
  { id: 'soc-pin', name: 'Pinterest', url: brandIcon(SiPinterest, '#BD081C') },
  { id: 'soc-sc', name: 'Snapchat', url: brandIcon(SiSnapchat, '#FFFC00') },
  { id: 'soc-rd', name: 'Reddit', url: brandIcon(SiReddit, '#FF4500') },
  { id: 'soc-dc', name: 'Discord', url: brandIcon(SiDiscord, '#5865F2') },
  { id: 'soc-gh', name: 'GitHub', url: brandIcon(SiGithub, '#181717') },
  { id: 'soc-em', name: 'Email', url: brandIcon(MdEmail, '#475569') },
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
// Shapes — real React icons (Bootstrap Icons + Font Awesome solids)
// ---------------------------------------------------------------
// Wraps each icon in a coloured tile so it slots into the existing
// image-block pipeline at 200×200px.
const iconAsset = (IconComponent, color, size = 160, tile = 200) => {
  const { viewBox, paths } = extractIcon(IconComponent, color);
  const offset = (tile - size) / 2;
  return svg(
    `<svg x="${offset}" y="${offset}" width="${size}" height="${size}" viewBox="${viewBox}">${paths}</svg>`,
    tile,
    tile
  );
};

// Shapes — each item carries a `shape` geometry key understood by
// ShapeBlock. Inserted as a real `shape` block (not an image) so the
// tutor gets fill/outline/no-fill controls and the shape sits on the
// canvas with no surrounding card chrome.
//
// `url` is still provided for the dialog's thumbnail grid only.
export const SHAPES = [
  { id: 'shape-circle',   name: 'Circle',          shape: 'circle',   fill: '#6366f1', url: iconAsset(BsCircleFill, '#6366f1') },
  { id: 'shape-square',   name: 'Square',          shape: 'square',   fill: '#0ea5e9', url: iconAsset(BsSquareFill, '#0ea5e9') },
  { id: 'shape-rounded',  name: 'Rounded square',  shape: 'rounded',  fill: '#0ea5e9', url: iconAsset(BsSquareFill, '#0ea5e9') },
  { id: 'shape-triangle', name: 'Triangle',        shape: 'triangle', fill: '#10b981', url: iconAsset(BsTriangleFill, '#10b981') },
  { id: 'shape-star',     name: 'Star',            shape: 'star',     fill: '#ef4444', url: iconAsset(BsStarFill, '#ef4444') },
  { id: 'shape-hex',      name: 'Hexagon',         shape: 'hexagon',  fill: '#8b5cf6', url: iconAsset(BsHexagonFill, '#8b5cf6') },
  { id: 'shape-pentagon', name: 'Pentagon',        shape: 'pentagon', fill: '#f59e0b', url: iconAsset(BsPentagonFill, '#f59e0b') },
  { id: 'shape-octagon',  name: 'Octagon',         shape: 'octagon',  fill: '#0d9488', url: iconAsset(BsOctagonFill, '#0d9488') },
  { id: 'shape-diamond',  name: 'Diamond',         shape: 'diamond',  fill: '#ec4899', url: iconAsset(BsDiamondFill, '#ec4899') },
  { id: 'shape-heart',    name: 'Heart',           shape: 'heart',    fill: '#e11d48', url: iconAsset(BsHeartFill, '#e11d48') },
  { id: 'shape-arrow-r',  name: 'Arrow right',     shape: 'arrowR',   fill: '#0f172a', url: iconAsset(BsArrowRight, '#0f172a') },
  { id: 'shape-arrow-l',  name: 'Arrow left',      shape: 'arrowL',   fill: '#0f172a', url: iconAsset(BsArrowLeft, '#0f172a') },
  { id: 'shape-arrow-u',  name: 'Arrow up',        shape: 'arrowU',   fill: '#10b981', url: iconAsset(BsArrowUp, '#10b981') },
  { id: 'shape-arrow-d',  name: 'Arrow down',      shape: 'arrowD',   fill: '#f59e0b', url: iconAsset(BsArrowDown, '#f59e0b') },
  { id: 'shape-ring',     name: 'Ring outline',    shape: 'circle',   fill: 'none', stroke: '#0f172a', strokeWidth: 4, url: iconAsset(FaRegCircle, '#0f172a') },
  { id: 'shape-square-outline', name: 'Square outline', shape: 'rounded', fill: 'none', stroke: '#0f172a', strokeWidth: 4, url: iconAsset(FaRegSquare, '#0f172a') },
];

// ---------------------------------------------------------------
// Lines & arrows (HTML so they sit inline at any width)
// ---------------------------------------------------------------
// Lines — inserted as native `shape` blocks (stroke-only geometry inside
// ShapeBlock). The colour picker + thickness slider on ShapeBlock then
// works for every line straight away. `url` is a static SVG thumbnail
// only used by the design dialog grid.
const lineThumb = (markup) =>
  svg(`<svg x="0" y="0" width="240" height="80" viewBox="0 0 240 80">${markup}</svg>`, 240, 80);

export const LINES = [
  {
    id: 'line-solid',
    name: 'Solid line',
    shape: 'line',
    fill: '#0f172a',
    strokeWidth: 3,
    url: lineThumb('<line x1="10" y1="40" x2="230" y2="40" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>'),
  },
  {
    id: 'line-dashed',
    name: 'Dashed line',
    shape: 'lineDashed',
    fill: '#475569',
    strokeWidth: 3,
    url: lineThumb('<line x1="10" y1="40" x2="230" y2="40" stroke="#475569" stroke-width="3" stroke-linecap="round" stroke-dasharray="10,6"/>'),
  },
  {
    id: 'line-dotted',
    name: 'Dotted line',
    shape: 'lineDotted',
    fill: '#94a3b8',
    strokeWidth: 4,
    url: lineThumb('<line x1="10" y1="40" x2="230" y2="40" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" stroke-dasharray="1,8"/>'),
  },
  {
    id: 'line-thick',
    name: 'Thick line',
    shape: 'line',
    fill: '#6366f1',
    strokeWidth: 8,
    url: lineThumb('<line x1="10" y1="40" x2="230" y2="40" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/>'),
  },
];

// Arrows — real React icons rendered into a wide 240×120 tile so the
// thumbnail reads as a directional arrow rather than a tiny glyph.
const arrowAsset = (IconComponent, color) => {
  const { viewBox, paths } = extractIcon(IconComponent, color);
  return svg(
    `<svg x="40" y="20" width="160" height="80" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${paths}</svg>`,
    240,
    120
  );
};

// Arrows — inserted as native `shape` blocks so the same colour picker
// + thickness slider that powers shapes/lines also powers arrows. The
// chunky filled glyphs from react-icons are retained only as filled
// `shape` variants below for tutors who want a heavier look.
export const ARROWS = [
  {
    id: 'arrow-line-right',
    name: 'Arrow right',
    shape: 'arrowLineR',
    fill: '#0f172a',
    strokeWidth: 4,
    url: arrowAsset(FaLongArrowAltRight, '#0f172a'),
  },
  {
    id: 'arrow-line-left',
    name: 'Arrow left',
    shape: 'arrowLineL',
    fill: '#0f172a',
    strokeWidth: 4,
    url: arrowAsset(FaLongArrowAltLeft, '#0f172a'),
  },
  {
    id: 'arrow-line-double',
    name: 'Double arrow',
    shape: 'arrowLineDouble',
    fill: '#ef4444',
    strokeWidth: 4,
    url: arrowAsset(FaArrowsAltH, '#ef4444'),
  },
  // Filled chevron arrows — keep the existing `arrowR/L/U/D` ShapeBlock
  // geometry so users still have a bold "block arrow" choice and the
  // fill colour control works on them naturally.
  {
    id: 'arrow-block-right',
    name: 'Block right',
    shape: 'arrowR',
    fill: '#0f172a',
    url: arrowAsset(BsArrowRight, '#0f172a'),
  },
  {
    id: 'arrow-block-left',
    name: 'Block left',
    shape: 'arrowL',
    fill: '#0f172a',
    url: arrowAsset(BsArrowLeft, '#0f172a'),
  },
  {
    id: 'arrow-block-up',
    name: 'Block up',
    shape: 'arrowU',
    fill: '#10b981',
    url: arrowAsset(BsArrowUp, '#10b981'),
  },
  {
    id: 'arrow-block-down',
    name: 'Block down',
    shape: 'arrowD',
    fill: '#f59e0b',
    url: arrowAsset(BsArrowDown, '#f59e0b'),
  },
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
  { id: 'shapes', label: 'Shapes', items: SHAPES, kind: 'shape' },
  { id: 'lines', label: 'Lines', items: LINES, kind: 'shape' },
  { id: 'arrows', label: 'Arrows', items: ARROWS, kind: 'shape' },
  { id: 'social', label: 'Social icons', items: SOCIAL_ICONS, kind: 'image' },
];