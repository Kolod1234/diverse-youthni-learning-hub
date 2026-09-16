import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { APP_URL, escapeHtml } from '../../shared/parentalConsent.ts';

const page = (title, content) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#172033;margin:0;padding:32px 16px}.card{max-width:680px;margin:auto;background:#fff;border:1px solid #dbe3ee;border-radius:18px;padding:32px;box-shadow:0 12px 35px #0f172a12}h1{margin-top:0}label{display:block;margin:18px 0;line-height:1.55}.notice{background:#eef6ff;border-radius:12px;padding:16px;line-height:1.6}button{border:0;border-radius:10px;padding:13px 18px;font-size:16px;font-weight:700;cursor:pointer}.approve{background:#0f766e;color:white}.decline{background:#fff1f2;color:#be123c;border:1px solid #fecdd3}hr{border:0;border-top:1px solid #e2e8f0;margin:28px 0}</style></head><body><main class="card"><h1>${escapeHtml(title)}</h1>${content}</main></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let token = new URL(req.url).searchParams.get('token') || '';
    let decision = '';
    let websiteConsent = false;
    let photographyConsent = false;
    if (req.method === 'POST') {
      const form = await req.formData();
      token = String(form.get('token') || '');
      decision = String(form.get('decision') || '');
      websiteConsent = form.get('website_consent') === 'yes';
      photographyConsent = form.get('photography_consent') === 'yes';
    }
    if (!token) return page('Invalid consent link', '<p>This parental consent link is incomplete.</p>');
    const records = await base44.asServiceRole.entities.StudentVerification.filter({ consent_token: token }, '-created_date', 1);
    const record = records[0];
    if (!record) return page('Invalid consent link', '<p>This link is invalid or no longer available.</p>');
    if (record.status !== 'pending') return page('Decision already recorded', `<p>This request is already marked as <strong>${escapeHtml(record.status)}</strong>.</p>`);
    if (new Date(record.deadline_at).getTime() <= Date.now()) {
      await base44.asServiceRole.entities.StudentVerification.update(record.id, { status: 'expired' });
      return page('Consent window expired', '<p>The three-day consent window has ended. The student can request a new link from their portal.</p>');
    }
    if (req.method === 'POST') {
      if (decision === 'decline') {
        await base44.asServiceRole.entities.StudentVerification.update(record.id, { status: 'declined', website_consent: false, photography_consent: false, decided_at: new Date().toISOString(), consent_token: '' });
        return page('Consent not given', '<p>Your decision has been recorded. The student portal will remain suspended.</p>');
      }
      if (decision !== 'approve' || !websiteConsent) return page('Website consent required', '<p>Consent to use the learning website is required before access can be approved.</p>');
      await base44.asServiceRole.entities.StudentVerification.update(record.id, { status: 'approved', website_consent: true, photography_consent: photographyConsent, decided_at: new Date().toISOString(), consent_token: '' });
      return page('Consent confirmed', '<p>Thank you. Your consent decision has been securely recorded and the student can use the learning portal.</p>');
    }
    const action = `${APP_URL}/functions/parentConsentDecision`;
    return page('Parental consent form', `<p>You are reviewing access for <strong>${escapeHtml(record.student_name)}</strong>.</p><div class="notice"><strong>Privacy and safeguarding</strong><br>Personal data will not be shared with anyone except constituted mandatory authorities when lawfully requested. All safeguarding procedures will be followed with due diligence.</div><form method="post" action="${action}"><input type="hidden" name="token" value="${escapeHtml(token)}"><input type="hidden" name="decision" value="approve"><label><input type="checkbox" name="website_consent" value="yes" required> I consent to this young person using the website for learning.</label><fieldset><legend>Photography consent for offline classes only</legend><label><input type="radio" name="photography_consent" value="yes" required> I consent to photography.</label><label><input type="radio" name="photography_consent" value="no" required> I do not consent to photography.</label></fieldset><label><input type="checkbox" required> I confirm that I am the parent or legal guardian and have authority to make this decision.</label><button class="approve" type="submit">Give consent</button></form><hr><form method="post" action="${action}"><input type="hidden" name="token" value="${escapeHtml(token)}"><input type="hidden" name="decision" value="decline"><button class="decline" type="submit">Do not give consent</button></form>`);
  } catch (error) {
    return page('Unable to record consent', `<p>${escapeHtml(error.message)}</p>`);
  }
}