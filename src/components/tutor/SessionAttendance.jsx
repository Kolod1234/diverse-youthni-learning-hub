import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionAttendance({ session, onClose }) {
  const { data: participants = [] } = useQuery({
    queryKey: ['session-participants', session.id],
    queryFn: () => base44.entities.SessionParticipant.filter({ session_id: session.id }),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const attendedEmails = participants.map(p => p.participant_email);
  const invitedStudents = (session.invited_students || []).map(email => {
    const user = allUsers.find(u => u.email === email);
    return {
      email,
      name: user?.full_name || email,
      attended: attendedEmails.includes(email)
    };
  });

  const attendanceRate = invitedStudents.length > 0
    ? Math.round((attendedEmails.length / invitedStudents.length) * 100)
    : 0;

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Joined At', 'Last Active'].join(','),
      ...invitedStudents.map(student => {
        const participant = participants.find(p => p.participant_email === student.email);
        return [
          student.name,
          student.email,
          student.attended ? 'Attended' : 'Absent',
          participant?.joined_at ? format(new Date(participant.joined_at), 'PPpp') : 'N/A',
          participant?.last_active ? format(new Date(participant.last_active), 'PPpp') : 'N/A'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${session.title}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Session Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Invited</p>
                  <p className="text-2xl font-bold text-gray-900">{invitedStudents.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Attended</p>
                  <p className="text-2xl font-bold text-gray-900">{attendedEmails.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Attendance List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Attendance Details</h4>
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="space-y-2">
              {invitedStudents.map(student => {
                const participant = participants.find(p => p.participant_email === student.email);
                return (
                  <Card key={student.email} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          student.attended ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            student.attended ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                          {participant && (
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>Joined: {format(new Date(participant.joined_at), 'h:mm a')}</span>
                              {participant.last_active && (
                                <span>Last active: {format(new Date(participant.last_active), 'h:mm a')}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={student.attended ? 'bg-green-500' : 'bg-gray-400'}>
                        {student.attended ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Attended
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Absent
                          </>
                        )}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}