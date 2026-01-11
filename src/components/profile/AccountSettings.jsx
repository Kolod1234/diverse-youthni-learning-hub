import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountSettings({ user }) {
  const [uploading, setUploading] = useState(false);
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
            <Input id="email" value={user?.email} disabled className="bg-gray-50" />
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
      </CardContent>
    </Card>
  );
}