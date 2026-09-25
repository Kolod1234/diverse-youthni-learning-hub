/* Fetch the OpenStax A&P 2e (ch. 24 Metabolism) figures used in the LHS AS 2
 * "Respiration" chapter. Figures are CC BY-NC-SA 4.0 (Rice University,
 * OpenStax); lesson captions carry the attribution. The build function
 * base44/functions/buildLhsAs2Respiration normally uploads these to public
 * storage; this script is the equivalent record for a sandboxed run that
 * writes them straight into public/lesson-assets/lhs-as2 instead.
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/lhs-as2');

const figures = [
  // Chapter 24 — metabolism and nutrition
  ['47fb0cb7c154559dfc16c7ba4769704866b2164d', 'openstax-ap2-metab-respiration-overview.png'],
  ['2a6147c3e109ac8295926abf3a16e3cf3b985148', 'openstax-ap2-metab-atp-structure.png'],
  ['364357dcdfb48592130ea9a86bdaadd12da46480', 'openstax-ap2-metab-glycolysis.png'],
  ['96895777af67e3af93416163e0c9b1447b5cd126', 'openstax-ap2-metab-link-krebs.png'],
  ['3589e07e861aa242cdd9739089cfca02ffea566d', 'openstax-ap2-metab-oxidative-phosphorylation.png'],
  ['d7f00156507ca8b5489a817cc67c1bdf7abb875b', 'openstax-ap2-metab-aerobic-vs-fermentation.png'],
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