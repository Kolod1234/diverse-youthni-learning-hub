import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, title, file_type } = await req.json();
    
    if (!file_url || !title) {
      return Response.json({ 
        error: 'file_url and title are required' 
      }, { status: 400 });
    }

    // Extract text content from file
    const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: file_url,
      json_schema: {
        type: "object",
        properties: {
          text_content: {
            type: "string",
            description: "All text content extracted from the document"
          }
        }
      }
    });

    if (extractionResult.status === 'error') {
      return Response.json({ 
        error: 'Failed to extract content: ' + extractionResult.details 
      }, { status: 500 });
    }

    const textContent = extractionResult.output?.text_content || '';
    
    if (!textContent) {
      return Response.json({ 
        error: 'No text content could be extracted from the file' 
      }, { status: 400 });
    }

    // Use AI to analyze and organize the document
    const analysisPrompt = `Analyze this document and provide structured metadata:

DOCUMENT TITLE: ${title}
DOCUMENT CONTENT:
${textContent.substring(0, 15000)}

Provide a comprehensive analysis with:
1. A concise summary (2-3 sentences)
2. The most appropriate category from: Education, Science, Business, Technology, Health, History, Literature, Legal, Research, Other
3. 5-8 relevant searchable tags
4. 3-5 key concepts or main topics

Return your analysis in this exact JSON format:
{
  "summary": "concise summary here",
  "category": "category name",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "key_concepts": ["concept1", "concept2", "concept3"]
}`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          category: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          key_concepts: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["summary", "category", "tags", "key_concepts"]
      }
    });

    // Calculate metadata
    const wordCount = textContent.split(/\s+/).length;
    const charCount = textContent.length;

    const knowledgeItem = {
      title: title,
      content: textContent,
      summary: aiAnalysis.summary,
      file_url: file_url,
      file_type: file_type,
      category: aiAnalysis.category,
      tags: aiAnalysis.tags,
      key_concepts: aiAnalysis.key_concepts,
      metadata: {
        word_count: wordCount,
        char_count: charCount,
        processed_date: new Date().toISOString()
      },
      embedding_processed: true
    };

    return Response.json(knowledgeItem);
    
  } catch (error) {
    console.error('Error processing document:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});