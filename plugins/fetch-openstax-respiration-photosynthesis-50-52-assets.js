/* Fetch/crop the OpenStax sources selected for A2 Biology lessons 50-52. */
import fs from 'fs';
import path from 'path';
import pdfjsPackage from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const LAB_MANUAL = 'https://assets.openstax.org/oscms-prodcms/media/documents/STUDENT_-_AP_Biology_Lab_Manual_Full.pdf';
const OUT = path.resolve('public/lesson-assets/a2-biology');
const figures = [
  ['41c3e0fcd6855dc11c031a4ff6bde5cff80f254e', 'openstax-7-19-respiratory-substrates.png'],
  ['0a7f415e3b677d985fef41084daa17c875901b67', 'openstax-8-6-chloroplast.png'],
  ['7c774b946c898a980b0a666e00be85c49333e165', 'openstax-8-7-two-stages-photosynthesis.png'],
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

const manualResponse = await fetch(LAB_MANUAL);
if (!manualResponse.ok) throw new Error(`OpenStax lab manual returned HTTP ${manualResponse.status}`);
const manualBytes = new Uint8Array(await manualResponse.arrayBuffer());
const { getDocument } = pdfjsPackage;
const document = await getDocument({ data: manualBytes, disableWorker: true }).promise;

async function cropFigure(pdfPage, box, filename) {
  const page = await document.getPage(pdfPage);
  const scale = 3;
  const viewport = page.getViewport({ scale });
  const full = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const fullContext = full.getContext('2d');
  fullContext.fillStyle = '#ffffff';
  fullContext.fillRect(0, 0, full.width, full.height);
  await page.render({ canvasContext: fullContext, viewport }).promise;
  const [x0, y0, x1, y1] = box.map((value) => Math.round(value * scale));
  const crop = createCanvas(x1 - x0, y1 - y0);
  const cropContext = crop.getContext('2d');
  cropContext.fillStyle = '#ffffff';
  cropContext.fillRect(0, 0, crop.width, crop.height);
  cropContext.drawImage(full, -x0, -y0);
  fs.writeFileSync(path.join(OUT, filename), crop.toBuffer('image/png', { compressionLevel: 9 }));
  console.log(`${filename}: ${crop.width}×${crop.height}`);
}

await cropFigure(75, [220, 235, 380, 505], 'openstax-lab-8-3-respirometer.png');
await cropFigure(76, [200, 120, 420, 300], 'openstax-lab-8-4-water-bath.png');
await document.destroy();

