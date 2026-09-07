/* Fetch the OpenStax figures selected for A2 Biology lessons 41-43. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['b4347e480f11f7bde955418c42a5250ac54f7448', 'openstax-46-15-carbon-cycle.png'],
  ['0aac6127fb141f645f9220b52e5fe80ff7e78a6a', 'openstax-46-17-nitrogen-cycle.png'],
  ['8cdd516ef282a525c4a48bd7995caa2ed8d6848a', 'openstax-46-19-dead-zones.png'],
  ['c45d92bd391c88b5a69236abeffa14f9994263af', 'openstax-31-11-root-nodules.png'],
  ['aa87a8b51a1ad240a078f55cb1038b18a560aabd', 'openstax-6-13-atp-structure.png'],
  ['89aa5eceb38327d6974cbbdb3144afda74343136', 'openstax-6-14-sodium-potassium-pump.png'],
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

