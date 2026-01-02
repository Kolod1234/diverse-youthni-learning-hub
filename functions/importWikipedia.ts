import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await req.json();

    if (!topic) {
      return Response.json({ error: 'Topic required' }, { status: 400 });
    }

    // Search Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return Response.json({ error: 'No Wikipedia articles found' }, { status: 404 });
    }

    const pageId = searchData.query.search[0].pageid;
    const pageTitle = searchData.query.search[0].title;

    // Get article content
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&explaintext&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    const content = contentData.query?.pages?.[pageId]?.extract || '';

    if (!content) {
      return Response.json({ error: 'Failed to extract content' }, { status: 500 });
    }

    // Extract key topics for tags
    const tagResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract 5-7 key topics/tags from this Wikipedia article about "${pageTitle}". Return only the tags as an array.

Content: ${content.substring(0, 2000)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save to knowledge base
    await base44.entities.KnowledgeBaseItem.create({
      title: pageTitle,
      content: content.substring(0, 10000), // Limit to 10k chars
      tags: tagResult.tags || [topic],
      category: 'wikipedia',
      source_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`
    });

    return Response.json({
      title: pageTitle,
      content: content.substring(0, 500) + '...',
      tags: tagResult.tags || [topic],
      fullLength: content.length
    });

  } catch (error) {
    console.error('Wikipedia import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});