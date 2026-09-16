import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquareWarning } from 'lucide-react';
export default function SafeguardingNotice({open,onClose,onRequest}){
 const [sent,setSent]=useState(false);
 const request=async()=>{await onRequest();setSent(true);};
 return <Dialog open={open} onOpenChange={value=>!value&&onClose()}><DialogContent><DialogHeader><DialogTitle>Safeguarding and online safety</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Report concerns, risks or incidents promptly. Preserve screenshot evidence without sharing it publicly.</p><div className="space-y-3"><a className="flex items-center gap-3 rounded-xl border p-4" href="mailto:info@diverseyouthni.com?subject=Safeguarding%20concern"><Mail className="h-5 w-5"/>Email evidence to info@diverseyouthni.com</a><a className="flex items-center gap-3 rounded-xl border p-4" href="tel:02890138615"><Phone className="h-5 w-5"/>Call the office: 028 9013 8615</a><Button variant="outline" className="w-full justify-start gap-3" onClick={request}><MessageSquareWarning className="h-5 w-5"/>{sent?'Request sent to admin':'Request safeguarding report procedure'}</Button></div><Button onClick={onClose}>I understand</Button></DialogContent></Dialog>;
}