import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resource_id, resource_title, shared_with_email, shared_by_name, message } = await req.json();

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: shared_with_email,
      subject: `${shared_by_name} shared a file with you`,
      body: `
        <h2>File Shared: ${resource_title}</h2>
        <p>${shared_by_name} has shared a file with you.</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p>Log in to view the file in your library.</p>
      `
    });

    // Create notification record
    await base44.entities.Notification.create({
      type: 'file_share',
      title: 'File Shared',
      message: `${shared_by_name} shared "${resource_title}" with you`,
      link: `/Library?file=${resource_id}`,
      is_read: false
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send share notification error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});