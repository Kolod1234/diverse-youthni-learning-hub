import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  cnn: 'http://rss.cnn.com/rss/edition.rss',
  ocnni: 'https://ocnni.org.uk/feed/',
  ukhomeoffice: 'https://homeofficemedia.blog.gov.uk/feed/',
  migrantni: 'https://migrantni.org/feed/',
};

function getTextContent(xmlText, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xmlText.match(regex);
  return match ? match[1].trim() : null;
}

function extractImageFromDescription(description) {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = description.match(imgRegex);
  return match ? match[1] : null;
}

async function parseRSSFeed(xmlText) {
  const items = [];
  
  // Try <item> tags first (RSS 2.0)
  let itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  let foundItems = false;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    foundItems = true;
    const itemXml = match[1];
    
    const title = getTextContent(itemXml, 'title');
    let description = getTextContent(itemXml, 'description') || getTextContent(itemXml, 'content:encoded') || '';
    const link = getTextContent(itemXml, 'link') || getTextContent(itemXml, 'guid');
    const pubDate = getTextContent(itemXml, 'pubDate') || getTextContent(itemXml, 'dc:date');
    
    // Extract image from description HTML or media tags
    let imageUrl = extractImageFromDescription(description);
    if (!imageUrl) {
      const mediaRegex = /<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i;
      const mediaMatch = itemXml.match(mediaRegex);
      if (mediaMatch) imageUrl = mediaMatch[1];
    }
    if (!imageUrl) {
      const enclosureRegex = /<enclosure[^>]+url="([^"]+)"[^>]+type="image/i;
      const enclosureMatch = itemXml.match(enclosureRegex);
      if (enclosureMatch) imageUrl = enclosureMatch[1];
    }
    
    // Strip HTML tags from description
    description = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    
    if (title && description && link) {
      items.push({
        title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&[^;]+;/g, ' ').trim(),
        description: description.substring(0, 500),
        link: link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        image_url: imageUrl,
        published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }
  
  // If no items found, try <entry> tags (Atom)
  if (!foundItems) {
    itemRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      const title = getTextContent(itemXml, 'title');
      let description = getTextContent(itemXml, 'summary') || getTextContent(itemXml, 'content') || '';
      const linkMatch = itemXml.match(/<link[^>]+href="([^"]+)"/i);
      const link = linkMatch ? linkMatch[1] : null;
      const pubDate = getTextContent(itemXml, 'updated') || getTextContent(itemXml, 'published');
      
      let imageUrl = extractImageFromDescription(description);
      
      description = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
      
      if (title && description && link) {
        items.push({
          title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&[^;]+;/g, ' ').trim(),
          description: description.substring(0, 500),
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