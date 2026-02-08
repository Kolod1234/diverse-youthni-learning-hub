import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect device type
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 1024) {
        setDeviceType('tablet');
      } else if (width >= 1024 && width < 1440) {
        setDeviceType('laptop');
      } else {
        setDeviceType('desktop');
      }

      // Detect orientation
      setOrientation(width > height ? 'landscape' : 'portrait');

      // Detect touch
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return { deviceType, orientation, isTouchDevice };
}

export function DeviceIndicator() {
  const { deviceType, orientation } = useDeviceType();

  const icons = {
    mobile: Smartphone,
    tablet: Tablet,
    laptop: Monitor,
    desktop: Maximize2
  };

  const Icon = icons[deviceType];

  return (
    <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2 z-50 opacity-50 hover:opacity-100 transition-opacity">
      <Icon className="w-3 h-3" />
      <span>{deviceType} • {orientation}</span>
    </div>
  );
}

export function ResponsiveLayout({ children, deviceType }) {
  const layouts = {
    mobile: 'flex flex-col',
    tablet: 'flex flex-col lg:flex-row',
    laptop: 'flex gap-4',
    desktop: 'flex gap-6'
  };

  const padding = {
    mobile: 'p-2',
    tablet: 'p-4',
    laptop: 'p-6',
    desktop: 'p-8'
  };

  return (
    <div className={`${layouts[deviceType]} ${padding[deviceType]}`}>
      {children}
    </div>
  );
}