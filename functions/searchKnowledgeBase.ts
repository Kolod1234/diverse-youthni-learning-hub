import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, documents } = await req.json();
    
    if (!query || !documents) {
      return Response.json({ 
        error: 'query and documents are required' 
      }, { status: 400 });
    }

    if (documents.length === 0) {
      return Response.json({ results: [] });
    }

    // Use AI to understand the query and find relevant documents
    const searchPrompt = `You are a knowledge base search AI. A user is searching for information with this query:

QUERY: "${query}"

Here are the available documents in the knowledge base:

${documents.map((doc, idx) => `
DOCUMENT ${idx + 1}:
ID: ${doc.id}
Title: ${doc.title}
Summary: ${doc.summary}
Category: ${doc.category}
Tags: ${doc.tags?.join(', ')}
Key Concepts: ${doc.key_concepts?.join(', ')}
Content Preview: ${doc.content.substring(0, 500)}...
`).join('\n---\n')}

Analyze the query and rank the documents by relevance. Return the top 5 most relevant document IDs with relevance scores (0-1).

Return ONLY valid JSON in this format:
{
  "results": [
    {
      "id": "document_id",
      "relevance_score": 0.95,
      "match_reason": "Brief explanation of why this matches"
    }
  ]
}

If no documents are relevant, return empty results array.`;

    const searchResult = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                relevance_score: { type: "number" },
                match_reason: { type: "string" }
              },
              required: ["id", "relevance_score"]
            }
          }
        },
        required: ["results"]
      }
    });

    // Enrich results with full document data
    const enrichedResults = searchResult.results
      .map(result => {
        const doc = documents.find(d => d.id === result.id);
        if (!doc) return null;
        return {
          ...doc,
          relevance_score: result.relevance_score,
          match_reason: result.match_reason
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.relevance_score - a.relevance_score);

    return Response.json({ 
      results: enrichedResults,
      total: enrichedResults.length 
    });
    
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});