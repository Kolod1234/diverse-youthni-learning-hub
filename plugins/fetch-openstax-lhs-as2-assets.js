/* Fetch the OpenStax Biology 2e figures selected for the Life & Health
 * Sciences AS 2 "Cells, Tissues and Biological Molecules" chapter.
 * Run once inside the Base44 sandbox. The committed PNGs make builds
 * offline-safe. Figures are CC BY-NC-SA 4.0 (Rice University, OpenStax):
 * captions in the lesson content carry the required attribution.
 */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/lhs-as2');

const figures = [
  // Biology 2e Figure 4.8(a) — typical animal cell, labelled organelles
  ['cc7c0da98dd7e0bb4de6e8ff7f79364434c2ce57', 'openstax-4-8-animal-cell.png'],
  // Biology 2e Figure 5.2 — the fluid mosaic model of the plasma membrane
  ['52bfcab8c986c794f20141487ae15a68f1ac7ac4', 'openstax-5-2-fluid-mosaic.png'],
  // Biology 2e Figure 5.12 — red blood cell in hypotonic / isotonic / hypertonic solutions
  ['544869222299197c04f854f532422e3e3aeefba7', 'openstax-5-12-tonicity.png'],
  // Biology 2e Figure 6.16 — induced-fit enzyme action, four stages
  ['065386871b944db2faf13ef55cbfebddbfba6394', 'openstax-6-16-enzyme-action.png'],
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
  fs.writeFileSync(path.join(OUT, filename), canvas.toBuffer('image/png', { compressionLevel: 9 }));
  console.log(`${filename}: ${image.width}×${image.height}`);
}