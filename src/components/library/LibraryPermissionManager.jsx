import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Select, MenuItem, Box, Typography, Chip, IconButton
} from '@mui/material';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_ROLES = [
  {
    role_name: 'viewer',
    display_name: 'Viewer',
    description: 'Can view and download books only',
    permissions: { can_upload: false, can_edit_own: false, can_edit_all: false, can_delete_own: false, can_delete_all: false, can_manage_users: false }
  },
  {
    role_name: 'contributor',
    display_name: 'Contributor',
    description: 'Can upload books and edit/delete their own',
    permissions: { can_upload: true, can_edit_own: true, can_edit_all: false, can_delete_own: true, can_delete_all: false, can_manage_users: false }
  },
  {
    role_name: 'moderator',
    display_name: 'Moderator',
    description: 'Can upload, edit, and delete any book',
    permissions: { can_upload: true, can_edit_own: true, can_edit_all: true, can_delete_own: true, can_delete_all: true, can_manage_users: false }
  },
  {
    role_name: 'curator',
    display_name: 'Curator',
    description: 'Full admin access including user management',
    permissions: { can_upload: true, can_edit_own: true, can_edit_all: true, can_delete_own: true, can_delete_all: true, can_manage_users: true }
  }
];

export default function LibraryPermissionManager({ open, onOpenChange }) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState('contributor');
  const queryClient = useQueryClient();

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-library-roles'],
    queryFn: () => base44.entities.UserLibraryRole.list('-assigned_date', 100),
    enabled: open
  });

  const { data: libraryRoles = [] } = useQuery({
    queryKey: ['library-roles'],
    queryFn: async () => {
      const roles = await base44.entities.LibraryRole.list('role_name', 100);
      return roles.length === 0 ? DEFAULT_ROLES : roles;
    },
    enabled: open
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UserLibraryRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-library-roles']);
      setUserEmail('');
      setUserName('');
      setSelectedRole('contributor');
      toast.success('User role assigned');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserLibraryRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-library-roles']);
      toast.success('User role removed');
    }
  });

  const handleAssignRole = () => {
    if (!userEmail) {
      toast.error('Email required');
      return;
    }
    createMutation.mutate({
      user_email: userEmail.toLowerCase(),
      user_name: userName,
      library_role: selectedRole,
      assigned_by: 'admin'
    });
  };

  const getRoleDisplay = (roleName) => {
    const role = libraryRoles.find(r => r.role_name === roleName);
    return role?.display_name || roleName;
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <DialogTitle>Manage Library User Roles</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Assign New Role */}
          <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Assign New Role
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="User email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Full name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Select
                size="small"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                sx={{ flex: 1 }}
              >
                {libraryRoles.map((role) => (
                  <MenuItem key={role.role_name} value={role.role_name}>
                    {role.display_name}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                onClick={handleAssignRole}
                disabled={!userEmail || createMutation.isPending}
                sx={{ bgcolor: '#4f46e5' }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Assign
              </Button>
            </Box>
          </Box>

          {/* Role Definitions */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Role Definitions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {libraryRoles.map((role) => (
                <Box key={role.role_name} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {role.display_name}
                    </Typography>
                    <Chip label={role.role_name} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {role.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {role.permissions.can_upload && <Chip label="Upload" size="small" />}
                    {role.permissions.can_edit_own && <Chip label="Edit Own" size="small" />}
                    {role.permissions.can_edit_all && <Chip label="Edit All" size="small" />}
                    {role.permissions.can_delete_own && <Chip label="Delete Own" size="small" />}
                    {role.permissions.can_delete_all && <Chip label="Delete All" size="small" />}
                    {role.permissions.can_manage_users && <Chip label="Manage Users" size="small" />}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Assigned Users */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Assigned Users ({userRoles.length})
            </Typography>
            {userRoles.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f9fafb' }}>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Assigned</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRoles.map((ur) => (
                      <TableRow key={ur.id}>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{ur.user_email}</TableCell>
                        <TableCell>
                          <Chip label={getRoleDisplay(ur.library_role)} size="small" />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {ur.assigned_date ? new Date(ur.assigned_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton aria-label="Delete"
                            size="small"
                            onClick={() => deleteMutation.mutate(ur.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">No users assigned yet</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}