import React from 'react';
export default function ParentChildrenList({ links, managed }){
 const items=[...(links||[]).map(x=>({id:x.id,name:x.child_name,detail:x.child_email,status:x.status})),...(managed||[]).map(x=>({id:x.id,name:x.child_name,detail:'Parent-managed profile',status:'managed'}))];
 if(!items.length)return null;
 return <section className="rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Your children</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map(item=><div key={item.id} className="rounded-xl bg-muted p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.detail}</p></div><span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium capitalize">{item.status}</span></div></div>)}</div></section>;
}