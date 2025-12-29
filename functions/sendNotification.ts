import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/tutor authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      recipient_email, 
      title, 
      message, 
      type, 
      link,
      send_email = false 
    } = await req.json();

    if (!recipient_email || !title || !message || !type) {
      return Response.json({ 
        error: 'Missing required fields: recipient_email, title, message, type' 
      }, { status: 400 });
    }

    // Create notification in database
    const notification = await base44.asServiceRole.entities.Notification.create({
      user_email: recipient_email,
      title,
      message,
      type,
      link,
      is_read: false,
    });

    // Send email if requested
    if (send_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Diverse Youth NI',
          to: recipient_email,
          subject: title,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF8C00;">${title}</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
              ${link ? `<p><a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #FF8C00; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a></p>` : ''}
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This is an automated notification from Diverse Youth NI. Please do not reply to this email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return Response.json({ 
      success: true, 
      notification,
      email_sent: send_email 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});