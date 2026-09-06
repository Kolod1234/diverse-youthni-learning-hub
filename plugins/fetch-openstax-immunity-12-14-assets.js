/* Fetch the OpenStax figures selected for A2 Biology lessons 12-14. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['17d0244b5dded9577afab15cd6866f67b1a4b0ea', 'openstax-18-24-immunity-classifications.png'],
  ['69008f2c74453e4b70a7bc2fdeab342febb7800c', 'openstax-42-18-vaccine-injection.png'],
  ['e5ef30c9e9133c797d9e827c7edeb570627dffc9', 'openstax-42-14-mhc-recognition.png'],
  ['ce2a5857e2670efef399e9e2d04a4e2a0ce07ec3', 'openstax-18-15-rh-pregnancy.png'],
  ['387433ee24cad9d0a576c5bd5944c5a726901211', 'openstax-18-16-blood-crossmatch.png'],
  ['10506feb0f2ee02f5a0821d51cf014c8316939ba', 'openstax-18-17-abo-blood-groups.png'],
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
  path.join(OUT, 'openstax-18-24-immunity-classifications.png'),
  path.join(OUT, 'a2-immunity-12-active-passive-immunity-photorealistic.png'),
);
fs.copyFileSync(
  path.join(OUT, 'openstax-18-17-abo-blood-groups.png'),
  path.join(OUT, 'a2-immunity-14-abo-rhesus-photorealistic.png'),
);

