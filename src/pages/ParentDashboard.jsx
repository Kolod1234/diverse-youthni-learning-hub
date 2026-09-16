import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ParentMetricCards from '@/components/parent/ParentMetricCards';
import ChildProgressPanel from '@/components/parent/ChildProgressPanel';
import ParentSchedule from '@/components/parent/ParentSchedule';
import GoogleCalendarCard from '@/components/parent/GoogleCalendarCard';
import ParentChildForms from '@/components/parent/ParentChildForms';
import ParentMessages from '@/components/parent/ParentMessages';
import ParentChildrenList from '@/components/parent/ParentChildrenList';
import ParentPortalSetup from '@/components/parent/ParentPortalSetup';
export default function ParentDashboard(){
 const [data,setData]=useState(null),[selected,setSelected]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=async()=>{setLoading(true);try{const res=await base44.functions.invoke('parentPortal',{action:'dashboard'});setData(res.data);setSelected(current=>current||res.data.children?.[0]?.id||'');setError('');}catch(e){setError(e.response?.data?.error||e.message);}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const act=async(action,payload)=>{await base44.functions.invoke('parentPortal',{action,...payload});await load();};
 const child=data?.children?.find(item=>item.id===selected)||data?.children?.[0];
 if(data?.needs_setup)return <ParentPortalSetup saving={loading} onActivate={()=>act('setup_parent',{})}/>;
 if(loading&&!data)return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary"/></div>;
 if(error&&!data)return <div className="mx-auto max-w-md p-8 text-center"><h1 className="text-xl font-bold">Parent dashboard unavailable</h1><p className="my-4 text-muted-foreground">{error}</p><Button onClick={load}>Try again</Button></div>;
 return <div className="min-h-screen bg-muted/30"><div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"><header className="rounded-3xl bg-primary p-7 text-primary-foreground"><p className="text-sm font-medium opacity-80">Diverse Youth NI</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Parent dashboard</h1><p className="mt-2 opacity-85">Progress, study time, assignments, classes and messages in one secure place.</p></div>{data?.children?.length>0&&<select className="rounded-xl bg-background px-4 py-2 text-foreground" value={child?.id||''} onChange={e=>setSelected(e.target.value)}>{data.children.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>}</div></header><ParentMetricCards child={child}/><ChildProgressPanel child={child}/><div className="grid gap-6 lg:grid-cols-2"><ParentSchedule schedules={data?.schedules}/><GoogleCalendarCard/></div><ParentMessages messages={data?.messages} tutors={data?.tutors} onSend={(recipient_email,content)=>act('send_message',{recipient_email,content})}/><ParentChildrenList links={data?.links} managed={data?.managed_children}/><ParentChildForms onAction={act}/>{data?.links?.some(link=>link.status==='pending')&&<div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">An existing-account link is awaiting safeguarding verification. No child progress is visible until an administrator approves it.</div>}</div></div>;
}