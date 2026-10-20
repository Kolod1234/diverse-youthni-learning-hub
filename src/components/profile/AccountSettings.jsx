import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AccountSettings({ user }) {
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      full_name: formData.get('full_name'),
      bio: formData.get('bio'),
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await base44.functions.invoke('optimizeAndUploadImage', { file });
      await base44.auth.updateMe({ avatar: data.file_url });
      queryClient.invalidateQueries(['user']);
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Email does not match');
      return;
    }
    try {
      // Deletes the user's personal records on the server, blocks the account and notifies admins.
      await base44.functions.invoke('deleteMyAccount', { confirmEmail: deleteConfirm });
      setDeleteDialogOpen(false);
      setDeleteConfirm('');
      toast.success('Your data has been deleted. An admin will close your login within 30 days.');
      await base44.auth.logout();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete account. Please contact support.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl">{user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              disabled={uploading}
            />
            <label htmlFor="avatar-upload">
              <Button variant="outline" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Change Avatar
                </span>
              </Button>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email} disabled className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" defaultValue={user?.full_name} required />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" name="bio" defaultValue={user?.bio} placeholder="Tell us about yourself" />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </form>

        {/* Danger Zone */}
        <div className="border border-red-200 rounded-lg bg-red-50 dark:bg-red-500/15 p-6 mt-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Danger Zone</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">Irreversible actions</p>
            </div>
          </div>
          <p className="text-sm text-red-800 dark:text-red-300 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-foreground">This action cannot be undone.</p>
              <p>All your data will be permanently deleted. This includes:</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                <li>Profile information</li>
                <li>Learning progress</li>
                <li>Enrollments and certificates</li>
              </ul>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Type your email to confirm:
                </p>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className={deleteConfirm && deleteConfirm !== user?.email ? 'border-red-300' : ''}
                />
              </div>
            </AlertDialogDescription>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== user?.email}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Delete Account
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}