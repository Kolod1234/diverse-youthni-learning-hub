import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await req.json();

        // Get course details
        const courses = await base44.entities.Course.filter({ id: courseId });
        const course = courses[0];

        if (!course) {
            return Response.json({ error: 'Course not found' }, { status: 404 });
        }

        // Send enrollment confirmation email
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `Welcome to ${course.title}!`,
            body: `
                <h2>Enrollment Confirmed!</h2>
                <p>Hi ${user.full_name},</p>
                <p>You've successfully enrolled in <strong>${course.title}</strong>.</p>
                <p><strong>Course Details:</strong></p>
                <ul>
                    <li>Instructor: ${course.instructor}</li>
                    <li>Duration: ${course.duration_hours} hours</li>
                    <li>Total Lessons: ${course.total_lessons}</li>
                </ul>
                <p>Start learning now and unlock your potential!</p>
                <p>Best regards,<br>Diverse Youth NI Team</p>
            `
        });

        return Response.json({ 
            success: true, 
            message: 'Enrollment email sent successfully' 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});