import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  bbceducation: 'https://feeds.bbci.co.uk/news/education/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition.rss',
  msn: 'https://www.msn.com/en-gb/news/rss',
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

    let imageUrl = null;

    const anyThumb = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
    if (anyThumb) imageUrl = anyThumb[1];

    if (!imageUrl) {
      const anyMedia = itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      if (anyMedia) imageUrl = anyMedia[1];
    }

    if (!imageUrl) {
      // FIX #3: Closed the type attribute pattern to correctly match MIME types
      // like image/jpeg, image/png, etc., without false-matching other values.
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i);
      if (enclosureMatch) imageUrl = enclosureMatch[1];
    }

    if (!imageUrl) {
      const msnImage = itemXml.match(/<image[^>]*url=["']([^"']+)["']/i);
      if (msnImage) imageUrl = msnImage[1];
    }

    if (!imageUrl) {
      imageUrl = extractImageFromContent(description);
    }

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

      let imageUrl = null;
      const anyThumb = entryXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
      if (anyThumb) imageUrl = anyThumb[1];
      if (!imageUrl) {
        const anyMedia = entryXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
        if (anyMedia) imageUrl = anyMedia[1];
      }
      if (!imageUrl) imageUrl = extractImageFromContent(description);

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