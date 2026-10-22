import React from 'react';
import { PartnerShell, RequestsView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — Admin: seat requests and sponsors. Sample data only; nothing is saved.
export default function PartnerSeatRequests() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="requests">
      <RequestsView go={go} />
    </PartnerShell>
  );
}
