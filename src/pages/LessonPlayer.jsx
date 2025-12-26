import React, { useState, useEffect, useRef } from 'react';
import { Users, Camera, Maximize, Minimize, X, Play } from 'lucide-react';

export default function LessonPlayer({ children, onlineUsers = [] }) {
  // 1. ALL HOOKS AT THE TOP (Prevents the "more hooks than previous render" error)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 2. LOGIC FUNCTIONS
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      alert("Camera access denied. Please check permissions.");
    }
  };

  // 3. RENDER LOGIC
  return (
    <div ref={playerRef} className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* HEADER: Responsive with Live/Join Buttons */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 flex-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">LIVE</span>
          <h1 className="text-sm font-medium truncate">Cell Structure and Function</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden sm:flex bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">Present</button>
          <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs">Join</button>
          <button onClick={toggleFullScreen} className="p-1.5 hover:bg-white/10 rounded">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE: Sidebar + Content Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Users (Hidden on very small mobile screens if desired) */}
        <aside className="hidden md:flex w-64 bg-slate-900/50 border-r border-slate-800 flex-col flex-none">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Online Users</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {onlineUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-green-500" /> {u.name}
              </div>
            ))}
          </div>
          {/* Webcam Preview in Sidebar */}
          {isCameraOn && (
            <div className="p-2 border-t border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="rounded-lg bg-black aspect-video w-full object-cover" />
            </div>
          )}
        </aside>

        {/* CONTENT AREA: No Horizontal Overflow */}
        <main className="flex-1 relative flex flex-col bg-black overflow-hidden justify-center items-center p-4">
          {!showQuiz ? (
            <div className="w-full h-full max-w-full max-h-full flex flex-col items-center">
              {/* Slide Container: Use iFrame or children here */}
              <div className="flex-1 w-full bg-white rounded-xl shadow-2xl overflow-hidden relative">
                <div className="p-8 text-slate-900 h-full overflow-y-auto">
                   {children} 
                </div>
              </div>

              {/* Footer Controls */}
              <div className="w-full mt-4 flex justify-between items-center px-2">
                <button onClick={startCamera} className="text-xs flex items-center gap-2 text-slate-400 hover:text-white">
                  <Camera size={16} /> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                </button>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  Take Quiz <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">Lesson Quiz</h2>
              <p className="text-slate-400 mb-6">Test your knowledge of Cell Structures.</p>
              <button onClick={() => setShowQuiz(false)} className="text-blue-400 text-sm">Back to Slides</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
  }
  if (!currentLesson || totalSlides === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h2>
          <p className="text-gray-600 mb-6">This lesson doesn't have content yet.</p>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Home className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentSlide = isDocumentMode ? { title: currentLesson.title } : slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  // Safety check for currentSlide
  if (!currentSlide && !lessonsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h2>
          <p className="text-gray-600 mb-6">This lesson doesn't have slides yet.</p>
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Home className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <X className="w-5 h-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {!isDocumentMode && (currentLesson?.google_slides_url || currentLesson?.slides?.length > 0) && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="bg-transparent text-gray-700 text-xs sm:text-sm font-medium border-none outline-none cursor-pointer"
                  >
                    {currentLesson?.slides?.length > 0 && (
                      <option value="slides">📄 Slides</option>
                    )}
                    {currentLesson?.google_slides_url && (
                      <option value="googleslides">📊 Google</option>
                    )}
                  </select>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className={`hover:bg-gray-100 ${bookmarked ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <Bookmark className={`w-4 sm:w-5 h-4 sm:h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQA(!showQA)}
                className="hover:bg-gray-100 text-gray-600"
              >
                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">{enrollment?.progress_percent || 0}%</span>
              </div>
            </div>
          </div>
          
{!isDocumentMode && (
            <div className="flex items-center gap-3">
              <Progress value={progressPercent} className="flex-1 h-2 bg-gray-200" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium min-w-[60px] text-right">
                {currentSlideIndex + 1} / {totalSlides}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {viewMode === 'googleslides' ? (
          /* Full-screen Google Slides view */
          <div className="flex-1 w-full flex flex-col">
            {/* Learning Objectives for Google Slides */}
            {currentLesson?.learning_objectives && currentLesson.learning_objectives.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-3 sm:p-4">
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
                >
                  <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Learning Objectives
                  </h3>
                  <ChevronRight className={`w-5 h-5 text-blue-900 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                </button>
                {showObjectives && (
                  <ul className="space-y-2 mt-3">
                    {currentLesson.learning_objectives.map((objective, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 text-blue-900 text-xs sm:text-sm"
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{objective}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-center">
              <p className="text-sm font-medium text-blue-900">👆 Tap the arrows at the bottom of the presentation to navigate</p>
              <p className="text-xs text-blue-700 mt-1">Use the navigation controls inside the presentation viewer</p>
            </div>
            <div className="flex-1" style={{ height: '70vh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <UniversalSlidePlayer 
                googleSlidesUrl={currentLesson?.google_slides_url}
              />
            </div>

            {/* Action Buttons for Google Slides */}
            <div className="bg-white border-t border-gray-200 p-4 space-y-3">
              <Button 
                onClick={markComplete}
                disabled={updateEnrollmentMutation.isPending || isCompleted}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isCompleted ? 'Lesson Completed ✓' : 'Complete Lesson'}
              </Button>

              {nextLesson && (
                <Button 
                  onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  Next Lesson
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              {lessonQuizzes.length > 0 && (
                <Button 
                  onClick={() => handleTakeQuiz(lessonQuizzes[0])}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Take Quiz ({lessonQuizzes[0].questions?.length})
                </Button>
              )}

              {!nextLesson && (
                <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 rounded-xl">
                    <Trophy className="w-5 h-5 mr-2" />
                    Back to Course
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto slide-swipe-area">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlideIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    nextSlide();
                  } else if (swipe > 10000) {
                    prevSlide();
                  }
                }}
              >
                <Card className="min-h-full shadow-xl bg-white border-0 flex flex-col p-4 sm:p-6">
                  {/* Learning Objectives - Show on first slide */}
                  {currentSlideIndex === 0 && currentLesson?.learning_objectives && currentLesson.learning_objectives.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 sm:p-6 mb-6 sm:mb-8 rounded-r-xl"
                  >
                    <button
                      onClick={() => setShowObjectives(!showObjectives)}
                      className="w-full flex items-center justify-between mb-3 sm:mb-4 hover:opacity-70 transition-opacity"
                    >
                      <h3 className="font-bold text-blue-900 flex items-center gap-2 text-base sm:text-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        Learning Objectives
                      </h3>
                      <ChevronRight className={`w-5 h-5 text-blue-900 transition-transform ${showObjectives ? 'rotate-90' : ''}`} />
                    </button>
                    {showObjectives && (
                      <ul className="space-y-2 sm:space-y-3">
                        {currentLesson.learning_objectives.map((objective, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 text-blue-900 text-sm sm:text-base"
                          >
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{objective}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Slide Content */}
                <div className="flex-1 overflow-y-auto mb-6 sm:mb-8">
                  {!isDocumentMode && (
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider block">
                              {currentLesson.section || 'Lesson'}
                            </span>
                            <span className="text-xs text-gray-500">Slide {currentSlideIndex + 1} of {totalSlides}</span>
                          </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 break-words leading-tight">
                          {currentSlide.title}
                        </h1>
                      {lessonQuizzes.length > 0 && (
                        <Button variant="outline" size="sm" className="mt-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => handleTakeQuiz(lessonQuizzes[0])}>
                          <Brain className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Quiz Available</span>
                          <span className="sm:hidden">Quiz</span>
                          <span className="ml-1">({lessonQuizzes[0].questions?.length})</span>
                        </Button>
                      )}
                      </div>
                      {isCompleted && (
                      <div className="ml-4 text-right hidden sm:block">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <CheckCircle className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">Completed</p>
                      </div>
                      )}
                      </div>
                      )}

                      {isDocumentMode ? (
                        <UniversalSlidePlayer 
                          fileUrl={currentLesson.file_url}
                          fileType={currentLesson.file_type}
                        />
                      ) : viewMode === 'document' && currentLesson?.file_url ? (
                    <UniversalSlidePlayer 
                      fileUrl={currentLesson.file_url}
                      fileType={currentLesson.file_type}
                    />
                  ) : (
                    <UniversalSlidePlayer 
                      content={currentSlide?.content}
                      fileUrl={currentSlide?.file_url}
                      fileType={currentSlide?.file_type}
                    />
                  )}

                  {/* Interactive Elements */}
                  {!isDocumentMode && currentSlide.inlineQuiz && (
                    <div className="mt-6">
                      <InlineQuiz 
                        quiz={currentSlide.inlineQuiz}
                        onComplete={(isCorrect) => console.log('Quiz completed:', isCorrect)}
                      />
                    </div>
                  )}

                  {!isDocumentMode && currentSlide.codePlayground && (
                    <div className="mt-6">
                      <CodePlayground
                        initialCode={currentSlide.codePlayground.code || ''}
                        language={currentSlide.codePlayground.language || 'javascript'}
                        onRun={(code) => console.log('Code executed:', code)}
                      />
                    </div>
                  )}
                  </div>

                {/* Actions */}
                {isLastSlide ? (
                  <div className="space-y-3 sm:space-y-4">
                    <Button 
                      onClick={markComplete}
                      disabled={updateEnrollmentMutation.isPending || isCompleted}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isCompleted ? 'Lesson Completed ✓' : 'Complete Lesson'}
                    </Button>

                    {nextLesson && (
                      <Button 
                        onClick={() => window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${nextLesson.id}`}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                      >
                        Next Lesson
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}

                    {lessonQuizzes.length > 0 && (
                      <Button 
                        onClick={() => handleTakeQuiz(lessonQuizzes[0])}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Take Quiz ({lessonQuizzes[0].questions?.length})
                      </Button>
                    )}

                    {!nextLesson && (
                      <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
                        <Button variant="outline" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 hover:bg-gray-50 rounded-xl">
                          <Trophy className="w-5 h-5 mr-2" />
                          Back to Course
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={nextSlide}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          {!isDocumentMode && (
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
              {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlideIndex ? 1 : -1);
                  setCurrentSlideIndex(idx);
                }}
                className={`transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 h-2 bg-indigo-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                } rounded-full`}
              />
            ))}
            </div>
            )}

            {/* Arrow Buttons */}
            {!isDocumentMode && (
            <div className="flex items-center justify-between mt-6 sm:mt-8 px-2 sm:px-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              variant="outline"
              size="icon"
              className="hover:bg-gray-50 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              variant="outline"
              size="icon"
              className="hover:bg-gray-50 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              </div>
              )}

              {/* Q&A Section */}
              {showQA && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <LessonQA
                    lessonId={lessonId}
                    courseId={courseId}
                    user={user}
                    currentSlideIndex={currentSlideIndex}
                  />
                </motion.div>
              )}
              </div>
              )}
              </div>

              {/* Dialogs */}
      {course && currentLesson && (
        <LessonRatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          lesson={currentLesson}
          course={course}
          onComplete={handleRatingComplete}
        />
      )}

      {showPointsAnimation && (
        <PointsAnimation 
          points={pointsEarned}
          onComplete={() => setShowPointsAnimation(false)}
        />
      )}
    </div>
  );
}