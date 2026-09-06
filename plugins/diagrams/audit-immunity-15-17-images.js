const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const featured = {
  15: 'lesson-assets/a2-biology/a2-immunity-15-transfusion-compatibility-photorealistic.png',
  16: 'lesson-assets/a2-biology/a2-immunity-16-antibiotic-resistance-photorealistic.png',
  17: 'lesson-assets/a2-biology/a2-immunity-17-elisa-photorealistic.png',
};
const expectedCopies = {
  15: [
    ['lesson-assets/a2-biology/openstax-18-17-abo-blood-groups.png', [5, 6, 7, 8, 9, 10, 12, 20]],
    ['lesson-assets/a2-biology/openstax-19-5-incompatible-transfusion.png', [11, 14, 15]],
    ['lesson-assets/a2-biology/openstax-18-16-blood-crossmatch.png', [19, 26, 27]],
  ],
  16: [
    ['lesson-assets/a2-biology/openstax-14-18-drug-resistance.png', [8, 9, 10, 20]],
    ['lesson-assets/a2-biology/openstax-13-31-disk-diffusion.png', [15, 19, 26, 27]],
  ],
  17: [
    ['lesson-assets/a2-biology/openstax-20-24-sandwich-elisa.png', [5, 6, 7, 8, 9, 10, 12, 13, 14, 19, 26, 27]],
    ['lesson-assets/a2-biology/openstax-17-10-cytokine-signalling.png', [11, 15, 20]],
  ],
};

const lessonPath = (lesson, page) => page === 5
  ? featured[lesson]
  : `a2-biology/a2-${String(lesson).padStart(3, '0')}-p${String(page).padStart(2, '0')}.png`;
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function inspect(relative) {
  const bytes = fs.readFileSync(path.join(publicDir, relative));
  const image = await loadImage(bytes);
  return {
    relative,
    bytes: bytes.length,
    width: image.width,
    height: image.height,
    signature: bytes.subarray(0, 8).toString('hex'),
  };
}

async function main() {
  const failures = [];
  const lessons = {};
  let verifiedOpenStaxCopies = 0;

  for (const lesson of [15, 16, 17]) {
    const decoded = [];
    for (let page = 1; page <= 30; page += 1) {
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
      pagesExpected: 30,
      pagesDecoded: decoded.length,
      totalBytes: decoded.reduce((sum, image) => sum + image.bytes, 0),
      dimensions: [...new Set(decoded.map((image) => `${image.width}x${image.height}`))],
    };
  }

  console.log(JSON.stringify({ lessons, verifiedOpenStaxCopies, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

