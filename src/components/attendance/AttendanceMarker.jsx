import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { Check, AlertCircle, Clock } from 'lucide-react';

export default function AttendanceMarker({ status, onMarkPresent, onMarkLate, onMarkAbsent }) {
  const statusColor = {
    present: '#10b981',
    absent: '#ef4444',
    late: '#f59e0b',
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {status && (
        <Chip
          label={status}
          size="small"
          sx={{ bgcolor: statusColor[status] + '20', color: statusColor[status] }}
        />
      )}
      <Button size="small" variant="outlined" startIcon={<Check style={{ width: 16, height: 16 }} />} onClick={onMarkPresent}>
        Present
      </Button>
      <Button size="small" variant="outlined" color="warning" startIcon={<Clock style={{ width: 16, height: 16 }} />} onClick={onMarkLate}>
        Late
      </Button>
      <Button size="small" variant="outlined" color="error" startIcon={<AlertCircle style={{ width: 16, height: 16 }} />} onClick={onMarkAbsent}>
        Absent
      </Button>
    </Box>
  );
}