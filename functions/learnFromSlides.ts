import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, contentType } = await req.json();

    // Get all successful slides from analytics
    const analytics = await base44.entities.SlideAnalytics.filter({
      success_score: { $gte: 80 }
    }, '-created_date', 50);

    // Get knowledge base items related to topic
    const knowledgeItems = await base44.entities.KnowledgeBaseItem.filter({
      tags: topic
    }, '-created_date', 10);

    // Analyze patterns with AI
    const patterns = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these successful slides and extract content patterns, structures, and preferences:

SUCCESSFUL SLIDES:
${analytics.map(a => `Topic: ${a.topic}\nTitle: ${a.slide_title}\nVisual: ${a.visual_type}\nStyle: ${a.visual_style}\n---`).join('\n')}

KNOWLEDGE BASE:
${knowledgeItems.map(k => `${k.title}: ${k.content?.substring(0, 500)}`).join('\n\n')}

Extract:
1. Preferred slide structures
2. Common visual patterns
3. Effective content organization
4. Style preferences
5. Topic-specific insights for "${topic}"

Be specific and actionable.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          slideStructures: { type: 'array', items: { type: 'string' } },
          visualPatterns: { type: 'array', items: { type: 'string' } },
          contentOrganization: { type: 'array', items: { type: 'string' } },
          stylePreferences: { type: 'array', items: { type: 'string' } },
          topicInsights: { type: 'string' }
        }
      }
    });

    return Response.json({
      patterns,
      successfulSlidesCount: analytics.length,
      knowledgeItemsCount: knowledgeItems.length
    });

  } catch (error) {
    console.error('Learning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});