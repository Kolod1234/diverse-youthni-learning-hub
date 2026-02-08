import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all page sections
    const sections = await base44.asServiceRole.entities.PageSection.list('-updated_date', 1000);

    // Group sections by page
    const pages = {};
    sections.forEach(section => {
      if (!pages[section.page_name]) {
        pages[section.page_name] = [];
      }
      pages[section.page_name].push(section);
    });

    // Build sitemap XML
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const baseUrl = req.headers.get('origin') || 'https://example.com';

    // Add pages with sections
    Object.entries(pages).forEach(([pageName, pageSections]) => {
      const path = pageName === 'Home' ? '' : `/${pageName.toLowerCase()}`;
      const url = `${baseUrl}${path}`;
      const lastModified = pageSections[0]?.updated_date || new Date().toISOString();

      sitemapXml += '  <url>\n';
      sitemapXml += `    <loc>${url}</loc>\n`;
      sitemapXml += `    <lastmod>${lastModified.split('T')[0]}</lastmod>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>${pageName === 'Home' ? '1.0' : '0.8'}</priority>\n`;
      sitemapXml += '  </url>\n';
    });

    sitemapXml += '</urlset>';

    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="sitemap.xml"',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});