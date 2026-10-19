// Shared server-side URL validation to prevent SSRF in backend functions
// that fetch caller-supplied file URLs. Rejects non-HTTPS schemes, private
// / link-local / loopback / metadata addresses, and known cloud metadata
// hostnames before any outbound fetch is performed.
//
// Usage:
//   import { assertSafeFetchUrl } from '../../shared/urlSafety.ts';
//   await assertSafeFetchUrl(file_url);            // throws UnsafeUrlError
//   const pdfResponse = await fetch(file_url);       // safe to fetch

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

const METADATA_HOSTS = new Set([
  'metadata.google.internal',
  '169.254.169.254',
  'metadata.aws.internal',
  'fd00:ec2::254',
  'localhost',
]);

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (/^127\./.test(v)) return true; // IPv4 loopback
  if (/^10\./.test(v)) return true; // private 10/8
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(v)) return true; // private 172.16/12
  if (/^192\.168\./.test(v)) return true; // private 192.168/16
  if (/^169\.254\./.test(v)) return true; // link-local
  if (/^0\./.test(v)) return true; // unspecified
  if (v === '::1') return true; // IPv6 loopback
  if (v.startsWith('fe80:')) return true; // IPv6 link-local
  if (/^f[cd][0-9a-f]{2}:/i.test(v)) return true; // IPv6 unique-local
  return false;
}

export interface SafeUrlOptions {
  /** Optional allowlist of hostnames (exact, case-insensitive). When set,
   *  a URL whose host is not in the list is rejected. */
  allowedHosts?: string[];
}

/** Validate a caller-supplied URL for server-side fetching. Throws
 *  UnsafeUrlError when the URL is not https, points at a private/reserved
 *  address, a cloud metadata endpoint, or (when allowedHosts is set) a host
 *  outside the allowlist. Returns the parsed URL on success. */
export async function assertSafeFetchUrl(
  rawUrl: string,
  opts: SafeUrlOptions = {},
): Promise<URL> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new UnsafeUrlError('A URL is required.');
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('Invalid URL.');
  }
  if (parsed.protocol !== 'https:') {
    throw new UnsafeUrlError('Only HTTPS URLs are permitted.');
  }
  const bareHost = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (METADATA_HOSTS.has(bareHost)) {
    throw new UnsafeUrlError('Requests to metadata endpoints are blocked.');
  }

  if (opts.allowedHosts && opts.allowedHosts.length > 0) {
    const allowed = opts.allowedHosts.map((h) => h.toLowerCase());
    if (!allowed.includes(bareHost)) {
      throw new UnsafeUrlError(`URL host "${bareHost}" is not permitted.`);
    }
  }

  // Literal IP check (covers direct IP addresses in the URL).
  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(bareHost);
  const isIpv6 = bareHost.includes(':');
  if ((isIpv4 || isIpv6) && isPrivateIp(bareHost)) {
    throw new UnsafeUrlError('Requests to private addresses are blocked.');
  }

  // Resolve the hostname and reject if any resolved address is private/reserved.
  // DNS failures are tolerated — the downstream fetch will fail naturally.
  try {
    const aRecords = await Deno.resolveDns(bareHost, 'A');
    if (aRecords.some((ip) => isPrivateIp(ip))) {
      throw new UnsafeUrlError('Host resolves to a private address.');
    }
  } catch (e) {
    if (e instanceof UnsafeUrlError) throw e;
  }
  try {
    const aaaaRecords = await Deno.resolveDns(bareHost, 'AAAA');
    if (aaaaRecords.some((ip) => isPrivateIp(ip))) {
      throw new UnsafeUrlError('Host resolves to a private address.');
    }
  } catch (e) {
    if (e instanceof UnsafeUrlError) throw e;
  }

  return parsed;
}
// ---------------------------------------------------------------------------
// App-file fetching. Functions that load a file the caller points at (a PDF
// to analyse, a page to extract) should only ever read THIS app's own uploads,
// never an arbitrary website. Each redirect hop is checked too, so a
// permitted URL can't bounce the request somewhere else.
const APP_ID = '69418fc30769c7d951368216';
const APP_FILE_RULES: Array<{ host: string; pathIncludes: string }> = [
  { host: 'base44.app', pathIncludes: `/apps/${APP_ID}/files/` },
  { host: 'media.base44.com', pathIncludes: `/files/public/${APP_ID}/` },
  { host: 'qtrypzzcjebvfcihiynt.supabase.co', pathIncludes: `/${APP_ID}/` },
];

export function isAppFileUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    return u.protocol === 'https:' &&
      APP_FILE_RULES.some((r) => u.hostname.toLowerCase() === r.host && u.pathname.includes(r.pathIncludes));
  } catch {
    return false;
  }
}

/** Fetch one of this app's uploaded files without sending any credentials.
 *  Throws UnsafeUrlError for anything that isn't an app file. */
export async function fetchAppFile(rawUrl: string, maxRedirects = 3): Promise<Response> {
  let url = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!isAppFileUrl(url)) throw new UnsafeUrlError('Only files uploaded to this app can be used.');
    await assertSafeFetchUrl(url);
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get('location');
      if (!next) throw new UnsafeUrlError('Redirect without a location.');
      url = new URL(next, url).toString();
      continue;
    }
    return res;
  }
  throw new UnsafeUrlError('Too many redirects.');
}
