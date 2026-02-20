import React, { useState } from 'react';
import { Box, Button, Chip } from '@mui/material';
import { Check, AlertCircle, Clock } from 'lucide-react';

export default function AttendanceMarker({ status, onMarkPresent, onMarkLate, onMarkAbsent }) {
  const [optimisticStatus, setOptimisticStatus] = useState(status);

  const handleMark = async (newStatus, callback) => {
    setOptimisticStatus(newStatus);
    try {
      await callback();
    } catch (error) {
      setOptimisticStatus(status);
    }
  };
  const statusColor = {
    present: '#10b981',
    absent: '#ef4444',
    late: '#f59e0b',
  };

  const displayStatus = optimisticStatus || status;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {displayStatus && (
        <Chip
          label={displayStatus}
          size="small"
          sx={{ bgcolor: statusColor[displayStatus] + '20', color: statusColor[displayStatus] }}
        />
      )}
      <Button 
        size="small" 
        variant="outlined" 
        startIcon={<Check style={{ width: 16, height: 16 }} />} 
        onClick={() => handleMark('present', onMarkPresent)}
        sx={{ minHeight: 44, minWidth: 44 }}
      >
        Present
      </Button>
      <Button 
        size="small" 
        variant="outlined" 
        color="warning" 
        startIcon={<Clock style={{ width: 16, height: 16 }} />} 
        onClick={() => handleMark('late', onMarkLate)}
        sx={{ minHeight: 44, minWidth: 44 }}
      >
        Late
      </Button>
      <Button 
        size="small" 
        variant="outlined" 
        color="error" 
        startIcon={<AlertCircle style={{ width: 16, height: 16 }} />} 
        onClick={() => handleMark('absent', onMarkAbsent)}
        sx={{ minHeight: 44, minWidth: 44 }}
      >
        Absent
      </Button>
    </Box>
  );
}