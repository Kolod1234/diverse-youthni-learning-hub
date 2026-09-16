import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { ageFromDateOfBirth, consentEmail, newConsentToken } from '../../shared/parentalConsent.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'admin' || user.is_tutor || user.is_coordinator) return Response.json({ status: 'not_required' });

    const payload = await req.json();
    const existing = await base44.asServiceRole.entities.StudentVerification.filter({ student_user_id: user.id }, '-created_date', 1);
    const current = existing[0];

    if (payload.resend === true) {
      if (!current || current.status !== 'expired') return Response.json({ error: 'This request cannot be resent.' }, { status: 409 });
      const consent_token = newConsentToken();
      const deadline_at = new Date(Date.now() + 3 * 86400000).toISOString();
      const updated = await base44.asServiceRole.entities.StudentVerification.update(current.id, { status: 'pending', consent_token, deadline_at, reminder_count: 0, last_reminder_at: new Date().toISOString() });
      const mail = consentEmail(updated);
      await base44.asServiceRole.integrations.Core.SendEmail({ to: updated.parent_email, subject: mail.subject, html: mail.html, text: mail.text, from_name: 'Diverse Youth NI' });
      return Response.json({ status: 'pending', deadline_at });
    }

    if (current) return Response.json({ status: current.status, deadline_at: current.deadline_at || null });
    const student_name = String(payload.student_name || '').trim();
    const date_of_birth = String(payload.date_of_birth || '');
    const age = ageFromDateOfBirth(date_of_birth);
    if (!student_name || student_name.length > 120) return Response.json({ error: 'Enter the student’s name.' }, { status: 400 });
    if (age === null) return Response.json({ error: 'Enter a valid date of birth.' }, { status: 400 });

    if (age >= 18) {
      await base44.asServiceRole.entities.StudentVerification.create({ student_user_id: user.id, student_name, date_of_birth, status: 'adult_verified', website_consent: true, photography_consent: false });
      return Response.json({ status: 'adult_verified' });
    }

    const parent_email = String(payload.parent_email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent_email)) return Response.json({ error: 'Enter a valid parent or guardian email address.' }, { status: 400 });
    if (parent_email === String(user.email || '').toLowerCase()) return Response.json({ error: 'Use a parent or guardian’s email address, not the student email.' }, { status: 400 });
    const consent_token = newConsentToken();
    const deadline_at = new Date(Date.now() + 3 * 86400000).toISOString();
    const record = await base44.asServiceRole.entities.StudentVerification.create({ student_user_id: user.id, student_name, date_of_birth, parent_email, status: 'pending', website_consent: false, photography_consent: false, consent_token, deadline_at, reminder_count: 0 });
    try {
      const mail = consentEmail(record);
      await base44.asServiceRole.integrations.Core.SendEmail({ to: parent_email, subject: mail.subject, html: mail.html, text: mail.text, from_name: 'Diverse Youth NI' });
    } catch (error) {
      await base44.asServiceRole.entities.StudentVerification.delete(record.id);
      throw error;
    }
    return Response.json({ status: 'pending', deadline_at });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}