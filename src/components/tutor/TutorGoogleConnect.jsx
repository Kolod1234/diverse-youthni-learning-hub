import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Link2, Loader2, LogOut } from 'lucide-react';

// ID of the "Tutor Google Calendar" workspace connector registered for this app.
// Each tutor connects their OWN Google account so Meet sessions are hosted on their calendar.
const CONNECTOR_ID = '6a2ff9b66b58a1afd53c7b4c';

export default function TutorGoogleConnect() {
  const [status, setStatus] = useState('checking'); // checking | connected | disconnected
  const [busy, setBusy] = useState(false);

  // We probe by attempting to create an OAuth URL through a tiny test: the only reliable
  // way to know if the user is connected is to invoke a backend function that uses the
  // connection. We piggy-back on the existing createGoogleMeetSession by NOT actually
  // calling it (it would create a meeting). Instead we check by trying to connect and
  // letting Base44 short-circuit if already authorized — but that opens a popup.
  // Simpler approach: track connection state in user prefs after a successful connect.
  useEffect(() => {
    base44.auth.me()
      .then(u => setStatus(u?.google_calendar_connected ? 'connected' : 'disconnected'))
      .catch(() => setStatus('disconnected'));
  }, []);

  const handleConnect = async () => {
    setBusy(true);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank', 'width=520,height=640');
      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          // Mark as connected on the user record so the UI persists across reloads.
          await base44.auth.updateMe({ google_calendar_connected: true });
          setStatus('connected');
          setBusy(false);
        }
      }, 500);
    } catch (e) {
      setBusy(false);
      alert('Could not start Google connection: ' + (e?.message || e));
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    } catch (_) { /* ignore */ }
    await base44.auth.updateMe({ google_calendar_connected: false });
    setStatus('disconnected');
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-blue-500" />
        Google Calendar
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Connect your Google account so live sessions are hosted on <strong>your</strong> calendar
        with <strong>your</strong> email as host (just like Zoom).
      </p>

      {status === 'checking' && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking…
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Connected — sessions host on your Google account</span>
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
        <Button
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={handleConnect}
          disabled={busy}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Connect Google Calendar
        </Button>
      )}
    </div>
  );
}