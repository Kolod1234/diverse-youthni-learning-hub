/* Vite plugin: draw the lesson diagrams at build time.
 *
 * Lesson slides reference /a2-biology/a2-00N-pMM.png. Rather than storing 240
 * binary files, each diagram is a small drawing function; this plugin runs them
 * on buildStart (and when the dev server boots) and writes the PNGs into public/.
 *
 * It is deliberately fail-soft: if node-canvas is unavailable on a build machine
 * the plugin logs and returns, leaving whatever files already exist. A missing
 * illustration is a much smaller problem than a build that will not deploy.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Every lesson generator registered here. Each module exports:
//   { dir: 'a2-biology', prefix: 'a2-001-p', pages: [fn, fn, ...] }
// where each fn(kit) returns a Diagram ready to be encoded.
const GENERATORS = [
  'diagrams/lesson01.js',
  'diagrams/lesson02.js',
  'diagrams/lesson03.js',
  'diagrams/lesson04.js',
  'diagrams/lesson05.js',
  'diagrams/lesson06.js',
  'diagrams/lesson07.js',
  'diagrams/lesson08.js',
  'diagrams/lesson09.js',
  'diagrams/lesson10.js',
  'diagrams/lesson11.js',
  'diagrams/lesson12.js',
  'diagrams/lesson13.js',
  'diagrams/lesson14.js',
  'diagrams/lesson15.js',
  'diagrams/lesson16.js',
  'diagrams/lesson17.js',
  'diagrams/lesson18.js',
  'diagrams/lesson19.js',
  'diagrams/lesson20.js',
  'diagrams/lesson21.js',
  'diagrams/lesson22.js',
  'diagrams/lesson23.js',
  'diagrams/lesson24.js',
  'diagrams/lesson25.js',
  'diagrams/lesson26.js',
  'diagrams/lesson27.js',
  'diagrams/lesson28.js',
  'diagrams/lesson29.js',
  'diagrams/lesson30.js',
  'diagrams/lesson31.js',
  'diagrams/lesson32.js',
  'diagrams/lesson33.js',
  'diagrams/lesson34.js',
  'diagrams/lesson35.js',
  'diagrams/lesson36.js',
  'diagrams/lesson37.js',
  'diagrams/lesson38.js',
  'diagrams/lesson39.js',
  'diagrams/lesson40.js',
  'diagrams/lesson41.js',
  'diagrams/lesson42.js',
  'diagrams/lesson43.js',
  'diagrams/lesson44.js',
  'diagrams/lesson45.js',
  'diagrams/lesson46.js',
  'diagrams/lesson47.js',
  'diagrams/lesson48.js',
  'diagrams/lesson49.js',
  'diagrams/lesson50.js',
  'diagrams/lesson51.js',
  'diagrams/lesson52.js',
];

export default function generateLessonDiagrams() {
  let done = false;

  const run = (logger) => {
    if (done) return;
    done = true;

    const log = (m) => (logger ? logger.info(m) : console.log(m));
    const warn = (m) => (logger ? logger.warn(m) : console.warn(m));

    // node-canvas ships a native binding that is not always present after a
    // clean install (install scripts may be skipped). Build it on demand once,
    // rather than silently shipping a lesson with no illustrations.
    let kit, quant;
    const load = () => {
      kit = require('./diagrams/diagkit.js');
      quant = require('./diagrams/quantpng.js');
    };
    try {
      load();
    } catch (first) {
      try {
        log('[diagrams] building the canvas binding (one-off)…');
        execSync('npm rebuild canvas', {
          cwd: path.resolve(HERE, '..'), stdio: 'ignore', timeout: 300000,
        });
        load();
      } catch (second) {
        warn(`[diagrams] skipped — drawing toolkit unavailable (${second.message})`);
        return;
      }
    }

    const publicDir = path.resolve(HERE, '..', 'public');
    let written = 0, bytes = 0;
    const faults = [];

    for (const rel of GENERATORS) {
      let mod;
      try {
        mod = require('./' + rel);
      } catch (err) {
        warn(`[diagrams] skipped ${rel} — ${err.message}`);
        continue;
      }

      const outDir = path.join(publicDir, mod.dir);
      try { fs.mkdirSync(outDir, { recursive: true }); } catch { /* ignore */ }

      mod.pages.forEach((page, i) => {
        const n = String(i + 1).padStart(2, '0');
        // A page is normally a draw function named by prefix+NN. Some slides
        // point at a different asset path, so those declare { path, draw }.
        // A page marked skip is served by a real image decoded from assets-b64,
        // so nothing must be drawn over it here.
        if (page && page.copyFrom) {
          const source = path.join(publicDir, page.copyFrom);
          const file = path.join(publicDir, page.path);
          try {
            if (!fs.existsSync(source)) throw new Error(`OpenStax source asset missing: ${page.copyFrom}`);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.copyFileSync(source, file);
            written++; bytes += fs.statSync(file).size;
          } catch (err) {
            faults.push(`${mod.prefix}${n}: threw ${err.message}`);
          }
          return;
        }
        if (page && page.skip) return;
        const draw = typeof page === 'function' ? page : page.draw;
        const file = page.path
          ? path.join(publicDir, page.path)
          : path.join(outDir, `${mod.prefix}${n}.png`);
        try {
          fs.mkdirSync(path.dirname(file), { recursive: true });
          const d = draw(kit);
          const bad = d.audit();
          if (bad.length) faults.push(`${mod.prefix}${n}: ${bad.join('; ')}`);
          const buf = quant.encodeDiagram(d, 16);
          fs.writeFileSync(file, buf);
          written++; bytes += buf.length;
        } catch (err) {
          faults.push(`${mod.prefix}${n}: threw ${err.message}`);
        }
      });
    }

    log(`[diagrams] wrote ${written} images, ${(bytes / 1024).toFixed(0)} kB total`);
    if (faults.length) {
      warn(`[diagrams] ${faults.length} layout fault(s):`);
      for (const f of faults) warn(`  - ${f}`);
    }
  };

  return {
    name: 'generate-lesson-diagrams',
    apply: () => true,
    buildStart() { try { run(this.warn ? null : null); } catch (e) { console.warn('[diagrams]', e.message); } },
    configureServer(server) { try { run(server.config.logger); } catch (e) { console.warn('[diagrams]', e.message); } },
  };
}
