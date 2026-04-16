import React, { useMemo, useState } from 'react';
import { ChevronRight, Hash, Sparkles } from 'lucide-react';
import { KAHOOT_BACKGROUND } from '@/components/kahoot/kahootTheme';
import { QUESTION_TYPE_OPTIONS } from '@/components/kahoot/questionTypeOptions';

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function KahootQuestionTypeSelector({ onContinue }) {
  const [title, setTitle] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [questionCount, setQuestionCount] = useState(10);

  const selectedOption = useMemo(
    () => QUESTION_TYPE_OPTIONS.find((item) => item.value === questionType),
    [questionType]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298] p-4 md:p-6">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7d4aa8]/90 via-[#7f58b4]/85 to-[#5f2f8b]/95" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] bg-white/95 p-6 shadow-2xl md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7c948]">
              <Sparkles className="h-7 w-7 text-[#5b2b86]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Strands of Ideas</h1>
              <p className="text-sm font-medium text-gray-500">Choose the question style before building your game.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-wide text-[#6f4298]">Game title</label>
                <input
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold focus:border-[#6f4298] focus:outline-none"
                  placeholder="My Strands of Ideas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-black uppercase tracking-wide text-[#6f4298]">Question style</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuestionType(option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${questionType === option.value ? 'border-[#1368ce] bg-[#eff6ff] ring-2 ring-[#2f80ed]/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div className="mb-2 text-base font-black text-gray-900">{option.label}</div>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#f8f6ff] p-5 shadow-inner">
              <label className="mb-3 block text-sm font-black uppercase tracking-wide text-[#6f4298]">How many questions?</label>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`rounded-2xl border px-4 py-4 font-black transition ${questionCount === count ? 'border-[#1368ce] bg-[#1368ce] text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <Hash className="h-4 w-4" /> {count}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-gray-500">Selected</p>
                <h2 className="mt-2 text-xl font-black text-gray-900">{selectedOption?.label}</h2>
                <p className="mt-2 text-sm text-gray-600">{selectedOption?.description}</p>
                <p className="mt-4 text-sm font-semibold text-gray-700">{questionCount} questions will be created.</p>
              </div>

              <button
                type="button"
                onClick={() => onContinue({ title, questionType, questionCount })}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#f7c948] py-4 text-lg font-black text-[#4b2a74] shadow-xl hover:bg-[#f3bf2b]"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}