import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'File URL required' }, { status: 400 });
        }

        // Analyze the book using AI
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze this book/document and provide the following information in JSON format:
            - title: The book title (if you can extract it from the file)
            - author: The author name (if available)
            - description: A brief 2-3 sentence description of what the book is about
            - category: Choose ONE from: book, document, video, article, research, other
            - tags: Array of 3-5 relevant tags/keywords
            
            File URL: ${file_url}
            
            If you cannot extract certain information, use reasonable defaults or leave empty.`,
            add_context_from_internet: false,
            file_urls: [file_url],
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    author: { type: "string" },
                    description: { type: "string" },
                    category: { 
                        type: "string",
                        enum: ["book", "document", "video", "article", "research", "other"]
                    },
                    tags: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({ 
            success: true,
            analysis 
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});