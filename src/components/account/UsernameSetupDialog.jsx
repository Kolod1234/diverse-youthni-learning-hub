import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UsernameSetupDialog({ onComplete }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await base44.functions.invoke('setUsername', { username });
      await onComplete(response.data.username);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to save that username. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background p-4">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-xl">
      <h1 className="text-2xl font-bold text-card-foreground">Choose your public username</h1>
      <p className="mt-2 text-sm text-muted-foreground">This is the only name shown on public scoreboards. Do not use your real name.</p>
      <Input className="mt-6" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. BrightFox27" maxLength={20} autoFocus aria-label="Public username" />
      <p className="mt-2 text-xs text-muted-foreground">3–20 characters; begin with a letter and use letters, numbers or underscores.</p>
      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      <Button className="mt-6 w-full" type="submit" disabled={saving || !username.trim()}>{saving ? 'Checking...' : 'Save username'}</Button>
    </form>
  </div>;
}