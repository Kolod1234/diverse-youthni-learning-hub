import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserPlus, UserMinus } from 'lucide-react';

export default function SessionParticipantsManager({ session, onClose, onUpdate }) {
  const [showAddStudent, setShowAddStudent] = useState(false);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', session.course_id],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: session.course_id }),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }) => base44.entities.VideoSession.update(sessionId, data),
    onSuccess: () => {
      onUpdate();
    },
  });

  const invitedStudents = (session.invited_students || []).map(email => 
    allUsers.find(u => u.email === email)
  ).filter(Boolean);

  const availableStudents = enrollments
    .map(e => allUsers.find(u => u.email === e.created_by))
    .filter(s => s && !session.invited_students?.includes(s.email));

  const handleAddStudent = (studentEmail) => {
    const updatedStudents = [...(session.invited_students || []), studentEmail];
    updateSessionMutation.mutate({
      sessionId: session.id,
      data: { invited_students: updatedStudents }
    });
    setShowAddStudent(false);
  };

  const handleRemoveStudent = (studentEmail) => {
    if (confirm('Remove this student from the session?')) {
      const updatedStudents = (session.invited_students || []).filter(e => e !== studentEmail);
      updateSessionMutation.mutate({
        sessionId: session.id,
        data: { invited_students: updatedStudents }
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Manage Participants
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {invitedStudents.length} student{invitedStudents.length !== 1 ? 's' : ''} invited
            </p>
            <Button
              size="sm"
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>

          {showAddStudent && availableStudents.length > 0 && (
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="font-medium text-gray-900 mb-3">Available Students</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableStudents.map(student => (
                  <div key={student.email} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {student.full_name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddStudent(student.email)}
                      disabled={updateSessionMutation.isPending}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Invited Students</h4>
            {invitedStudents.length > 0 ? (
              <div className="space-y-2">
                {invitedStudents.map(student => (
                  <Card key={student.email} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {student.full_name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveStudent(student.email)}
                      disabled={updateSessionMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No students invited yet</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}