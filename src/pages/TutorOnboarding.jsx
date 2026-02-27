import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, User, BookOpen, CheckCircle, ArrowRight, ArrowLeft,
  Camera, X, Plus, Award, GraduationCap, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
  { id: 'welcome', title: 'Welcome!', icon: Sparkles },
  { id: 'profile', title: 'Your Profile', icon: User },
  { id: 'expertise', title: 'Expertise', icon: BookOpen },
  { id: 'verification', title: 'Verification', icon: Award },
  { id: 'done', title: 'All Set!', icon: CheckCircle },
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Further Mathematics', 'English Language', 'English Literature',
  'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Digital Technology',
  'History', 'Geography', 'Economics', 'Religious Studies', 'Technology & Design',
  'Life & Health Sciences', 'Environmental Technology',
];

const QUALIFICATION_OPTIONS = ['GCSE', 'AS-Level', 'A-Level', 'Primary', 'University', 'Professional'];

export default function TutorOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    bio: '',
    teaching_style: '',
    avatar: '',
  });

  const [expertise, setExpertise] = useState({
    subjects: [],
    qualifications: [],
    years_experience: '',
    custom_subject: '',
  });

  const [verification, setVerification] = useState({
    full_name_confirm: '',
    qualifications_detail: '',
    agreed_to_terms: false,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u?.is_tutor) {
        navigate(createPageUrl('Home'));
      }
    });
  }, []);

  const saveUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile(p => ({ ...p, avatar: file_url }));
    setUploading(false);
    toast.success('Photo uploaded!');
  };

  const toggleSubject = (subject) => {
    setExpertise(ex => ({
      ...ex,
      subjects: ex.subjects.includes(subject)
        ? ex.subjects.filter(s => s !== subject)
        : [...ex.subjects, subject],
    }));
  };

  const toggleQualification = (q) => {
    setExpertise(ex => ({
      ...ex,
      qualifications: ex.qualifications.includes(q)
        ? ex.qualifications.filter(x => x !== q)
        : [...ex.qualifications, q],
    }));
  };

  const addCustomSubject = () => {
    const s = expertise.custom_subject.trim();
    if (s && !expertise.subjects.includes(s)) {
      setExpertise(ex => ({ ...ex, subjects: [...ex.subjects, s], custom_subject: '' }));
    }
  };

  const handleNext = async () => {
    if (step === STEPS.length - 1) {
      navigate(createPageUrl('TutorDashboardOverview'));
      return;
    }

    // Save profile step
    if (step === 1) {
      if (!profile.bio.trim()) { toast.error('Please add a bio'); return; }
      await saveUserMutation.mutateAsync({
        bio: profile.bio,
        teaching_style: profile.teaching_style,
        ...(profile.avatar ? { avatar: profile.avatar } : {}),
      });
    }

    // Save expertise step
    if (step === 2) {
      if (expertise.subjects.length === 0) { toast.error('Please select at least one subject'); return; }
      await saveUserMutation.mutateAsync({
        expertise_subjects: expertise.subjects,
        expertise_qualifications: expertise.qualifications,
        years_experience: expertise.years_experience,
      });
    }

    // Save verification step
    if (step === 3) {
      if (!verification.agreed_to_terms) { toast.error('Please agree to the tutor terms'); return; }
      await saveUserMutation.mutateAsync({
        onboarding_completed: true,
        verification_status: 'pending',
      });
    }

    setStep(s => s + 1);
  };

  const canProceed = () => {
    if (step === 1) return profile.bio.trim().length > 0;
    if (step === 2) return expertise.subjects.length > 0;
    if (step === 3) return verification.agreed_to_terms;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              {React.createElement(STEPS[step].icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
            </div>
          </div>

          <Progress value={progress} className="h-1.5 bg-white/20 mb-3" />

          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  i <= step ? 'bg-white' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-2xl shadow-xl">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && <WelcomeStep user={user} />}
                {step === 1 && (
                  <ProfileStep
                    profile={profile}
                    setProfile={setProfile}
                    uploading={uploading}
                    fileInputRef={fileInputRef}
                    onUploadClick={() => fileInputRef.current?.click()}
                    onFileChange={handleAvatarUpload}
                  />
                )}
                {step === 2 && (
                  <ExpertiseStep
                    expertise={expertise}
                    setExpertise={setExpertise}
                    toggleSubject={toggleSubject}
                    toggleQualification={toggleQualification}
                    addCustomSubject={addCustomSubject}
                  />
                )}
                {step === 3 && (
                  <VerificationStep
                    user={user}
                    verification={verification}
                    setVerification={setVerification}
                  />
                )}
                {step === 4 && <DoneStep user={user} expertise={expertise} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t px-8 py-4 flex items-center justify-between bg-gray-50 rounded-b-2xl">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < STEPS.length - 1 && step !== STEPS.length - 1 && (
              <Button
                variant="ghost"
                className="text-gray-400 text-sm"
                onClick={() => {
                  if (step < STEPS.length - 1) setStep(s => s + 1);
                  else navigate(createPageUrl('TutorDashboardOverview'));
                }}
              >
                Skip for now
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saveUserMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 gap-2 min-w-[120px]"
            >
              {saveUserMutation.isPending
                ? 'Saving...'
                : step === STEPS.length - 1
                ? 'Go to Dashboard'
                : 'Continue'}
              {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────────────

function WelcomeStep({ user }) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <GraduationCap className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome, {user?.full_name?.split(' ')[0] || 'Tutor'}! 🎉
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Congratulations on being approved as a tutor! Let's set up your profile so students can find and book sessions with you.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 text-left">
        {[
          { icon: User, label: 'Build your profile', desc: 'Bio, photo & teaching style', color: 'bg-purple-50 text-purple-600' },
          { icon: BookOpen, label: 'Set your subjects', desc: 'Subjects you can teach', color: 'bg-indigo-50 text-indigo-600' },
          { icon: CheckCircle, label: 'Quick verification', desc: 'Confirm your details', color: 'bg-green-50 text-green-600' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileStep({ profile, setProfile, uploading, fileInputRef, onUploadClick, onFileChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Public Profile</h3>
        <p className="text-sm text-gray-500">This is what students will see when browsing tutors.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-purple-400" />
            )}
          </div>
          {profile.avatar && (
            <button
              onClick={() => setProfile(p => ({ ...p, avatar: '' }))}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          <Button variant="outline" onClick={onUploadClick} disabled={uploading} className="gap-2">
            <Camera className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 5MB</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Bio <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={profile.bio}
          onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
          placeholder="e.g. I'm a qualified Maths teacher with 8 years of experience in GCSE and A-Level tutoring..."
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{profile.bio.length} / 500 chars recommended</p>
      </div>

      {/* Teaching Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Style</label>
        <Textarea
          value={profile.teaching_style}
          onChange={e => setProfile(p => ({ ...p, teaching_style: e.target.value }))}
          placeholder="e.g. I focus on step-by-step explanations with lots of practice problems and real-world examples..."
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}

function ExpertiseStep({ expertise, setExpertise, toggleSubject, toggleQualification, addCustomSubject }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Teaching Expertise</h3>
        <p className="text-sm text-gray-500">Select the subjects and qualification levels you teach.</p>
      </div>

      {/* Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects <span className="text-red-500">*</span>
          {expertise.subjects.length > 0 && (
            <span className="ml-2 text-purple-600">({expertise.subjects.length} selected)</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SUBJECT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => toggleSubject(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                expertise.subjects.includes(s)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Custom subject */}
        <div className="flex gap-2">
          <Input
            value={expertise.custom_subject}
            onChange={e => setExpertise(ex => ({ ...ex, custom_subject: e.target.value }))}
            placeholder="Add other subject..."
            onKeyDown={e => e.key === 'Enter' && addCustomSubject()}
            className="h-9"
          />
          <Button variant="outline" size="sm" onClick={addCustomSubject} className="gap-1 shrink-0">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      {/* Qualification Levels */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Levels You Teach</label>
        <div className="flex flex-wrap gap-2">
          {QUALIFICATION_OPTIONS.map(q => (
            <button
              key={q}
              onClick={() => toggleQualification(q)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                expertise.qualifications.includes(q)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Years Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Teaching Experience</label>
        <select
          value={expertise.years_experience}
          onChange={e => setExpertise(ex => ({ ...ex, years_experience: e.target.value }))}
          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select...</option>
          <option value="<1">Less than 1 year</option>
          <option value="1-3">1–3 years</option>
          <option value="3-5">3–5 years</option>
          <option value="5-10">5–10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>
    </div>
  );
}

function VerificationStep({ user, verification, setVerification }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification & Confirmation</h3>
        <p className="text-sm text-gray-500">Please confirm your details before going live as a tutor.</p>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tutor Verification</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Our team will review your profile and send you an email confirmation within 24 hours. You can start setting up your courses right away.
            </p>
          </div>
        </div>
      </Card>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Your Full Name</label>
        <Input
          value={verification.full_name_confirm}
          onChange={e => setVerification(v => ({ ...v, full_name_confirm: e.target.value }))}
          placeholder={user?.full_name || 'Your full name'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualifications & Credentials <span className="text-gray-400">(optional)</span>
        </label>
        <Textarea
          value={verification.qualifications_detail}
          onChange={e => setVerification(v => ({ ...v, qualifications_detail: e.target.value }))}
          placeholder="e.g. BSc Mathematics (Queen's University Belfast), PGCE, QTS..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => setVerification(v => ({ ...v, agreed_to_terms: !v.agreed_to_terms }))}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            verification.agreed_to_terms
              ? 'bg-purple-600 border-purple-600'
              : 'border-gray-300 group-hover:border-purple-400'
          }`}
        >
          {verification.agreed_to_terms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm text-gray-700">
          I confirm that the information provided is accurate, and I agree to uphold the platform's{' '}
          <span className="text-purple-600 underline cursor-pointer">Tutor Code of Conduct</span>{' '}
          and maintain professional standards in all sessions.
        </span>
      </label>
    </div>
  );
}

function DoneStep({ user, expertise }) {
  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-green-600" />
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Your tutor profile is ready. Head to your dashboard to create courses, set your availability, and start accepting bookings.
      </p>

      {expertise.subjects.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Your Teaching Subjects</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {expertise.subjects.map(s => (
              <Badge key={s} className="bg-purple-100 text-purple-700 border-0">
                <Star className="w-3 h-3 mr-1" />
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 text-left">
        <p className="text-sm font-semibold text-gray-900 mb-2">What's next?</p>
        <ul className="space-y-1.5">
          {[
            'Set your availability so students can book sessions',
            'Create your first course to share your knowledge',
            'Check incoming booking requests from students',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}