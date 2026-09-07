const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const featured = {
  35: 'lesson-assets/a2-biology/a2-ecology-35-community-ecosystem-photorealistic.png',
  36: 'lesson-assets/a2-biology/a2-ecology-36-succession-photorealistic.png',
  37: 'lesson-assets/a2-biology/a2-ecology-37-food-chains-webs-photorealistic.png',
};
const expectedCopies = {
  35: [
    ['lesson-assets/a2-biology/openstax-44-2-ecological-levels.png', [1, 3, 4, 5, 6, 21, 22, 23, 24, 28, 29, 30]],
    ['lesson-assets/a2-biology/openstax-46-2-ecosystems.png', [7, 14, 19, 20]],
    ['lesson-assets/a2-biology/openstax-46-6-food-web.png', [8, 9, 10, 11, 15, 16, 17, 18, 25]],
  ],
  36: [
    ['lesson-assets/a2-biology/openstax-45-32-primary-succession.png', [6, 9, 11, 21, 22, 23, 24, 28]],
    ['lesson-assets/a2-biology/openstax-45-33-secondary-succession.png', [1, 3, 4, 5, 7, 8, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 29, 30]],
  ],
  37: [
    ['lesson-assets/a2-biology/openstax-46-4-food-chain.png', [6, 7, 11, 12, 24]],
    ['lesson-assets/a2-biology/openstax-46-6-food-web.png', [1, 3, 4, 5, 10, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 28, 29, 30]],
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
  for (const lesson of [35, 36, 37]) {
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

