import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ageFromDob = (value) => {
  if (!value) return null;
  const today = new Date();
  const birth = new Date(`${value}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

export default function AgeVerificationForm({ user, onComplete }) {
  const [name, setName] = useState(user?.full_name || '');
  const [dob, setDob] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const age = useMemo(() => ageFromDob(dob), [dob]);
  const under18 = age !== null && age < 18;
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      const response = await base44.functions.invoke('submitAgeVerification', { student_name: name, date_of_birth: dob, parent_email: parentEmail });
      onComplete(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to submit verification. Please try again.');
    } finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-[210] overflow-y-auto bg-background p-4"><form onSubmit={submit} className="mx-auto my-8 w-full max-w-lg rounded-2xl border bg-card p-7 shadow-xl">
    <h1 className="text-2xl font-bold">Age verification</h1><p className="mt-2 text-sm text-muted-foreground">Students under 18 need consent from a parent or legal guardian.</p>
    <label className="mt-6 block text-sm font-medium">Student name</label><Input value={name} onChange={e => setName(e.target.value)} maxLength={120} required />
    <label className="mt-4 block text-sm font-medium">Date of birth</label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} required />
    {under18 && <><label className="mt-4 block text-sm font-medium">Parent or guardian email</label><Input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} required /><p className="mt-2 text-xs text-muted-foreground">They will receive a secure consent link and daily reminders. They have three days to respond.</p></>}
    <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground"><strong className="text-foreground">Privacy and safeguarding</strong><p className="mt-1">Personal data will not be shared with anyone except constituted mandatory authorities when lawfully requested. All safeguarding procedures will be followed with due diligence.</p></div>
    {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}<Button className="mt-6 w-full" disabled={saving || !dob || !name.trim() || (under18 && !parentEmail)}>{saving ? 'Submitting...' : 'Submit verification'}</Button>
  </form></div>;
}