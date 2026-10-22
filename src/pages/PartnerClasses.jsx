import React from 'react';
import { PartnerShell, ClassesView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — School: classes. Sample data only; nothing is saved.
export default function PartnerClasses() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="classes">
      <ClassesView go={go} />
    </PartnerShell>
  );
}
