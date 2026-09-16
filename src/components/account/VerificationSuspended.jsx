import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function VerificationSuspended({ status, onResent }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const resend = async () => {
    setSending(true);
    setError('');
    try {
      const response = await base44.functions.invoke('submitAgeVerification', { resend: true });
      onResent(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to resend the consent request.');
    } finally {
      setSending(false);
    }
  };

  const message = status === 'declined'
    ? 'Your parent or guardian did not give consent to use the learning website.'
    : 'The three-day parental consent period ended without verification.';

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Portal suspended pending verification</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {status === 'expired' && (
          <Button className="mt-6" onClick={resend} disabled={sending}>
            {sending ? 'Sending...' : 'Send a new consent link'}
          </Button>
        )}
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      </div>
    </div>
  );
}