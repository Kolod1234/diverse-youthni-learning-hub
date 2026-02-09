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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const factsToAdd = [];
    let successCount = 0;
    let errorCount = 0;

    // Fetch facts from various sources using LLM to extract and summarize
    for (const source of FACT_SOURCES) {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Visit and extract 3-5 interesting, educational facts from this source: ${source}. 
          
          Return ONLY a JSON array of facts in this format:
          [
            {
              "fact": "An interesting fact here",
              "category": "science|history|general|nature|technology",
              "source_url": "${source}"
            }
          ]
          
          Make sure facts are:
          - Accurate and educational
          - Concise (1-2 sentences)
          - Interesting and engaging
          - Not repetitive
          
          Return ONLY valid JSON, no other text.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fact: { type: 'string' },
                category: { type: 'string', enum: ['science', 'history', 'general', 'nature', 'technology'] },
                source_url: { type: 'string' }
              },
              required: ['fact', 'category']
            }
          }
        });

        if (Array.isArray(response)) {
          response.forEach(item => {
            if (item.fact && item.category) {
              factsToAdd.push({
                content: item.fact,
                category: item.category,
                source_url: item.source_url || source,
                is_published: true
              });
              successCount++;
            }
          });
        }
      } catch (sourceError) {
        errorCount++;
        console.error(`Error fetching from ${source}:`, sourceError.message);
      }
    }

    // Remove duplicates
    const uniqueFacts = [];
    const seen = new Set();
    for (const fact of factsToAdd) {
      if (!seen.has(fact.content.toLowerCase())) {
        seen.add(fact.content.toLowerCase());
        uniqueFacts.push(fact);
      }
    }

    // Save unique facts to database
    if (uniqueFacts.length > 0) {
      await base44.asServiceRole.entities.DailyFact.bulkCreate(uniqueFacts);
    }

    return Response.json({
      success: true,
      message: `Fetched ${successCount} facts from ${FACT_SOURCES.length} sources, saved ${uniqueFacts.length} unique facts`,
      factsAdded: uniqueFacts.length,
      sourcesAttempted: FACT_SOURCES.length,
      errors: errorCount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});