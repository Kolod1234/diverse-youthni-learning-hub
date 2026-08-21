const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader','--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'],
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 620 }, deviceScaleFactor: 1 });
  const problems = [];
  const requests = [];
  page.on('pageerror', e => problems.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type()==='error') problems.push('CONSOLE: ' + m.text().slice(0,200)); });
  page.on('request', r => { const u=r.url(); if(!u.startsWith('file://')) requests.push(u.slice(0,120)); });
  page.on('requestfailed', r => problems.push('REQFAIL: ' + r.url().slice(0,120)));

  await page.goto('file:///app/dist-labshot/labshot.html', { waitUntil:'load', timeout:60000 });
  await page.waitForSelector('canvas', { timeout:60000 });
  await page.waitForTimeout(30000);

  // Is anything actually drawn? Sample the canvas pixels.
  const stats = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const g = document.createElement('canvas');
    g.width = c.width; g.height = c.height;
    g.getContext('2d').drawImage(c, 0, 0);
    const d = g.getContext('2d').getImageData(0,0,g.width,g.height).data;
    const seen = new Set(); let lum = 0, n = 0;
    for (let i=0;i<d.length;i+=4*97){
      seen.add((d[i]>>4)+','+(d[i+1]>>4)+','+(d[i+2]>>4));
      lum += (d[i]+d[i+1]+d[i+2])/3; n++;
    }
    return { w:c.width, h:c.height, distinctColours: seen.size, meanLuminance: +(lum/n).toFixed(1) };
  });

  fs.mkdirSync('/tmp/shots', { recursive:true });
  await page.screenshot({ path:'/tmp/shots/lab-fixed.png', animations:'disabled', timeout:120000 });
  console.log('CANVAS_STATS ' + JSON.stringify(stats));
  console.log('EXTERNAL_REQUESTS ' + JSON.stringify([...new Set(requests)]));
  console.log('PROBLEMS ' + JSON.stringify(problems.slice(0,8)));
  await browser.close();
})();
