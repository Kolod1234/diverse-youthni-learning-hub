/* Fetch the OpenStax figures selected for A2 Biology lessons 21-23. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['1e1baa96f078fc96977df3a129bc19dbe0402635', 'openstax-30-39-phototropism.png'],
  ['0268b185bcddfb09e758cfd60b22f515b2582a55', 'openstax-30-40-gibberellin-grapes.png'],
  ['23c7101f84c6afb58d5506d12bf520f2b889651d', 'openstax-35-3-neuron.png'],
  ['61b4d087adb9b7a2c1298f5f2e7b6263fb852901', 'openstax-35-5-neuron-types.png'],
  ['c0e836a422116c400a2365e25fd93d3893e769e0', 'openstax-35-7-glial-cells.png'],
  ['bb5cda2a164974bcfccd00a60e40a0b2b3934d87', 'openstax-35-10-membrane-potential.png'],
  ['dbe79b659256cef76f0b0377d48c78ad3fd8edc0', 'openstax-35-11-action-potential.png'],
  ['0d4d8e978090c5adf07cc1661372b69be3496ec6', 'openstax-35-12-propagation.png'],
  ['1a264d4943c1148665b7216c649d72ad774fc80b', 'openstax-35-13-saltatory-conduction.png'],
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

