import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Typography, Button, IconButton, Collapse } from '@mui/material';
import { X, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// The web app always shows the latest version banner since it IS the web app.
// This banner is intended to prompt users to download/update the Android APK.
// It stores the dismissed version in localStorage so it doesn't keep re-appearing.

export default function AppUpdateBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: versions = [] } = useQuery({
    queryKey: ['app-versions-banner'],
    queryFn: () => base44.entities.AppVersion.filter({ is_active: true }, '-created_date', 1),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const active = versions[0];

  useEffect(() => {
    if (!active) return;
    const dismissedVersion = localStorage.getItem('dismissed_app_version');
    if (dismissedVersion === String(active.version_code)) {
      setDismissed(true);
    }
  }, [active]);

  const handleDismiss = () => {
    if (active) {
      localStorage.setItem('dismissed_app_version', String(active.version_code));
    }
    setDismissed(true);
  };

  if (!active || dismissed) return null;

  const isForce = active.force_update;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 9999 }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          px: 3,
          py: 1.5,
          bgcolor: isForce ? '#dc2626' : '#003366',
          color: 'white',
          flexWrap: 'wrap',
        }}>
          {isForce && <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {isForce
              ? `Update required — v${active.version_name} is now available.`
              : `📱 New app version available — v${active.version_name}.`}
            {active.release_notes && ` ${active.release_notes}`}
          </Typography>
          <Button
            href={active.apk_url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<Download size={16} />}
            sx={{
              bgcolor: 'white',
              color: isForce ? '#dc2626' : '#003366',
              fontWeight: 700,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              flexShrink: 0,
            }}
          >
            Download Update
          </Button>
          {!isForce && (
            <IconButton size="small" onClick={handleDismiss} sx={{ color: 'rgba(255,255,255,0.8)', ml: -1 }}>
              <X size={18} />
            </IconButton>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}