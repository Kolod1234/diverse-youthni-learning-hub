import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch CCEA curriculum page
    const response = await fetch('https://ccea.org.uk/post-16/qualifications');
    const html = await response.text();
    
    // Parse subjects from the page
    const subjects = [];
    const subjectRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = subjectRegex.exec(html)) !== null) {
      const url = match[1];
      const name = match[2].trim();
      
      // Filter for relevant GCSE subjects
      if (url.includes('/subjects/') && !subjects.some(s => s.name === name)) {
        subjects.push({
          name: name,
          url: url.startsWith('http') ? url : `https://ccea.org.uk${url}`
        });
      }
    }

    return Response.json({ 
      subjects: subjects.slice(0, 50) // Limit to 50 subjects
    });
    
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return Response.json({ 
      error: error.message,
      subjects: []
    }, { status: 500 });
  }
});