import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, BookOpen, CheckCircle, Clock, Download, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function LogbookManager({ programId, isAdmin, isMentor, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    week_number: '',
    participant_role: '',
    duty_for_week: '',
    days_of_work: [],
    hours_per_week: '',
    activity_summary: '',
    skills_developed: '',
    challenges: '',
    upcoming_task: '',
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: logbooks = [] } = useQuery({
    queryKey: ['logbooks', programId, userEmail],
    queryFn: () => {
      if (isAdmin || isMentor) {
        return base44.entities.Logbook.filter({ program_id: programId }, '-entry_date', 200);
      } else {
        return base44.entities.Logbook.filter({ program_id: programId, participant_email: userEmail }, '-entry_date', 100);
      }
    },
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['program-participants', programId],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: programId }),
    enabled: isAdmin || isMentor,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Logbook.create({
      ...data,
      program_id: programId,
      participant_email: userEmail,
      participant_name: user?.full_name || '',
      participant_avatar: user?.avatar || '',
      hours_per_week: parseFloat(data.hours_per_week) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['logbooks', programId]);
      setShowForm(false);
      resetForm();
      toast.success('Logbook entry submitted');
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Logbook.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['logbooks', programId]);
      toast.success('Logbook approved');
    },
  });

  const resetForm = () => {
    setFormData({
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      week_number: '',
      participant_role: '',
      duty_for_week: '',
      days_of_work: [],
      hours_per_week: '',
      activity_summary: '',
      skills_developed: '',
      challenges: '',
      upcoming_task: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleApprove = (logbookId, coordinatorComment, recommendation) => {
    approveMutation.mutate({
      id: logbookId,
      data: { 
        coordinator_comment: coordinatorComment,
        recommendation_for_improvement: recommendation,
        is_approved: true,
        approved_by: userEmail,
        approved_date: new Date().toISOString(),
      },
    });
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_work: prev.days_of_work.includes(day)
        ? prev.days_of_work.filter(d => d !== day)
        : [...prev.days_of_work, day]
    }));
  };

  const downloadLogbookPDF = async (entry) => {
    try {
      toast.info('Generating PDF...');
      const doc = new jsPDF();
      const participant = participants.find(p => p.participant_email === entry.participant_email);
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Leadership Empowerment Logbook', 105, 20, { align: 'center' });
      
      // Participant Info Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Participant Information', 20, 40);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${entry.participant_name || participant?.participant_name || 'N/A'}`, 20, 50);
      doc.text(`Email: ${entry.participant_email}`, 20, 57);
      doc.text(`Role: ${entry.participant_role || 'N/A'}`, 20, 64);
      doc.text(`Week: ${entry.week_number || 'N/A'}`, 20, 71);
      doc.text(`Entry Date: ${format(new Date(entry.entry_date), 'MMMM d, yyyy')}`, 20, 78);
      
      // Week Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Weekly Details', 20, 95);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Duty for Week: ${entry.duty_for_week || 'N/A'}`, 20, 105);
      doc.text(`Days Worked: ${entry.days_of_work?.join(', ') || 'N/A'}`, 20, 112);
      doc.text(`Hours Per Week: ${entry.hours_per_week || 0} hours`, 20, 119);
      
      // Activities Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Activities & Progress', 20, 136);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const splitText = (text, maxWidth) => doc.splitTextToSize(text || 'N/A', maxWidth);
      
      let yPos = 146;
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Summary:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      const activityLines = splitText(entry.activity_summary, 170);
      doc.text(activityLines, 20, yPos);
      yPos += activityLines.length * 6 + 5;
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Skills Developed:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      const skillsLines = splitText(entry.skills_developed, 170);
      doc.text(skillsLines, 20, yPos);
      yPos += skillsLines.length * 6 + 5;
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Challenges:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      const challengesLines = splitText(entry.challenges, 170);
      doc.text(challengesLines, 20, yPos);
      yPos += challengesLines.length * 6 + 5;
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Upcoming Task:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      const taskLines = splitText(entry.upcoming_task, 170);
      doc.text(taskLines, 20, yPos);
      yPos += taskLines.length * 6 + 10;
      
      // Coordinator Feedback Section
      if (entry.is_approved) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Coordinator Feedback', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Comment:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 7;
        const commentLines = splitText(entry.coordinator_comment, 170);
        doc.text(commentLines, 20, yPos);
        yPos += commentLines.length * 6 + 5;
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation for Improvement:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 7;
        const recLines = splitText(entry.recommendation_for_improvement, 170);
        doc.text(recLines, 20, yPos);
        yPos += recLines.length * 6 + 5;
        
        doc.text(`Approved by: ${entry.approved_by || 'N/A'}`, 20, yPos + 7);
        doc.text(`Approved on: ${entry.approved_date ? format(new Date(entry.approved_date), 'MMMM d, yyyy') : 'N/A'}`, 20, yPos + 14);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Leadership Empowerment Programme', 105, 285, { align: 'center' });
      }
      
      doc.save(`logbook_${entry.participant_name}_week${entry.week_number || 'na'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Logbook Entries</h3>
        {!isAdmin && !isMentor && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF8C00]">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entry Date *</Label>
                <Input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Week Number *</Label>
                <Input
                  type="number"
                  value={formData.week_number}
                  onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                  placeholder="e.g., 1, 2, 3"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Your Role *</Label>
                <Input
                  value={formData.participant_role}
                  onChange={(e) => setFormData({ ...formData, participant_role: e.target.value })}
                  placeholder="e.g., Team Leader, Volunteer"
                  required
                />
              </div>
              <div>
                <Label>Hours This Week *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.hours_per_week}
                  onChange={(e) => setFormData({ ...formData, hours_per_week: e.target.value })}
                  placeholder="e.g., 7.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Duty/Role for This Week *</Label>
              <Input
                value={formData.duty_for_week}
                onChange={(e) => setFormData({ ...formData, duty_for_week: e.target.value })}
                placeholder="Describe your duty or role for this week"
                required
              />
            </div>

            <div>
              <Label>Days of Work *</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.days_of_work.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="text-sm cursor-pointer">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Activity Summary *</Label>
              <Textarea
                value={formData.activity_summary}
                onChange={(e) => setFormData({ ...formData, activity_summary: e.target.value })}
                placeholder="What did you work on this week?"
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Skills Developed</Label>
              <Textarea
                value={formData.skills_developed}
                onChange={(e) => setFormData({ ...formData, skills_developed: e.target.value })}
                placeholder="What skills did you learn or practice?"
                rows={3}
              />
            </div>

            <div>
              <Label>Challenges Faced</Label>
              <Textarea
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                placeholder="Any difficulties or obstacles?"
                rows={3}
              />
            </div>

            <div>
              <Label>Upcoming Task</Label>
              <Textarea
                value={formData.upcoming_task}
                onChange={(e) => setFormData({ ...formData, upcoming_task: e.target.value })}
                placeholder="What's your goal or task for next week?"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#FF8C00]">Submit Entry</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {logbooks.map(entry => {
          const participant = participants.find(p => p.participant_email === entry.participant_email);
          
          return (
            <Card key={entry.id} className="p-6">
              {/* Header with Profile */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-gray-200">
                    <AvatarImage src={entry.participant_avatar || participant?.participant_avatar} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-bold">
                      {(entry.participant_name || participant?.participant_name || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      {entry.participant_name || participant?.participant_name || 'Participant'}
                    </h4>
                    <p className="text-sm text-gray-500">{entry.participant_email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{entry.participant_role || 'Participant'}</Badge>
                      <Badge variant="outline">Week {entry.week_number || 'N/A'}</Badge>
                      {entry.is_approved ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadLogbookPDF(entry)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>

              {/* Biodata Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-medium">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duty This Week</p>
                  <p className="text-sm font-medium">{entry.duty_for_week || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hours Worked</p>
                  <p className="text-sm font-medium">{entry.hours_per_week || 0} hours</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Days of Work</p>
                  <p className="text-sm font-medium">{entry.days_of_work?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Activity Summary</h5>
                  <p className="text-gray-600 leading-relaxed">{entry.activity_summary}</p>
                </div>

                {entry.skills_developed && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Skills Developed</h5>
                    <p className="text-gray-600 leading-relaxed">{entry.skills_developed}</p>
                  </div>
                )}

                {entry.challenges && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Challenges</h5>
                    <p className="text-gray-600 leading-relaxed">{entry.challenges}</p>
                  </div>
                )}

                {entry.upcoming_task && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Task</h5>
                    <p className="text-gray-600 leading-relaxed">{entry.upcoming_task}</p>
                  </div>
                )}

                {/* Coordinator Feedback */}
                {entry.is_approved && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Coordinator's Feedback
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Comment</p>
                        <p className="text-purple-800">{entry.coordinator_comment}</p>
                      </div>
                      {entry.recommendation_for_improvement && (
                        <div>
                          <p className="text-xs text-purple-600 font-medium mb-1">Recommendation for Improvement</p>
                          <p className="text-purple-800">{entry.recommendation_for_improvement}</p>
                        </div>
                      )}
                      <div className="text-xs text-purple-600 mt-3 pt-3 border-t border-purple-200">
                        Approved by {entry.approved_by} on {entry.approved_date ? format(new Date(entry.approved_date), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Form for Coordinators */}
                {(isAdmin || isMentor) && !entry.is_approved && (
                  <div className="pt-4 border-t mt-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Coordinator Approval</h5>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Coordinator Comment *</Label>
                        <Textarea
                          placeholder="Write your feedback for this entry..."
                          rows={3}
                          id={`comment-${entry.id}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Recommendation for Improvement</Label>
                        <Textarea
                          placeholder="Suggestions for improvement (optional)"
                          rows={3}
                          id={`recommendation-${entry.id}`}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const comment = document.getElementById(`comment-${entry.id}`).value;
                          const recommendation = document.getElementById(`recommendation-${entry.id}`).value;
                          if (comment.trim()) {
                            handleApprove(entry.id, comment, recommendation);
                          } else {
                            toast.error('Please provide a comment before approving');
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Entry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {logbooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No logbook entries yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}