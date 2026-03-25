import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all RSS feed items
    const allItems = await base44.asServiceRole.entities.RSSFeed.list('-published_date', 1000);
    
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Find items to delete (older than 3 days and not custom announcements)
    const itemsToDelete = allItems.filter(item => {
      if (item.category === 'ANNOUNCEMENT') return false; // Keep custom announcements
      const publishedDate = new Date(item.published_date || item.created_date);
      return publishedDate < threeDaysAgo;
    });
    
    // Delete old items
    for (const item of itemsToDelete) {
      await base44.asServiceRole.entities.RSSFeed.delete(item.id);
    }
    
    return Response.json({
      success: true,
      deletedCount: itemsToDelete.length,
      message: `Deleted ${itemsToDelete.length} old news items`
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});