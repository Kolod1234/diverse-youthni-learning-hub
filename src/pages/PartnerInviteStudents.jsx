import React from 'react';
import { PartnerShell, InviteView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — School: invite students. Sample data only; nothing is saved.
export default function PartnerInviteStudents() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="invite">
      <InviteView go={go} />
    </PartnerShell>
  );
}
