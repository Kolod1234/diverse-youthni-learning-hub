import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resource_id, commenter_name, comment } = await req.json();

    // Get the resource
    const resource = await base44.asServiceRole.entities.LibraryResource.get(resource_id);
    
    // Get all users who have access to this file (creator + shares)
    const shares = await base44.asServiceRole.entities.FileShare.filter({ resource_id });
    const notifyEmails = new Set([resource.created_by]);
    shares.forEach(share => notifyEmails.add(share.shared_with_email));
    notifyEmails.delete(user.email); // Don't notify the commenter

    // Send notifications to all relevant users
    for (const email of notifyEmails) {
      await base44.asServiceRole.entities.Notification.create({
        type: 'file_comment',
        title: 'New Comment',
        message: `${commenter_name} commented on "${resource.title}"`,
        link: `/Library?file=${resource_id}`,
        is_read: false,
        created_by: email
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send comment notification error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});