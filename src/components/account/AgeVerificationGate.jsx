import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AgeVerificationForm from './AgeVerificationForm';
import VerificationSuspended from './VerificationSuspended';

export default function AgeVerificationGate({ user, children }) {
  const isParentPortal = window.location.pathname === '/parent-dashboard';
  const isStudent = user && !isParentPortal && user.account_type !== 'parent' && user.role !== 'admin' && !user.is_tutor && !user.is_coordinator;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['age-verification', user?.id],
    queryFn: async () => (await base44.functions.invoke('getAgeVerificationStatus', {})).data,
    enabled: !!isStudent,
    refetchInterval: 60000,
  });
  if (!isStudent) return children;
  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  if (isError) return <div className="fixed inset-0 z-[210] flex items-center justify-center bg-background p-4"><div className="max-w-md rounded-2xl border bg-card p-7 text-center shadow-xl"><h1 className="text-xl font-bold">Verification unavailable</h1><p className="mt-2 text-sm text-muted-foreground">We could not safely confirm your verification status.</p><button className="mt-5 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground" onClick={() => refetch()}>Try again</button></div></div>;
  if (data?.status === 'not_started') return <AgeVerificationForm user={user} onComplete={() => refetch()} />;
  if (data?.status === 'expired' || data?.status === 'declined') return <VerificationSuspended status={data.status} onResent={() => refetch()} />;
  return children;
}