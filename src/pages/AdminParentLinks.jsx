import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminParentRequestCard from '@/components/parent/AdminParentRequestCard';
import AdminRegisteredChildren from '@/components/parent/AdminRegisteredChildren';
export default function AdminParentLinks(){
 const [data,setData]=useState({requests:[],learners:[],registered_children:[]}),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=async()=>{try{const res=await base44.functions.invoke('adminParentLinks',{});setData(res.data);setError('');}catch(e){setError(e.response?.data?.error||e.message);}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const decide=async(request_id,decision,child_user_id)=>{await base44.functions.invoke('adminParentLinks',{action:'decide',request_id,decision,child_user_id});await load();};
 if(loading)return <div className="p-10 text-center">Loading verification requests…</div>;
 return <div className="min-h-screen bg-muted/30 px-4 py-8"><div className="mx-auto max-w-5xl"><header className="mb-6"><h1 className="text-3xl font-bold">Parent verification</h1><p className="mt-2 text-muted-foreground">Confirm the relationship offline, then select the exact learner account before approval.</p></header><AdminRegisteredChildren children={data.registered_children}/>{error?<div className="rounded-xl border border-destructive p-4 text-destructive">{error}</div>:<div className="space-y-4">{data.requests.length?data.requests.map(request=><AdminParentRequestCard key={request.id} request={request} learners={data.learners} onDecide={decide}/>):<div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No parent link requests.</div>}</div>}</div></div>;
}