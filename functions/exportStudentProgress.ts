import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all enrollments for the user
        const enrollments = await base44.entities.Enrollment.filter({ 
            created_by: user.email 
        });

        // Get all courses
        const allCourses = await base44.asServiceRole.entities.Course.list();

        // Create PDF
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.text('Learning Progress Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Student: ${user.full_name}`, 20, 35);
        doc.text(`Email: ${user.email}`, 20, 42);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 49);
        
        // Statistics
        doc.setFontSize(14);
        doc.text('Summary Statistics', 20, 65);
        
        doc.setFontSize(11);
        const completed = enrollments.filter(e => e.is_completed).length;
        const inProgress = enrollments.length - completed;
        const totalHours = enrollments.reduce((sum, e) => {
            const course = allCourses.find(c => c.id === e.course_id);
            return sum + (course?.duration_hours || 0) * (e.progress_percent / 100);
        }, 0);

        doc.text(`Total Courses: ${enrollments.length}`, 20, 75);
        doc.text(`Completed: ${completed}`, 20, 82);
        doc.text(`In Progress: ${inProgress}`, 20, 89);
        doc.text(`Hours Learned: ${Math.round(totalHours)}`, 20, 96);

        // Course Details
        doc.setFontSize(14);
        doc.text('Course Details', 20, 115);
        
        let y = 125;
        doc.setFontSize(10);

        enrollments.forEach((enrollment, index) => {
            const course = allCourses.find(c => c.id === enrollment.course_id);
            if (!course) return;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(11);
            doc.text(`${index + 1}. ${course.title}`, 20, y);
            y += 7;
            
            doc.setFontSize(9);
            doc.text(`Progress: ${Math.round(enrollment.progress_percent || 0)}%`, 25, y);
            doc.text(`Status: ${enrollment.is_completed ? 'Completed' : 'In Progress'}`, 80, y);
            y += 7;
            
            doc.text(`Instructor: ${course.instructor}`, 25, y);
            y += 7;
            
            if (enrollment.is_completed && enrollment.completed_date) {
                doc.text(`Completed: ${new Date(enrollment.completed_date).toLocaleDateString()}`, 25, y);
                y += 7;
            }
            
            y += 5;
        });

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=progress-report-${user.email}.pdf`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});