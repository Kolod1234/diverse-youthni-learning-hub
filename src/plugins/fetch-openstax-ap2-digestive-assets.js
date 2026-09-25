/* Fetch the OpenStax Anatomy & Physiology 2e figures used in the LHS AS 2
 * "The Digestive System" chapter (chapter 23 of the textbook). Figures are
 * CC BY-NC-SA 4.0 (Rice University, OpenStax); lesson captions carry the
 * attribution.
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';
const OUT = path.resolve('public/lesson-assets/lhs-as2');

const figures = [
  // Chapter 23 — the digestive system
  ['abe85277d60c52f85be133e1b5ddc40aea009e1c', 'openstax-ap2-digest-organs.png'],
  ['cfa0a944ef93cbf70c104f57c04cbd286ca74e3b', 'openstax-ap2-digest-layers.png'],
  ['0b2e78d3899b326af03df0bff0e91e86989e364f', 'openstax-ap2-digest-processes.png'],
  ['d5a1371691fee08cef0c64e47d65e0d95a601e30', 'openstax-ap2-digest-peristalsis.png'],
  ['871a95b27cad7140e9bdcfea14a1dd3401b175d4', 'openstax-ap2-digest-mouth.png'],
  ['67bbb4fe789401610fde18f82b8eab22988f1458', 'openstax-ap2-digest-salivary-glands.png'],
  ['3ab71b92a6025a8f458271b284b3a956837f8a1d', 'openstax-ap2-digest-tooth.png'],
  ['01c4e52cf98957ffa76861e4e36a4bb35d3f8e32', 'openstax-ap2-digest-deglutition.png'],
  ['1f9dc4ca1bb93d5e0d4c0b95a5daf1029dbac827', 'openstax-ap2-digest-oesophagus.png'],
  ['5af25f8d997d4e131865ab78ac754796ffcaecfc', 'openstax-ap2-digest-stomach.png'],
  ['6d88b0ea24be4b818870fa0c858c61f370184854', 'openstax-ap2-digest-gastric-pits.png'],
  ['84b4d40e2577581f0caa243606a4092a82b32ea5', 'openstax-ap2-digest-gastric-phases.png'],
  ['abf6ec32722c242d09afa2da6f08a61d71ac585b', 'openstax-ap2-digest-small-intestine.png'],
  ['65de80fe9396d266a09772aa978551d22566f5d8', 'openstax-ap2-digest-pancreas.png'],
  ['5d96eb41fcdfc0f7134331cec1795295aa0cb659', 'openstax-ap2-digest-segmentation.png'],
  ['182e0270dca32d6c112dddd17fb7aef5a9fffa42', 'openstax-ap2-digest-accessory-organs.png'],
  ['d626425e45148eb41c740661057f2b36f0aaef37', 'openstax-ap2-digest-liver-lobules.png'],
  ['06e02b521c8c634a2768518ea1ddaf1816823aef', 'openstax-ap2-digest-gallbladder.png'],
  ['8eb3433934b5eb137942d3290028e4dad8332e1d', 'openstax-ap2-digest-villi.png'],
  ['ee5d4d78da8a6418debe94999ced693451cd30c0', 'openstax-ap2-digest-lipid-absorption.png'],
  ['f561f8920405489bd3f51b68dd37242ac9d0b77e', 'openstax-ap2-digest-absorption-summary.png'],
  ['107362a1a09bafad94581b66928ea133539858e0', 'openstax-ap2-digest-carb-digestion.png'],
  ['02fb682d178b7662f7447ac690a161a66886639b', 'openstax-ap2-digest-large-intestine.png'],
  ['2208b3ea6d54b52abeac5c2ee7b67b46cb7f68b9', 'openstax-ap2-digest-large-intestine-histology.png'],
];

fs.mkdirSync(OUT, { recursive: true });

for (const [hash, filename] of figures) {
  const response = await fetch(ARCHIVE + hash);
  if (!response.ok) throw new Error(`${filename}: OpenStax returned HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(path.join(OUT, filename), buffer);
  console.log(`${filename}: ${buffer.length} bytes`);
}