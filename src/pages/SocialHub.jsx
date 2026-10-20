import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';
import DiscussionForum from '@/components/social/DiscussionForum';
import StudyGroups from '@/components/social/StudyGroups';
import ProgressSharing from '@/components/social/ProgressSharing';

export default function SocialHub() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Enrollment.filter({ created_by: user.email }, '-updated_date', 50);
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100)
  });

  const myCourses = courses.filter(c => enrollments.some(e => e.course_id === c.id));
  const currentCourse = selectedCourse || myCourses[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[#0b2f5c] bg-clip-text text-transparent mb-3">
            Social Learning Hub
          </h1>
          <p className="text-muted-foreground text-lg">Connect, collaborate, and learn together with your peers</p>
        </div>

        {/* Course Selector */}
        {myCourses.length > 0 && (
          <div className="mb-6">
            <select
              value={currentCourse?.id || ''}
              onChange={(e) => setSelectedCourse(myCourses.find(c => c.id === e.target.value))}
              className="px-4 py-2 bg-card border border-border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {myCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentCourse ? (
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-lg mb-8">
              <TabsTrigger 
                value="discussions" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white px-6 py-2.5"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger 
                value="groups"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white px-6 py-2.5"
              >
                <Users className="w-4 h-4 mr-2" />
                Study Groups
              </TabsTrigger>
              <TabsTrigger 
                value="progress"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white px-6 py-2.5"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions">
              <DiscussionForum courseId={currentCourse.id} />
            </TabsContent>

            <TabsContent value="groups">
              <StudyGroups courseId={currentCourse.id} />
            </TabsContent>

            <TabsContent value="progress">
              <ProgressSharing courseId={currentCourse.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h2>
            <p className="text-muted-foreground">Enroll in a course to access social features</p>
          </div>
        )}
      </div>
    </div>
  );
}