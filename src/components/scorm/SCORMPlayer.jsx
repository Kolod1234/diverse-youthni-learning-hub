import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, LinearProgress, Typography, Alert } from '@mui/material';
import { Play, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SCORMPlayer({ scormPackage, onComplete }) {
  const iframeRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('not_started');
  const [score, setScore] = useState(0);
  const [sessionData, setSessionData] = useState(null);

  const saveSCORMDataMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SCORMSession.create(data);
    },
    onSuccess: () => {
      toast.success('Progress saved!');
    }
  });

  // Initialize SCORM API
  useEffect(() => {
    // Create SCORM API adapter
    window.API = {
      LMSInitialize: () => {
        console.log('SCORM: LMSInitialize');
        setStatus('in_progress');
        return 'true';
      },
      LMSFinish: () => {
        console.log('SCORM: LMSFinish');
        setStatus('completed');
        saveSCORMData();
        return 'true';
      },
      LMSGetValue: (element) => {
        console.log('SCORM: LMSGetValue', element);
        if (element === 'cmi.core.lesson_status') return status;
        if (element === 'cmi.core.score.raw') return score.toString();
        if (element === 'cmi.suspend_data') return sessionData?.suspend_data || '';
        return '';
      },
      LMSSetValue: (element, value) => {
        console.log('SCORM: LMSSetValue', element, value);
        if (element === 'cmi.core.lesson_status') setStatus(value);
        if (element === 'cmi.core.score.raw') setScore(parseFloat(value));
        if (element === 'cmi.core.lesson_location') setProgress(parseFloat(value) || 0);
        if (element === 'cmi.suspend_data') {
          setSessionData(prev => ({ ...prev, suspend_data: value }));
        }
        return 'true';
      },
      LMSCommit: () => {
        console.log('SCORM: LMSCommit');
        saveSCORMData();
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => '',
      LMSGetDiagnostic: () => ''
    };

    // SCORM 2004 API
    window.API_1484_11 = {
      Initialize: () => window.API.LMSInitialize(),
      Terminate: () => window.API.LMSFinish(),
      GetValue: (element) => window.API.LMSGetValue(element),
      SetValue: (element, value) => window.API.LMSSetValue(element, value),
      Commit: () => window.API.LMSCommit(),
      GetLastError: () => window.API.LMSGetLastError(),
      GetErrorString: () => window.API.LMSGetErrorString(),
      GetDiagnostic: () => window.API.LMSGetDiagnostic()
    };

    return () => {
      delete window.API;
      delete window.API_1484_11;
    };
  }, []);

  const saveSCORMData = async () => {
    try {
      const user = await base44.auth.me();
      
      saveSCORMDataMutation.mutate({
        scorm_package_id: scormPackage.id,
        lesson_id: scormPackage.lesson_id,
        course_id: scormPackage.course_id,
        student_email: user.email,
        user_email: user.email, // the SCORMSession table and its access rule use user_email
        lesson_status: status,
        score_raw: score,
        completion_status: status === 'completed' ? 'completed' : 'incomplete',
        suspend_data: sessionData?.suspend_data || ''
      });

      if (status === 'completed') {
        onComplete?.({ score, status });
      }
    } catch (error) {
      console.error('Failed to save SCORM data:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{scormPackage.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {status === 'completed' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircle className="w-4 h-4" />
              <Typography variant="body2">Completed</Typography>
            </Box>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              setProgress(0);
              setScore(0);
              setStatus('not_started');
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {progress > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Progress</Typography>
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Box sx={{ 
        width: '100%', 
        height: 600, 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'grey.50'
      }}>
        <iframe
          ref={iframeRef}
          src={scormPackage.launch_url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="SCORM Content"
        />
      </Box>
    </Box>
  );
}