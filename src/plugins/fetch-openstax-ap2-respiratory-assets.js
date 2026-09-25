/* Fetch the OpenStax Anatomy & Physiology 2e figures used in the LHS AS 2
 * "The Respiratory System" chapter. Figures are CC BY-NC-SA 4.0
 * (Rice University, OpenStax); lesson captions carry the attribution.
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { createCanvas, loadImage } from 'canvas';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/lhs-as2');

const figures = [
  // Chapter 22 — the respiratory system
  ['a20b8077aaf4688018122bf8f59ecfea069ed3b0', 'openstax-ap2-resp-organs.png'],
  ['6ad3bd99a305dc92d45fd2afb44831c056b91cd2', 'openstax-ap2-resp-trachea-bronchi.png'],
  ['db017adf40b25ef3a09b04de55fd9ea9bd21015a', 'openstax-ap2-resp-lung-structure.png'],
  ['ab75c5732c0dd28d9862cebcc0ae5955d578f763', 'openstax-ap2-resp-pleural-membranes.png'],
  ['2e0d73008ea7502a0bfbc8bd3bb2cfa89855c517', 'openstax-ap2-resp-boyle-law.png'],
  ['5ae96ca57ec74c0100efe6d029917e51d981c5e2', 'openstax-ap2-resp-breathing-mechanism.png'],
  ['4c87f180f435531cbb43bfc7235e305ed339bd78', 'openstax-ap2-resp-lung-volumes.png'],
  ['15b2230c1a9392143da7cafdb04d9617a0fb6fb3', 'openstax-ap2-resp-pulmonary-function-tests.png'],
  ['171baf4f46c4c283037fc7cf4366cde5f2c3d6b4', 'openstax-ap2-resp-breathing-control-centres.png'],
  ['09a9e7232a1476aabaca09bf662d1d0ca8fe5f0d', 'openstax-ap2-resp-bronchioles-alveoli.png'],
  ['f952b574f8274066d24917980386cd90970675b3', 'openstax-ap2-resp-alveolus-structure.png'],
  ['e9f09bac9f50684bda8170444b458a66ad9af447', 'openstax-ap2-resp-external-respiration.png'],
  ['51782420a77f633a98451518ad50874b71d9c762', 'openstax-ap2-resp-internal-respiration.png'],
  ['60a4a5093d359bf8057dc6bdaffc23ff9c5ae420', 'openstax-ap2-resp-haemoglobin.png'],
  ['05fbe5362a273db06b7e04a20959251b9586e533', 'openstax-ap2-resp-oxygen-dissociation.png'],
  ['0a5914bd4c88ad10cfa14f60d326a729fc88f7a4', 'openstax-ap2-resp-co2-transport.png'],
  ['3a2cfa6d95c36b31436aa70c1109a7a5f422f3a8', 'openstax-ap2-resp-asthma-tissue.png'],
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