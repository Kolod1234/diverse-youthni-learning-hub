import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–:;,.]+|[\s\-–:;,.]+$/g, '')
    .trim();
}

function normalizeHint(value) {
  const hint = cleanText(value).toLowerCase();
  return ['diagram_only', 'chart_only', 'table_only', 'figure_only', 'whole_page'].includes(hint)
    ? hint
    : 'whole_page';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      fileUrl,
      question,
      visualDescription,
      visualSourceHint = 'whole_page',
      fileName = 'source file'
    } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    const extractionPrompt = `You are preparing a high-clarity Kahoot image from an uploaded study file.

SOURCE FILE: ${fileName}
QUESTION: ${cleanText(question)}
VISUAL DESCRIPTION: ${cleanText(visualDescription)}
PREFERRED VISUAL TARGET: ${normalizeHint(visualSourceHint)}

Task:
- Review the uploaded file and identify the single best visual to display for this question.
- Prefer the specific diagram, chart, table, figure, or labelled visual when clearly present.
- If a precise crop is not possible, use the full page that best matches the question.
- Return ONE final image that is classroom-ready and easy to read in Kahoot.
- Preserve the original visual content faithfully.
- Do not invent new educational content.
- Ensure the result is sharp, centered, and readable.

Return JSON.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          should_attach_image: { type: 'boolean' },
          chosen_visual_type: { type: 'string' },
          extracted_image_url: { type: 'string' },
          reasoning: { type: 'string' }
        }
      }
    });

    return Response.json({
      should_attach_image: result.should_attach_image === true,
      chosen_visual_type: cleanText(result.chosen_visual_type),
      extracted_image_url: cleanText(result.extracted_image_url),
      reasoning: cleanText(result.reasoning)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});