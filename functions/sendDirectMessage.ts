import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Forbidden: Only admins and teachers can send messages' }, { status: 403 });
    }

    const { studentEmail, subject, body } = await req.json();

    if (!studentEmail || !subject || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email
    await base44.integrations.Core.SendEmail({
      to: studentEmail,
      subject: subject,
      body: body,
      from_name: user.full_name || 'Diverse Youth NI'
    });

    return Response.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});