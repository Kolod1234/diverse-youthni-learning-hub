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