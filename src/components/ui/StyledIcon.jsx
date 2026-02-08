import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StyledIcon - Line Art Icon with optional Badge Overlay
 * Outline/linear style with gradient background, shadow, and accent badges
 * @param {React.Component} Icon - Lucide icon component to render
 * @param {string} colorFrom - Gradient start color (e.g., 'from-blue-500')
 * @param {string} colorTo - Gradient end color (e.g., 'to-blue-600')
 * @param {string} size - Icon size preset: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} badge - Badge content (e.g., 'NEW', '5', numeric count)
 * @param {string} badgeColor - Badge background color (default: 'bg-red-500')
 * @param {string} badgePosition - Badge position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' (default: 'top-right')
 * @param {string} className - Additional CSS classes
 */
export default function StyledIcon({ 
  Icon, 
  colorFrom = 'from-blue-500', 
  colorTo = 'to-blue-600',
  size = 'md',
  badge = null,
  badgeColor = 'bg-red-500',
  badgePosition = 'top-right',
  className = ''
}) {
  const sizeMap = {
    sm: { container: 'w-10 h-10', icon: 'w-5 h-5', badge: 'w-5 h-5 text-xs' },
    md: { container: 'w-14 h-14', icon: 'w-7 h-7', badge: 'w-6 h-6 text-sm' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8', badge: 'w-7 h-7 text-sm' },
    xl: { container: 'w-20 h-20', icon: 'w-10 h-10', badge: 'w-8 h-8 text-base' }
  };

  const sizes = sizeMap[size] || sizeMap.md;

  const badgePositionMap = {
    'top-right': 'top-0 right-0 translate-x-1 -translate-y-1',
    'top-left': 'top-0 left-0 -translate-x-1 -translate-y-1',
    'bottom-right': 'bottom-0 right-0 translate-x-1 translate-y-1',
    'bottom-left': 'bottom-0 left-0 -translate-x-1 translate-y-1'
  };

  return (
    <div 
      className={cn(
        'relative bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transition-shadow duration-300 hover:shadow-xl',
        colorFrom,
        colorTo,
        sizes.container,
        className
      )}
    >
      <Icon className={cn('text-white', sizes.icon)} strokeWidth={2} />
      
      {badge && (
        <div 
          className={cn(
            'absolute rounded-full flex items-center justify-center text-white font-bold shadow-md',
            badgeColor,
            sizes.badge,
            badgePositionMap[badgePosition] || badgePositionMap['top-right']
          )}
        >
          {badge}
        </div>
      )}
    </div>
  );
}