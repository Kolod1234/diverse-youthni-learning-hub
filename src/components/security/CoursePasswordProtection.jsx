import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CoursePasswordProtection({ children, user }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  const { data: siteContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getCoursePassword = () => {
    const item = siteContent.find(c => c.key === 'course_access_password');
    return item?.value || 'LEARNERS26';
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (user === null && userLoading) {
        return;
      }

      setUserLoading(false);

      if (user?.role === 'admin') {
        setHasAccess(true);
        return;
      }

      const accessGranted = sessionStorage.getItem('course_access_granted');
      if (accessGranted === 'true') {
        setHasAccess(true);
        return;
      }

      setHasAccess(false);
    };

    checkAccess();
  }, [user, userLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const correctPassword = getCoursePassword();

    if (password === correctPassword) {
      sessionStorage.setItem('course_access_granted', 'true');
      setHasAccess(true);
      toast.success('Access granted!');
    } else {
      setError('Incorrect password. Please try again.');
      toast.error('Incorrect password');
    }
  };

  const handleGoBack = () => {
    navigate(createPageUrl('Home'));
  };

  if (userLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md shadow-2xl rounded-3xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Course Access Required</CardTitle>
            <p className="text-sm text-gray-500">Please enter the password to access courses</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="text-center text-lg"
                />
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  disabled={!password}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Access Courses
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have the password? Contact your administrator
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}