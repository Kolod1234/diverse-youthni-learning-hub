import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import { fetchAppFile, isAppFileUrl } from '../../shared/urlSafety.ts';

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

        // Validate the caller-supplied URL before fetching to prevent SSRF
        // (cloud metadata endpoints, internal hosts, private ranges).
        // Only this app's own uploads can be analysed (blocks fetching arbitrary or internal addresses).
        if (!isAppFileUrl(file_url)) {
            return Response.json({ error: 'Only files uploaded to this app can be analysed.' }, { status: 400 });
        }

        let coverImageUrl = null;

        // Try to extract cover page from PDF
        try {
            if (file_url.toLowerCase().includes('.pdf')) {
                const pdfResponse = await fetchAppFile(file_url);
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

        // Analyze the book using AI with comprehensive content analysis
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Perform a comprehensive analysis of this educational resource/book. Extract and provide:

1. BASIC INFORMATION:
   - title: Extract the exact book/document title
   - author: Identify the author(s) or organization
   
2. CONTENT SUMMARY:
   - summary: Provide a detailed 4-6 sentence summary covering:
     * Main topics and themes
     * Target audience (age/education level)
     * Key concepts covered
     * Practical applications or exercises included
   - description: A concise 2-3 sentence overview suitable for quick browsing

3. LEARNING OBJECTIVES:
   - learning_objectives: Array of 5-8 specific learning objectives students will achieve by studying this resource. Format as actionable statements (e.g., "Understand the principles of...", "Apply techniques for...", "Analyze and evaluate...")

4. CATEGORIZATION:
   - category: Select the MOST appropriate category from: youth_work, gcse_books, gcse_past_questions, a_level_books, inspirational, dyni_books, workbooks_logbooks, history_books
   - difficulty_level: Assess as beginner, intermediate, or advanced
   - subject_area: Identify primary subject (e.g., Mathematics, Biology, English Literature, History, etc.)

5. METADATA:
   - tags: Generate 8-12 highly relevant keywords/tags including:
     * Subject-specific terms
     * Key topics covered
     * Educational level indicators
     * Resource type indicators (textbook, workbook, guide, etc.)
   - estimated_reading_time: Estimate in hours for average student
   
6. CONTENT STRUCTURE:
   - has_exercises: Boolean - does it include practice questions/exercises?
   - has_illustrations: Boolean - contains diagrams, images, or visual aids?
   - chapter_count: Approximate number of chapters/sections (if identifiable)

Analyze the actual content thoroughly. Be specific and accurate.

File URL: ${file_url}`,
            add_context_from_internet: false,
            file_urls: [file_url],
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    author: { type: "string" },
                    summary: { type: "string" },
                    description: { type: "string" },
                    learning_objectives: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 5,
                        maxItems: 8
                    },
                    category: { 
                        type: "string",
                        enum: ["youth_work", "gcse_books", "gcse_past_questions", "a_level_books", "inspirational", "dyni_books", "workbooks_logbooks", "history_books"]
                    },
                    difficulty_level: {
                        type: "string",
                        enum: ["beginner", "intermediate", "advanced"]
                    },
                    subject_area: { type: "string" },
                    tags: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 8,
                        maxItems: 12
                    },
                    estimated_reading_time: { type: "number" },
                    has_exercises: { type: "boolean" },
                    has_illustrations: { type: "boolean" },
                    chapter_count: { type: "number" }
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