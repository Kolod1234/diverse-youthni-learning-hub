import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, enrollmentId } = await req.json();

        // Get course and enrollment details
        const courses = await base44.entities.Course.filter({ id: courseId });
        const course = courses[0];

        if (!course) {
            return Response.json({ error: 'Course not found' }, { status: 404 });
        }

        // Send completion email with certificate info
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `🎉 Congratulations! You completed ${course.title}`,
            body: `
                <h2>🎓 Course Completed!</h2>
                <p>Hi ${user.full_name},</p>
                <p>Congratulations on completing <strong>${course.title}</strong>!</p>
                <p>You've demonstrated dedication and commitment throughout this journey.</p>
                <p><strong>Your Achievement:</strong></p>
                <ul>
                    <li>Course: ${course.title}</li>
                    <li>Instructor: ${course.instructor}</li>
                    <li>Completed: ${new Date().toLocaleDateString()}</li>
                </ul>
                <p>Your certificate is now available in your dashboard.</p>
                <p>Keep learning and growing!</p>
                <p>Best regards,<br>Diverse Youth NI Team</p>
            `
        });

        return Response.json({ 
            success: true, 
            message: 'Completion email sent successfully' 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});