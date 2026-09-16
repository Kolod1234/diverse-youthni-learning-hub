export const APP_URL = 'https://learn-sphere-51368216.base44.app';

export function ageFromDateOfBirth(dateOfBirth, now = new Date()) {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()) || birth > now) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
}

export function newConsentToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function consentEmail(record, reminder = false) {
  const url = `${APP_URL}/functions/parentConsentDecision?token=${encodeURIComponent(record.consent_token)}`;
  const deadline = new Date(record.deadline_at).toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short' });
  const subject = `${reminder ? 'Reminder: ' : ''}Parental consent required for Diverse Youth NI`;
  const text = `Dear parent or guardian,\n\n${record.student_name} has requested access to the Diverse Youth NI learning website. Because they are under 18, your decision is required by ${deadline}.\n\nPlease review and decide here: ${url}\n\nThe form asks for consent to use the website for learning and separately asks about photography for offline classes only. Personal data will not be shared with anyone except constituted mandatory authorities when lawfully requested. All safeguarding procedures will be followed with due diligence.\n\nIf you do not respond within three days, the student's portal will be suspended pending verification.`;
  const html = `<p>Dear parent or guardian,</p><p><strong>${escapeHtml(record.student_name)}</strong> has requested access to the Diverse Youth NI learning website. Because they are under 18, your decision is required by <strong>${escapeHtml(deadline)}</strong>.</p><p><a href="${url}">Review the parental consent form</a></p><p>The form asks for consent to use the website for learning and separately asks about photography for offline classes only.</p><p>Personal data will not be shared with anyone except constituted mandatory authorities when lawfully requested. All safeguarding procedures will be followed with due diligence.</p><p>If you do not respond within three days, the student's portal will be suspended pending verification.</p>`;
  return { subject, text, html };
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}