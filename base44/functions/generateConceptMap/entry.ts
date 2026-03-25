import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, depth = 2, focusKeywords = [] } = await req.json();

    let lesson;
    try {
      lesson = await base44.entities.Lesson.get(lessonId);
    } catch (error) {
      if (error.status === 404) {
        return Response.json({ error: 'Lesson not found' }, { status: 404 });
      }
      throw error;
    }

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lessonTitle = lesson.title || '';
    const lessonDescription = lesson.description || '';
    const learningObjectives = lesson.learning_objectives || [];
    const slidesText = (lesson.slides || [])
      .map(s => `${s.title || ''}: ${(s.content || '').replace(/<[^>]*>/g, '')}`)
      .join('\n')
      .substring(0, 3000); // limit context size

    const keywordFocus = focusKeywords.length > 0
      ? `\nFOCUS KEYWORDS: Ensure these concepts appear as central nodes in the map: ${focusKeywords.join(', ')}.`
      : '';

    const depthGuidance = {
      1: 'Create a shallow map: main concept at center, 4-6 direct child concepts, minimal sub-nodes.',
      2: 'Create a medium-depth map: main concept at center, 4-6 key concepts as direct children, each with 2-3 sub-concepts.',
      3: 'Create a deep map: main concept at center, 5-7 key concepts as children, each with 2-4 sub-concepts and examples.'
    };

    const prompt = `You are an expert educational content designer. Analyse the following lesson and generate a concept map as structured JSON.

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
${slidesText ? `\nLesson Content:\n${slidesText}` : ''}
${keywordFocus}

MAP DEPTH: ${depth}
${depthGuidance[depth] || depthGuidance[2]}

Generate a concept map as valid JSON with this EXACT structure:

{
  "centralConcept": {
    "id": "root",
    "label": "main topic/lesson title",
    "description": "brief overview of the entire lesson topic",
    "type": "root"
  },
  "nodes": [
    {
      "id": "unique_id",
      "label": "concept name",
      "description": "clear definition or explanation of this concept",
      "example": "a concrete example of this concept",
      "type": "concept|definition|example|principle|process",
      "difficulty": "basic|intermediate|advanced"
    }
  ],
  "edges": [
    {
      "from": "node_id_1",
      "to": "node_id_2",
      "relationship": "short relationship label (e.g., 'leads to', 'is a type of', 'requires', 'explains', 'examples include', 'is defined as', 'is related to')"
    }
  ],
  "summary": "2-3 sentence summary of how these concepts interconnect and why understanding their relationships matters"
}

REQUIREMENTS:
- All nodes and edges MUST be based strictly on THIS lesson's content
- Use clear, concise labels (max 5 words per label)
- Every node must have a meaningful description and example where possible
- The 'from' and 'to' fields in edges must reference valid node ids (including "root" for central concept)
- Relationship labels should be specific and directional (e.g., "is a type of", "requires understanding of", "produces")
- IDs must be simple strings with no spaces (use underscores)
- Aim for ${depth === 1 ? '6-8' : depth === 2 ? '10-15' : '15-22'} total nodes`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content designer specialising in visual learning tools. You create precise, well-structured concept maps from lesson content. Every node and relationship must be grounded in the provided lesson material. Always respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return Response.json({
      success: true,
      centralConcept: content.centralConcept,
      nodes: content.nodes || [],
      edges: content.edges || [],
      summary: content.summary || '',
      lessonTitle
    });

  } catch (error) {
    console.error('Error generating concept map:', error);
    return Response.json({
      error: 'Failed to generate concept map',
      details: error.message
    }, { status: 500 });
  }
});