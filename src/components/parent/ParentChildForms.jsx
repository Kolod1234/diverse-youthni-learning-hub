import React from 'react';
import ChildRegistrationForm from '@/components/parent/ChildRegistrationForm';
export default function ParentChildForms({ onAction, onRegistered }) {
 const register=async(form)=>{const result=await onAction('managed_child',form);onRegistered?.(result?.child);};
 return <section className="rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Add your child</h2><p className="mt-1 text-sm text-muted-foreground">Register the child’s information. An administrator can create their login later.</p><ChildRegistrationForm onSubmit={register}/></section>;
}