import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Card, CardContent, Grid, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceReports() {
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportDialog, setExportDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user authorization
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const hasPermission = user && (user.role === 'admin' || user.is_tutor === true || user.is_coordinator === true);

  const { data: allAttendance = [] } = useQuery({
    queryKey: ['all-attendance'],
    queryFn: () => base44.entities.Attendance.list('-date', 5000),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-for-reports'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date', 1000),
  });

  const handleExport = async () => {
    try {
      const csvContent = generateCSV();
      downloadCSV(csvContent);
      toast.success('Report exported successfully');
      setExportDialog(false);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const generateCSV = () => {
    const filteredRecords = startDate && endDate
      ? allAttendance.filter(r => r.date >= startDate && r.date <= endDate)
      : allAttendance;

    if (reportType === 'summary') {
      const headers = ['Date', 'Present', 'Late', 'Absent', 'Attendance Rate'];
      const dataByDate = {};

      filteredRecords.forEach(record => {
        if (!dataByDate[record.date]) {
          dataByDate[record.date] = { present: 0, late: 0, absent: 0 };
        }
        dataByDate[record.date][record.status]++;
      });

      const rows = Object.entries(dataByDate).map(([date, stats]) => {
        const total = stats.present + stats.late + stats.absent;
        const rate = total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0;
        return [date, stats.present, stats.late, stats.absent, `${rate}%`];
      });

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['Student Name', 'Email', 'Date', 'Status'];
      const rows = filteredRecords.map(record => {
        const user = users.find(u => u.email === record.user_email);
        return [user?.full_name || 'Unknown', record.user_email, record.date, record.status];
      });

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  const downloadCSV = (csvContent) => {
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getTotalStats = () => {
    const present = allAttendance.filter(r => r.status === 'present').length;
    const absent = allAttendance.filter(r => r.status === 'absent').length;
    const late = allAttendance.filter(r => r.status === 'late').length;
    return { present, absent, late, total: present + absent + late };
  };

  const stats = getTotalStats();

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!hasPermission) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">You don't have permission to view attendance reports.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Total Records</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Total Present</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>{stats.present}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Total Late</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>{stats.late}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Total Absent</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ef4444' }}>{stats.absent}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Generate Report</Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>Report Type</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant={reportType === 'summary' ? 'contained' : 'outlined'}
                onClick={() => setReportType('summary')}
              >
                Daily Summary
              </Button>
              <Button
                variant={reportType === 'detailed' ? 'contained' : 'outlined'}
                onClick={() => setReportType('detailed')}
              >
                Detailed Records
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setExportDialog(true)}
            >
              Export Report
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Attendance Report</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Report Type: <strong>{reportType === 'summary' ? 'Daily Summary' : 'Detailed Records'}</strong>
          </Typography>
          {startDate && endDate && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Date Range: <strong>{startDate} to {endDate}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}