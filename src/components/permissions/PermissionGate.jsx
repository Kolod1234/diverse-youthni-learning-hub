import React from 'react';
import { usePermissions } from './usePermissions';
import { Alert } from '@mui/material';
import { Lock } from 'lucide-react';

export default function PermissionGate({ 
  permission, 
  children, 
  fallback = null,
  showDenied = false 
}) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!permission || can(permission)) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <Alert severity="warning" icon={<Lock />}>
        You don't have permission to access this feature.
      </Alert>
    );
  }

  return fallback;
}

export function RoleGate({ role, minRole, children, fallback = null, showDenied = false }) {
  const { hasRole, hasMinRole, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const hasAccess = role ? hasRole(role) : (minRole ? hasMinRole(minRole) : false);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <Alert severity="warning" icon={<Lock />}>
        You don't have the required role to access this feature.
      </Alert>
    );
  }

  return fallback;
}