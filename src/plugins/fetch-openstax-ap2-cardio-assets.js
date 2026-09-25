/* Fetch the OpenStax Anatomy & Physiology 2e figures used in the LHS AS 2
 * "The Cardiovascular System" chapter. Figures are CC BY-NC-SA 4.0
 * (Rice University, OpenStax); lesson captions carry the attribution.
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/lhs-as2');

const figures = [
  // A&P 2e Figure 19.4 — dual system of human blood circulation
  ['38bde48e307e339036f8a4b50a1874aa6bdcb0d8', 'openstax-ap2-19-4-dual-circulation.png'],
  // A&P 2e Figure 19.9 — internal structures of the heart
  ['c9d5c770b3ddb5014230220f12028905df9b896e', 'openstax-ap2-19-9-heart-internal.png'],
  // A&P 2e Figure 19.18 — conduction system of the heart
  ['ab4103111b36720e9c0b2ac83f5ef1b73e8a1686', 'openstax-ap2-19-18-conduction-system.png'],
  // A&P 2e Figure 19.23 — electrocardiogram
  ['d2b02a992ba896646801eae232b3acf8bfde879d', 'openstax-ap2-19-23-ecg.png'],
  // A&P 2e Figure 19.27 — overview of the cardiac cycle
  ['9c7bc663283f8f56000369b313fff985bde8e87a', 'openstax-ap2-19-27-cardiac-cycle.png'],
  // A&P 2e Figure 20.3 — structure of blood vessels
  ['8b43899d27f37826ddbe8c7616ef67a25e5a625c', 'openstax-ap2-20-3-blood-vessel-structure.png'],
  // A&P 2e Figure 18.2 — composition of blood
  ['7fa48eed7793f19b4120a18fbd89b434fe2d1274', 'openstax-ap2-18-2-blood-composition.png'],
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