/* Fetch the OpenStax figures selected for A2 Biology lessons 35-37. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['11850960ebc1b129e74066cb19f4ec1a70fc3281', 'openstax-44-2-ecological-levels.png'],
  ['bcbef43f0c4391e4052b3b236d09a125c576a440', 'openstax-46-2-ecosystems.png'],
  ['dd5a80691b58507a326cfb54ea8c225aca7b7a67', 'openstax-45-32-primary-succession.png'],
  ['5d33e7ae28276e1f150246053f0f9209ed1bb92c', 'openstax-45-33-secondary-succession.png'],
  ['d2b636a215efb1ec7f1a55221e684d1410da22e3', 'openstax-46-4-food-chain.png'],
  ['f23c678aa7632b690db16cb08ad2e029c5d2e10c', 'openstax-46-6-food-web.png'],
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

