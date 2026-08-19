const fs = require('fs');
const { chromium } = require('playwright');

const URL = 'file:///app/dist-labshot/labshot.html';
const OUT = '/tmp/shots';

const SHOTS = [
  { name: '01-bench',     pos: [1.5, 1.75, 1.9],   target: [0, 1.05, -0.15] },
  { name: '02-apparatus', pos: [0.62, 1.35, 0.78], target: [0.02, 1.12, -0.16] },
  { name: '03-room',      pos: [3.1, 2.6, 3.6],    target: [0, 1.1, -0.7] },
  { name: '04-bottles',   pos: [-0.35, 1.35, 0.55],target: [-0.5, 1.0, -0.26] },
];

(async () => {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 875 }, deviceScaleFactor: 2 });

  const problems = [];
  page.on('pageerror', e => problems.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') problems.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.waitForTimeout(12000);

  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
    return { canvas: c ? c.width + 'x' + c.height : 'none',
             gl: gl ? gl.getParameter(gl.VERSION) : 'no gl',
             hasR3F: !!(c && c.__r3f) };
  });
  console.log('INFO:', JSON.stringify(info));
  console.log('PROBLEMS:', JSON.stringify(problems.slice(0,6)));

  fs.mkdirSync(OUT, { recursive: true });

  for (const s of SHOTS) {
    const moved = await page.evaluate(({ pos, target }) => {
      const c = document.querySelector('canvas');
      const root = c && c.__r3f && c.__r3f.root;
      const st = root && root.getState ? root.getState() : null;
      if (!st) return false;
      st.camera.position.set(pos[0], pos[1], pos[2]);
      if (st.controls && st.controls.target) {
        st.controls.target.set(target[0], target[1], target[2]);
        st.controls.update();
      } else { st.camera.lookAt(target[0], target[1], target[2]); }
      st.camera.updateProjectionMatrix();
      return true;
    }, s);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: OUT + '/' + s.name + '.png' });
    console.log('shot ' + s.name + ' moved=' + moved);
  }
  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
