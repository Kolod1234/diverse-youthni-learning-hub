import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const ONBOARDING_STEPS = {
  leadership: [
    {
      title: 'Welcome to Leadership!',
      description: 'Track your personal development journey with our comprehensive leadership programme.',
      target: null,
    },
    {
      title: 'Your Programs',
      description: 'View and join active leadership programs. Track activities, logbooks, and mentor meetings.',
      highlight: 'Programs',
    },
    {
      title: 'Activity Calendar',
      description: 'See upcoming activities, workshops, and events scheduled for your programs.',
      highlight: 'Activities',
    },
    {
      title: 'Digital Logbooks',
      description: 'Submit weekly logbooks, track hours, and receive feedback from coordinators.',
      highlight: 'Logbooks',
    },
  ],
  learning: [
    {
      title: 'Welcome to Learning!',
      description: 'Master GCSE and A-Level subjects with our interactive platform.',
      target: null,
    },
    {
      title: 'Browse Courses',
      description: 'Explore hundreds of courses across all subjects. Enroll to start learning instantly.',
      highlight: 'Explore',
    },
    {
      title: 'Your Dashboard',
      description: 'Track your progress, view enrolled courses, and see your achievements.',
      highlight: 'Dashboard',
    },
    {
      title: 'Study Library',
      description: 'Access past papers, textbooks, and study materials to support your learning.',
      highlight: 'Library',
    },
    {
      title: 'Live Sessions',
      description: 'Join interactive classes with tutors and ask questions in real-time.',
      highlight: 'Sessions',
    },
  ],
  youth_work: [
    {
      title: 'Welcome to Youth Work!',
      description: 'Complete your OCN qualifications with structured support and resources.',
      target: null,
    },
    {
      title: 'Your Workbooks',
      description: 'Access and complete workbook tasks for your OCN qualification units.',
      highlight: 'Workbooks',
    },
    {
      title: 'Attendance Tracking',
      description: 'Monitor your session attendance and ensure you meet requirements.',
      highlight: 'Attendance',
    },
    {
      title: 'Certificates',
      description: 'View completed units and download your OCN certificates.',
      highlight: 'Certificates',
    },
  ],
  guest: [
    {
      title: 'Welcome, Guest!',
      description: "You're in preview mode. Sign in to unlock full access and choose your pathway.",
      target: null,
    },
    {
      title: 'Browse Courses',
      description: 'View our course catalog (sign in required to enroll and access lessons).',
      highlight: 'Browse',
    },
    {
      title: 'View Programmes',
      description: 'Explore our leadership programmes (sign in required to participate).',
      highlight: 'Programmes',
    },
    {
      title: 'Ready to Join?',
      description: 'Sign in to select your pathway and get full access to all features.',
      highlight: 'Sign In',
    },
  ],
};

export default function PathwayOnboarding({ pathway, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ONBOARDING_STEPS[pathway] || [];

  if (!steps.length) return null;

  const handleComplete = async () => {
    try {
      await base44.auth.updateMe({ onboarding_completed: true });
    } catch (error) {
      // Guest users can't save - just store in localStorage
      localStorage.setItem('onboarding_completed', 'true');
    }
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Onboarding Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Step Indicator */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {step.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500"
            >
              Skip Tour
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-primary"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}