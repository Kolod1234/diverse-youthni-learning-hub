// Shared helpers for LLM-driven lesson HTML rewrites.

export function mathTokens(html: string): string[] {
  return ((html || '').match(/\$\$?[^$]+\$\$?/g) || []).map((t) => t.replace(/\s+/g, ''));
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