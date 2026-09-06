const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const pageCount = { 24: 28, 25: 30, 26: 18 };
const expectedCopies = {
  24: [
    ['lesson-assets/a2-biology/openstax-35-14-synaptic-vesicles.png', [5]],
    ['lesson-assets/a2-biology/openstax-35-15-chemical-synapse.png', [3, 4, 6, 7, 10, 13, 14, 16, 18, 20, 22, 23, 24, 25, 26, 27, 28]],
    ['lesson-assets/a2-biology/openstax-35-16-summation.png', [8, 9, 11, 12, 15, 17, 19, 21]],
  ],
  25: [
    ['lesson-assets/a2-biology/openstax-36-18-eye-retina.png', [3, 4, 5, 11, 12, 22, 24, 26, 28, 29, 30]],
    ['lesson-assets/a2-biology/openstax-15-9-pupil-control.png', [6, 7]],
    ['lesson-assets/a2-biology/openstax-26-4-accommodation.png', [8, 9, 10]],
    ['lesson-assets/a2-biology/openstax-36-19-rods-cones.png', [13, 16, 17, 18, 20, 23, 25]],
    ['lesson-assets/a2-biology/openstax-36-20-rhodopsin.png', [21]],
    ['lesson-assets/a2-biology/openstax-36-22-spectral-sensitivity.png', [19]],
  ],
  26: [
    ['lesson-assets/a2-biology/openstax-36-18-eye-retina.png', [4, 5, 11, 12, 13, 14, 15, 16, 17, 18]],
    ['lesson-assets/a2-biology/openstax-36-19-rods-cones.png', [6]],
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
  for (const lesson of [24, 25, 26]) {
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


