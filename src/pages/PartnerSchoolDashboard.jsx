import React from 'react';
import { PartnerShell, SchoolDashboardView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — School: dashboard. Sample data only; nothing is saved.
export default function PartnerSchoolDashboard() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="dashboard">
      <SchoolDashboardView go={go} />
    </PartnerShell>
  );
}
