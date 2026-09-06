const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadImage } = require('canvas');

const publicDir = path.resolve('public');
const featured = {
  10: 'lesson-assets/a2-biology/a2-immunity-10-humoral-cell-mediated-photorealistic.png',
  11: 'lesson-assets/a2-biology/a2-immunity-11-antibody-phagocytosis-photorealistic.png',
};
const pageCounts = { 9: 36, 10: 30, 11: 30 };
const expectedCopies = {
  9: [
    ['lesson-assets/a2-biology/openstax-21-12-innate-adaptive.png', [3, 14, 23, 36]],
    ['lesson-assets/a2-biology/openstax-21-21-antibody-structure.png', [19]],
    ['lesson-assets/a2-biology/openstax-42-25-affinity-specificity.png', [20]],
    ['lesson-assets/a2-biology/openstax-42-24-antibody-functions.png', [21]],
  ],
  10: [
    ['lesson-assets/a2-biology/openstax-42-11-helper-t-coordination.png', [5, 10, 12]],
    ['lesson-assets/a2-biology/openstax-42-16-b-cell-activation.png', [8, 9]],
    ['lesson-assets/a2-biology/openstax-21-23-b-cell-clonal-selection.png', [11]],
    ['lesson-assets/a2-biology/openstax-21-19-t-cell-clonal-selection.png', [19]],
    ['lesson-assets/a2-biology/openstax-42-17-primary-secondary.png', [15, 26]],
  ],
  11: [
    ['lesson-assets/a2-biology/openstax-42-25-affinity-specificity.png', [6]],
    ['lesson-assets/a2-biology/openstax-42-8-phagocytosis-apc.png', [11, 12, 13]],
    ['lesson-assets/a2-biology/openstax-42-24-antibody-functions.png', [14, 19, 20]],
  ],
};

const lessonPath = (lesson, page) => {
  if (page === 5 && featured[lesson]) return featured[lesson];
  return `a2-biology/a2-${String(lesson).padStart(3, '0')}-p${String(page).padStart(2, '0')}.png`;
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function inspect(relative) {
  const file = path.join(publicDir, relative);
  const bytes = fs.readFileSync(file);
  const signature = bytes.subarray(0, 8).toString('hex');
  const image = await loadImage(bytes);
  return { relative, bytes: bytes.length, width: image.width, height: image.height, signature };
}

async function main() {
  const failures = [];
  const lessons = {};
  let verifiedOpenStaxCopies = 0;

  for (const lesson of [9, 10, 11]) {
    const decoded = [];
    for (let page = 1; page <= pageCounts[lesson]; page += 1) {
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
        const source = await inspect(sourceRelative);
        if (source.signature !== '89504e470d0a1a0a') failures.push({ lesson, sourceRelative, error: 'OpenStax source is not PNG' });
        const sourceHash = sha256(path.join(publicDir, sourceRelative));
        for (const page of pages) {
          const copyRelative = lessonPath(lesson, page);
          const matches = sourceHash === sha256(path.join(publicDir, copyRelative));
          verifiedOpenStaxCopies += Number(matches);
          if (!matches) failures.push({ lesson, page, copyRelative, sourceRelative, error: 'OpenStax copy hash mismatch' });
        }
      } catch (error) {
        failures.push({ lesson, sourceRelative, error: error.message });
      }
    }

    lessons[lesson] = {
      pagesExpected: pageCounts[lesson],
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

