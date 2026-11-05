import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, Grid, Chip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, List, ListItem,
  ListItemText, IconButton, Alert, Checkbox, FormControlLabel
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ShieldIcon from '@mui/icons-material/Shield';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Users = _w(PeopleIcon), Shield = _w(ShieldIcon), Edit = _w(EditIcon), Save = _w(SaveIcon), Search = _w(SearchIcon);
import { toast } from 'sonner';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/components/permissions/permissions';
import PermissionGate from '@/components/permissions/PermissionGate';

export default function AdminRolesPermissions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    role: '',
    custom_permissions: []
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => (await base44.functions.invoke('adminListUsers', { sort: 'email', limit: 1000 })).data.users
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, custom_permissions }) => {
      return await base44.functions.invoke('adminUpdateUser', {
        userId,
        data: { role, custom_permissions }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User role and permissions updated!');
      setShowEditDialog(false);
      setSelectedUser(null);
    }
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role || 'learner',
      custom_permissions: user.custom_permissions || []
    });
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    
    updateUserRoleMutation.mutate({
      userId: selectedUser.id,
      role: editForm.role,
      custom_permissions: editForm.custom_permissions
    });
  };

  const toggleCustomPermission = (permission) => {
    const current = editForm.custom_permissions || [];
    const updated = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    
    setEditForm({ ...editForm, custom_permissions: updated });
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      instructor: 'primary',
      content_creator: 'secondary',
      coordinator: 'info',
      learner: 'default'
    };
    return colors[role] || 'default';
  };

  const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
  };

  return (
    <PermissionGate permission={PERMISSIONS.MANAGE_ROLES} showDenied>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              User Roles & Permissions
            </Typography>
            <Typography color="text.secondary">
              Manage user roles and configure granular permissions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={<Users />} label={`${users.length} Total Users`} />
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Roles determine default permissions. You can also add custom permissions to individual users for fine-grained control.
        </Alert>

        {/* Role Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(ROLES).map(([key, role]) => {
            const userCount = users.filter(u => u.role === role).length;
            const permissions = getRolePermissions(role);
            
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={role}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Shield className="w-6 h-6 text-primary-main" />
                    <Box>
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {role.replace('_', ' ')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {userCount} users
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {permissions.length} permissions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {permissions.slice(0, 3).map(perm => (
                      <Chip
                        key={perm}
                        label={perm.replace(/_/g, ' ')}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                    {permissions.length > 3 && (
                      <Chip
                        label={`+${permissions.length - 3} more`}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* User Management */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User Management</Typography>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {isLoading ? (
            <Typography>Loading users...</Typography>
          ) : (
            <List>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                  secondaryAction={
                    <IconButton aria-label="Edit" onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span>{user.full_name || 'Unnamed User'}</span>
                        <Chip
                          label={user.role?.replace('_', ' ') || 'learner'}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {user.custom_permissions?.length > 0 && (
                          <Chip
                            label={`+${user.custom_permissions.length} custom`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Edit User Role & Permissions
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>User Information</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.full_name} ({selectedUser.email})
                  </Typography>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    label="Role"
                  >
                    {Object.entries(ROLES).map(([key, role]) => (
                      <MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>
                        {role.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Default Permissions for {editForm.role?.replace('_', ' ')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getRolePermissions(editForm.role).map(perm => (
                      <Chip
                        key={perm}
                        label={perm.replace(/_/g, ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Custom Permissions (override role defaults)
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                    {Object.entries(PERMISSIONS).map(([key, permission]) => {
                      const hasRolePermission = getRolePermissions(editForm.role).includes(permission);
                      const hasCustomPermission = editForm.custom_permissions?.includes(permission);
                      
                      return (
                        <FormControlLabel
                          key={permission}
                          control={
                            <Checkbox
                              checked={hasCustomPermission}
                              onChange={() => toggleCustomPermission(permission)}
                              disabled={hasRolePermission}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                {permission.replace(/_/g, ' ')}
                              </Typography>
                              {hasRolePermission && (
                                <Typography variant="caption" color="text.secondary">
                                  (included in role)
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={updateUserRoleMutation.isPending}
            >
              {updateUserRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PermissionGate>
  );
}