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

  // Large assets are written in numbered parts (name.b64.part1, .part2, ...)
  // because the tooling that produces them has a per-write size limit.
  // Group those so each asset is reassembled in order before decoding.
  const groups = new Map()
  for (const file of walk(src)) {
    const m = file.match(/^(.*\.b64)\.part(\d+)$/)
    const key = m ? m[1] : file
    if (!key.endsWith('.b64')) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ file, part: m ? Number(m[2]) : 0 })
  }

  for (const [key, parts] of groups) {
    const rel = path.relative(src, key).replace(/\.b64$/, '')
    const out = path.resolve(process.cwd(), OUT, rel)
    try {
      parts.sort((a, b) => a.part - b.part)
      const b64 = parts
        .map((p) => fs.readFileSync(p.file, 'utf8'))
        .join('')
        .replace(/\s+/g, '')
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
