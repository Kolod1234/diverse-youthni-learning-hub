import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button, Card, Tabs, Tab, Chip, Box, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const CalendarIcon = _w(CalendarTodayIcon), ClipboardList = _w(AssignmentIcon), Users = _w(PeopleIcon), BookOpen = _w(MenuBookIcon);
const Plus = _w(AddIcon), Settings = _w(TuneIcon), Clock = _w(AccessTimeIcon), MapPin = _w(LocationOnIcon), User = _w(PersonIcon);
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ProgramCalendar from '@/components/programs/ProgramCalendar';
import ActivitySchedule from '@/components/programs/ActivitySchedule';
import RotaManager from '@/components/programs/RotaManager';
import ParticipantManager from '@/components/programs/ParticipantManager';
import LogbookManager from '@/components/programs/LogbookManager';
import ProgramDetailsCard from '@/components/programs/ProgramDetailsCard';
import ProgramForm from '@/components/programs/ProgramForm';
import { listUsers } from '@/api/listUsers';

export default function Programs() {
  const [user, setUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [tabValue, setTabValue] = useState('calendar');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date', 100),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['program-participants', selectedProgram?.id],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: selectedProgram.id }),
    enabled: !!selectedProgram,
  });

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.is_tutor || isAdmin;

  // Check if user is already enrolled
  const isEnrolled = participants.some(p => p.participant_email === user?.email);

  const enrollMutation = useMutation({
    mutationFn: async (data) => {
      const participant = await base44.entities.ProgramParticipant.create(data);
      
      // Notify program coordinators/admins about new enrollment
      try {
        const coordinators = await listUsers({ filter: { role: 'admin' } });
        for (const coord of coordinators) {
          await base44.functions.invoke('sendNotification', {
            recipient_email: coord.email,
            title: 'New Programme Enrollment',
            message: `${data.participant_name} has enrolled in ${selectedProgram.name}`,
            type: 'program',
            link: `/programs`,
            send_email: true,
          });
        }
      } catch (err) {
        console.error('Failed to send notification:', err);
      }
      
      return participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program-participants']);
      setShowSignUpDialog(false);
      toast.success('Successfully enrolled in programme!');
    },
  });

  const handleSignUp = () => {
    if (!user || !selectedProgram) return;
    
    enrollMutation.mutate({
      program_id: selectedProgram.id,
      participant_email: user.email,
      participant_name: user.full_name,
      status: 'active',
    });
  };

  // Auto-select first program
  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0]);
    }
  }, [programs, selectedProgram]);

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div

        >
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>Leadership Employment Programmes</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage programmes, activities, and participant progress</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isAdmin && !isMentor && selectedProgram && !isEnrolled && (
                  <Button 
                    onClick={() => setShowSignUpDialog(true)}
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
                  >
                    Sign Up for Programme
                  </Button>
                )}
                {isAdmin && (
                  <Button 
                    onClick={() => setShowProgramForm(true)}
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
                  >
                    New Programme
                  </Button>
                )}
              </Box>
            </Box>

            {/* Program Selector */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {programs.map(program => (
                <Button
                  key={program.id}
                  variant={selectedProgram?.id === program.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedProgram(program)}
                  sx={{
                    bgcolor: selectedProgram?.id === program.id ? '#FF8C00' : 'transparent',
                    '&:hover': { bgcolor: selectedProgram?.id === program.id ? '#CC7000' : 'action.hover' }
                  }}
                  endIcon={<Chip label={program.status} size="small" sx={{ ml: 1 }} />}
                >
                  {program.name}
                </Button>
              ))}
            </Box>
          </Box>
        </motion.div>

        {selectedProgram ? (
          <>
            {/* Program Details */}
            <ProgramDetailsCard program={selectedProgram} participants={participants} />

            {/* Main Tabs */}
            <Box sx={{ mt: 3 }}>
              <Card sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab value="calendar" icon={<CalendarIcon size={16} />} iconPosition="start" label="Calendar" />
                  <Tab value="activities" icon={<ClipboardList size={16} />} iconPosition="start" label="Activities" />
                  <Tab value="rota" icon={<Clock size={16} />} iconPosition="start" label="Rota" />
                  <Tab value="participants" icon={<Users size={16} />} iconPosition="start" label="Participants" />
                  <Tab value="logbook" icon={<BookOpen size={16} />} iconPosition="start" label="Logbook" />
                </Tabs>
              </Card>

              {tabValue === 'calendar' && <ProgramCalendar programId={selectedProgram.id} isAdmin={isAdmin} />}
              {tabValue === 'activities' && <ActivitySchedule programId={selectedProgram.id} isAdmin={isAdmin} participants={participants} />}
              {tabValue === 'rota' && <RotaManager programId={selectedProgram.id} isAdmin={isAdmin} participants={participants} />}
              {tabValue === 'participants' && <ParticipantManager programId={selectedProgram.id} isAdmin={isAdmin} isMentor={isMentor} />}
              {tabValue === 'logbook' && (
                <LogbookManager 
                  programId={selectedProgram.id} 
                  isAdmin={isAdmin}
                  isMentor={isMentor}
                  userEmail={user.email}
                />
              )}
            </Box>
          </>
        ) : (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <ClipboardList size={64} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>No Programmes Yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Create your first leadership employment programme to get started</Typography>
            {isAdmin && (
              <Button 
                onClick={() => setShowProgramForm(true)}
                variant="contained"
                startIcon={<Plus size={16} />}
                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#CC7000' } }}
              >
                Create Programme
              </Button>
            )}
          </Card>
        )}
      </Container>

      {/* Program Form Dialog */}
      <ProgramForm open={showProgramForm} onOpenChange={setShowProgramForm} />

      {/* Sign Up Confirmation Dialog */}
      <Dialog open={showSignUpDialog} onClose={() => setShowSignUpDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sign Up for Programme</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to sign up for <strong>{selectedProgram?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignUpDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSignUp} 
            disabled={enrollMutation.isPending}
            variant="contained"
            sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
          >
            {enrollMutation.isPending ? 'Enrolling...' : 'Confirm Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}