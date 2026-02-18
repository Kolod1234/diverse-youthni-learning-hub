import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get all pending scheduled messages that are due
        const now = new Date();
        const scheduledMessages = await base44.asServiceRole.entities.ScheduledMessage.filter(
            { status: 'pending' },
            'scheduled_time',
            1000
        );

        const dueMessages = scheduledMessages.filter(msg => 
            new Date(msg.scheduled_time) <= now
        );

        console.log(`Found ${dueMessages.length} messages to send`);

        const results = [];
        for (const msg of dueMessages) {
            try {
                // Create the actual message
                await base44.asServiceRole.entities.Message.create({
                    sender_email: msg.sender_email,
                    sender_name: msg.sender_name,
                    recipient_email: msg.recipient_email,
                    content: `Subject: ${msg.subject || 'Message from Admin'}\n\n${msg.content}`,
                    is_read: false,
                });

                // Create notification
                await base44.asServiceRole.entities.Notification.create({
                    user_email: msg.recipient_email,
                    title: 'New Message',
                    message: `You have a new message from ${msg.sender_name}`,
                    type: 'message',
                });

                // Send email
                try {
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: msg.recipient_email,
                        subject: msg.subject || 'Message from ' + msg.sender_name,
                        body: msg.content,
                    });
                } catch (emailError) {
                    console.error('Email send failed:', emailError);
                }

                // Update scheduled message status
                await base44.asServiceRole.entities.ScheduledMessage.update(msg.id, {
                    status: 'sent',
                    sent_at: now.toISOString(),
                });

                results.push({ id: msg.id, status: 'sent' });
            } catch (error) {
                console.error(`Failed to send message ${msg.id}:`, error);
                
                // Mark as failed
                await base44.asServiceRole.entities.ScheduledMessage.update(msg.id, {
                    status: 'failed',
                });

                results.push({ id: msg.id, status: 'failed', error: error.message });
            }
        }

        return Response.json({
            success: true,
            processed: results.length,
            results,
        });
    } catch (error) {
        console.error('Error processing scheduled messages:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});