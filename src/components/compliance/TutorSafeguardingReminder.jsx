import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export default function TutorSafeguardingReminder(){
 const [open,setOpen]=useState(true),[status,setStatus]=useState(null),[sent,setSent]=useState(false);
 useEffect(()=>{base44.functions.invoke('tutorCompliance',{action:'status'}).then(res=>setStatus(res.data));},[]);
 const request=async()=>{await base44.functions.invoke('tutorCompliance',{action:'safeguarding_request'});setSent(true);};
 return <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Safeguarding reminder</DialogTitle></DialogHeader><p>Report safeguarding concerns, online risks and safety issues immediately. Keep screenshot evidence secure.</p><div className="rounded-xl bg-muted p-4 text-sm"><p>Email: <a className="underline" href="mailto:info@diverseyouthni.com">info@diverseyouthni.com</a></p><p>Office: <a className="underline" href="tel:02890138615">028 9013 8615</a></p>{status?.due_at&&<p className="mt-2 font-medium">Compliance form due: {new Date(status.due_at).toLocaleDateString('en-GB')}</p>}</div><Button variant="outline" onClick={request}>{sent?'Procedure requested':'Request reporting procedure from admin'}</Button><Button onClick={()=>setOpen(false)}>I understand</Button></DialogContent></Dialog>;
}