/* quantpng.js — median-cut quantisation + indexed (palette) PNG writer.

   node-canvas emits 32-bit RGBA PNGs, which for flat diagram artwork are
   roughly ten times larger than they need to be: a typical sheet contains
   ~1800 colours, nearly all of them antialiasing fringes. This reduces to a
   small palette and writes a colour-type-3 PNG using only Node's built-in
   zlib, so no extra dependency is needed. */

const zlib = require('zlib');

// ---------- CRC32 ----------
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

// ---------- median cut ----------
function medianCut(counts, maxColours) {
  // counts: Map<rgbInt, pixelCount>
  let boxes = [[...counts.keys()]];
  const spread = (bucket) => {
    let lo = [255, 255, 255], hi = [0, 0, 0];
    for (const v of bucket) {
      const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
      for (let i = 0; i < 3; i++) {
        if (c[i] < lo[i]) lo[i] = c[i];
        if (c[i] > hi[i]) hi[i] = c[i];
      }
    }
    return [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
  };
  while (boxes.length < maxColours) {
    // split the box with the largest single-channel spread
    let bi = -1, bchan = 0, best = 0;
    boxes.forEach((b, i) => {
      if (b.length < 2) return;
      const s = spread(b);
      for (let ch = 0; ch < 3; ch++) if (s[ch] > best) { best = s[ch]; bi = i; bchan = ch; }
    });
    if (bi < 0) break;
    const shift = [16, 8, 0][bchan];
    const b = boxes[bi].slice().sort((p, q) => ((p >> shift) & 255) - ((q >> shift) & 255));
    const mid = b.length >> 1;
    boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid));
  }
  // palette entry = pixel-count-weighted mean of its box
  return boxes.filter(b => b.length).map(b => {
    let r = 0, g = 0, bl = 0, n = 0;
    for (const v of b) {
      const w = counts.get(v) || 1;
      r += ((v >> 16) & 255) * w; g += ((v >> 8) & 255) * w; bl += (v & 255) * w; n += w;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(bl / n)];
  });
}

/* rgba: Buffer/Uint8ClampedArray of w*h*4. Returns an indexed PNG Buffer. */
function encodeIndexed(rgba, w, h, maxColours = 32) {
  const counts = new Map();
  for (let i = 0; i < rgba.length; i += 4) {
    const v = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const palette = counts.size <= maxColours
    ? [...counts.keys()].map(v => [(v >> 16) & 255, (v >> 8) & 255, v & 255])
    : medianCut(counts, maxColours);

  // nearest-palette lookup, memoised per distinct source colour
  const cache = new Map();
  const nearest = (v) => {
    let hit = cache.get(v);
    if (hit !== undefined) return hit;
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    let bi = 0, bd = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2;
      if (d < bd) { bd = d; bi = i; }
    }
    cache.set(v, bi);
    return bi;
  };

  // raw scanlines, filter byte 0 (None) — best for flat palette art
  const raw = Buffer.alloc(h * (w + 1));
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0;
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      const i = row + x * 4;
      raw[o++] = nearest((rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2]);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 3;    // colour type: indexed
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach((p, i) => { plte[i * 3] = p[0]; plte[i * 3 + 1] = p[1]; plte[i * 3 + 2] = p[2]; });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* Convenience: take a Diagram and return a compact indexed PNG. */
function encodeDiagram(diagram, maxColours = 32) {
  const { w, h, g } = diagram;
  const data = g.getImageData(0, 0, w, h).data;
  return encodeIndexed(data, w, h, maxColours);
}

module.exports = { encodeIndexed, encodeDiagram };
