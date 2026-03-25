import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Forbidden: Only admins and teachers can send messages' }, { status: 403 });
    }

    const { studentEmail, subject, body } = await req.json();

    if (!studentEmail || !subject || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create in-app message
    const message = await base44.asServiceRole.entities.Message.create({
      sender_email: user.email,
      sender_name: user.full_name,
      sender_avatar: user.avatar,
      recipient_email: studentEmail,
      content: `**${subject}**\n\n${body}`,
      is_read: false,
      message_type: 'text'
    });

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: studentEmail,
      title: 'New Message from ' + user.full_name,
      message: subject,
      type: 'message'
    });

    return Response.json({
      success: true,
      message: 'Message sent successfully',
      messageId: message.id
    });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});