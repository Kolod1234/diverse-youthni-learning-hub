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
// Uses the official brand SVG paths from `react-icons/si` (Simple Icons)
// and `react-icons/md` for the generic email icon. We render them as
// inline-SVG data URIs so they slot straight into the existing image
// insertion pipeline (no React component rendering needed for picker
// thumbnails or inserted blocks).
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
import { FaLinkedinIn } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

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
// Banners — high-quality stock photo banners from Unsplash.
// Sized as 1200×240 panoramic crops so they slot into the existing
// image-block insertion pipeline.
// ---------------------------------------------------------------
const unsplashBanner = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&h=320&q=80`;

export const BANNERS = [
  { id: 'banner-sunrise', name: 'Sunrise', url: unsplashBanner('photo-1506905925346-21bda4d32df4') },
  { id: 'banner-ocean', name: 'Ocean', url: unsplashBanner('photo-1507525428034-b723cf961d3e') },
  { id: 'banner-forest', name: 'Forest', url: unsplashBanner('photo-1448375240586-882707db888b') },
  { id: 'banner-mountains', name: 'Mountains', url: unsplashBanner('photo-1464822759023-fed622ff2c3b') },
  { id: 'banner-city', name: 'City skyline', url: unsplashBanner('photo-1480714378408-67cf0d13bc1b') },
  { id: 'banner-desk', name: 'Workspace', url: unsplashBanner('photo-1499951360447-b19be8fe80f5') },
  { id: 'banner-abstract', name: 'Abstract gradient', url: unsplashBanner('photo-1557682250-33bd709cbe85') },
  { id: 'banner-paper', name: 'Paper texture', url: unsplashBanner('photo-1518655048521-f130df041f66') },
];

// ---------------------------------------------------------------
// Shapes — real React icons (Bootstrap Icons + Font Awesome solids)
// ---------------------------------------------------------------
// Wraps each icon in a coloured tile so it slots into the existing
// image-block pipeline at 200×200px.
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
} from 'react-icons/bs';
import { FaRegCircle, FaRegSquare } from 'react-icons/fa';

const iconAsset = (IconComponent, color, size = 160, tile = 200) => {
  const { viewBox, paths } = extractIcon(IconComponent, color);
  const offset = (tile - size) / 2;
  return svg(
    `<svg x="${offset}" y="${offset}" width="${size}" height="${size}" viewBox="${viewBox}">${paths}</svg>`,
    tile,
    tile
  );
};

export const SHAPES = [
  { id: 'shape-circle', name: 'Circle', url: iconAsset(BsCircleFill, '#6366f1') },
  { id: 'shape-square', name: 'Square', url: iconAsset(BsSquareFill, '#0ea5e9') },
  { id: 'shape-triangle', name: 'Triangle', url: iconAsset(BsTriangleFill, '#10b981') },
  { id: 'shape-star', name: 'Star', url: iconAsset(BsStarFill, '#ef4444') },
  { id: 'shape-hex', name: 'Hexagon', url: iconAsset(BsHexagonFill, '#8b5cf6') },
  { id: 'shape-pentagon', name: 'Pentagon', url: iconAsset(BsPentagonFill, '#f59e0b') },
  { id: 'shape-octagon', name: 'Octagon', url: iconAsset(BsOctagonFill, '#0d9488') },
  { id: 'shape-diamond', name: 'Diamond', url: iconAsset(BsDiamondFill, '#ec4899') },
  { id: 'shape-heart', name: 'Heart', url: iconAsset(BsHeartFill, '#e11d48') },
  { id: 'shape-cloud', name: 'Cloud', url: iconAsset(BsCloudFill, '#64748b') },
  { id: 'shape-bolt', name: 'Bolt', url: iconAsset(BsLightningChargeFill, '#eab308') },
  { id: 'shape-ring', name: 'Ring outline', url: iconAsset(FaRegCircle, '#0f172a') },
  { id: 'shape-square-outline', name: 'Square outline', url: iconAsset(FaRegSquare, '#0f172a') },
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

// ---------------------------------------------------------------
// Arrows — real React icons (Font Awesome + Tabler)
// ---------------------------------------------------------------
import {
  FaLongArrowAltRight,
  FaLongArrowAltLeft,
  FaArrowsAltH,
} from 'react-icons/fa';
import {
  TbArrowCurveRight,
  TbArrowWaveRightUp,
  TbArrowBigRight,
  TbArrowBigLeft,
} from 'react-icons/tb';

const arrowAsset = (IconComponent, color) => {
  const { viewBox, paths } = extractIcon(IconComponent, color);
  return svg(
    `<svg x="20" y="10" width="200" height="60" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${paths}</svg>`,
    240,
    80
  );
};

export const ARROWS = [
  { id: 'arrow-right', name: 'Arrow right', url: arrowAsset(FaLongArrowAltRight, '#0f172a') },
  { id: 'arrow-left', name: 'Arrow left', url: arrowAsset(FaLongArrowAltLeft, '#0f172a') },
  { id: 'arrow-double', name: 'Double arrow', url: arrowAsset(FaArrowsAltH, '#ef4444') },
  { id: 'arrow-big-right', name: 'Bold arrow right', url: arrowAsset(TbArrowBigRight, '#6366f1') },
  { id: 'arrow-big-left', name: 'Bold arrow left', url: arrowAsset(TbArrowBigLeft, '#6366f1') },
  { id: 'arrow-curve', name: 'Curved arrow', url: arrowAsset(TbArrowCurveRight, '#0ea5e9') },
  { id: 'arrow-wave', name: 'Wave arrow', url: arrowAsset(TbArrowWaveRightUp, '#10b981') },
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