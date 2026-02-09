import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Button, Card, CardContent, TextField, Tabs, Tab, Chip, Container, Typography, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';
import { Calendar, Download, Plus, Check, X, Search, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import AttendanceReports from '@/components/attendance/AttendanceReports';
import AttendanceStatistics from '@/components/attendance/AttendanceStatistics';

export default function AdminAttendance() {
  const [selectedTab, setSelectedTab] = useState('mark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('');
  const [bulkMarkDialog, setBulkMarkDialog] = useState(false);
  const [bulkMarkStatus, setBulkMarkStatus] = useState('present');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => base44.entities.Attendance.filter({ date: selectedDate }, '-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-attendance'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date', 1000),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions-attendance'],
    queryFn: () => base44.entities.VideoSession.list('-created_date', 200),
  });

  const createAttendanceMutation = useMutation({
    mutationFn: (data) => base44.entities.Attendance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      toast.success('Attendance recorded');
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Attendance.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      toast.success('Attendance updated');
    },
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: (id) => base44.entities.Attendance.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      toast.success('Attendance record deleted');
    },
  });

  const handleBulkMark = () => {
    if (selectedStudents.size === 0) {
      toast.error('No students selected');
      return;
    }

    selectedStudents.forEach(userId => {
      const existingRecord = attendanceRecords.find(r => r.user_email === userId);
      const data = {
        date: selectedDate,
        user_email: userId,
        status: bulkMarkStatus,
        session_id: selectedSession || null,
      };

      if (existingRecord) {
        updateAttendanceMutation.mutate({ id: existingRecord.id, data });
      } else {
        createAttendanceMutation.mutate(data);
      }
    });

    setBulkMarkDialog(false);
    setSelectedStudents(new Set());
    toast.success(`Marked ${selectedStudents.size} students as ${bulkMarkStatus}`);
  };

  const toggleStudentSelection = (userId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === users.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(users.map(u => u.email)));
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttendanceStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    return { present, absent, late };
  };

  const stats = getAttendanceStats();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Attendance Management</Typography>
              <Typography color="textSecondary">Track and manage student attendance</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Download />}>Export Report</Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check style={{ color: '#16a34a' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.present}</Typography>
                    <Typography variant="caption" color="textSecondary">Present</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar style={{ color: '#d97706' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.late}</Typography>
                    <Typography variant="caption" color="textSecondary">Late</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X style={{ color: '#dc2626' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.absent}</Typography>
                    <Typography variant="caption" color="textSecondary">Absent</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Date & Session Filter */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                label="Select Date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Session (Optional)</InputLabel>
                <Select
                  value={selectedSession}
                  label="Session (Optional)"
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <MenuItem value="">All Sessions</MenuItem>
                  {sessions.map(session => (
                    <MenuItem key={session.id} value={session.id}>{session.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)}>
            <Tab label="Mark Attendance" value="mark" icon={<Users style={{ marginRight: 8 }} />} iconPosition="start" />
            <Tab label="Statistics" value="stats" icon={<BarChart3 style={{ marginRight: 8 }} />} iconPosition="start" />
            <Tab label="Reports" value="reports" icon={<Download style={{ marginRight: 8 }} />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {selectedTab === 'mark' && (
          <Box>
            {/* Search and Bulk Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{ startAdornment: <Search style={{ marginRight: 8 }} /> }}
              />
              <Button
                variant="contained"
                startIcon={<Check />}
                onClick={() => setBulkMarkDialog(true)}
                disabled={selectedStudents.size === 0}
              >
                Bulk Mark ({selectedStudents.size})
              </Button>
            </Box>

            {/* Attendance Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.size === users.length && users.length > 0}
                        onChange={toggleAllStudents}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(user => {
                    const record = attendanceRecords.find(r => r.user_email === user.email);
                    const statusColor = {
                      present: '#10b981',
                      absent: '#ef4444',
                      late: '#f59e0b',
                    };
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.has(user.email)}
                            onChange={() => toggleStudentSelection(user.email)}
                          />
                        </TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {record ? (
                            <Chip
                              label={record.status}
                              size="small"
                              sx={{ bgcolor: statusColor[record.status] + '20', color: statusColor[record.status] }}
                            />
                          ) : (
                            <Chip label="Not Marked" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button size="small" variant="outlined" onClick={() => {
                              if (record) {
                                updateAttendanceMutation.mutate({ id: record.id, data: { status: 'present' } });
                              } else {
                                createAttendanceMutation.mutate({ user_email: user.email, date: selectedDate, status: 'present' });
                              }
                            }}>Present</Button>
                            <Button size="small" variant="outlined" color="warning" onClick={() => {
                              if (record) {
                                updateAttendanceMutation.mutate({ id: record.id, data: { status: 'late' } });
                              } else {
                                createAttendanceMutation.mutate({ user_email: user.email, date: selectedDate, status: 'late' });
                              }
                            }}>Late</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => {
                              if (record) {
                                updateAttendanceMutation.mutate({ id: record.id, data: { status: 'absent' } });
                              } else {
                                createAttendanceMutation.mutate({ user_email: user.email, date: selectedDate, status: 'absent' });
                              }
                            }}>Absent</Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {selectedTab === 'stats' && <AttendanceStatistics selectedDate={selectedDate} />}
        {selectedTab === 'reports' && <AttendanceReports />}

        {/* Bulk Mark Dialog */}
        <Dialog open={bulkMarkDialog} onClose={() => setBulkMarkDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Bulk Mark Attendance</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, space: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={bulkMarkStatus}
                  label="Status"
                  onChange={(e) => setBulkMarkStatus(e.target.value)}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary">
                Mark {selectedStudents.size} selected students as <strong>{bulkMarkStatus}</strong>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkMarkDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkMark} variant="contained">Mark</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}