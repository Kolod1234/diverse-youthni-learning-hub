import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// POST { title, message, type, action_url, target, specific_email, send_email }
// target: 'all' | 'user' | 'admin' | 'tutors' | 'coordinators' | 'specific'
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { title, message, type = 'announcement', action_url = '', target, specific_email, send_email = false } = await req.json();

  if (!title || !message || !target) {
    return Response.json({ error: 'title, message and target are required' }, { status: 400 });
  }

  // Fetch all users to determine recipients
  const allUsers = await base44.asServiceRole.entities.User.list('email', 1000);

  let recipients = [];

  if (target === 'specific') {
    const found = allUsers.find(u => u.email === specific_email);
    if (!found) return Response.json({ error: 'User not found' }, { status: 404 });
    recipients = [found];
  } else if (target === 'all') {
    recipients = allUsers;
  } else if (target === 'admin') {
    recipients = allUsers.filter(u => u.role === 'admin');
  } else if (target === 'user') {
    recipients = allUsers.filter(u => u.role === 'user' || !u.role);
  } else if (target === 'tutors') {
    recipients = allUsers.filter(u => u.is_tutor === true);
  } else if (target === 'coordinators') {
    recipients = allUsers.filter(u => u.is_coordinator === true && !u.coordinator_banned);
  }

  if (recipients.length === 0) {
    return Response.json({ sent_count: 0, message: 'No matching users found' });
  }

  // Create in-app notifications in bulk
  const notifications = recipients.map(u => ({
    recipient_email: u.email,
    title,
    message,
    type,
    action_url,
    is_read: false,
    sent_by: user.email,
  }));

  await base44.asServiceRole.entities.Notification.bulkCreate(notifications);

  // Optionally send email digest
  if (send_email) {
    const emailPromises = recipients.map(u =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: u.email,
        subject: title,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #003366; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px;">🔔 ${title}</h2>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">${message}</p>
              ${action_url ? `<a href="${action_url}" style="display: inline-block; background: #003366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Now →</a>` : ''}
              <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; margin-bottom: 0;">You received this notification from Diverse Youth NI. To manage your notification preferences, visit your profile settings.</p>
            </div>
          </div>
        `,
      }).catch(() => null) // Don't fail if one email fails
    );
    await Promise.all(emailPromises);
  }

  return Response.json({ sent_count: recipients.length, email_sent: send_email });
});