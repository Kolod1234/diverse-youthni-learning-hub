import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, answer, subject, qualification } = await req.json();
    if (!question && !answer) return Response.json({ error: 'Question or answer is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'automatic',
      add_context_from_internet: true,
      prompt: `Find accurate, openly reusable educational figures for this ${qualification || ''} ${subject || ''} topic.
Question: ${(question || '').slice(0, 800)}
Worked answer: ${(answer || '').replace(/<[^>]*>/g, ' ').slice(0, 800)}

Search OpenStax first, then Wikimedia Commons, NASA, NIH and other government or university open repositories. Prefer an existing professionally labelled figure that directly teaches the concept. Do not return SVG files, generic decoration, stock photography, paywalled pages, generated images, or a URL unless it appears in the web results. For every result provide the direct PNG/JPEG/WebP image URL, its public source page, source name, displayed licence/usage statement, attribution, a factual description and concise alt text.`,
      response_json_schema: {
        type: 'object',
        properties: {
          search_query: { type: 'string', description: 'A concise 3-8 word visual search phrase' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                image_url: { type: 'string' },
                source_page_url: { type: 'string' },
                source: { type: 'string' },
                licence: { type: 'string' },
                attribution: { type: 'string' },
                description: { type: 'string' },
                alt_text: { type: 'string' }
              },
              required: ['image_url', 'source_page_url', 'source', 'licence', 'attribution', 'description', 'alt_text']
            }
          }
        },
        required: ['search_query', 'images']
      }
    });

    const allowedHosts = ['openstax.org', 'cnx.org', 'wikimedia.org', 'wikipedia.org', 'nasa.gov', 'nih.gov', 'noaa.gov', 'usgs.gov', '.edu'];
    const candidates = (result?.images || []).filter((item) => {
      try {
        const imageHost = new URL(item.image_url).hostname.toLowerCase();
        const sourceHost = new URL(item.source_page_url).hostname.toLowerCase();
        return allowedHosts.some((host) => imageHost.endsWith(host) || sourceHost.endsWith(host)) && !/\.svg(?:\?|$)/i.test(item.image_url);
      } catch {
        return false;
      }
    }).slice(0, 8);

    const verified = [];
    for (const item of candidates) {
      try {
        const response = await fetch(item.image_url, {
          headers: { Range: 'bytes=0-2047', 'User-Agent': 'DiverseYouthNI-EducationalVisualFinder/1.0' },
          redirect: 'follow',
          signal: AbortSignal.timeout(8000)
        });
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && /^image\/(png|jpeg|webp)/i.test(contentType)) verified.push(item);
        await response.body?.cancel();
      } catch {
        // Skip inaccessible or non-image URLs.
      }
      if (verified.length === 3) break;
    }

    if (verified.length < 3) {
      const stopWords = new Set(['the', 'and', 'for', 'are', 'was', 'were', 'has', 'have', 'had', 'not', 'but', 'difference', 'explain', 'describe', 'calculate', 'show', 'what', 'which', 'when', 'where', 'with', 'from', 'that', 'this', 'between', 'including', 'into', 'does', 'about', 'using', 'their', 'there', 'equals']);
      const concepts = `${question || ''}`.toLowerCase().match(/[a-z][a-z-]{2,}/g) || [];
      const fallbackQuery = [...new Set(concepts.filter((word) => !stopWords.has(word)))].slice(0, 5).join(' ');
      const searchQuery = result?.search_query || fallbackQuery || subject;
      const apiUrl = new URL('https://commons.wikimedia.org/w/api.php');
      apiUrl.search = new URLSearchParams({
        action: 'query', format: 'json', origin: '*', generator: 'search',
        gsrsearch: searchQuery, gsrnamespace: '6', gsrlimit: '10',
        prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '1400'
      }).toString();
      const commonsResponse = await fetch(apiUrl, {
        headers: { 'User-Agent': 'DiverseYouthNI-LearningHub/1.0 (https://learn-sphere-51368216.base44.app)' }
      });
      if (commonsResponse.ok) {
        const commonsData = await commonsResponse.json();
        const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        for (const page of Object.values(commonsData?.query?.pages || {})) {
          const info = page?.imageinfo?.[0];
          const isRaster = /^image\/(png|jpeg|webp)$/i.test(info?.mime || '');
          const hasRasterPreview = info?.mime === 'image/svg+xml' && Boolean(info?.thumburl);
          if (!info || (!isRaster && !hasRasterPreview)) continue;
          const meta = info.extmetadata || {};
          verified.push({
            image_url: info.thumburl || info.url,
            source_page_url: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
            source: 'Wikimedia Commons',
            licence: stripHtml(meta.LicenseShortName?.value || meta.UsageTerms?.value || 'See source page for licence'),
            attribution: stripHtml(meta.Artist?.value || meta.Credit?.value || 'Attribution details on source page'),
            description: stripHtml(meta.ImageDescription?.value || page.title.replace(/^File:/, '')),
            alt_text: stripHtml(meta.ImageDescription?.value || page.title.replace(/^File:/, ''))
          });
          if (verified.length === 3) break;
        }
      }
    }

    return Response.json({ images: verified.slice(0, 3) });
  } catch (error) {
    return Response.json({ error: error?.message || 'Educational visual search failed' }, { status: 500 });
  }
}