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

    // Send email using integrations with proper context
    try {
      const result = await base44.asServiceRole.integrations.Core.SendEmail({
        to: studentEmail,
        subject: subject,
        body: body
      });

      return Response.json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return Response.json({ 
        error: 'Failed to send email: ' + emailError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});