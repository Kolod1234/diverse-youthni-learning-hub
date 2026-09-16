import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { jsPDF } from 'npm:jspdf@2.5.2';

const clean = (value) => String(value || '')
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201c\u201d]/g, '"')
  .replace(/[\u2013\u2014]/g, '-')
  .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const solutions = Array.isArray(body.solutions) ? body.solutions.slice(0, 100) : [];
    if (!solutions.length) return Response.json({ error: 'No solutions supplied' }, { status: 400 });

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 170;
    let y = 20;
    const writeLines = (text: string, size = 10, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(clean(text).slice(0, 50000), pageWidth);
      for (const line of lines) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 20, y); y += size * 0.45;
      }
      y += 3;
    };

    writeLines('Past Paper AI Solver', 18, true);
    writeLines(`${clean(body.qualification)} ${clean(body.subject)} - AI-generated study support`, 11);
    solutions.forEach((item: any, index: number) => {
      if (index > 0) { doc.addPage(); y = 20; }
      writeLines(item.number ? `Question ${item.number}` : `Solution ${index + 1}`, 14, true);
      writeLines('Question', 11, true);
      writeLines(item.question || 'Question supplied as an uploaded image or document.');
      if (item.marks) writeLines(`Marks: ${item.marks}`);
      writeLines('Solution', 11, true);
      writeLines(item.answer);
    });

    const dataUri = doc.output('datauristring');
    return Response.json({
      filename: `past-paper-solution-${new Date().toISOString().slice(0, 10)}.pdf`,
      base64: dataUri.slice(dataUri.indexOf(',') + 1),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'PDF export failed' }, { status: 500 });
  }
}