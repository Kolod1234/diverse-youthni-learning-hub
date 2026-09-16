import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CONNECTOR_ID = "6a2ff9b66b58a1afd53c7b4c";
export default function GroupCalendarSyncCard() {
  const [state, setState] = useState({ loading: true, authenticated: false, connected: false, synced: 0 });
  const sync = async () => {
    try {
      const response = await base44.functions.invoke("syncMyGroupStudySessions", {});
      setState({ loading: false, authenticated: true, connected: true, synced: response.data.synced || 0 });
    } catch (_) {
      setState((current) => ({ ...current, loading: false, authenticated: true, connected: false }));
    }
  };
  useEffect(() => { base44.auth.isAuthenticated().then((authenticated) => authenticated ? sync() : setState({ loading: false, authenticated: false, connected: false, synced: 0 })); }, []);
  const connect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = window.setInterval(() => { if (!popup || popup.closed) { window.clearInterval(timer); sync(); } }, 500);
  };
  const disconnect = async () => { await base44.connectors.disconnectAppUser(CONNECTOR_ID); setState((current) => ({ ...current, connected: false, synced: 0 })); };
  if (state.loading) return <Card className="p-4 text-sm text-gray-500">Checking Google Calendar…</Card>;
  return <Card className="p-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-blue-600" /><div><p className="font-semibold">Personal Google Calendar</p><p className="text-sm text-gray-500">{state.connected ? `${state.synced} upcoming session${state.synced === 1 ? "" : "s"} synced with a 24-hour email reminder.` : "Connect to keep your group sessions synced automatically."}</p></div></div>{!state.authenticated ? <Button size="sm" onClick={() => base44.auth.redirectToLogin()}>Log in</Button> : state.connected ? <Button size="sm" variant="outline" onClick={disconnect}>Disconnect</Button> : <Button size="sm" onClick={connect}>Connect Google Calendar</Button>}</Card>;
}