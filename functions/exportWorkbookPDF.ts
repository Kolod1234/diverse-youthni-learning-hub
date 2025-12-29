import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { progressId } = await req.json();

        const progress = await base44.entities.WorkbookProgress.filter({ id: progressId });
        if (!progress || progress.length === 0) {
            return Response.json({ error: 'Workbook not found' }, { status: 404 });
        }

        const workbook = progress[0];
        const qualification = await base44.entities.YouthWorkQualification.filter({ id: workbook.qualification_id });
        
        const doc = new jsPDF();
        let y = 20;

        // Header
        doc.setFontSize(20);
        doc.text('Youth Work Workbook', 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.text(`Participant: ${workbook.participant_name}`, 20, y);
        y += 7;
        doc.text(`Email: ${workbook.participant_email}`, 20, y);
        y += 7;
        doc.text(`Qualification: ${qualification[0]?.title || 'N/A'}`, 20, y);
        y += 7;
        doc.text(`Unit: ${workbook.unit_index + 1}`, 20, y);
        y += 7;
        doc.text(`Progress: ${workbook.progress_percent}%`, 20, y);
        y += 7;
        doc.text(`Status: ${workbook.is_approved ? 'Approved' : workbook.is_submitted ? 'Submitted' : 'In Progress'}`, 20, y);
        y += 10;

        // Workbook Data
        doc.setFontSize(14);
        doc.text('Workbook Responses:', 20, y);
        y += 10;

        doc.setFontSize(10);
        const workbookData = workbook.workbook_data || {};
        
        for (const [section, data] of Object.entries(workbookData)) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Section: ${section}`, 20, y);
            y += 7;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            if (typeof data === 'object' && data !== null) {
                for (const [key, value] of Object.entries(data)) {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }

                    const questionText = `Q: ${key}`;
                    const lines = doc.splitTextToSize(questionText, 170);
                    lines.forEach(line => {
                        doc.text(line, 25, y);
                        y += 5;
                    });

                    const answerText = `A: ${value || '(No answer)'}`;
                    const answerLines = doc.splitTextToSize(answerText, 170);
                    answerLines.forEach(line => {
                        doc.text(line, 25, y);
                        y += 5;
                    });
                    y += 3;
                }
            }
            y += 5;
        }

        // Feedback
        if (workbook.coordinator_feedback) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            y += 5;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Coordinator Feedback:', 20, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const feedbackLines = doc.splitTextToSize(workbook.coordinator_feedback, 170);
            feedbackLines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 5;
            });
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=workbook-${workbook.participant_name}-${Date.now()}.pdf`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});