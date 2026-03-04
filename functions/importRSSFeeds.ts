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

    // 1. media:content — pick highest width
    const mediaContentMatches = [...itemXml.matchAll(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/gi)];
    let bestMediaUrl = null;
    let maxWidth = 0;
    for (const m of mediaContentMatches) {
      const fullTag = m[0];
      const url = m[1];
      const widthMatch = fullTag.match(/width=["'](\d+)["']/i);
      const width = widthMatch ? parseInt(widthMatch[1]) : 1;
      if (width > maxWidth) {
        maxWidth = width;
        bestMediaUrl = url;
      }
    }
    if (bestMediaUrl) imageUrl = bestMediaUrl;

    // 2. enclosure with image type
    if (!imageUrl) {
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i);
      if (enclosureMatch) imageUrl = enclosureMatch[1];
    }

    // 3. media:thumbnail — pick highest width
    if (!imageUrl) {
      const thumbMatches = [...itemXml.matchAll(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/gi)];
      let bestThumb = null;
      let maxThumbWidth = 0;
      for (const m of thumbMatches) {
        const fullTag = m[0];
        const url = m[1];
        const widthMatch = fullTag.match(/width=["'](\d+)["']/i);
        const width = widthMatch ? parseInt(widthMatch[1]) : 1;
        if (width > maxThumbWidth) {
          maxThumbWidth = width;
          bestThumb = url;
        }
      }
      if (bestThumb) imageUrl = bestThumb;
    }

    // 4. Any media:content (no width attribute)
    if (!imageUrl) {
      const anyMedia = itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      if (anyMedia) imageUrl = anyMedia[1];
    }

    // 5. Any media:thumbnail (no width attribute)
    if (!imageUrl) {
      const anyThumb = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
      if (anyThumb) imageUrl = anyThumb[1];
    }

    // 6. MSN-specific image tag
    if (!imageUrl) {
      const msnImage = itemXml.match(/<image[^>]*url=["']([^"']+)["']/i);
      if (msnImage) imageUrl = msnImage[1];
    }

    // 7. img tag inside description HTML
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
        published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  // Atom format
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
      const anyMedia = entryXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      if (anyMedia) imageUrl = anyMedia[1];
      if (!imageUrl) {
        const anyThumb = entryXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
        if (anyThumb) imageUrl = anyThumb[1];
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
          published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
  }

  return items;
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

    for (const currentSource of sourcesToImport) {
      try {
        const feedUrl = RSS_FEEDS[currentSource];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSSImporter/1.0)' },
          signal: controller['signal'],
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          results.push({ source: currentSource.toUpperCase(), error: 'Failed to fetch: ' + response['statusText'] });
          continue;
        }

        const xmlText = await response.text();
        const items = await parseRSSFeed(xmlText);

        const imported = [];
        for (const item of items.slice(0, 10)) {
          try {
            const existing = await base44.asServiceRole.entities.RSSFeed.filter({ link: item['link'] });
            if (existing.length === 0) {
              const created = await base44.asServiceRole.entities.RSSFeed.create({
                ...item,
                category: currentSource.toUpperCase(),
              });
              imported.push(created);
            }
          } catch (e) {
            console.error('Error importing item from ' + currentSource + ': ' + getMsg(e));
          }
        }

        totalImported += imported.length;
        results.push({
          source: currentSource.toUpperCase(),
          itemsFound: items.length,
          itemsImported: imported.length,
        });

      } catch (e) {
        results.push({ source: currentSource.toUpperCase(), error: getMsg(e) });
      }
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