import React from 'react';
import { PartnerShell, JoinView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — Student: join your school with a code. Sample data only; nothing is saved.
export default function PartnerJoinSchool() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="join">
      <JoinView go={go} />
    </PartnerShell>
  );
}
