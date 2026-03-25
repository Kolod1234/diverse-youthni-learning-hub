import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
        }

        const urlParams = new URL(req.url).searchParams;
        const type = urlParams.get('type') || 'courses'; // courses, enrollments, or reviews

        let csvContent = '';
        
        if (type === 'courses') {
            const courses = await base44.asServiceRole.entities.Course.list();
            const enrollments = await base44.asServiceRole.entities.Enrollment.list();
            
            // CSV Header
            csvContent = 'Course ID,Title,Instructor,Category,Level,Price,Duration (hrs),Lessons,Enrolled Students,Created Date\n';
            
            // CSV Rows
            courses.forEach(course => {
                const enrollmentCount = enrollments.filter(e => e.course_id === course.id).length;
                csvContent += `"${course.id}","${course.title}","${course.instructor}","${course.category}","${course.level}",${course.price || 0},${course.duration_hours || 0},${course.total_lessons || 0},${enrollmentCount},"${new Date(course.created_date).toLocaleDateString()}"\n`;
            });
        } 
        else if (type === 'enrollments') {
            const enrollments = await base44.asServiceRole.entities.Enrollment.list();
            const courses = await base44.asServiceRole.entities.Course.list();
            
            // CSV Header
            csvContent = 'Enrollment ID,Student Email,Course Title,Progress %,Completed Lessons,Status,Enrolled Date,Completed Date\n';
            
            // CSV Rows
            enrollments.forEach(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                csvContent += `"${enrollment.id}","${enrollment.created_by}","${course?.title || 'N/A'}",${Math.round(enrollment.progress_percent || 0)},${enrollment.completed_lessons?.length || 0},"${enrollment.is_completed ? 'Completed' : 'In Progress'}","${new Date(enrollment.created_date).toLocaleDateString()}","${enrollment.completed_date ? new Date(enrollment.completed_date).toLocaleDateString() : 'N/A'}"\n`;
            });
        }
        else if (type === 'reviews') {
            const reviews = await base44.asServiceRole.entities.Review.list();
            const courses = await base44.asServiceRole.entities.Course.list();
            
            // CSV Header
            csvContent = 'Review ID,Course,Student,Rating,Type,Comment,Date\n';
            
            // CSV Rows
            reviews.forEach(review => {
                const course = courses.find(c => c.id === review.course_id);
                const comment = (review.comment || '').replace(/"/g, '""');
                csvContent += `"${review.id}","${course?.title || 'N/A'}","${review.user_name || review.created_by}",${review.rating},"${review.rating_type || 'course'}","${comment}","${new Date(review.created_date).toLocaleDateString()}"\n`;
            });
        }

        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${type}-export-${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});