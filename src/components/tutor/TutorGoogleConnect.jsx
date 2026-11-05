import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Link2, Loader2, LogOut, AlertCircle } from 'lucide-react';

// ID of the "Tutor Google Calendar" workspace connector (APP_USER mode).
// Each tutor connects their OWN Google account so Meet sessions are hosted on
// their calendar (like Zoom). Connection state is verified server-side against
// a real OAuth grant — never derived from popup-close, never self-declared.
const CONNECTOR_ID = '6a2ff9b66b58a1afd53c7b4c';

export default function TutorGoogleConnect() {
  const [status, setStatus] = useState('checking'); // checking | connected | disconnected | error
  const [connectedEmail, setConnectedEmail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const verify = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('checkTutorGoogleConnection', {});
      const data = res?.data || {};
      if (data.connected) {
        setConnectedEmail(data.email || null);
        setStatus('connected');
      } else {
        setConnectedEmail(null);
        setStatus('disconnected');
      }
      setErrorMsg(null);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || 'Could not check connection');
    }
  }, []);

  useEffect(() => { verify(); }, [verify]);

  const handleConnect = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank', 'width=520,height=640');
      if (!popup) {
        setBusy(false);
        setErrorMsg('Popup was blocked. Please allow popups and try again.');
        return;
      }
      // When the popup closes, verify against the server. Popup-closed alone
      // does NOT imply consent — the user may have cancelled or hit an error.
      const timer = setInterval(async () => {
        if (popup.closed) {
          clearInterval(timer);
          await verify();
          setBusy(false);
        }
      }, 500);
    } catch (e) {
      setBusy(false);
      setErrorMsg(e?.message || 'Could not start Google connection');
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    } catch (_) { /* ignore */ }
    await verify();
    setBusy(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-blue-500" />
        Google Calendar
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Connect your Google account so live sessions are hosted on <strong>your</strong> calendar
        with <strong>your</strong> email as host (just like Zoom).
      </p>

      {status === 'checking' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking…
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div>Connected — sessions host on your Google account</div>
              {connectedEmail && (
                <div className="text-xs text-emerald-800/80 mt-0.5">{connectedEmail}</div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1"
            onClick={handleDisconnect}
            disabled={busy}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Disconnect
          </Button>
        </div>
      )}

      {status === 'disconnected' && (
        <>
          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={handleConnect}
            disabled={busy}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            Connect Google Calendar
          </Button>
          {errorMsg && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div>Could not verify connection.</div>
            {errorMsg && <div className="text-xs mt-0.5">{errorMsg}</div>}
            <button onClick={verify} className="text-xs underline mt-1">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}