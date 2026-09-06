/* Fetch the OpenStax figures selected for A2 Biology lessons 18-20. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['4d8ae09285ddae4a6dedf474999e0c01af9c25d6', 'openstax-1-7-streak-plate-loop.png'],
  ['da8c2de0c8a9632429623e1fd94f8ff3000fa7e7', 'openstax-9-13-spread-plate.png'],
  ['ca32a0353abe1cb2f61de4b480202fa754304afa', 'openstax-13-31-disk-diffusion.png'],
  ['40442501e2bba0da03fa2ad8e295c5c78ca3a466', 'openstax-14-21-etest.png'],
  ['e4f988e70573efcdd252f816148bf154bc286e57', 'openstax-14-2-herbal-antimicrobials.png'],
  ['f3788fa72cacf554c0a6e864cda0b3bbadb16cd2', 'openstax-30-38-phytochrome.png'],
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

