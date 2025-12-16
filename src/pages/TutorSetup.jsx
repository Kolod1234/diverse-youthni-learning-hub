import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { GraduationCap, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    expertise_subjects: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (!userData.is_tutor && userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }

      // Pre-fill if data exists
      setFormData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        expertise_subjects: userData.expertise_subjects || [],
      });
    };
    loadUser();
  }, []);

  const subjects = [
    'mathematics',
    'english',
    'biology',
    'chemistry',
    'physics',
    'history',
    'geography'
  ];

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      expertise_subjects: prev.expertise_subjects.includes(subject)
        ? prev.expertise_subjects.filter(s => s !== subject)
        : [...prev.expertise_subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (formData.expertise_subjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    try {
      await base44.auth.updateMe(formData);
      toast.success('Profile updated successfully!');
      navigate(createPageUrl('TutorDashboard'));
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Tutor Profile</h1>
          <p className="text-gray-500">Tell us about yourself and your expertise</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell students about your teaching experience and qualifications..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Subjects You Teach *</Label>
              <p className="text-sm text-gray-500 mb-3">Select all subjects you're qualified to teach</p>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`p-4 rounded-lg border-2 transition-all capitalize ${
                      formData.expertise_subjects.includes(subject)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
              <Save className="w-5 h-5 mr-2" />
              Save Profile
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}