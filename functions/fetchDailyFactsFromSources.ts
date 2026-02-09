import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const FACT_SOURCES = [
  'https://www.thefactsite.com/day/today/',
  'https://funfactoday.com/random-facts/50-fun-facts-of-today/',
  'https://on-this-day.com/cgi-bin/otd/thehistoryoftoday.pl',
  'https://www.historynet.com/today-in-history/',
  'https://www.sciencefocus.com/science/fun-facts',
  'https://www.livescience.com/science-facts',
  'https://www.findafact.com/'
];

async function fetchPageContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    
    // Extract text content from HTML (remove scripts, styles, etc)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 5000); // Limit to 5000 chars to avoid token overload
    
    return text;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const factsToAdd = [];
    let successCount = 0;

    // Fetch content from each source and extract facts
    for (const source of FACT_SOURCES) {
      const pageContent = await fetchPageContent(source);
      
      if (!pageContent) {
        console.error(`Could not fetch content from ${source}`);
        continue;
      }

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract 3-5 unique, interesting, and educational facts from the following webpage content:

"${pageContent}"

Return ONLY a valid JSON object in this exact format - no other text:
{
  "facts": [
    {
      "fact": "A complete, interesting educational fact",
      "category": "science|history|general|nature|technology"
    }
  ]
}

Rules:
- Facts must be concise (1-2 sentences max)
- Facts must be unique and not repetitive
- Facts must be interesting and educational
- Only include facts actually mentioned in the content
- Return ONLY JSON, nothing else`,
          response_json_schema: {
            type: 'object',
            properties: {
              facts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fact: { type: 'string' },
                    category: { type: 'string', enum: ['science', 'history', 'general', 'nature', 'technology'] }
                  },
                  required: ['fact', 'category']
                }
              }
            },
            required: ['facts']
          }
        });

        if (Array.isArray(response)) {
          response.forEach(item => {
            if (item.fact && item.fact.length > 10) {
              factsToAdd.push({
                fact: item.fact,
                category: item.category,
                source_url: source,
                is_active: true
              });
              successCount++;
            }
          });
        }
      } catch (parseError) {
        console.error(`Error parsing facts from ${source}:`, parseError.message);
      }
    }

    // Remove exact duplicates
    const uniqueFacts = [];
    const seen = new Set();
    for (const fact of factsToAdd) {
      const factLower = fact.fact.toLowerCase().trim();
      if (!seen.has(factLower)) {
        seen.add(factLower);
        uniqueFacts.push(fact);
      }
    }

    // Save to database
    if (uniqueFacts.length > 0) {
      await base44.asServiceRole.entities.DailyFact.bulkCreate(uniqueFacts);
    }

    return Response.json({
      success: true,
      factsAdded: uniqueFacts.length,
      sourcesProcessed: FACT_SOURCES.length,
      message: `Successfully added ${uniqueFacts.length} unique facts from ${FACT_SOURCES.length} sources`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});