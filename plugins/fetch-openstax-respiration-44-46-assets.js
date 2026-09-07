/* Fetch the OpenStax figures selected for A2 Biology lessons 44-46. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['0ee2fa4f802104e76f9d7f9e79f1442ae3a60b64', 'openstax-7-8-glycolysis-investment.png'],
  ['b9148483a53d5719d54a4c19e2fbdfab3f36d10a', 'openstax-7-9-glycolysis-payoff.png'],
  ['30c947dd1e264e10484fd9b22cd8ce60f0f0305f', 'openstax-7-6-mitochondrion.png'],
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

