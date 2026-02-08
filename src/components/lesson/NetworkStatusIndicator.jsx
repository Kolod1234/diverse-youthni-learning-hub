import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNetworkStatus from './useNetworkStatus';

export default function NetworkStatusIndicator() {
  const { isOnline, connectionType } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
      </motion.div>
    </AnimatePresence>
  );
}