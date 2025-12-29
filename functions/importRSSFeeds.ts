import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  cnn: 'https://rss.cnn.com/rss/edition.rss',
  ocnni: 'https://www.ocnni.org.uk/feed/',
  ukhomeoffice: 'https://homeofficemedia.blog.gov.uk/feed/',
  migrantni: 'https://migrantni.org/feed/',
};

async function parseRSSFeed(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  
  const items = [];
  const itemNodes = doc.querySelectorAll('item');
  
  itemNodes.forEach((item) => {
    const title = item.querySelector('title')?.textContent?.trim();
    const description = item.querySelector('description')?.textContent?.trim()
      .replace(/<[^>]*>/g, ''); // Strip HTML tags
    const link = item.querySelector('link')?.textContent?.trim();
    const pubDate = item.querySelector('pubDate')?.textContent?.trim();
    
    // Try to get image from various sources
    let imageUrl = null;
    const mediaContent = item.querySelector('media\\:content, content');
    const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
    const enclosure = item.querySelector('enclosure[type^="image"]');
    
    if (mediaContent?.getAttribute('url')) {
      imageUrl = mediaContent.getAttribute('url');
    } else if (mediaThumbnail?.getAttribute('url')) {
      imageUrl = mediaThumbnail.getAttribute('url');
    } else if (enclosure?.getAttribute('url')) {
      imageUrl = enclosure.getAttribute('url');
    }
    
    if (title && description) {
      items.push({
        title,
        description: description.substring(0, 500), // Limit description length
        link,
        image_url: imageUrl,
        published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  });
  
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