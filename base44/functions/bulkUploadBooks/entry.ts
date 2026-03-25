import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { books, auto_categorize } = await req.json();

    if (!Array.isArray(books) || books.length === 0) {
      return Response.json({ error: 'No books provided' }, { status: 400 });
    }

    const results = [];
    let successCount = 0;

    for (const book of books) {
      try {
        // Validate required fields
        if (!book.title || !book.file_url) {
          results.push({
            title: book.title || 'Unknown',
            success: false,
            message: 'Missing title or file URL'
          });
          continue;
        }

        // Auto-categorize with AI if needed
        let category = book.category || 'gcse_books';
        if (auto_categorize && !book.category) {
          try {
            const aiResponse = await base44.integrations.Core.InvokeLLM({
              prompt: `Categorize this book: Title: "${book.title}", Description: "${book.description || ''}", Author: "${book.author || ''}". 
              Choose from: youth_work, gcse_books, gcse_past_questions, a_level_books, inspirational, dyni_books, workbooks_logbooks, history_books.
              Respond with ONLY the category name.`,
              add_context_from_internet: false,
              response_json_schema: {
                type: 'object',
                properties: {
                  category: { type: 'string' }
                }
              }
            });
            
            const aiCategory = aiResponse?.category?.toLowerCase().trim();
            const validCategories = ['youth_work', 'gcse_books', 'gcse_past_questions', 'a_level_books', 'inspirational', 'dyni_books', 'workbooks_logbooks', 'history_books'];
            
            if (validCategories.includes(aiCategory)) {
              category = aiCategory;
            }
          } catch (aiError) {
            console.log('AI categorization failed, using default:', aiError.message);
          }
        }

        // Process tags
        let tags = [];
        if (book.tags) {
          if (typeof book.tags === 'string') {
            tags = book.tags.split(',').map(t => t.trim()).filter(t => t);
          } else if (Array.isArray(book.tags)) {
            tags = book.tags;
          }
        }

        // Create library resource
        const resourceData = {
          title: book.title,
          author: book.author || '',
          description: book.description || '',
          category,
          file_url: book.file_url,
          cover_image: book.cover_image || '',
          tags,
          is_featured: book.is_featured === true || book.is_featured === 'true',
          downloads_count: 0
        };

        await base44.entities.LibraryResource.create(resourceData);
        successCount++;
        results.push({
          title: book.title,
          success: true,
          message: `Added to ${category}`
        });

      } catch (error) {
        results.push({
          title: book.title || 'Unknown',
          success: false,
          message: error.message || 'Upload failed'
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return Response.json({
      success: true,
      success_count: successCount,
      total: books.length,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return Response.json(
      { error: error.message || 'Bulk upload failed' },
      { status: 500 }
    );
  }
});