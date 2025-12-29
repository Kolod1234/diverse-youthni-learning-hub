import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Trash2, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseParticipantManager({ courseId, courseName }) {
  const [user, setUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.CourseEnrollment.filter({ course_id: courseId }, '-created_date', 500),
    enabled: !!courseId,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.asServiceRole.entities.User.list('full_name', 1000),
    enabled: user?.role === 'admin' || user?.is_coordinator,
  });

  const addEnrollmentMutation = useMutation({
    mutationFn: (data) => base44.entities.CourseEnrollment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-enrollments']);
      toast.success('Participant added successfully!');
      setShowAddDialog(false);
      setSelectedUser('');
      setGroupName('');
    },
  });

  const removeEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId) => base44.entities.CourseEnrollment.delete(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-enrollments']);
      toast.success('Participant removed');
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CourseEnrollment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-enrollments']);
      toast.success('Enrollment updated');
    },
  });

  const handleAddParticipant = () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    const selectedUserData = allUsers.find(u => u.email === selectedUser);
    
    addEnrollmentMutation.mutate({
      course_id: courseId,
      user_email: selectedUser,
      user_name: selectedUserData?.full_name,
      assigned_by: user?.email,
      coordinator_email: user?.is_coordinator ? user.email : null,
      group_name: groupName || null,
      enrollment_status: 'active',
    });
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledEmails = enrollments.map(e => e.user_email);
  const availableUsers = allUsers.filter(u => !enrolledEmails.includes(u.email));

  const groupedEnrollments = filteredEnrollments.reduce((acc, enrollment) => {
    const group = enrollment.group_name || 'Ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(enrollment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Course Participants</h3>
              <p className="text-sm text-gray-600">{courseName}</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Participant to Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(u => (
                        <SelectItem key={u.email} value={u.email}>
                          {u.full_name} - {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group/Cohort (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Group A, Cohort 2024"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddParticipant}
                    disabled={addEnrollmentMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Participant
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participants..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedEnrollments).map(([groupName, groupEnrollments]) => (
            <div key={groupName}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-gray-900">{groupName}</h4>
                <Badge variant="outline">{groupEnrollments.length} participants</Badge>
              </div>
              <div className="space-y-2">
                {groupEnrollments.map(enrollment => (
                  <Card key={enrollment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-indigo-100 text-indigo-600">
                            {enrollment.user_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.user_name}</p>
                          <p className="text-sm text-gray-600">{enrollment.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={enrollment.enrollment_status}
                          onValueChange={(value) =>
                            updateEnrollmentMutation.mutate({
                              id: enrollment.id,
                              data: { enrollment_status: value },
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Remove this participant?')) {
                              removeEnrollmentMutation.mutate(enrollment.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No participants enrolled yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}