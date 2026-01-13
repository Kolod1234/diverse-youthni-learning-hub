import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, BookOpen, Award, MessageSquare, Calendar, 
  TrendingUp, Clock, ArrowLeft, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminUserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setCurrentUser(userData);
    };
    loadUser();
  }, []);

  const { data: targetUser } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      return users[0];
    },
    enabled: !!userId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', targetUser?.email],
    queryFn: () => base44.asServiceRole.entities.Enrollment.filter({ created_by: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['user-certificates', targetUser?.email],
    queryFn: () => base44.entities.Certificate.filter({ student_name: targetUser.full_name }),
    enabled: !!targetUser?.full_name,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', targetUser?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', targetUser?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  if (!currentUser || !targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  const completedEnrollments = enrollments.filter(e => e.is_completed);
  const totalProgress = enrollments.length > 0 
    ? enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('AdminUsers')}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={targetUser.avatar} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                  {targetUser.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{targetUser.full_name}</h1>
                    <p className="text-gray-600 mb-3">{targetUser.email}</p>
                    <div className="flex gap-2 flex-wrap">
                      {targetUser.role === 'admin' && (
                        <Badge className="bg-red-100 text-red-700">Admin</Badge>
                      )}
                      {targetUser.is_tutor && (
                        <Badge className="bg-purple-100 text-purple-700">Tutor</Badge>
                      )}
                      {targetUser.is_coordinator && (
                        <Badge className="bg-blue-100 text-blue-700">Coordinator</Badge>
                      )}
                      {targetUser.is_suspended && (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{new Date(targetUser.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalProgress)}%</p>
                <p className="text-sm text-gray-500">Avg Progress</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{messages.length}</p>
                <p className="text-sm text-gray-500">Messages Sent</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="certificates">Certificates ({certificates.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const course = allCourses.find(c => c.id === enrollment.course_id);
                return (
                  <Card key={enrollment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{course?.title || 'Unknown Course'}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${enrollment.progress_percent || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{enrollment.progress_percent || 0}%</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {enrollment.completed_lessons?.length || 0} lessons completed
                          </Badge>
                          {enrollment.is_completed && (
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Enrolled</p>
                        <p className="font-medium">{new Date(enrollment.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {enrollments.length === 0 && (
                <Card className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No course enrollments</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="grid md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{cert.course_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Certificate #{cert.certificate_number}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Issued {new Date(cert.issue_date).toLocaleDateString()}
                      </div>
                      {cert.final_score && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                          Final Score: {cert.final_score}%
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {certificates.length === 0 && (
                <Card className="col-span-2 p-12 text-center">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No certificates issued</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-3">
              {reviews.map((review) => {
                const course = allCourses.find(c => c.id === review.course_id);
                return (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course?.title || 'Unknown Course'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                            ))}
                          </div>
                          <Badge variant="outline" className="capitalize">{review.rating_type}</Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                    )}
                  </Card>
                );
              })}
              {reviews.length === 0 && (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews submitted</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-3">
              {messages.map((msg) => (
                <Card key={msg.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">Sent message to {msg.recipient_email}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{msg.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {messages.length === 0 && (
                <Card className="p-12 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}