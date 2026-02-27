import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, BookOpen, Users, MessageSquare, Award, Calendar, Clock, 
  ChevronRight, User
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function TutorProfileModal({ tutor, stats, open, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: availability = [] } = useQuery({
    queryKey: ['tutor-availability', tutor?.email],
    queryFn: () => base44.entities.TutorAvailability.filter({ tutor_email: tutor.email, is_active: true }),
    enabled: !!tutor?.email && open,
  });

  const { data: tutorReviews = [] } = useQuery({
    queryKey: ['tutor-reviews', tutor?.email],
    queryFn: async () => {
      const tutorCourses = stats?.courses || [];
      const courseIds = tutorCourses.map(c => c.id);
      if (courseIds.length === 0) return [];
      const allReviews = await base44.entities.Review.filter({ rating_type: 'tutor' });
      return allReviews.filter(r => courseIds.includes(r.course_id));
    },
    enabled: !!tutor?.email && open,
  });

  if (!tutor) return null;

  const avgRating = tutorReviews.length > 0
    ? tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length
    : 0;

  const availabilityByDay = DAYS.reduce((acc, day) => {
    acc[day] = availability.filter(a => a.day_of_week === day);
    return acc;
  }, {});

  const hasAvailability = availability.length > 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'availability', label: 'Availability' },
    { id: 'reviews', label: `Reviews (${tutorReviews.length})` },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-white/30">
              <AvatarImage src={tutor.avatar} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {tutor.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{tutor.full_name || 'Expert Tutor'}</h2>
              {tutor.role === 'admin' && (
                <Badge className="bg-white/20 text-white border-0 mt-1">
                  <Award className="w-3 h-3 mr-1" /> Platform Admin
                </Badge>
              )}
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {stats.courseCount} courses
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {stats.studentCount} students
                </span>
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Message Button */}
          <Link
            to={`${createPageUrl('MessageCenter')}?recipient=${encodeURIComponent(tutor.email)}&name=${encodeURIComponent(tutor.full_name || 'Tutor')}`}
            onClick={onClose}
          >
            <Button className="mt-4 bg-white text-indigo-700 hover:bg-white/90 gap-2 w-full sm:w-auto">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {tutor.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
                </div>
              )}

              {tutor.expertise_subjects?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.expertise_subjects.map(s => (
                      <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stats.courses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Courses</h3>
                  <div className="space-y-2">
                    {stats.courses.map(course => (
                      <Link
                        key={course.id}
                        to={createPageUrl('CourseDetails') + `?id=${course.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group"
                      >
                        <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 truncate">
                          {course.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Weekly Availability</h3>
              </div>
              {!hasAvailability ? (
                <div className="text-center py-10 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No availability set by this tutor yet.</p>
                  <p className="text-sm mt-1">Message them directly to arrange a session.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {DAYS.map(day => {
                    const slots = availabilityByDay[day];
                    if (slots.length === 0) return null;
                    return (
                      <div key={day} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="w-10 text-sm font-semibold text-gray-700 capitalize pt-0.5">
                          {DAY_LABELS[day]}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot, i) => (
                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                              <Clock className="w-3 h-3" />
                              {slot.start_time} – {slot.end_time}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6">
                <Link
                  to={`${createPageUrl('BookSession')}?tutor=${encodeURIComponent(tutor.email)}`}
                  onClick={onClose}
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Calendar className="w-4 h-4" />
                    Book a Session
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {tutorReviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No reviews yet for this tutor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg mb-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-indigo-700">{avgRating.toFixed(1)}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{tutorReviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map(star => {
                        const count = tutorReviews.filter(r => Math.round(r.rating) === star).length;
                        const pct = tutorReviews.length > 0 ? (count / tutorReviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-gray-500">{star}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-4 text-gray-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  {tutorReviews.map((review, i) => (
                    <div key={i} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          {review.user_avatar ? (
                            <img src={review.user_avatar} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{review.user_name || 'Anonymous'}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 ml-11">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}