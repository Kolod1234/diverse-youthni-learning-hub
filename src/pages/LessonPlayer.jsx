import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Presentation, Layout, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function LessonPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const courseId = params.get('course');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Auto-redirect based on preference
        if (!userData.player_preference) {
          navigate(`/LessonPlayerClassic?lesson=${lessonId}&course=${courseId}`, { replace: true });
        } else {
          navigate(`/${userData.player_preference}?lesson=${lessonId}&course=${courseId}`, { replace: true });
        }
      } catch (error) {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePlayerSelect = (playerType) => {
    const url = `/${playerType}?lesson=${lessonId}&course=${courseId}`;
    navigate(url);
  };

  const savePreference = async (playerType) => {
    if (user) {
      await base44.auth.updateMe({ player_preference: playerType });
    }
    handlePlayerSelect(playerType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Experience</h1>
          <p className="text-gray-600 text-lg">Select the lesson player that works best for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PowerPoint Style */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all group">
            <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Presentation className="w-24 h-24 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">PowerPoint Style</h3>
              <p className="text-gray-600 mb-6">
                Professional presentation mode with ribbon toolbar, filmstrip navigation, and immersive fullscreen experience.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Ribbon-style toolbar
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Presentation mode
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Filmstrip navigation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Keyboard shortcuts
                </li>
              </ul>
              <Button
                onClick={() => savePreference('LessonPlayerPowerPoint')}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                size="lg"
              >
                Use PowerPoint Style
              </Button>
            </div>
          </div>

          {/* Classic Style */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all group">
            <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layout className="w-24 h-24 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Classic Style</h3>
              <p className="text-gray-600 mb-6">
                Clean and simple interface focused on content. Perfect for distraction-free learning with easy navigation.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Clean, minimal interface
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Sidebar navigation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Distraction-free view
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Easy to use
                </li>
              </ul>
              <Button
                onClick={() => savePreference('LessonPlayerClassic')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                size="lg"
              >
                Use Classic Style
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Don't worry, you can always change your preference later in settings
        </p>
      </div>
    </div>
  );
}