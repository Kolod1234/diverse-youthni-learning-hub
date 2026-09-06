/* Fetch the OpenStax figures selected for A2 Biology lessons 29-31. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['64522a7f22df9f70dca059bff0d746c9e40be33f', 'openstax-45-9-growth-models.png'],
  ['b25eab5537e7388b0fe161a1cdb0829088445dca', 'openstax-45-10-logistic-examples.png'],
  ['7a3f5fa29040e081045bc4bb5fd6733f08ed3968', 'openstax-45-13-r-k-examples.png'],
  ['93bb007228ac2a2363ea4f8961b477a0641d27fd', 'openstax-45-6-survivorship.png'],
  ['16f78688b81f7c253d2e3bdc64d93403420ebb45', 'openstax-45-18-predator-prey.png'],
  ['bc7c4d9c79787d747db81d38c2a19f34a68de5d0', 'openstax-45-24-competition.png'],
  ['df2cd1c6582abcec68f931bc2dd5986ebc02fa84', 'openstax-45-26-mutualism.png'],
  ['543be0974da39764f1d1ed6e9c79a6b1b898af09', 'openstax-45-27-parasitism.png'],
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


