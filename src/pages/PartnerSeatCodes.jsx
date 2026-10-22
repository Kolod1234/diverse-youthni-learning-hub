import React from 'react';
import { PartnerShell, SeatCodesView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — Admin: every seat code across schools. Sample data only; nothing is saved.
export default function PartnerSeatCodes() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="codes">
      <SeatCodesView go={go} />
    </PartnerShell>
  );
}
