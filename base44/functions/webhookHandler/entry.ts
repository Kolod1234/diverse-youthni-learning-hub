import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify webhook signature or secret (if provided)
        const urlParams = new URL(req.url).searchParams;
        const secret = urlParams.get('secret');
        
        // Optional: Validate webhook secret
        const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
        if (expectedSecret && secret !== expectedSecret) {
            return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
        }

        // Parse webhook payload
        const payload = await req.json();
        
        // Log webhook for debugging
        console.log('Webhook received:', {
            timestamp: new Date().toISOString(),
            payload: payload
        });

        // Handle different webhook types
        const { type, data } = payload;

        switch (type) {
            case 'form_submission':
                // Handle form submissions
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: Deno.env.get('ADMIN_EMAIL') || 'admin@example.com',
                    subject: 'New Form Submission',
                    body: `
                        <h2>New Form Submission</h2>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    `
                });
                break;

            case 'enrollment_notification':
                // Handle enrollment notifications from external systems
                if (data.course_id && data.user_email) {
                    // Create enrollment record
                    await base44.asServiceRole.entities.Enrollment.create({
                        course_id: data.course_id,
                        created_by: data.user_email,
                        progress_percent: 0,
                        completed_lessons: [],
                        is_completed: false
                    });
                }
                break;

            case 'user_update':
                // Handle user profile updates from external systems
                if (data.email && data.updates) {
                    const users = await base44.asServiceRole.entities.User.filter({ 
                        email: data.email 
                    });
                    if (users.length > 0) {
                        await base44.asServiceRole.entities.User.update(
                            users[0].id, 
                            data.updates
                        );
                    }
                }
                break;

            default:
                console.log('Unknown webhook type:', type);
        }

        return Response.json({ 
            success: true, 
            message: 'Webhook processed successfully',
            type: type
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});