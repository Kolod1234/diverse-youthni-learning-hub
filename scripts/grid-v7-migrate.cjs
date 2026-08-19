/**
 * MUI v7 Grid migration.
 *
 * In MUI 7 the legacy grid moved to `GridLegacy` and `Grid` became the v2 API:
 *   <Grid item xs={12} md={6}>  ->  <Grid size={{ xs: 12, md: 6 }}>
 *   <Grid item xs={12}>         ->  <Grid size={12}>
 *   <Grid item>                 ->  <Grid>
 * `container`, `spacing`, `sx`, `key` and everything else are left untouched.
 *
 * Operates on the raw source text with a brace/string-aware scanner so that
 * existing formatting is preserved exactly (unlike a jscodeshift reprint).
 *
 * Usage: node scripts/grid-v7-migrate.cjs [--apply]   (default is a dry run)
 */
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..', 'src');
const BPS = ['xs', 'sm', 'md', 'lg', 'xl'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx|js|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Find the index of the `>` closing the tag that starts at `start`. */
function findTagEnd(src, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return i;
  }
  return -1;
}

/** Split a tag's attribute region into {name, raw, value} tokens. */
function parseAttrs(s) {
  const attrs = [];
  let i = 0;
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    // spread attribute {...props}
    if (s[i] === '{') {
      const end = matchBrace(s, i);
      attrs.push({ name: null, raw: s.slice(i, end + 1) });
      i = end + 1;
      continue;
    }
    const nameMatch = /^[A-Za-z_$][A-Za-z0-9_$:.-]*/.exec(s.slice(i));
    if (!nameMatch) { i++; continue; }
    const name = nameMatch[0];
    let j = i + name.length;
    while (j < s.length && /\s/.test(s[j])) j++;
    if (s[j] !== '=') {           // bare attribute, e.g. `item`
      attrs.push({ name, raw: name, value: null });
      i = i + name.length;
      continue;
    }
    j++;
    while (j < s.length && /\s/.test(s[j])) j++;
    let valEnd;
    if (s[j] === '{') valEnd = matchBrace(s, j);
    else if (s[j] === '"' || s[j] === "'") valEnd = s.indexOf(s[j], j + 1);
    else { valEnd = j; while (valEnd < s.length && !/\s/.test(s[valEnd])) valEnd++; valEnd--; }
    attrs.push({ name, raw: s.slice(i, valEnd + 1), value: s.slice(j, valEnd + 1) });
    i = valEnd + 1;
  }
  return attrs;
}

function matchBrace(s, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote && s[i - 1] !== '\\') quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return s.length - 1;
}

/** Strip the outer braces of a JSX expression value: `{12}` -> `12`. */
function unwrap(v) {
  return v && v[0] === '{' ? v.slice(1, -1).trim() : v;
}

function transformTag(tag) {
  const selfClosing = /\/>$/.test(tag);
  const inner = tag.slice('<Grid'.length, tag.length - (selfClosing ? 2 : 1));
  const attrs = parseAttrs(inner);

  const hasItem = attrs.some((a) => a.name === 'item');
  const bpAttrs = attrs.filter((a) => a.name && BPS.includes(a.name));
  if (!hasItem && bpAttrs.length === 0) return tag; // container / already-migrated

  const sizeParts = [];
  for (const bp of BPS) {
    const a = bpAttrs.find((x) => x.name === bp);
    if (a) sizeParts.push([bp, unwrap(a.value)]);
  }

  let sizeAttr = null;
  if (sizeParts.length === 1 && sizeParts[0][0] === 'xs') {
    sizeAttr = `size={${sizeParts[0][1]}}`;          // xs-only is the shorthand
  } else if (sizeParts.length > 0) {
    sizeAttr = `size={{ ${sizeParts.map(([k, v]) => `${k}: ${v}`).join(', ')} }}`;
  }

  const out = [];
  let placed = false;
  for (const a of attrs) {
    if (a.name === 'item') {                          // dropped
      if (sizeAttr && !placed) { out.push(sizeAttr); placed = true; }
      continue;
    }
    if (a.name && BPS.includes(a.name)) {
      if (sizeAttr && !placed) { out.push(sizeAttr); placed = true; }
      continue;
    }
    out.push(a.raw);
  }
  if (sizeAttr && !placed) out.push(sizeAttr);

  return `<Grid${out.length ? ' ' + out.join(' ') : ''}${selfClosing ? ' />' : '>'}`;
}

let totalTags = 0;
let totalFiles = 0;
const samples = [];

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('<Grid')) continue;

  let out = '';
  let i = 0;
  let count = 0;

  while (true) {
    const idx = src.indexOf('<Grid', i);
    if (idx === -1) break;
    const after = src[idx + 5];
    if (!/[\s/>]/.test(after)) { out += src.slice(i, idx + 5); i = idx + 5; continue; }
    const end = findTagEnd(src, idx);
    if (end === -1) break;
    const tag = src.slice(idx, end + 1);
    const newTag = transformTag(tag);
    out += src.slice(i, idx) + newTag;
    if (newTag !== tag) {
      count++;
      if (samples.length < 12) samples.push({ file: path.relative(ROOT, file), before: tag, after: newTag });
    }
    i = end + 1;
  }
  out += src.slice(i);

  if (count > 0) {
    totalFiles++;
    totalTags += count;
    if (APPLY) fs.writeFileSync(file, out);
  }
}

console.log(samples.map((s) => `  ${s.file}\n    - ${s.before}\n    + ${s.after}`).join('\n'));
console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${totalTags} Grid tags across ${totalFiles} files`);
