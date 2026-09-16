import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AgeVerificationForm from './AgeVerificationForm';
import VerificationSuspended from './VerificationSuspended';

export default function AgeVerificationGate({ user, children }) {
  const isStudent = user && user.role !== 'admin' && !user.is_tutor && !user.is_coordinator;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['age-verification', user?.id],
    queryFn: async () => (await base44.functions.invoke('getAgeVerificationStatus', {})).data,
    enabled: !!isStudent,
    refetchInterval: 60000,
  });
  if (!isStudent) return children;
  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  if (data?.status === 'not_started') return <AgeVerificationForm user={user} onComplete={() => refetch()} />;
  if (data?.status === 'expired' || data?.status === 'declined') return <VerificationSuspended status={data.status} onResent={() => refetch()} />;
  return children;
}