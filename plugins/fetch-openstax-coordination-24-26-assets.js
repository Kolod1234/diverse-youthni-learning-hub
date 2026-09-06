/* Fetch the OpenStax figures selected for A2 Biology lessons 24-26. */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['ef4a200043db56be3868898ed18b4c921ae79224', 'openstax-35-14-synaptic-vesicles.png'],
  ['cb6d479cc9f33a2cd7b18f980c22a887ec64b676', 'openstax-35-15-chemical-synapse.png'],
  ['1e847919381c3a812182d4d81c1d3936b7af8e0a', 'openstax-35-16-summation.png'],
  ['73a574964b3cd7e464b9db2805254ac141d37eb9', 'openstax-36-18-eye-retina.png'],
  ['4bcfcd1576a41d3dfc0d0c5159fdbc60c7c563e1', 'openstax-36-19-rods-cones.png'],
  ['98f0e196df825fa627a0feaf26867b888813aba9', 'openstax-36-20-rhodopsin.png'],
  ['1d1433f265f77354d9440c220ac2874230e7cfa6', 'openstax-36-22-spectral-sensitivity.png'],
  ['cf4fb7e21b51f0534217cdc56f5e46cf152562ee', 'openstax-15-9-pupil-control.png'],
  ['c7edc5ff2fffbef4d4b82c20acbe62cbfa857764', 'openstax-26-4-accommodation.png'],
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


