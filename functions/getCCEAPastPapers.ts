import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL from query params
    const url = new URL(req.url).searchParams.get('url');
    if (!url) {
      return Response.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // Fetch the subject page
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse past papers from the page
    const papers = [];
    
    // Look for PDF links
    const pdfRegex = /<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]*)<\/a>/gi;
    let match;
    
    while ((match = pdfRegex.exec(html)) !== null) {
      const pdfUrl = match[1];
      const title = match[2].trim() || 'Untitled Document';
      
      // Determine category from title
      let category = 'Paper';
      if (title.toLowerCase().includes('mark scheme') || title.toLowerCase().includes('ms')) {
        category = 'Mark Scheme';
      } else if (title.toLowerCase().includes('question')) {
        category = 'Question Paper';
      }
      
      papers.push({
        title: title,
        url: pdfUrl.startsWith('http') ? pdfUrl : `https://ccea.org.uk${pdfUrl}`,
        category: category
      });
    }

    // Also look for links in common CCEA structures
    const resourceRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*resource[^"]*"[^>]*>([^<]*)<\/a>/gi;
    while ((match = resourceRegex.exec(html)) !== null) {
      const resourceUrl = match[1];
      const title = match[2].trim();
      
      if (resourceUrl.includes('.pdf')) {
        papers.push({
          title: title || 'Resource Document',
          url: resourceUrl.startsWith('http') ? resourceUrl : `https://ccea.org.uk${resourceUrl}`,
          category: 'Resource'
        });
      }
    }

    return Response.json({ 
      papers: papers.slice(0, 100) // Limit to 100 papers
    });
    
  } catch (error) {
    console.error('Error fetching past papers:', error);
    return Response.json({ 
      error: error.message,
      papers: []
    }, { status: 500 });
  }
});