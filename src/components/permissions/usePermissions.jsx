import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { hasPermission, getPermissions, hasRoleLevel } from '@/lib/permissions';

export function usePermissions() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData) {
          const userPermissions = getPermissions(
            userData.role,
            userData.custom_permissions || []
          );
          setPermissions(userPermissions);
        }
      } catch (error) {
        console.error('Failed to load user permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const can = (permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission, user.custom_permissions);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasMinRole = (requiredRole) => {
    if (!user) return false;
    return hasRoleLevel(user.role, requiredRole);
  };

  return {
    user,
    permissions,
    isLoading,
    can,
    hasRole,
    hasMinRole,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor' || user?.is_tutor === true,
    isContentCreator: user?.role === 'content_creator',
    isLearner: user?.role === 'learner',
    isCoordinator: user?.role === 'coordinator' || user?.is_coordinator === true
  };
}