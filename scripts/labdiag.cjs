/** Diagnostic: load the lab page and report exactly what the browser says. */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  const logs = [];
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} :: ${r.failure()?.errorText}`));

  try {
    await page.goto('http://127.0.0.1:5173/labshot.html', { waitUntil: 'load', timeout: 45000 });
  } catch (e) {
    logs.push('[goto] ' + e.message);
  }

  await page.waitForTimeout(12000);

  const dom = await page.evaluate(() => ({
    rootHtml: (document.getElementById('labroot')?.innerHTML || '').slice(0, 400),
    canvases: document.querySelectorAll('canvas').length,
    bodyLen: document.body.innerHTML.length,
  }));

  console.log('DOM:', JSON.stringify(dom, null, 2));
  console.log('--- browser messages ---');
  logs.slice(0, 30).forEach((l) => console.log(l.slice(0, 300)));

  await browser.close();
})();
