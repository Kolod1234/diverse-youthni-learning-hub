// Shared helpers for LLM-driven lesson HTML rewrites.

// Math-token comparison must be insensitive to how special characters are
// HTML-encoded: the model may emit raw & < > where stored lesson HTML uses
// &amp; &lt; &gt; (or the reverse). Decoding entities inside each token keeps
// the comparison focused on the mathematics itself; callers re-canonicalise
// accepted output before persisting.
const ENTITY_RE = /&(amp|lt|gt|nbsp|quot|apos|#x[0-9a-fA-F]+|#\d+);/g;

export function decodeEntities(str: string): string {
  return str.replace(ENTITY_RE, (e) => {
    const body = e.slice(1, -1);
    if (body.startsWith('#x')) return String.fromCodePoint(parseInt(body.slice(2), 16));
    if (body.startsWith('#')) return String.fromCodePoint(parseInt(body.slice(1), 10));
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"', apos: "'" };
    return body in named ? named[body] : e;
  });
}

export function mathTokens(html: string): string[] {
  return ((html || '').match(/\$\$?[^$]+\$\$?/g) || [])
    .map((t) => decodeEntities(t).replace(/\s+/g, ''));
}

export function mathTokensKey(html: string): string {
  return mathTokens(html).sort().join('|');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Rewrites each maths span into the stored canonical form: decode HTML
// entities, then re-escape raw < and > so the browser never parses them as
// markup at render time (matches the escapeMathOperators convention).
// Spans that contain HTML tags are skipped: they are not real maths (an
// unpaired currency "$" pairing across markup) and escaping their tags
// would corrupt the HTML.
export function canonicaliseMathSpans(html: string): string {
  return (html || '').replace(/\$\$?[^$]+\$\$?/g, (span) => {
    const decoded = decodeEntities(span);
    if (/<\/?[a-zA-Z!]/.test(decoded)) return span;
    return decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
}

// --- Micro-step rewrite preservation checks ---
// A rewrite that legitimately splits a relation chain such as $a=b=c$ across
// separate steps must not be rejected just because the full chain no longer
// appears verbatim: a token survives if it reappears verbatim, or if the
// RESULT of its chain still appears somewhere in the rewritten HTML.
export const normaliseMath = (s: string) =>
  decodeEntities(s || '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\text|\\mathrm|\\operatorname/g, '')
    .replace(/\\[,;:!]|~/g, '')
    .replace(/[{}\s]/g, '')
    .replace(/\(\d+(s\.f\.|d\.p\.|sf|dp)\)/gi, '');

// The rewritten HTML, with tags removed, so a value that legitimately moves
// between maths mode and surrounding text (e.g. "$6$ cm" for "$6\text{cm}$")
// is still recognised.
export const mathPlainBlob = (html: string) => normaliseMath(html.replace(/<[^>]+>/g, ' '));

// Last resort comparison: LaTeX commands and grouping punctuation dropped, so
// only the numbers, letters and operators of the result have to survive.
export const mathLooseBlob = (blob: string) => blob.replace(/\\[a-zA-Z]+/g, '').replace(/[()[\]$,]/g, '');

// Returns the original maths tokens that the rewritten HTML no longer
// preserves (verbatim, via their chain results, or loosely). Empty = safe.
export function lostMathTokens(original: string, rewritten: string): string[] {
  const tokenSet = new Set(mathTokens(rewritten));
  const blob = mathPlainBlob(rewritten);
  const loose = mathLooseBlob(blob);
  return mathTokens(original).filter((t) => {
    if (tokenSet.has(t)) return false;
    const parts = t
      .replace(/^\$\$?/, '')
      .replace(/\$\$?$/, '')
      .split(/=|<|>|\\leq?(?![a-zA-Z])|\\geq?(?![a-zA-Z])|\\Rightarrow|\\to(?![a-zA-Z])/)
      .map(normaliseMath)
      .filter(Boolean);
    const result = parts[parts.length - 1];
    if (!result) return true;
    if (blob.includes(result)) return false;
    return !loose.includes(mathLooseBlob(result));
  });
}

export async function invokeWithRetry(base44, prompt: string, model?: string) {
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        ...(model ? { model } : {}),
        response_json_schema: {
          type: 'object',
          properties: { html: { type: 'string' }, changed: { type: 'boolean' } }
        }
      });
    } catch (err) {
      lastError = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastError;
}

// Plain-text LLM invocation for HTML rewriting. Avoids response_json_schema:
// JSON string escaping silently corrupts LaTeX backslash commands when the
// model under-escapes (\frac decodes to a form feed, eating the backslash).
export async function invokeTextWithRetry(base44, prompt: string, model?: string): Promise<string> {
  let lastError: any = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        ...(model ? { model } : {})
      });
      return typeof res === 'string' ? res : ((res && (res.text || res.html)) || String(res));
    } catch (err) {
      lastError = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastError;
}

export async function mapWithLimit(items, limit: number, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    runners.push(
      (async () => {
        while (next < items.length) {
          const index = next++;
          results[index] = await worker(items[index], index);
        }
      })()
    );
  }
  await Promise.all(runners);
  return results;
}