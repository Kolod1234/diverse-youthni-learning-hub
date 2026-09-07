/* Fetch the OpenStax figures selected for A2 Biology lessons 32-34. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['f11ebddb2bb760a4a0711d6c4f79dda0c1e2b39b', 'openstax-24-28-fungal-insect-control.png'],
  ['493d367e053492a937b87ab260a5fb473d54f8d9', 'openstax-19-6-gene-flow.png'],
  ['5fde27aece7c9adbbf664aaf9832b958fd045b5c', 'openstax-24-3-yeast-cells.png'],
  ['483a36636dc40f3f023632636fa8ca712f60566e', 'openstax-45-4-mark-recapture.png'],
  ['b25eab5537e7388b0fe161a1cdb0829088445dca', 'openstax-45-10-logistic-examples.png'],
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

