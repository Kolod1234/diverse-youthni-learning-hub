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

    // Fetch the subject page with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse past papers from the page
    const papers = [];
    const foundUrls = new Set();
    
    // Pattern 1: Direct PDF links with anchor text
    const pdfRegex1 = /<a[^>]*href="([^"]*\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = pdfRegex1.exec(html)) !== null) {
      const pdfUrl = match[1];
      if (foundUrls.has(pdfUrl)) continue;
      foundUrls.add(pdfUrl);
      
      const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `https://ccea.org.uk${pdfUrl}`;
      const linkText = match[2].replace(/<[^>]*>/g, '').trim();
      const title = linkText || pdfUrl.split('/').pop().replace('.pdf', '');
      
      let category = 'Paper';
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('mark') || lowerTitle.includes('ms')) {
        category = 'Mark Scheme';
      } else if (lowerTitle.includes('question') || lowerTitle.includes('qp')) {
        category = 'Question Paper';
      } else if (lowerTitle.includes('insert') || lowerTitle.includes('resource')) {
        category = 'Resource';
      }
      
      papers.push({ title, url: fullUrl, category });
    }

    // Pattern 2: Links that might contain PDFs (check href attribute more broadly)
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      
      if (href.toLowerCase().includes('.pdf') && !foundUrls.has(href)) {
        foundUrls.add(href);
        const fullUrl = href.startsWith('http') ? href : `https://ccea.org.uk${href}`;
        const linkText = match[2].replace(/<[^>]*>/g, '').trim();
        const fileName = href.split('/').pop();
        const title = linkText || fileName.replace('.pdf', '');
        
        let category = 'Paper';
        const lowerCheck = (title + fileName).toLowerCase();
        if (lowerCheck.includes('mark') || lowerCheck.includes('ms')) {
          category = 'Mark Scheme';
        } else if (lowerCheck.includes('question') || lowerCheck.includes('qp')) {
          category = 'Question Paper';
        } else if (lowerCheck.includes('insert') || lowerCheck.includes('resource')) {
          category = 'Resource';
        }
        
        papers.push({ title, url: fullUrl, category });
      }
    }

    // If no papers found, log for debugging
    if (papers.length === 0) {
      console.log('No papers found. URL:', url);
      console.log('HTML sample:', html.substring(0, 500));
    }

    return Response.json({ 
      papers: papers.slice(0, 100),
      foundCount: papers.length
    });
    
  } catch (error) {
    console.error('Error fetching past papers:', error);
    return Response.json({ 
      error: `Failed to load papers: ${error.message}`,
      details: error.toString(),
      papers: []
    }, { status: 500 });
  }
});