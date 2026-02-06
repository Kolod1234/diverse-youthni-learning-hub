import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

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

        let coverImageUrl = null;

        // Try to extract cover page from PDF
        try {
            if (file_url.toLowerCase().includes('.pdf')) {
                const pdfResponse = await fetch(file_url);
                const pdfBytes = await pdfResponse.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes);
                
                if (pdfDoc.getPageCount() > 0) {
                    // Create a new PDF with just the first page
                    const newPdf = await PDFDocument.create();
                    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
                    newPdf.addPage(firstPage);
                    const firstPageBytes = await newPdf.save();
                    
                    // Upload the first page as a separate file
                    const blob = new Blob([firstPageBytes], { type: 'application/pdf' });
                    const file = new File([blob], 'first-page.pdf', { type: 'application/pdf' });
                    
                    const { file_url: coverPdfUrl } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
                    
                    // Use the first page PDF directly as cover
                    // We'll display it in the viewer using PDF.js
                    coverImageUrl = coverPdfUrl;
                }
            }
        } catch (error) {
            console.log('Cover extraction failed, continuing without cover:', error.message);
        }

        // Analyze the book using AI
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyze this book/document and provide the following information in JSON format:
            - title: The book title (if you can extract it from the file)
            - author: The author name (if available)
            - description: A brief 2-3 sentence description of what the book is about
            - category: Choose ONE from: youth_work, gcse_books, gcse_past_questions, a_level_books, inspirational, dyni_books, workbooks_logbooks, history_books
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
                        enum: ["youth_work", "gcse_books", "gcse_past_questions", "a_level_books", "inspirational", "dyni_books", "workbooks_logbooks", "history_books"]
                    },
                    tags: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Add cover image to analysis if extracted
        if (coverImageUrl) {
            analysis.cover_image = coverImageUrl;
        }

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