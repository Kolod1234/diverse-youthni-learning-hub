const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const pageCount = { 32: 30, 33: 30, 34: 30 };
const featured = {
  32: 'lesson-assets/a2-biology/a2-ecology-32-biological-control-photorealistic.png',
  33: 'lesson-assets/a2-biology/a2-ecology-33-population-dynamics-photorealistic.png',
  34: 'lesson-assets/a2-biology/a2-ecology-34-yeast-cmr-practical-photorealistic.png',
};
const expectedCopies = {
  32: [['lesson-assets/a2-biology/openstax-24-28-fungal-insect-control.png', [1, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30]]],
  33: [['lesson-assets/a2-biology/openstax-19-6-gene-flow.png', [1, 3, 4, 6, 9, 11, 14, 18, 20, 21, 22, 23, 25, 28, 29, 30]]],
  34: [
    ['lesson-assets/a2-biology/openstax-24-3-yeast-cells.png', [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 21, 22, 23, 24, 28, 29, 30]],
    ['lesson-assets/a2-biology/openstax-45-10-logistic-examples.png', [11, 13, 16, 17]],
    ['lesson-assets/a2-biology/openstax-45-4-mark-recapture.png', [14, 15, 18, 19, 20, 25, 26, 27]],
  ],
};

const lessonPath = (lesson, page) => page === 5 ? featured[lesson] : `a2-biology/a2-${String(lesson).padStart(3, '0')}-p${String(page).padStart(2, '0')}.png`;
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
  for (const lesson of [32, 33, 34]) {
    const decoded = [];
    for (let page = 1; page <= pageCount[lesson]; page += 1) {
      const relative = lessonPath(lesson, page);
      try {
        const image = await inspect(relative);
        decoded.push({ page, ...image });
        if (image.signature !== '89504e470d0a1a0a' || image.width < 100 || image.height < 100 || image.bytes < 1000) failures.push({ lesson, page, ...image, error: 'invalid or implausibly small PNG' });
      } catch (error) { failures.push({ lesson, page, relative, error: error.message }); }
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
      } catch (error) { failures.push({ lesson, sourceRelative, error: error.message }); }
    }
    lessons[lesson] = { pagesExpected: pageCount[lesson], pagesDecoded: decoded.length, totalBytes: decoded.reduce((sum, image) => sum + image.bytes, 0), dimensions: [...new Set(decoded.map((image) => `${image.width}x${image.height}`))] };
  }
  console.log(JSON.stringify({ lessons, verifiedOpenStaxCopies, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

