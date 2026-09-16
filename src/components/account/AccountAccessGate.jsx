import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import TutorComplianceForm from '@/components/compliance/TutorComplianceForm';
export default function AccountAccessGate({user,refreshUser,children}){
 const [status,setStatus]=useState(null),[error,setError]=useState('');
 const check=async()=>{if(!user?.is_tutor||user?.role==='admin')return setStatus({applicable:false});try{const res=await base44.functions.invoke('tutorCompliance',{action:'status'});setStatus(res.data);setError('');}catch(e){setError(e.response?.data?.error||e.message);}};
 useEffect(()=>{check();},[user?.id,user?.tutor_compliance_due_at]);
 if(user?.account_banned)return <div className="flex min-h-screen items-center justify-center bg-muted p-6"><div className="max-w-md rounded-2xl border bg-card p-8 text-center"><h1 className="text-2xl font-bold">Account access restricted</h1><p className="mt-3 text-muted-foreground">{user.ban_reason||'An administrator has restricted this account. Contact Diverse Youth NI for support.'}</p><a className="mt-5 inline-block underline" href="mailto:info@diverseyouthni.com">info@diverseyouthni.com</a></div></div>;
 if(user?.is_tutor&&user?.role!=='admin'&&!status&&!error)return <div className="flex min-h-screen items-center justify-center">Checking compliance…</div>;
 if(error)return <div className="flex min-h-screen items-center justify-center p-6"><div className="text-center"><p>Compliance status is unavailable.</p><Button className="mt-4" onClick={check}>Try again</Button></div></div>;
 if(status?.overdue)return <div className="min-h-screen bg-muted/30 px-4 py-10"><TutorComplianceForm locked onComplete={async()=>{await refreshUser?.();await check();}}/></div>;
 return children;
}