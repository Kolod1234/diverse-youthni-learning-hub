/* Fetch the OpenStax figures selected for A2 Biology lessons 38-40. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['d2b636a215efb1ec7f1a55221e684d1410da22e3', 'openstax-46-4-food-chain.png'],
  ['b0189c43612d80364bc9a6242ac55ee07f863a7c', 'openstax-46-8-energy-flow.png'],
  ['95af711419a8c5ec02c1e4bc5aeb618a29cb5d15', 'openstax-46-10-ecological-pyramids.png'],
  ['d5532c1c6cc8df4363b192abde0b9b42924eeed9', 'openstax-31-4-nutrient-deficiency.png'],
  ['95c9e9554a888fbb9a05d251e663c9e5667d8e30', 'openstax-31-5-hydroponics.png'],
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

