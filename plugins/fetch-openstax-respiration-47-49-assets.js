/* Fetch the OpenStax figures selected for A2 Biology lessons 47-49. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['189892a2e492714e5e91daa0ba12912a21ffd287', 'openstax-7-10-link-reaction.png'],
  ['a84c5164820430e4fbb277e533da26ccdbba5490', 'openstax-7-11-krebs-cycle.png'],
  ['13960959567cae51dab62cce59daade453ccfddf', 'openstax-7-12-electron-transport-chain.png'],
  ['3266f7f79ef9149d89113dced736731f46bf456b', 'openstax-7-13-atp-synthase.png'],
  ['51448a57b43ca03f026f8d69fe0e788b3cf7e559', 'openstax-7-14-chemiosmosis.png'],
  ['7db74c1b8a7dd5730807d4f469df9519f6b4c9c5', 'openstax-7-16-lactate-fermentation.png'],
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

