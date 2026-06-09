import React from 'react';
import { Loader2, Upload, Video, FileText, Target, Presentation, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import FileUploadManager from '@/components/editor/FileUploadManager';

/**
 * LessonMetadataPanel
 * --------------------
 * Pure presentational extraction of the lesson metadata + external-media
 * controls that previously sat *above* the SlideEditor in pages/LessonEditor.
 *
 * Behaviour is preserved verbatim — same field names, same setLessonForm
 * patches, same upload handlers, same convert handlers. The only change is
 * that these controls now live inside a right-side Sheet drawer instead of
 * dominating the editor's primary fold. This unblocks the reference visual
 * where the slide builder must be the first thing the tutor sees.
 *
 * IMPORTANT: This component renders form sections only. The Sheet wrapper,
 * trigger button, and drawer chrome are owned by pages/LessonEditor so the
 * drawer can also host save state without coupling it here.
 */
function SectionCard({ icon: Icon, iconColor, title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-2.5 mb-3">
        {Icon && (
          <div className="shrink-0 mt-0.5">
            <Icon className={`w-4 h-4 ${iconColor || 'text-slate-600'}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function LessonMetadataPanel({
  lessonForm,
  setLessonForm,
  lessonId,
  courseId,
  tutorCourses,
  uploading,
  setUploading,
  converting,
  setConverting,
  convertingPptx,
  setConvertingPptx,
}) {
  const queryClient = useQueryClient();

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({ ...lessonForm, video_url: file_url });
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({
        ...lessonForm,
        file_url,
        file_type: file.name.split('.').pop(),
        content_type: 'document',
      });
      toast.success('Document uploaded!');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <SectionCard title="Basic Information" subtitle="Course, title, section and duration.">
        {!lessonId && !courseId && (
          <div>
            <Label className="text-xs">Course *</Label>
            <select
              value={lessonForm.course_id || ''}
              onChange={(e) => setLessonForm({ ...lessonForm, course_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-1 bg-white"
            >
              <option value="">Select a course</option>
              {tutorCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label className="text-xs">Lesson Title *</Label>
          <Input
            value={lessonForm.title || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="Introduction to the topic"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Section / Module</Label>
          <Input
            value={lessonForm.section || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, section: e.target.value })}
            placeholder="e.g. Getting Started, Module 1"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Duration (minutes)</Label>
          <Input
            type="number"
            value={lessonForm.duration_minutes || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
            placeholder="10"
            className="mt-1"
          />
        </div>
      </SectionCard>

      {/* Description */}
      <SectionCard title="Lesson Description" subtitle="Short summary shown on the course page.">
        <Textarea
          value={lessonForm.description || ''}
          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
          placeholder="Write a comprehensive description…"
          className="min-h-[120px]"
        />
      </SectionCard>

      {/* Video */}
      <SectionCard icon={Video} iconColor="text-red-600" title="Video Content">
        <div>
          <Label className="text-xs">Video URL (YouTube, Vimeo, etc.)</Label>
          <Input
            value={lessonForm.video_url || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
            placeholder="https://youtube.com/embed/..."
            className="mt-1"
          />
        </div>
        <div className="text-center text-xs text-slate-400">OR</div>
        <div>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="hidden"
            id="meta-video-upload"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => document.getElementById('meta-video-upload').click()}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" />Upload Video File</>
            )}
          </Button>
        </div>
      </SectionCard>

      {/* Google Slides */}
      <SectionCard icon={Presentation} iconColor="text-yellow-600" title="Google Slides Presentation">
        <div>
          <Label className="text-xs">Google Slides URL</Label>
          <Input
            placeholder="https://docs.google.com/presentation/d/..."
            value={lessonForm.google_slides_url || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, google_slides_url: e.target.value, content_type: 'googleslides' })}
            className="mt-1"
          />
          <p className="text-[11px] text-slate-500 mt-1">Embedded in the lesson player.</p>
        </div>
        <div>
          <Label className="text-xs">Total Slides</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 43"
            value={lessonForm.total_slides || ''}
            onChange={(e) => setLessonForm({ ...lessonForm, total_slides: parseInt(e.target.value) || null })}
            className="mt-1"
          />
          <p className="text-[11px] text-slate-500 mt-1">Used by the player's slide counter (e.g. "8 / 43").</p>
        </div>

        {lessonId && lessonForm.google_slides_url && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs font-semibold text-purple-800 mb-1">🎨 Convert to Custom Slides</p>
            <p className="text-[11px] text-slate-600 mb-2">Renders each Google Slide as a high-quality image so Prev/Next works fully.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-purple-400 text-purple-700 hover:bg-purple-100 w-full"
              disabled={converting}
              onClick={async () => {
                setConverting(true);
                try {
                  const res = await base44.functions.invoke('convertGoogleSlideToCustom', { lessonId });
                  toast.success(`✅ Converted ${res.data?.slideCount || ''} slides! Save the lesson to apply.`);
                  queryClient.invalidateQueries(['lesson', lessonId]);
                } catch (err) {
                  toast.error('Conversion failed: ' + (err?.response?.data?.error || err.message));
                } finally {
                  setConverting(false);
                }
              }}
            >
              {converting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Converting...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Convert Slides Now</>
              )}
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Manus */}
      <SectionCard icon={Sparkles} iconColor="text-purple-600" title="Manus Slides">
        <div>
          <Label className="text-xs">Manus Public Share URL</Label>
          <Input
            placeholder="https://manus.space/share/..."
            value={lessonForm.manus_slides_url || ''}
            onChange={(e) => setLessonForm({
              ...lessonForm,
              manus_slides_url: e.target.value,
              content_type: e.target.value ? 'manusslides' : (lessonForm.content_type || 'richtext'),
            })}
            className="mt-1"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Manus blocks embedding — students see a branded "Open Manus Slides" button.
          </p>
        </div>
      </SectionCard>

      {/* Document */}
      <SectionCard icon={FileText} iconColor="text-blue-600" title="Upload Document (PPT, PDF, Word)">
        {lessonForm.file_url ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
              <p className="text-xs text-green-800">✓ {lessonForm.file_type?.toUpperCase()} uploaded</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLessonForm({
                    ...lessonForm,
                    file_url: null,
                    file_type: null,
                    content_type: 'richtext',
                  });
                  toast.success('Document removed');
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
            {lessonForm.file_type?.toLowerCase() === 'pptx' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-semibold text-purple-800 mb-1">🎨 Convert PPTX to Editable Slides</p>
                <p className="text-[11px] text-slate-600 mb-2">
                  Extracts text from each slide and populates the Slide Editor.
                  {(lessonForm.slides || []).length > 0 && (
                    <span className="block mt-1 text-amber-700 font-medium">⚠ Existing slides will be replaced.</span>
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-purple-400 text-purple-700 hover:bg-purple-100 w-full"
                  disabled={convertingPptx}
                  onClick={async () => {
                    setConvertingPptx(true);
                    try {
                      const res = await base44.functions.invoke('convertPptxToCustomSlides', { fileUrl: lessonForm.file_url });
                      const extractedSlides = res.data?.slides || [];
                      if (!extractedSlides.length) {
                        toast.error('No slides were extracted from the PPTX');
                        return;
                      }
                      setLessonForm({ ...lessonForm, slides: extractedSlides });
                      toast.success(`✅ Extracted ${extractedSlides.length} slides! Review and save.`);
                    } catch (err) {
                      toast.error('Conversion failed: ' + (err?.response?.data?.error || err.message));
                    } finally {
                      setConvertingPptx(false);
                    }
                  }}
                >
                  {convertingPptx ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Converting...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Convert to Editable Slides</>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={handleDocumentUpload}
              disabled={uploading}
              className="hidden"
              id="meta-document-upload"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={() => document.getElementById('meta-document-upload').click()}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Upload Document</>
              )}
            </Button>
          </>
        )}
      </SectionCard>

      {/* Learning Objectives */}
      <SectionCard icon={Target} iconColor="text-green-600" title="Learning Objectives (CCEA)" subtitle="What students will learn.">
        <div className="space-y-2">
          {(lessonForm.learning_objectives || []).map((objective, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...(lessonForm.learning_objectives || [])];
                  newObjectives[idx] = e.target.value;
                  setLessonForm({ ...lessonForm, learning_objectives: newObjectives });
                }}
                placeholder="e.g., Describe the structure and function of cells"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newObjectives = (lessonForm.learning_objectives || []).filter((_, i) => i !== idx);
                  setLessonForm({ ...lessonForm, learning_objectives: newObjectives });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setLessonForm({
                ...lessonForm,
                learning_objectives: [...(lessonForm.learning_objectives || []), ''],
              });
            }}
          >
            + Add Learning Objective
          </Button>
        </div>
      </SectionCard>

      {/* Supplementary Materials */}
      <SectionCard title="Supplementary Materials" subtitle="Downloadable files for students.">
        <FileUploadManager
          resources={lessonForm.resources || []}
          onChange={(resources) => setLessonForm({ ...lessonForm, resources })}
        />
      </SectionCard>

      {/* Options */}
      <SectionCard title="Lesson Options">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={lessonForm.is_preview || false}
            onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm text-slate-700">
            Allow free preview (non-enrolled students can view)
          </span>
        </label>
      </SectionCard>
    </div>
  );
}