/* Fetch the OpenStax figures selected for A2 Biology lessons 27-28. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['ae0dd7a07b209f9a709b8c57f5e30213ac61b9fe', 'openstax-10-2-muscle-types.png'],
  ['7990f132356dc4b9ee2949417ac064b52b47b06f', 'openstax-10-3-muscle-organisation.png'],
  ['079419aef68b615feb19ec1d7a05d558e06b5adc', 'openstax-10-4-muscle-fibre.png'],
  ['20598ea3cb1cf18c62196a5f93bbe36a1a6d246f', 'openstax-10-5-sarcomere.png'],
  ['d27415657173fa90321a95a51a9637b20d168b70', 'openstax-10-8-contraction-coupling.png'],
  ['1463f0ef934552382ad130bf14cd23dd9e1e779a', 'openstax-10-10-sliding-filament.png'],
  ['86ea61f9cc667f8fdba8e214b3cefcb16b60676e', 'openstax-10-11-cross-bridge.png'],
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


