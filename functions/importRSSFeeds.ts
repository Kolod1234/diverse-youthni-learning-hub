import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  bbceducation: 'https://feeds.bbci.co.uk/news/education/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition.rss',
  ocnni: 'https://ocnni.org.uk/feed/',
  ukhomeoffice: 'https://homeofficemedia.blog.gov.uk/feed/',
  migrantni: 'https://migrantni.org/feed/',
  eani: 'https://www.eani.org.uk/news-and-events/feed',
  deni: 'https://www.education-ni.gov.uk/rss/news.xml',
  govuk: 'https://www.gov.uk/government/organisations/department-for-education.atom',
  ukparliament: 'https://www.parliament.uk/site-information/rss-feeds/rss-education/',
  metroweather: 'https://metro.co.uk/feed/',
};

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
  const regex = new RegExp(`<${tagName}(?:[^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'i');
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
  
  // Try <item> tags (RSS 2.0)
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
    
    // Extract image
    let imageUrl = extractImageFromContent(description);
    
    if (!imageUrl) {
      const mediaMatch = itemXml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
      if (mediaMatch) imageUrl = mediaMatch[1];
    }
    
    if (!imageUrl) {
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i);
      if (enclosureMatch) imageUrl = enclosureMatch[1];
    }
    
    // Clean description
    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (title && cleanDesc && link) {
      items.push({
        title: title.substring(0, 200),
        description: cleanDesc.substring(0, 500),
        link: link,
        image_url: imageUrl,
        published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }
  
  // If no items found, try Atom format
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
      
      const imageUrl = extractImageFromContent(description);
      
      const cleanDesc = description
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (title && cleanDesc && link) {
        items.push({
          title: title.substring(0, 200),
          description: cleanDesc.substring(0, 500),
          link: link,
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
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }
    
    const { source } = await req.json();
    
    if (!source || !RSS_FEEDS[source]) {
      return Response.json({ 
        error: 'Invalid source',
        availableSources: Object.keys(RSS_FEEDS)
      }, { status: 400 });
    }
    
    const feedUrl = RSS_FEEDS[source];
    
    // Fetch RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSSImporter/1.0)',
      },
    });
    
    if (!response.ok) {
      return Response.json({ 
        error: `Failed to fetch RSS feed: ${response.statusText}` 
      }, { status: 500 });
    }
    
    const xmlText = await response.text();
    const items = await parseRSSFeed(xmlText);
    
    // Import items to database
    const imported = [];
    for (const item of items.slice(0, 10)) { // Limit to 10 most recent items
      try {
        // Check if item already exists
        const existing = await base44.asServiceRole.entities.RSSFeed.filter({
          link: item.link
        });
        
        if (existing.length === 0) {
          const created = await base44.asServiceRole.entities.RSSFeed.create({
            ...item,
            category: source.toUpperCase(),
          });
          imported.push(created);
        }
      } catch (error) {
        console.error('Error importing item:', error);
      }
    }
    
    return Response.json({
      success: true,
      source: source.toUpperCase(),
      itemsFound: items.length,
      itemsImported: imported.length,
      message: `Imported ${imported.length} new items from ${source.toUpperCase()}`,
    });
    
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});