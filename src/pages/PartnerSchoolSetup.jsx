import React from 'react';
import { PartnerShell, SetupView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — School: first-time setup. Sample data only; nothing is saved.
export default function PartnerSchoolSetup() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="setup">
      <SetupView go={go} />
    </PartnerShell>
  );
}
