/* Fetch the OpenStax figures selected for A2 Biology lessons 15-17. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['094e30bf3fce9621f4043b1259890266f4aaf87d', 'openstax-19-5-incompatible-transfusion.png'],
  ['8b2dd9e5f72821dded76d1b95f6d57b7428acbc2', 'openstax-14-18-drug-resistance.png'],
  ['ca32a0353abe1cb2f61de4b480202fa754304afa', 'openstax-13-31-disk-diffusion.png'],
  ['c6a1d98b2690161d9ce091d1bdedf80149126ede', 'openstax-20-24-sandwich-elisa.png'],
  ['18270a9b332bdea339685f813264497105e5e5b1', 'openstax-17-10-cytokine-signalling.png'],
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

fs.copyFileSync(
  path.join(OUT, 'openstax-18-17-abo-blood-groups.png'),
  path.join(OUT, 'a2-immunity-15-transfusion-compatibility-photorealistic.png'),
);
fs.copyFileSync(
  path.join(OUT, 'openstax-20-24-sandwich-elisa.png'),
  path.join(OUT, 'a2-immunity-17-elisa-photorealistic.png'),
);

