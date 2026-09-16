import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock3, ShieldCheck } from 'lucide-react';

const remaining = (deadline) => {
  const ms = Math.max(0, new Date(deadline).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export default function ParentalConsentCountdown({ user }) {
  const [, tick] = useState(0);
  const { data } = useQuery({
    queryKey: ['age-verification', user?.id],
    queryFn: async () => (await base44.functions.invoke('getAgeVerificationStatus', {})).data,
    enabled: !!user,
    refetchInterval: 60000,
  });
  useEffect(() => { const timer = setInterval(() => tick(value => value + 1), 1000); return () => clearInterval(timer); }, []);
  if (data?.status !== 'pending') return null;
  return <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 shrink-0" /><div><h2 className="font-bold">Parental consent pending</h2><p className="mt-1 text-sm">Daily reminders are being sent to your parent or guardian. Your portal will be suspended if consent is not received in time.</p></div></div>
    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 font-mono font-bold shadow-sm"><Clock3 className="h-5 w-5" />{remaining(data.deadline_at)}</div>
  </div>;
}