import React from 'react';
import { useLocation } from 'react-router-dom';
import GroupProjectWorkspace from '@/components/collaboration/GroupProjectWorkspace';

export default function GroupProjectWorkspacePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const projectId = params.get('id');

  return <GroupProjectWorkspace projectId={projectId} />;
}