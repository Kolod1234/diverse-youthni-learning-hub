import React, { useEffect, useState } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
const CONNECTOR_ID = '6a2ff9b66b58a1afd53c7b4c';
export default function GoogleCalendarCard() {
  const [connected,setConnected]=useState(false), [loading,setLoading]=useState(true), [status,setStatus]=useState('');
  const refresh = async () => { try { await base44.functions.invoke('parentCalendarSync',{action:'status'}); setConnected(true); const sync=await base44.functions.invoke('parentCalendarSync',{action:'sync'}); setStatus(sync.data.added ? `${sync.data.added} new items added` : 'Calendar is up to date'); } catch { setConnected(false); setStatus('Connect your calendar to add classes and events automatically.'); } finally { setLoading(false); } };
  useEffect(()=>{ base44.auth.isAuthenticated().then(ok => ok ? refresh() : setLoading(false)); },[]);
  const connect=async()=>{ const url=await base44.connectors.connectAppUser(CONNECTOR_ID); const popup=window.open(url,'_blank','width=640,height=760'); const timer=setInterval(()=>{ if(!popup || popup.closed){clearInterval(timer);setLoading(true);refresh();}},500); };
  const disconnect=async()=>{await base44.connectors.disconnectAppUser(CONNECTOR_ID);setConnected(false);setStatus('Google Calendar disconnected.');};
  return <section className="rounded-2xl border bg-card p-6"><div className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-primary"/><h2 className="font-semibold">Google Calendar</h2></div><p className="mt-2 text-sm text-muted-foreground">{loading?'Checking calendar…':status}</p><div className="mt-4">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:connected?<Button variant="outline" onClick={disconnect}>Disconnect</Button>:<Button onClick={connect}>Connect Google Calendar</Button>}</div></section>;
}