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
    sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    md: { container: 'w-14 h-14', icon: 'w-7 h-7' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    xl: { container: 'w-20 h-20', icon: 'w-10 h-10' }
  };

  const sizes = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={cn(
        'bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105',
        colorFrom,
        colorTo,
        sizes.container,
        className
      )}
    >
      <Icon className={cn('text-white', sizes.icon)} />
    </div>
  );
}