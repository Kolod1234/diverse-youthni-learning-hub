const fs = require('fs');
const { chromium } = require('playwright');
const URL = 'file:///app/dist-labshot/labshot.html';
const OUT = '/tmp/shots';

(async () => {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'],
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 690 }, deviceScaleFactor: 1 });

  const problems = [];
  page.on('pageerror', e => problems.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') problems.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  console.log('canvas present, warming up (software GL is slow)...');
  await page.waitForTimeout(25000);
  console.log('PROBLEMS:', JSON.stringify(problems.slice(0,6)));

  fs.mkdirSync(OUT, { recursive: true });
  const snap = async (name) => {
    await page.screenshot({ path: OUT + '/' + name + '.png', animations: 'disabled', timeout: 120000 });
    console.log('shot ' + name);
  };

  // 1. The view a student sees on load.
  await snap('01-default-view');

  // Orbit by dragging on the canvas (OrbitControls).
  const drag = async (dx, dy) => {
    await page.mouse.move(550, 380);
    await page.mouse.down();
    await page.mouse.move(550 + dx, 380 + dy, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(6000);
  };

  await drag(-230, 40);   await snap('02-orbit-left');
  await drag(430, -20);   await snap('03-orbit-right');
  await drag(-190, -110); await snap('04-from-above');

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
