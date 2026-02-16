import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, mode = 'answer', resourceIds = [] } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch library resources to search
    let resourcesToSearch = [];
    if (resourceIds.length > 0) {
      // Search specific books
      for (const id of resourceIds) {
        const resource = await base44.entities.LibraryResource.filter({ id }, '-created_date', 1);
        if (resource.length > 0) resourcesToSearch.push(resource[0]);
      }
    } else {
      // Search all available books
      resourcesToSearch = await base44.entities.LibraryResource.list('-created_date', 100);
    }

    if (resourcesToSearch.length === 0) {
      return Response.json({ 
        error: 'No library resources found',
        suggestions: []
      }, { status: 400 });
    }

    // Build context from available resources
    const resourceContext = resourcesToSearch
      .map(r => `Title: ${r.title}\nAuthor: ${r.author || 'Unknown'}\nDescription: ${r.description || 'N/A'}\nCategory: ${r.category || 'N/A'}\nTags: ${r.tags?.join(', ') || 'N/A'}`)
      .join('\n\n');

    let prompt = '';
    let responseSchema = {};

    if (mode === 'answer') {
      // Filter books that match the query
      const queryLower = query.toLowerCase();
      const relevantBooks = resourcesToSearch.filter(r => {
        const titleMatch = r.title.toLowerCase().includes(queryLower);
        const descMatch = r.description?.toLowerCase().includes(queryLower);
        const tagsMatch = r.tags?.some(t => t.toLowerCase().includes(queryLower));
        const categoryMatch = r.category?.toLowerCase().includes(queryLower);
        return titleMatch || descMatch || tagsMatch || categoryMatch;
      });

      // If no exact matches, show all available books
      const booksToShow = relevantBooks.length > 0 ? relevantBooks : resourcesToSearch;

      const booksList = booksToShow
        .slice(0, 15)
        .map(r => `- "${r.title}" by ${r.author || 'Unknown'} (Category: ${r.category}, Tags: ${r.tags?.join(', ') || 'N/A'})\n  Description: ${r.description || 'No description'}`)
        .join('\n\n');

      prompt = `You are a helpful research assistant. Answer this student's question comprehensively using current information and available textbooks.

QUESTION: "${query}"

AVAILABLE TEXTBOOKS IN OUR LIBRARY:
${booksList}

Please provide:
1. A clear, complete answer to the question
2. A list of relevant library books that cover this topic (with why each is relevant)
3. A suggested reading order`;

      responseSchema = {
        type: 'object',
        properties: {
          answer: { type: 'string', description: 'Comprehensive answer to the question' },
          relevantBooks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { type: 'string' },
                why: { type: 'string' }
              }
            }
          },
          readingOrder: { type: 'array', items: { type: 'string' } }
        }
      };
    } else if (mode === 'search') {
      prompt = `You are a library search assistant. Help the user find relevant books and topics related to their search query.

AVAILABLE LIBRARY RESOURCES:
${resourceContext}

SEARCH QUERY: ${query}

Please provide:
1. Most relevant books matching the search
2. Related topics and subtopics
3. Suggested learning path
4. Alternative search terms`;

      responseSchema = {
        type: 'object',
        properties: {
          matchedBooks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { type: 'string' },
                matchScore: { type: 'number', description: 'Relevance score 0-100' },
                reason: { type: 'string' }
              }
            }
          },
          relatedTopics: { type: 'array', items: { type: 'string' } },
          suggestedLearningPath: { type: 'array', items: { type: 'string' } },
          alternativeSearches: { type: 'array', items: { type: 'string' } }
        }
      };
    } else if (mode === 'generateQuestions') {
      prompt = `You are an educational assistant. Generate thoughtful study questions based on the user's topic and available library resources.

AVAILABLE LIBRARY RESOURCES:
${resourceContext}

TOPIC: ${query}

Please generate:
1. 5-10 thought-provoking questions about this topic
2. Question difficulty levels (beginner, intermediate, advanced)
3. Relevant books for each question
4. Expected answer length`;

      responseSchema = {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                relevantBooks: { type: 'array', items: { type: 'string' } },
                expectedLength: { type: 'string', enum: ['short', 'medium', 'long'] },
                learningObjectives: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          topicOverview: { type: 'string' },
          suggestedReadingOrder: { type: 'array', items: { type: 'string' } }
        }
      };
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: responseSchema
    });

    // Log search activity
    await base44.entities.FileActivity.create({
      action: 'ai_search',
      user_name: user.full_name,
      details: `Query: ${query}, Mode: ${mode}`
    });

    return Response.json({
      success: true,
      query,
      mode,
      result,
      resourcesSearched: resourcesToSearch.length
    });
  } catch (error) {
    console.error('Library AI Assistant Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process request',
      success: false 
    }, { status: 500 });
  }
});