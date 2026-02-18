import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useUserAccess() {
  const [user, setUser] = useState(null);
  const [interestType, setInterestType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setInterestType(userData?.interest_type || null);
      } catch (error) {
        // Not logged in - check localStorage for guest
        const guestInterest = localStorage.getItem('interest_type');
        setInterestType(guestInterest);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const isGuest = !user || interestType === 'guest';
  const isLeadership = interestType === 'leadership';
  const isLearning = interestType === 'learning';
  const isYouthWork = interestType === 'youth_work';

  const canAccess = (feature) => {
    // Admins can access everything
    if (user?.role === 'admin') return true;

    // Guest restrictions
    if (isGuest) {
      const guestAllowed = [
        'browse_courses',
        'view_programs',
        'view_library',
        'view_tutors',
      ];
      return guestAllowed.includes(feature);
    }

    // Feature-based access for logged-in users
    const accessMap = {
      leadership: ['programs', 'activities', 'logbooks', 'participants'],
      learning: ['courses', 'lessons', 'library', 'sessions', 'quizzes', 'dashboard'],
      youth_work: ['youth_work', 'workbooks', 'attendance', 'qualifications'],
    };

    if (accessMap[interestType]?.includes(feature)) return true;

    // Everyone can access these
    const universalAccess = ['profile', 'settings', 'messages', 'achievements'];
    return universalAccess.includes(feature);
  };

  const requireAuth = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return false;
    }
    return true;
  };

  return {
    user,
    interestType,
    loading,
    isGuest,
    isLeadership,
    isLearning,
    isYouthWork,
    canAccess,
    requireAuth,
  };
}