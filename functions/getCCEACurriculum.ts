import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch CCEA GCSE subjects page
    const response = await fetch('https://ccea.org.uk/key-stage-4/gcse/subjects');
    const html = await response.text();
    
    // Parse subjects from the page
    const subjects = [];
    const subjectRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = subjectRegex.exec(html)) !== null) {
      const url = match[1];
      const name = match[2].trim();
      
      // Filter for relevant GCSE subjects - look for subject pages
      if ((url.includes('/subjects/') || url.includes('/gcse/')) && name && name.length > 2 && !subjects.some(s => s.name === name)) {
        const fullUrl = url.startsWith('http') ? url : `https://ccea.org.uk${url}`;
        // Add /past-papers to the subject URL
        const pastPapersUrl = fullUrl.endsWith('/') ? `${fullUrl}past-papers` : `${fullUrl}/past-papers`;
        
        subjects.push({
          name: name,
          url: pastPapersUrl
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