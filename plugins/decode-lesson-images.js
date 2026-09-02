import fs from 'node:fs'
import path from 'node:path'

/**
 * Lesson diagrams are stored in the repo as base64 text (assets-b64/**.b64)
 * because the tooling that writes them can only persist text files.
 * This plugin decodes each one into a real binary file under public/
 * before dev-server start and before build, so <img src="/a2-biology/x.png">
 * resolves to an actual PNG.
 *
 *   assets-b64/a2-biology/a2-001-p01.png.b64  ->  public/a2-biology/a2-001-p01.png
 */

const SRC = 'assets-b64'
const OUT = 'public'

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

function decodeAll() {
  const src = path.resolve(process.cwd(), SRC)
  let written = 0
  for (const file of walk(src)) {
    if (!file.endsWith('.b64')) continue
    const rel = path.relative(src, file).replace(/\.b64$/, '')
    const out = path.resolve(process.cwd(), OUT, rel)
    try {
      const b64 = fs.readFileSync(file, 'utf8').replace(/\s+/g, '')
      const buf = Buffer.from(b64, 'base64')
      if (!buf.length) continue
      if (fs.existsSync(out) && fs.statSync(out).size === buf.length) continue
      fs.mkdirSync(path.dirname(out), { recursive: true })
      fs.writeFileSync(out, buf)
      written++
    } catch {
      // a single bad asset must never break the build
    }
  }
  return written
}

export default function decodeLessonImages() {
  return {
    name: 'decode-lesson-images',
    enforce: 'pre',
    buildStart() {
      decodeAll()
    },
    configureServer() {
      decodeAll()
    },
  }
}
