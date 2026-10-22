import React from 'react';
import { PartnerShell, SchoolsView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — Admin: list of partner schools. Sample data only; nothing is saved.
export default function PartnerSchools() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="schools">
      <SchoolsView go={go} />
    </PartnerShell>
  );
}
