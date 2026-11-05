import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, Circle, ArrowRight, ArrowLeft, X, 
  User, Calendar, BookOpen, Sparkles, Clock, Video, Trophy, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AvailabilityManager from '@/components/tutor/AvailabilityManager';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Teaching!',
    description: 'Let\'s get you set up to start teaching amazing courses',
    icon: Sparkles,
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Help students get to know you better',
    icon: User,
  },
  {
    id: 'availability',
    title: 'Set Your Availability',
    description: 'Let students know when you\'re available for sessions',
    icon: Calendar,
  },
  {
    id: 'first_course',
    title: 'Create Your First Course',
    description: 'Start building engaging content for your students',
    icon: BookOpen,
  },
  {
    id: 'features',
    title: 'Platform Overview',
    description: 'Discover powerful features to enhance your teaching',
    icon: Trophy,
  },
];

export default function TutorOnboardingFlow({ user, onComplete, onSkip }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    bio: '',
    expertise: '',
    teaching_style: '',
  });
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'mathematics',
    level: 'beginner',
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ['tutor-onboarding', user?.email],
    queryFn: async () => {
      const status = await base44.entities.TutorOnboarding.filter({ tutor_email: user?.email });
      return status[0];
    },
    enabled: !!user?.email,
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: (data) => {
      if (onboardingStatus?.id) {
        return base44.entities.TutorOnboarding.update(onboardingStatus.id, data);
      }
      return base44.entities.TutorOnboarding.create({ tutor_email: user?.email, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-onboarding']);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
  });

  useEffect(() => {
    if (onboardingStatus?.current_step !== undefined) {
      setCurrentStep(onboardingStatus.current_step);
    }
  }, [onboardingStatus]);

  const handleNext = async () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // Save progress
    const completedSteps = [...(onboardingStatus?.completed_steps || []), step.id];
    await updateOnboardingMutation.mutateAsync({
      current_step: currentStep + 1,
      completed_steps: completedSteps,
    });

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await updateOnboardingMutation.mutateAsync({ is_completed: true });
      toast.success('🎉 Onboarding completed!');
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await updateOnboardingMutation.mutateAsync({ skipped: true, is_completed: true });
    onSkip?.();
  };

  const handleSaveProfile = async () => {
    await updateUserMutation.mutateAsync(profileData);
    toast.success('Profile updated!');
    handleNext();
  };

  const handleCreateCourse = async () => {
    await createCourseMutation.mutateAsync({
      ...courseData,
      instructor: user?.full_name || 'Instructor',
      instructor_avatar: user?.avatar,
      rating: 4.5,
      enrolled_count: 0,
      price: 0,
      duration_hours: 10,
      total_lessons: 0,
    });
    toast.success('Course created!');
    handleNext();
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                {React.createElement(ONBOARDING_STEPS[currentStep].icon, { className: "w-6 h-6" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{ONBOARDING_STEPS[currentStep].title}</h2>
                <p className="text-purple-100 text-sm">{ONBOARDING_STEPS[currentStep].description}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {ONBOARDING_STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-white'
                    : idx < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <WelcomeStep user={user} />}
              {currentStep === 1 && (
                <ProfileStep 
                  user={user} 
                  data={profileData} 
                  setData={setProfileData}
                  onSave={handleSaveProfile}
                  isSaving={updateUserMutation.isPending}
                />
              )}
              {currentStep === 2 && <AvailabilityStep user={user} onNext={handleNext} />}
              {currentStep === 3 && (
                <CourseStep 
                  data={courseData} 
                  setData={setCourseData}
                  onCreate={handleCreateCourse}
                  isCreating={createCourseMutation.isPending}
                />
              )}
              {currentStep === 4 && <FeaturesStep onFinish={handleNext} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip Tutorial
          </Button>

          {currentStep < ONBOARDING_STEPS.length - 1 && currentStep !== 1 && currentStep !== 3 && (
            <Button onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-indigo-600 gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function WelcomeStep({ user }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        Welcome, {user?.full_name}! 🎉
      </h3>
      <p className="text-muted-foreground max-w-lg mx-auto mb-8">
        We're excited to have you as a tutor! This quick setup will help you get started with creating courses, 
        managing your schedule, and connecting with students.
      </p>
      
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {[
          { icon: User, title: 'Build Your Profile', desc: 'Showcase your expertise' },
          { icon: Calendar, title: 'Set Availability', desc: 'Control your schedule' },
          { icon: BookOpen, title: 'Create Courses', desc: 'Share your knowledge' },
          { icon: Video, title: 'Live Sessions', desc: 'Connect with students' },
        ].map((feature, idx) => (
          <Card key={idx} className="p-4 text-left border-2">
            <feature.icon className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfileStep({ user, data, setData, onSave, isSaving }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Tell Students About Yourself</h3>
        <p className="text-muted-foreground text-sm mb-6">
          A compelling profile helps students connect with you and understand your teaching approach.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Professional Bio
            <span className="text-muted-foreground ml-2">(What's your background?)</span>
          </label>
          <Textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            placeholder="I'm a certified teacher with 10 years of experience in..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Areas of Expertise
            <span className="text-muted-foreground ml-2">(What do you teach?)</span>
          </label>
          <Input
            value={data.expertise}
            onChange={(e) => setData({ ...data, expertise: e.target.value })}
            placeholder="Mathematics, Physics, GCSE Preparation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Teaching Style
            <span className="text-muted-foreground ml-2">(How do you teach?)</span>
          </label>
          <Textarea
            value={data.teaching_style}
            onChange={(e) => setData({ ...data, teaching_style: e.target.value })}
            placeholder="I focus on interactive learning with real-world examples..."
            rows={3}
          />
        </div>
      </div>

      <Button 
        onClick={onSave} 
        disabled={isSaving || !data.bio}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 h-12"
      >
        {isSaving ? 'Saving...' : 'Save & Continue'}
      </Button>
    </div>
  );
}

function AvailabilityStep({ user, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Set Your Teaching Schedule</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Add time slots when you're available for live tutoring sessions. You can always update this later.
        </p>
      </div>

      <AvailabilityManager tutorEmail={user?.email} />

      <Button onClick={onNext} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 h-12">
        Continue
      </Button>
    </div>
  );
}

function CourseStep({ data, setData, onCreate, isCreating }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Create Your First Course</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Don't worry about making it perfect - you can add lessons and content later!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Course Title *</label>
          <Input
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Introduction to Algebra"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Description *</label>
          <Textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder="What will students learn in this course?"
            rows={3}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg"
            >
              <option value="mathematics">Mathematics</option>
              <option value="english">English</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
              <option value="physics">Physics</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Level</label>
            <select
              value={data.level}
              onChange={(e) => setData({ ...data, level: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <Button 
        onClick={onCreate} 
        disabled={isCreating || !data.title || !data.description}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 h-12"
      >
        {isCreating ? 'Creating Course...' : 'Create Course'}
      </Button>
    </div>
  );
}

function FeaturesStep({ onFinish }) {
  const features = [
    {
      icon: Video,
      title: 'Live Video Sessions',
      description: 'Schedule and conduct live tutoring sessions with screen sharing, whiteboard, and breakout rooms.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Course Builder',
      description: 'Create engaging courses with lessons, quizzes, and interactive content.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Award points, badges, and track student progress with built-in gamification.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Clock,
      title: 'Availability Management',
      description: 'Students can book sessions based on your available time slots.',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Powerful Tools at Your Fingertips</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Here are some key features to help you deliver amazing learning experiences:
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
          >
            <Card className="p-4 border-2 hover:border-purple-300 transition-all">
              <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Need Help?</h4>
            <p className="text-sm text-muted-foreground">
              Visit the Tutor Dashboard to access guides, tips, and support resources anytime.
            </p>
          </div>
        </div>
      </Card>

      <Button onClick={onFinish} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 h-12">
        Complete Setup & Start Teaching! 🎉
      </Button>
    </div>
  );
}