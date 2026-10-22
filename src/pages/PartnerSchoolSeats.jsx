import React from 'react';
import { PartnerShell, SchoolSeatsView, usePartnerGo } from '@/components/partner/PartnerPreview';

// Partner Schools preview — Admin: one school's seats, codes and courses. Sample data only; nothing is saved.
export default function PartnerSchoolSeats() {
  const go = usePartnerGo();
  return (
    <PartnerShell current="school">
      <SchoolSeatsView go={go} />
    </PartnerShell>
  );
}
