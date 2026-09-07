const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const featured = {
  41: 'lesson-assets/a2-biology/a2-ecology-41-carbon-cycle-photorealistic.png',
  42: 'lesson-assets/a2-biology/a2-ecology-42-nitrogen-cycle-photorealistic.png',
  43: 'lesson-assets/a2-biology/a2-respiration-43-atp-energy-coupling-photorealistic.png',
};
const expectedCopies = {
  41: [['lesson-assets/a2-biology/openstax-46-15-carbon-cycle.png', [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30]]],
  42: [
    ['lesson-assets/a2-biology/openstax-46-17-nitrogen-cycle.png', [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 28, 29, 30]],
    ['lesson-assets/a2-biology/openstax-46-19-dead-zones.png', [19]],
    ['lesson-assets/a2-biology/openstax-31-11-root-nodules.png', [20]],
  ],
  43: [
    ['lesson-assets/a2-biology/openstax-6-13-atp-structure.png', [1, 3, 4, 5, 6, 7, 8, 10, 11, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 30]],
    ['lesson-assets/a2-biology/openstax-6-14-sodium-potassium-pump.png', [9, 12, 13, 20, 25]],
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
  for (const lesson of [41, 42, 43]) {
    const decoded = [];
    for (let page = 1; page <= 30; page += 1) {
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
    lessons[lesson] = { pagesExpected: 30, pagesDecoded: decoded.length, totalBytes: decoded.reduce((sum, image) => sum + image.bytes, 0), dimensions: [...new Set(decoded.map((image) => `${image.width}x${image.height}`))] };
  }
  console.log(JSON.stringify({ lessons, verifiedOpenStaxCopies, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

