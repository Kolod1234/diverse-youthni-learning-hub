import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DEFAULT_ROLES = {
  viewer: {
    can_upload: false,
    can_edit_own: false,
    can_edit_all: false,
    can_delete_own: false,
    can_delete_all: false,
    can_manage_users: false
  },
  contributor: {
    can_upload: true,
    can_edit_own: true,
    can_edit_all: false,
    can_delete_own: true,
    can_delete_all: false,
    can_manage_users: false
  },
  moderator: {
    can_upload: true,
    can_edit_own: true,
    can_edit_all: true,
    can_delete_own: true,
    can_delete_all: true,
    can_manage_users: false
  },
  curator: {
    can_upload: true,
    can_edit_own: true,
    can_edit_all: true,
    can_delete_own: true,
    can_delete_all: true,
    can_manage_users: true
  }
};

export function useLibraryPermissions(userEmail) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-library-role', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const roles = await base44.entities.UserLibraryRole.filter({ user_email: userEmail.toLowerCase() });
      return roles[0] || null;
    },
    enabled: !!userEmail
  });

  const getPermissions = (roleKey) => {
    return DEFAULT_ROLES[roleKey] || DEFAULT_ROLES.viewer;
  };

  const userPermissions = userRole 
    ? getPermissions(userRole.library_role)
    : user?.role === 'admin' ? getPermissions('curator') : getPermissions('viewer');

  const canUpload = userPermissions.can_upload;
  
  const canEditBook = (book, createdBy) => {
    if (userPermissions.can_edit_all) return true;
    if (userPermissions.can_edit_own && createdBy === userEmail) return true;
    return false;
  };

  const canDeleteBook = (book, createdBy) => {
    if (userPermissions.can_delete_all) return true;
    if (userPermissions.can_delete_own && createdBy === userEmail) return true;
    return false;
  };

  const canManageUsers = userPermissions.can_manage_users;

  return {
    userRole: userRole?.library_role || 'viewer',
    canUpload,
    canEditBook,
    canDeleteBook,
    canManageUsers,
    userPermissions
  };
}