/* Fetch the OpenStax immunity figures selected for A2 Biology lessons 9-11.
 * Run once inside the Base44 sandbox. The committed PNGs make builds offline-safe.
 */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');

const figures = [
  ['86e277aca20c56d538a49a0684c03063ca1a2f6d', 'openstax-21-12-innate-adaptive.png'],
  ['835454fababd5805c9787610ae37cb6df9fb15f1', 'openstax-21-21-antibody-structure.png'],
  ['05e3c5fcb2a46e4b7b2ba915fd41360e5d69eb22', 'openstax-21-23-b-cell-clonal-selection.png'],
  ['1a4e976aaf6bdb5525663486eee9c8b1912ef8b6', 'openstax-21-19-t-cell-clonal-selection.png'],
  ['173d1c48b0ad43c7c7658af67fad19aa9477a5d4', 'openstax-42-8-phagocytosis-apc.png'],
  ['e3abb746a4f57494e07a0cfd1e36325388b561f2', 'openstax-42-11-helper-t-coordination.png'],
  ['600bcc597e8aab3d0d2cb8573a3e736d7e50fd5a', 'openstax-42-16-b-cell-activation.png'],
  ['05bb50a88617f47427bea536bac7d62fba605083', 'openstax-42-17-primary-secondary.png'],
  ['f345009812aa51277e672aacde9fc480eb706e61', 'openstax-42-24-antibody-functions.png'],
  ['e8bae4fe067177efb08093ee24bf3602ff8c698c', 'openstax-42-25-affinity-specificity.png'],
];

fs.mkdirSync(OUT, { recursive: true });

for (const [hash, filename] of figures) {
  const response = await fetch(ARCHIVE + hash);
  if (!response.ok) throw new Error(`${filename}: OpenStax returned HTTP ${response.status}`);
  const source = Buffer.from(await response.arrayBuffer());
  const image = await loadImage(source);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  const output = path.join(OUT, filename);
  fs.writeFileSync(output, canvas.toBuffer('image/png', { compressionLevel: 9 }));
  console.log(`${filename}: ${image.width}×${image.height}`);
}

// These legacy slide paths already exist in lesson data. Supply them with the
// closest authoritative OpenStax source instead of fabricating photographs.
fs.copyFileSync(
  path.join(OUT, 'openstax-42-11-helper-t-coordination.png'),
  path.join(OUT, 'a2-immunity-10-humoral-cell-mediated-photorealistic.png'),
);

