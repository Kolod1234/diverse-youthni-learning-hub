const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const pageCount = { 27: 28, 28: 18 };
const expectedCopies = {
  27: [
    ['lesson-assets/a2-biology/openstax-10-3-muscle-organisation.png', [3, 4]],
    ['lesson-assets/a2-biology/openstax-10-4-muscle-fibre.png', [5, 18, 26]],
    ['lesson-assets/a2-biology/openstax-10-5-sarcomere.png', [6, 7, 8, 20, 21, 23, 24]],
    ['lesson-assets/a2-biology/openstax-10-8-contraction-coupling.png', [13, 28]],
    ['lesson-assets/a2-biology/openstax-10-10-sliding-filament.png', [9, 10, 11, 16, 19, 22, 27]],
    ['lesson-assets/a2-biology/openstax-10-11-cross-bridge.png', [12, 14, 15]],
  ],
  28: [
    ['lesson-assets/a2-biology/openstax-10-2-muscle-types.png', [3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18]],
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
  for (const lesson of [27, 28]) {
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


