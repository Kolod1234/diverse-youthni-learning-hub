import React, { useState } from 'react';
import UsernameSetupDialog from '@/components/account/UsernameSetupDialog';

export default function UsernameSetupGate({ user, refreshUser, children }) {
  const [savedUsername, setSavedUsername] = useState(user?.username || '');
  const isParentPortal = window.location.pathname === '/parent-dashboard';
  const isStudent = user && !isParentPortal && user.account_type !== 'parent' && user.role !== 'admin' && !user.is_tutor && !user.is_coordinator;
  if (isStudent && !savedUsername) {
    return <UsernameSetupDialog onComplete={async (username) => {
      setSavedUsername(username);
      await refreshUser();
    }} />;
  }
  return children;
}