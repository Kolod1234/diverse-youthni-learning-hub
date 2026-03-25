import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  bbceducation: 'https://feeds.bbci.co.uk/news/education/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition.rss',
  guardian: 'https://www.theguardian.com/uk/rss',
  skynews: 'https://feeds.skynews.com/feeds/rss/home.xml',
  independent: 'https://www.independent.co.uk/news/rss',
  dailymail: 'https://www.dailymail.co.uk/news/index.rss',
  mirror: 'https://www.mirror.co.uk/news/rss.xml',
  ocnni: 'https://ocnni.org.uk/feed/',
  ukhomeoffice: 'https://homeofficemedia.blog.gov.uk/feed/',
  migrantni: 'https://migrantni.org/feed/',
  eani: 'https://www.eani.org.uk/news-and-events/feed',
  deni: 'https://www.education-ni.gov.uk/rss/news.xml',
  govuk: 'https://www.gov.uk/government/organisations/department-for-education.atom',
  ukparliament: 'https://www.parliament.uk/site-information/rss-feeds/rss-education/',
};

// FIX #2: Named constant instead of a silent magic number in .slice()
const MAX_ITEMS_PER_FEED = 5;

function getMsg(e) {
  return e && e['message'] ? e['message'] : String(e);
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function getTextContent(xmlText, tagName) {
  const regex = new RegExp('<' + tagName + '(?:[^>]*)>([\\s\\S]*?)<\\/' + tagName + '>', 'i');
  const match = xmlText.match(regex);
  return match ? cleanText(match[1]) : null;
}

function extractImageFromContent(content) {
  if (!content) return null;
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = content.match(imgRegex);
  if (match) return match[1];
  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/i;
  const urlMatch = content.match(urlRegex);
  return urlMatch ? urlMatch[1] : null;
}

// FIX #6: Safe date parser — guards against malformed pubDate strings
// that would cause new Date(pubDate).toISOString() to throw a RangeError.
function safeToISOString(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

// IMAGE FIX: Replaces the previous single-match approach with a function that
// collects ALL media:thumbnail and media:content candidates from an item block,
// picks the one with the largest declared width, and then applies source-specific
// URL rewrites to upgrade low-resolution URLs to their full-resolution equivalents.
//
// Root causes of blurry images per source:
//
//   BBC          — media:thumbnail is always 240px wide. The URL path contains
//                  the size token "standard/240" which can be rewritten to
//                  "standard/1024" (or higher) to get a full-resolution image.
//
//   The Guardian — publishes multiple media:content elements per item, each with
//                  a different ?width= query parameter (140, 460, 700). The old
//                  code matched the FIRST one (140px). We now pick the widest.
//
//   Daily Mail   — provides both a large media:content (full image, no size attr)
//                  and a small media:thumbnail (154px wide). The old code matched
//                  the thumbnail first. We now prefer the unsized media:content.
//
//   Sky News     — already provides 1920×1080 images; no rewrite needed.
//   Independent  — already provides 1200px images; no rewrite needed.

function getBestImageUrl(xmlBlock) {
  // Collect all media:thumbnail and media:content candidates with their widths.
  const candidates: Array<{ url: string; width: number }> = [];

  // Match all media:thumbnail tags and record their width attribute (if present).
  for (const m of xmlBlock.matchAll(/<media:thumbnail([^>]*)>/gi)) {
    const attrs = m[1];
    const urlMatch = attrs.match(/url=["']([^"']+)["']/i);
    const widthMatch = attrs.match(/width=["']?(\d+)["']?/i);
    if (urlMatch) {
      candidates.push({
        url: urlMatch[1],
        width: widthMatch ? parseInt(widthMatch[1], 10) : 0,
      });
    }
  }

  // Match all media:content tags that carry an image MIME type or no type at all.
  for (const m of xmlBlock.matchAll(/<media:content([^>]*)>/gi)) {
    const attrs = m[1];
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
    // Skip non-image media:content (e.g. video)
    if (typeMatch && !typeMatch[1].startsWith('image')) continue;
    const urlMatch = attrs.match(/url=["']([^"']+)["']/i);
    const widthMatch = attrs.match(/width=["']?(\d+)["']?/i);
    if (urlMatch) {
      candidates.push({
        url: urlMatch[1],
        // Unsized media:content (e.g. Daily Mail full image) gets a high default
        // so it is preferred over explicitly small thumbnails.
        width: widthMatch ? parseInt(widthMatch[1], 10) : 9999,
      });
    }
  }

  // FIX #3: Closed the type attribute pattern to correctly match MIME types
  // like image/jpeg, image/png, etc., without false-matching other values.
  if (candidates.length === 0) {
    const enclosureMatch = xmlBlock.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i);
    if (enclosureMatch) return enclosureMatch[1];
    const genericImage = xmlBlock.match(/<image[^>]*url=["']([^"']+)["']/i);
    if (genericImage) return genericImage[1];
    return null;
  }

  // Pick the candidate with the largest declared width.
  candidates.sort((a, b) => b.width - a.width);
  let bestUrl = candidates[0].url;

  // Decode HTML entities in the URL (e.g. Guardian uses &amp; in query strings).
  bestUrl = bestUrl.replace(/&amp;/g, '&');

  // SOURCE-SPECIFIC REWRITES
  // BBC: "standard/240/" → "standard/1024/" for a full-resolution image.
  bestUrl = bestUrl.replace(
    /(ichef\.bbci\.co\.uk\/ace\/standard\/)(\d+)\//i,
    '$11024/'
  );

  // Guardian: strip the ?width= query parameter so the CDN serves the master image.
  // The base filename already points to the highest-quality source file.
  if (bestUrl.includes('i.guim.co.uk')) {
    bestUrl = bestUrl.replace(/\?.*$/, '');
  }

  return bestUrl;
}

async function parseRSSFeed(xmlText) {
  const items = [];

  const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi);

  for (const match of itemMatches) {
    const itemXml = match[1];

    const title = getTextContent(itemXml, 'title');
    let description = getTextContent(itemXml, 'description') ||
                      getTextContent(itemXml, 'content:encoded') ||
                      getTextContent(itemXml, 'content') || '';
    const link = getTextContent(itemXml, 'link') || getTextContent(itemXml, 'guid');
    const pubDate = getTextContent(itemXml, 'pubDate') ||
                    getTextContent(itemXml, 'dc:date') ||
                    getTextContent(itemXml, 'date');

    // IMAGE FIX: use getBestImageUrl instead of first-match approach.
    const imageUrl = getBestImageUrl(itemXml) || extractImageFromContent(description);

    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (title && cleanDesc && link) {
      items.push({
        title: title.substring(0, 200),
        description: cleanDesc.substring(0, 500),
        link,
        image_url: imageUrl,
        published_date: safeToISOString(pubDate), // FIX #6 applied
      });
    }
  }

  if (items.length === 0) {
    const entryMatches = xmlText.matchAll(/<entry>([\s\S]*?)<\/entry>/gi);

    for (const match of entryMatches) {
      const entryXml = match[1];

      const title = getTextContent(entryXml, 'title');
      let description = getTextContent(entryXml, 'summary') ||
                        getTextContent(entryXml, 'content') || '';
      const linkMatch = entryXml.match(/<link[^>]+href=["']([^"']+)["']/i);
      const link = linkMatch ? linkMatch[1] : null;
      const pubDate = getTextContent(entryXml, 'updated') ||
                      getTextContent(entryXml, 'published');

      // IMAGE FIX: use getBestImageUrl instead of first-match approach.
      const imageUrl = getBestImageUrl(entryXml) || extractImageFromContent(description);

      const cleanDesc = description
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (title && cleanDesc && link) {
        items.push({
          title: title.substring(0, 200),
          description: cleanDesc.substring(0, 500),
          link,
          image_url: imageUrl,
          published_date: safeToISOString(pubDate), // FIX #6 applied
        });
      }
    }
  }

  return items;
}

async function fetchFeed(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSSImporter/1.0)' },
      signal: controller['signal'],
    });
    if (!response.ok) {
      clearTimeout(timeoutId);
      return null;
    }
    // FIX #5: clearTimeout moved to AFTER response.text() completes so that
    // slow body streams are also covered by the 5-second abort guard.
    const text = await response.text();
    clearTimeout(timeoutId);
    return text;
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let source;
    try {
      const body = await req.json();
      source = body['source'];
    } catch (e) {
      source = null;
    }

    const sourcesToImport = source && RSS_FEEDS[source] ? [source] : Object.keys(RSS_FEEDS);

    const results = [];
    let totalImported = 0;

    // Fetch all feeds in parallel to save time
    const fetchPromises = sourcesToImport.map(async (currentSource) => {
      try {
        const feedUrl = RSS_FEEDS[currentSource];
        const xmlText = await fetchFeed(feedUrl);

        if (!xmlText) {
          // FIX #1: Removed the misleading `imported: []` field from fetch-phase results.
          return { source: currentSource.toUpperCase(), error: 'Failed to fetch or timed out' };
        }

        const items = await parseRSSFeed(xmlText);
        // FIX #1: Removed the misleading `imported: []` field from fetch-phase results.
        return { source: currentSource.toUpperCase(), items };
      } catch (e) {
        // FIX #1: Removed the misleading `imported: []` field from fetch-phase results.
        return { source: currentSource.toUpperCase(), error: getMsg(e) };
      }
    });

    const feedResults = await Promise.all(fetchPromises);

    // Now save to DB sequentially
    for (const feedResult of feedResults) {
      if (feedResult['error']) {
        results.push({ source: feedResult['source'], error: feedResult['error'] });
        continue;
      }

      const imported = [];
      // FIX #2: Use named constant MAX_ITEMS_PER_FEED instead of a silent magic number.
      for (const item of (feedResult['items'] || []).slice(0, MAX_ITEMS_PER_FEED)) {
        try {
          const existing = await base44.asServiceRole.entities.RSSFeed.filter({ link: item['link'] });
          if (existing.length === 0) {
            const created = await base44.asServiceRole.entities.RSSFeed.create({
              ...item,
              category: feedResult['source'],
            });
            imported.push(created);
          }
        } catch (e) {
          console.error('DB error for ' + feedResult['source'] + ': ' + getMsg(e));
        }
      }

      totalImported += imported.length;
      results.push({
        source: feedResult['source'],
        itemsFound: (feedResult['items'] || []).length,
        itemsImported: imported.length,
      });
    }

    return Response.json({
      success: true,
      totalImported,
      results,
      message: 'Imported ' + totalImported + ' new items from ' + results.length + ' sources',
    });

  } catch (e) {
    return Response.json({ error: getMsg(e), stack: e['stack'] }, { status: 500 });
  }
});