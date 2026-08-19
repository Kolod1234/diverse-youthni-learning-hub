/**
 * Renders the 3D laboratory headlessly and writes PNG screenshots.
 * Used to visually check the scene without a desktop. Safe to delete.
 *
 *   node scripts/labshot.cjs
 */
const { chromium } = require('playwright');

const URL = process.env.LAB_URL || 'http://127.0.0.1:5173/labshot.html';
const OUT = process.env.LAB_OUT || '/tmp/shots';

/** Camera poses to capture, driven through the page's OrbitControls camera. */
const SHOTS = [
  { name: '01-bench-wide', pos: [1.9, 1.95, 2.3], target: [0, 1.05, -0.1] },
  { name: '02-burette-flask', pos: [0.55, 1.35, 0.75], target: [0.02, 1.15, -0.16] },
  { name: '03-room', pos: [2.9, 2.5, 3.4], target: [0, 1.2, -0.6] },
  { name: '04-cupboard', pos: [1.4, 1.9, 1.1], target: [1.55, 1.6, -2.2] },
];

(async () => {
  const browser = await chromium.launch({
    args: [
      '--enable-unsafe-swiftshader',
      '--use-gl=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });

  // Wait for the canvas to exist and actually have drawn something.
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.waitForTimeout(9000);

  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return c ? { w: c.width, h: c.height } : null;
  });
  console.log('CANVAS:', JSON.stringify(info));
  console.log('ERRORS:', JSON.stringify(errors.slice(0, 8)));

  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });

  for (const shot of SHOTS) {
    // Reach into the R3F store to move the camera for each pose.
    await page.evaluate(({ pos, target }) => {
      const c = document.querySelector('canvas');
      const store = c && (c.__r3f?.root?.getState ? c.__r3f.root.getState() : null);
      if (!store) return false;
      store.camera.position.set(pos[0], pos[1], pos[2]);
      store.camera.lookAt(target[0], target[1], target[2]);
      store.camera.updateProjectionMatrix();
      if (store.controls) {
        store.controls.target.set(target[0], target[1], target[2]);
        store.controls.update();
      }
      store.invalidate && store.invalidate();
      return true;
    }, shot);

    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${shot.name}.png` });
    console.log('shot:', shot.name);
  }

  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
