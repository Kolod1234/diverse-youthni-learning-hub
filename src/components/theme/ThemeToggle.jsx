import { Moon, Sun, Monitor, Zap, Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('auto-schedule-theme');
    setAutoSchedule(saved === 'true');
  }, []);

  const handleAutoSchedule = () => {
    const newState = !autoSchedule;
    setAutoSchedule(newState);
    localStorage.setItem('auto-schedule-theme', newState);
    if (newState) setTheme('auto-schedule');
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const themeConfig = {
    light: { icon: Sun, label: 'Light', color: 'text-yellow-600' },
    dark: { icon: Moon, label: 'Dark', color: 'text-slate-400' },
    system: { icon: Monitor, label: 'System', color: 'text-gray-600' },
    'high-contrast-dark': { icon: Eye, label: 'High Contrast', color: 'text-blue-600' },
  };

  const currentConfig = themeConfig[theme] || themeConfig.system;
  const CurrentIcon = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full transition-colors hover:bg-accent"
        >
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentIcon className={`h-5 w-5 ${currentConfig.color}`} />
          </motion.div>
          <span className="sr-only">Theme menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Theme</span>
          {theme === 'dark' && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onCheckedChange={() => setTheme('light')}
          className="cursor-pointer"
        >
          <Sun className="w-4 h-4 mr-2" />
          Light Mode
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onCheckedChange={() => setTheme('dark')}
          className="cursor-pointer"
        >
          <Moon className="w-4 h-4 mr-2" />
          Dark Mode
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={theme === 'high-contrast-dark'}
          onCheckedChange={() => setTheme('high-contrast-dark')}
          className="cursor-pointer"
        >
          <Eye className="w-4 h-4 mr-2" />
          High Contrast Dark
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onCheckedChange={() => {
            setTheme('system');
            setAutoSchedule(false);
            localStorage.setItem('auto-schedule-theme', 'false');
          }}
          className="cursor-pointer"
        >
          <Monitor className="w-4 h-4 mr-2" />
          System Preference
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={autoSchedule}
          onCheckedChange={handleAutoSchedule}
          className="cursor-pointer"
        >
          <Zap className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Auto-Switch at Sunset</span>
            <span className="text-xs text-muted-foreground">6 PM - 6 AM</span>
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}