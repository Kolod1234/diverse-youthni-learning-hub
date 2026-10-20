import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, TextField, Chip, LinearProgress } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Textarea = ({ className, ...props }) => <TextField fullWidth multiline className={className} {...props} />;
const Badge = ({ children, className, ...props }) => <Chip label={children} size="small" className={className} {...props} />;
const Progress = ({ value, className }) => <LinearProgress variant="determinate" value={value || 0} className={className} sx={{ borderRadius: 1 }} />;
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MonitorIcon from '@mui/icons-material/Monitor';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import VideocamIcon from '@mui/icons-material/Videocam';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Sparkles = _w(AutoAwesomeIcon), User = _w(PersonIcon), BookOpen = _w(MenuBookIcon), CheckCircle = _w(CheckCircleIcon);
const ArrowRight = _w(ArrowForwardIcon), ArrowLeft = _w(ArrowBackIcon), Camera = _w(PhotoCameraIcon), X = _w(CloseIcon);
const Plus = _w(AddIcon), Award = _w(EmojiEventsIcon), GraduationCap = _w(SchoolIcon), Star = _w(StarIcon);
const Lightbulb = _w(LightbulbIcon), Monitor = _w(MonitorIcon), ClipboardCheck = _w(FactCheckIcon);
const ChevronDown = _w(KeyboardArrowDownIcon), ChevronUp = _w(KeyboardArrowUpIcon), PlayCircle = _w(PlayCircleOutlineIcon);
const Users = _w(PeopleIcon), BarChart3 = _w(BarChartIcon), MessageSquare = _w(ChatIcon);
const Video = _w(VideocamIcon), FileText = _w(DescriptionIcon), Lock = _w(LockIcon);
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
  { id: 'guide', title: 'Tutor Guide', icon: BookOpen },
  { id: 'profile', title: 'Your Profile', icon: User },
  { id: 'expertise', title: 'Expertise', icon: Sparkles },
  { id: 'checklist', title: 'Pre-Session Checklist', icon: ClipboardCheck },
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

  const [profile, setProfile] = useState({ bio: '', teaching_style: '', avatar: '' });
  const [expertise, setExpertise] = useState({ subjects: [], qualifications: [], years_experience: '', custom_subject: '' });
  const [verification, setVerification] = useState({ full_name_confirm: '', qualifications_detail: '', agreed_to_terms: false });
  const [checklist, setChecklist] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u?.is_tutor) navigate(createPageUrl('Home'));
    });
  }, []);

  const saveUserMutation = useMutation({ mutationFn: (data) => base44.auth.updateMe(data) });

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
      subjects: ex.subjects.includes(subject) ? ex.subjects.filter(s => s !== subject) : [...ex.subjects, subject],
    }));
  };

  const toggleQualification = (q) => {
    setExpertise(ex => ({
      ...ex,
      qualifications: ex.qualifications.includes(q) ? ex.qualifications.filter(x => x !== q) : [...ex.qualifications, q],
    }));
  };

  const addCustomSubject = () => {
    const s = expertise.custom_subject.trim();
    if (s && !expertise.subjects.includes(s)) {
      setExpertise(ex => ({ ...ex, subjects: [...ex.subjects, s], custom_subject: '' }));
    }
  };

  const handleNext = async () => {
    if (step === STEPS.length - 1) { navigate(createPageUrl('TutorDashboardOverview')); return; }

    if (STEPS[step].id === 'profile') {
      if (!profile.bio.trim()) { toast.error('Please add a bio'); return; }
      await saveUserMutation.mutateAsync({ bio: profile.bio, teaching_style: profile.teaching_style, ...(profile.avatar ? { avatar: profile.avatar } : {}) });
    }

    if (STEPS[step].id === 'expertise') {
      if (expertise.subjects.length === 0) { toast.error('Please select at least one subject'); return; }
      await saveUserMutation.mutateAsync({ expertise_subjects: expertise.subjects, expertise_qualifications: expertise.qualifications, years_experience: expertise.years_experience });
    }

    if (STEPS[step].id === 'verification') {
      if (!verification.agreed_to_terms) { toast.error('Please agree to the tutor terms'); return; }
      await saveUserMutation.mutateAsync({ onboarding_completed: true, verification_status: 'pending' });
    }

    setStep(s => s + 1);
  };

  const canProceed = () => {
    const id = STEPS[step].id;
    if (id === 'profile') return profile.bio.trim().length > 0;
    if (id === 'expertise') return expertise.subjects.length > 0;
    if (id === 'verification') return verification.agreed_to_terms;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
        {/* Header */}
        <div className="bg-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              {React.createElement(STEPS[step].icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/20 mb-3" />
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${i <= step ? 'bg-card' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-b-2xl shadow-xl">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {STEPS[step].id === 'guide' && <GuideStep user={user} />}
                {STEPS[step].id === 'profile' && (
                  <ProfileStep profile={profile} setProfile={setProfile} uploading={uploading} fileInputRef={fileInputRef}
                    onUploadClick={() => fileInputRef.current?.click()} onFileChange={handleAvatarUpload} />
                )}
                {STEPS[step].id === 'expertise' && (
                  <ExpertiseStep expertise={expertise} setExpertise={setExpertise} toggleSubject={toggleSubject}
                    toggleQualification={toggleQualification} addCustomSubject={addCustomSubject} />
                )}
                {STEPS[step].id === 'checklist' && <ChecklistStep checklist={checklist} setChecklist={setChecklist} />}
                {STEPS[step].id === 'verification' && (
                  <VerificationStep user={user} verification={verification} setVerification={setVerification} />
                )}
                {STEPS[step].id === 'done' && <DoneStep user={user} expertise={expertise} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t px-8 py-4 flex items-center justify-between bg-gray-50 rounded-b-2xl">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < STEPS.length - 1 && STEPS[step].id !== 'verification' && STEPS[step].id !== 'profile' && STEPS[step].id !== 'expertise' && (
              <Button variant="ghost" className="text-gray-400 text-sm" onClick={() => setStep(s => s + 1)}>
                Skip for now
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saveUserMutation.isPending}
              className="bg-indigo-600 gap-2 min-w-[120px]"
            >
              {saveUserMutation.isPending ? 'Saving...' : step === STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
              {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Guide Step ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  {
    id: 'steps',
    icon: PlayCircle,
    color: 'purple',
    title: 'Step-by-Step Getting Started Guide',
    items: [
      { step: '1', title: 'Complete your profile', desc: 'Add your bio, photo, and teaching style so students can get to know you before booking.' },
      { step: '2', title: 'Set your subjects & expertise', desc: 'Select the subjects and qualification levels you teach to appear in the right searches.' },
      { step: '3', title: 'Set your availability', desc: 'Use the Booking Manager to define your available time slots for student bookings.' },
      { step: '4', title: 'Create your first course or lesson', desc: 'Head to the Lesson Editor or Tutor Dashboard to build structured content for your students.' },
      { step: '5', title: 'Accept your first booking', desc: 'Review incoming requests and confirm sessions. You\'ll receive notifications for new bookings.' },
      { step: '6', title: 'Run your session & submit feedback', desc: 'Deliver your session via the platform\'s live video tools, then mark attendance and leave feedback.' },
    ],
  },
  {
    id: 'strategies',
    icon: Lightbulb,
    color: 'amber',
    title: 'Effective Teaching Strategies',
    items: [
      { step: '💡', title: 'Know your student', desc: 'Before each session, review any notes or previous quiz results to tailor your approach to their level.' },
      { step: '🎯', title: 'Set clear learning objectives', desc: 'Start every lesson with 2-3 clear goals. Use the Learning Objectives feature in the Lesson Editor.' },
      { step: '🔄', title: 'Use active recall', desc: 'End sessions with quick quizzes using the Quiz Generator — proven to boost long-term retention.' },
      { step: '🛠️', title: 'Break it down', desc: 'Use the Slides editor to split complex topics into digestible chunks, building confidence step by step.' },
      { step: '🙌', title: 'Be encouraging', desc: 'Many of our learners face real challenges. Patience, positivity, and consistency make the biggest difference.' },
      { step: '📊', title: 'Track and adapt', desc: 'Use Student Analytics to monitor progress and identify where learners are struggling.' },
    ],
  },
  {
    id: 'tools',
    icon: Monitor,
    color: 'indigo',
    title: 'Platform Tools & Features',
    features: [
      { icon: BookOpen, label: 'Lesson Editor', desc: 'Create rich lessons with text, video, slides, documents & interactive H5P content.' },
      { icon: Video, label: 'Live Sessions', desc: 'Host scheduled live sessions with video, chat, attendance marking & Q&A.' },
      { icon: FileText, label: 'Quiz Generator', desc: 'Build or AI-generate quizzes with instant marking and performance insights.' },
      { icon: BarChart3, label: 'Student Analytics', desc: 'Track lesson completion, quiz scores, and engagement per student.' },
      { icon: Users, label: 'Booking Manager', desc: 'Set availability, review booking requests, and manage your calendar.' },
      { icon: MessageSquare, label: 'Messaging & Chat', desc: 'Communicate with students directly through the platform\'s message center.' },
      { icon: ClipboardCheck, label: 'Assignment & Grading', desc: 'Set assignments, review submissions, and provide detailed feedback.' },
    ],
  },
];

function GuideStep({ user }) {
  const [expanded, setExpanded] = useState('steps');

  const colorMap = {
    purple: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', badge: 'bg-indigo-600', header: 'text-indigo-800' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-500', header: 'text-amber-800' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', badge: 'bg-indigo-600', header: 'text-indigo-800' },
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0] || 'Tutor'}! 🎉</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Everything you need to know to get started as a tutor on Diverse Youth NI Learning Hub.
        </p>
      </div>

      {GUIDE_SECTIONS.map((section) => {
        const c = colorMap[section.color];
        const Icon = section.icon;
        const isOpen = expanded === section.id;

        return (
          <div key={section.id} className={`border rounded-xl overflow-hidden ${c.border}`}>
            <button
              className={`w-full flex items-center justify-between p-4 ${c.bg} text-left`}
              onClick={() => setExpanded(isOpen ? null : section.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${c.icon}`} />
                <span className={`font-semibold text-sm ${c.header}`}>{section.title}</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-card space-y-3">
                    {section.items && section.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className={`w-7 h-7 ${c.badge} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                          {item.step}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                    {section.features && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.features.map((f, i) => {
                          const FIcon = f.icon;
                          return (
                            <div key={i} className={`rounded-lg p-3 ${c.bg} border ${c.border}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <FIcon className={`w-4 h-4 ${c.icon}`} />
                                <p className="text-xs font-semibold text-gray-800">{f.label}</p>
                              </div>
                              <p className="text-xs text-gray-500">{f.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Checklist Step ───────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: 'profile_complete', label: 'Profile complete with photo and bio', category: 'Profile' },
  { id: 'subjects_set', label: 'Subjects and qualification levels selected', category: 'Profile' },
  { id: 'availability_set', label: 'Availability slots added in Booking Manager', category: 'Scheduling' },
  { id: 'first_lesson', label: 'At least one lesson or course created', category: 'Content' },
  { id: 'quiz_ready', label: 'A quiz or assessment prepared for students', category: 'Content' },
  { id: 'video_tested', label: 'Video/audio tested and working', category: 'Technical' },
  { id: 'platform_tour', label: 'Explored the Tutor Dashboard and all tools', category: 'Technical' },
  { id: 'contact_info', label: 'Contact info and notification preferences set', category: 'Setup' },
  { id: 'code_of_conduct', label: 'Read and understood the Tutor Code of Conduct', category: 'Setup' },
  { id: 'first_student', label: 'Ready to welcome your first student!', category: 'Launch' },
];

function ChecklistStep({ checklist, setChecklist }) {
  const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const pct = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Pre-Session Checklist</h3>
        <p className="text-sm text-gray-500">Complete these before your first session to ensure a great experience.</p>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-800">{completedCount} of {CHECKLIST_ITEMS.length} completed</span>
          <span className="text-sm font-bold text-indigo-700">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{cat}</p>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.filter(i => i.category === cat).map(item => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  checklist[item.id] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div
                  onClick={() => setChecklist(c => ({ ...c, [item.id]: !c[item.id] }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    checklist[item.id] ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {checklist[item.id] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`text-sm ${checklist[item.id] ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile Step ─────────────────────────────────────────────────────────────

function ProfileStep({ profile, setProfile, uploading, fileInputRef, onUploadClick, onFileChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Public Profile</h3>
        <p className="text-sm text-gray-500">This is what students will see when browsing tutors.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden border-2 border-indigo-200">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          {profile.avatar && (
            <button onClick={() => setProfile(p => ({ ...p, avatar: '' }))}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio <span className="text-red-500">*</span></label>
        <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
          placeholder="e.g. I'm a qualified Maths teacher with 8 years of experience in GCSE and A-Level tutoring..."
          rows={4} className="resize-none" />
        <p className="text-xs text-gray-400 mt-1">{profile.bio.length} / 500 chars recommended</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Style</label>
        <Textarea value={profile.teaching_style} onChange={e => setProfile(p => ({ ...p, teaching_style: e.target.value }))}
          placeholder="e.g. I focus on step-by-step explanations with lots of practice problems and real-world examples..."
          rows={3} className="resize-none" />
      </div>
    </div>
  );
}

// ─── Expertise Step ───────────────────────────────────────────────────────────

function ExpertiseStep({ expertise, setExpertise, toggleSubject, toggleQualification, addCustomSubject }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Teaching Expertise</h3>
        <p className="text-sm text-gray-500">Select the subjects and qualification levels you teach.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects <span className="text-red-500">*</span>
          {expertise.subjects.length > 0 && <span className="ml-2 text-indigo-600">({expertise.subjects.length} selected)</span>}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SUBJECT_OPTIONS.map(s => (
            <button key={s} onClick={() => toggleSubject(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                expertise.subjects.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-card text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={expertise.custom_subject} onChange={e => setExpertise(ex => ({ ...ex, custom_subject: e.target.value }))}
            placeholder="Add other subject..." onKeyDown={e => e.key === 'Enter' && addCustomSubject()} className="h-9" />
          <Button variant="outline" size="sm" onClick={addCustomSubject} className="gap-1 shrink-0">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Levels You Teach</label>
        <div className="flex flex-wrap gap-2">
          {QUALIFICATION_OPTIONS.map(q => (
            <button key={q} onClick={() => toggleQualification(q)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                expertise.qualifications.includes(q) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-card text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}>{q}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Teaching Experience</label>
        <select value={expertise.years_experience} onChange={e => setExpertise(ex => ({ ...ex, years_experience: e.target.value }))}
          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
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

// ─── Verification Step ────────────────────────────────────────────────────────

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
        <Input value={verification.full_name_confirm} onChange={e => setVerification(v => ({ ...v, full_name_confirm: e.target.value }))}
          placeholder={user?.full_name || 'Your full name'} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualifications & Credentials <span className="text-gray-400">(optional)</span>
        </label>
        <Textarea value={verification.qualifications_detail} onChange={e => setVerification(v => ({ ...v, qualifications_detail: e.target.value }))}
          placeholder="e.g. BSc Mathematics (Queen's University Belfast), PGCE, QTS..." rows={3} className="resize-none" />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div onClick={() => setVerification(v => ({ ...v, agreed_to_terms: !v.agreed_to_terms }))}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            verification.agreed_to_terms ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'
          }`}>
          {verification.agreed_to_terms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm text-gray-700">
          I confirm that the information provided is accurate, and I agree to uphold the platform's{' '}
          <span className="text-indigo-600 underline cursor-pointer">Tutor Code of Conduct</span>{' '}
          and maintain professional standards in all sessions.
        </span>
      </label>
    </div>
  );
}

// ─── Done Step ────────────────────────────────────────────────────────────────

function DoneStep({ user, expertise }) {
  return (
    <div className="text-center py-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
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
              <Badge key={s} className="bg-indigo-100 text-indigo-700 border-0"><Star className="w-3 h-3 mr-1" />{s}</Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 text-left">
        <p className="text-sm font-semibold text-gray-900 mb-2">What's next?</p>
        <ul className="space-y-1.5">
          {[
            'Set your availability so students can book sessions',
            'Create your first course to share your knowledge',
            'Check incoming booking requests from students',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />{item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}