const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const pageCount = { 21: 20, 22: 24, 23: 28 };
const expectedCopies = {
  21: [
    ['lesson-assets/a2-biology/openstax-30-39-phototropism.png', [4]],
    ['lesson-assets/a2-biology/openstax-30-40-gibberellin-grapes.png', [6, 11]],
  ],
  22: [
    ['lesson-assets/a2-biology/openstax-35-3-neuron.png', [3, 4, 8, 13, 16, 20, 24]],
    ['lesson-assets/a2-biology/openstax-35-5-neuron-types.png', [7, 14, 22]],
    ['lesson-assets/a2-biology/openstax-35-7-glial-cells.png', [5, 6]],
  ],
  23: [
    ['lesson-assets/a2-biology/openstax-35-10-membrane-potential.png', [3, 4, 5, 7, 10]],
    ['lesson-assets/a2-biology/openstax-35-11-action-potential.png', [6, 8, 9, 11, 18, 19, 22, 23, 24, 25, 27]],
    ['lesson-assets/a2-biology/openstax-35-12-propagation.png', [12, 13, 14]],
    ['lesson-assets/a2-biology/openstax-35-13-saltatory-conduction.png', [15, 16, 20, 28]],
  ],
};

const lessonPath = (lesson, page) => `a2-biology/a2-${String(lesson).padStart(3, '0')}-p${String(page).padStart(2, '0')}.png`;
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function inspect(relative) {
  const bytes = fs.readFileSync(path.join(publicDir, relative));
  const image = await loadImage(bytes);
  return { relative, bytes: bytes.length, width: image.width, height: image.height, signature: bytes.subarray(0, 8).toString('hex') };
}

async function main() {
  const failures = [];
  const lessons = {};
  let verifiedOpenStaxCopies = 0;

  for (const lesson of [21, 22, 23]) {
    const decoded = [];
    for (let page = 1; page <= pageCount[lesson]; page += 1) {
      const relative = lessonPath(lesson, page);
      try {
        const image = await inspect(relative);
        decoded.push({ page, ...image });
        if (image.signature !== '89504e470d0a1a0a' || image.width < 100 || image.height < 100 || image.bytes < 1000) {
          failures.push({ lesson, page, ...image, error: 'invalid or implausibly small PNG' });
        }
      } catch (error) {
        failures.push({ lesson, page, relative, error: error.message });
      }
    }

    for (const [sourceRelative, pages] of expectedCopies[lesson]) {
      try {
        const sourceHash = sha256(path.join(publicDir, sourceRelative));
        for (const page of pages) {
          const relative = lessonPath(lesson, page);
          const matches = sourceHash === sha256(path.join(publicDir, relative));
          verifiedOpenStaxCopies += Number(matches);
          if (!matches) failures.push({ lesson, page, relative, sourceRelative, error: 'OpenStax copy hash mismatch' });
        }
      } catch (error) {
        failures.push({ lesson, sourceRelative, error: error.message });
      }
    }

    lessons[lesson] = {
      pagesExpected: pageCount[lesson],
      pagesDecoded: decoded.length,
      totalBytes: decoded.reduce((sum, image) => sum + image.bytes, 0),
      dimensions: [...new Set(decoded.map((image) => `${image.width}x${image.height}`))],
    };
  }

  console.log(JSON.stringify({ lessons, verifiedOpenStaxCopies, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

