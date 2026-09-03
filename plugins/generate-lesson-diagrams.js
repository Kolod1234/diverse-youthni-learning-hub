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
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Every lesson generator registered here. Each module exports:
//   { dir: 'a2-biology', prefix: 'a2-001-p', pages: [fn, fn, ...] }
// where each fn(kit) returns a Diagram ready to be encoded.
const GENERATORS = [
  'diagrams/lesson01.js',
];

export default function generateLessonDiagrams() {
  let done = false;

  const run = (logger) => {
    if (done) return;
    done = true;

    const log = (m) => (logger ? logger.info(m) : console.log(m));
    const warn = (m) => (logger ? logger.warn(m) : console.warn(m));

    let kit, quant;
    try {
      kit = require('./diagrams/diagkit.js');
      quant = require('./diagrams/quantpng.js');
    } catch (err) {
      warn(`[diagrams] skipped — drawing toolkit unavailable (${err.message})`);
      return;
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

      mod.pages.forEach((draw, i) => {
        const n = String(i + 1).padStart(2, '0');
        const file = path.join(outDir, `${mod.prefix}${n}.png`);
        try {
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
