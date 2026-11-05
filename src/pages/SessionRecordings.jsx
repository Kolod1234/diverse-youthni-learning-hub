import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Grid, Button, TextField,
  Chip, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Video = _w(VideocamIcon), Search = _w(SearchIcon), Play = _w(PlayArrowIcon);
const Eye = _w(VisibilityIcon), Download = _w(DownloadIcon), Clock = _w(AccessTimeIcon);
import { motion } from 'framer-motion';

export default function SessionRecordings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);

  const { data: recordings = [] } = useQuery({
    queryKey: ['session-recordings'],
    queryFn: () => base44.entities.SessionRecording.list('-created_date', 100)
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['completed-sessions'],
    queryFn: () => base44.entities.VideoSession.filter({ status: 'completed' })
  });

  const filteredRecordings = recordings.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Session Recordings
        </Typography>
        <Typography color="text.secondary">
          Watch past live sessions and webinars
        </Typography>
      </Box>

      <TextField
        placeholder="Search recordings..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search className="w-5 h-5 text-gray-400" />
            </InputAdornment>
          )
        }}
      />

      <Grid container spacing={3}>
        {filteredRecordings.map((recording, idx) => {
          const session = sessions.find(s => s.id === recording.session_id);
          
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={recording.id}>
              <motion.div
              >
                <Card sx={{ overflow: 'hidden', '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'grey.900' }}>
                    {recording.thumbnail_url ? (
                      <img
                        src={recording.thumbnail_url}
                        alt={recording.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.800'
                        }}
                      >
                        <Video className="w-12 h-12 text-gray-400" />
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {recording.duration_seconds ? formatDuration(recording.duration_seconds) : 'N/A'}
                    </Box>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                      {recording.title || session?.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Eye className="w-4 h-4 text-gray-400" />
                      <Typography variant="caption" color="text.secondary">
                        {recording.view_count || 0} views
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Play className="w-4 h-4" />}
                      onClick={() => setSelectedRecording(recording)}
                    >
                      Watch Recording
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          );
        })}

        {filteredRecordings.length === 0 && (
          <Grid size={12}>
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <Video className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <Typography variant="h6" sx={{ mb: 1 }}>No Recordings Found</Typography>
              <Typography color="text.secondary">
                Recorded sessions will appear here
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {selectedRecording && (
        <Dialog
          open={!!selectedRecording}
          onClose={() => setSelectedRecording(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>{selectedRecording.title}</DialogTitle>
          <DialogContent>
            <video
              src={selectedRecording.recording_url}
              controls
              autoPlay
              style={{ width: '100%', borderRadius: 8 }}
            />
            {selectedRecording.transcript && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Transcript</Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecording.transcript}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedRecording(null)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
              href={selectedRecording.recording_url}
              download
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}