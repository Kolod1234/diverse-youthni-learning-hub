import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
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
      // Wait for user to be defined (either logged in or null)
      if (user === null && userLoading) {
        return;
      }
      
      setUserLoading(false);

      // Admin always has access
      if (user?.role === 'admin') {
        setHasAccess(true);
        return;
      }

      // Check if password was already entered in this session
      const accessGranted = sessionStorage.getItem('course_access_granted');
      if (accessGranted === 'true') {
        setHasAccess(true);
        return;
      }

      // Otherwise, user needs to enter password
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Access Required</h2>
            <p className="text-gray-600">Please enter the password to access courses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
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
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={!password}
              >
                Access Courses
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have the password? Contact your administrator
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}