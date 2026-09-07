import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Check, Menu, Search, X,
  BookOpen, CheckCircle, Sparkles, MessageSquare, Clock,
  Bookmark, BookmarkCheck, Settings, Maximize2, Minimize2,
  Download, Send, Loader2, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import UniversalLessonPlayer from '@/components/lesson/UniversalLessonPlayer';
import ManusSlidePlayer from '@/components/lesson/ManusSlidePlayer';
import LessonUnlockDialog from '@/components/lesson/LessonUnlockDialog';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import BadgeUnlock from '@/components/gamification/BadgeUnlock';
import useLessonPlayer from '@/components/lesson/useLessonPlayer';
import QuizGeneratorPanel from '@/components/lesson/QuizGeneratorPanel';
import MathJaxContent from '@/components/lesson/MathJaxContent';
import TopicQuizModal from '@/components/lesson/TopicQuizModal';
import WaterPolarityLessonVisual from '@/components/lesson/WaterPolarityLessonVisual';
import LessonABPanels from '@/components/lesson/LessonABPanels';

const SolarSystem3D = React.lazy(() => import('@/components/lesson/SolarSystem3D'));
const CrystalLattice3D = React.lazy(() => import('@/components/lesson/CrystalLattice3D'));
const AmmoniaFountainLive = React.lazy(() => import('@/components/lesson/AmmoniaFountainLive'));
const AS_BIOLOGY_COURSE_ID = '698a3d721a8a90bcc13737dc';
const A2_BIOLOGY_COURSE_ID = '698a3d721a8a90bcc13737dd';
const WATER_INTERACTIVE_LESSON_ID = '6992f49f4f5ddcd614cb9d2e';
const WATER_POLARITY_MARKER = 'interactive:water-polarity';
const OPENSTAX_FIGURES = [
  {
    path: '/lesson-assets/a2-biology/a2-homeostasis-02-kidney-cross-section-photorealistic.png',
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.8',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    path: '/lesson-assets/a2-biology/a2-homeostasis-03-urinary-system-photorealistic.png',
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.8',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-3-gross-anatomy-of-the-kidney',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    path: '/lesson-assets/a2-biology/a2-homeostasis-04-nephron-photorealistic.png',
    book: 'Biology 2e',
    figure: 'Figure 41.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/41-2-the-kidneys-and-osmoregulatory-organs',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    path: '/lesson-assets/a2-biology/a2-homeostasis-05-filtration-barrier-photorealistic.png',
    paths: [
      '/lesson-assets/a2-biology/a2-homeostasis-05-filtration-barrier-photorealistic.png',
      '/a2-biology/a2-006-p09.png',
      '/a2-biology/a2-006-p14.png',
      '/a2-biology/a2-006-p15.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.12',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-4-microscopic-anatomy-of-the-kidney',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-homeostasis-06-ultrafiltration-pressure-photorealistic.png',
      '/a2-biology/a2-006-p08.png',
      '/a2-biology/a2-006-p10.png',
      '/a2-biology/a2-006-p12.png',
      '/a2-biology/a2-006-p13.png',
      '/a2-biology/a2-006-p16.png',
      '/a2-biology/a2-006-p17.png',
      '/a2-biology/a2-006-p18.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.16',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-5-physiology-of-urine-formation',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-homeostasis-07-selective-reabsorption-photorealistic.png',
      '/a2-biology/a2-007-p06.png',
      '/a2-biology/a2-007-p15.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.17',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-homeostasis-07-pct-transport-openstax.png',
      '/a2-biology/a2-007-p07.png',
      '/a2-biology/a2-007-p08.png',
      '/a2-biology/a2-007-p09.png',
      '/a2-biology/a2-007-p10.png',
      '/a2-biology/a2-007-p12.png',
      '/a2-biology/a2-007-p13.png',
      '/a2-biology/a2-007-p14.png',
      '/a2-biology/a2-007-p16.png',
      '/a2-biology/a2-007-p17.png',
      '/a2-biology/a2-007-p18.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.18',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-homeostasis-08-loop-adh-photorealistic.png',
      '/a2-biology/a2-008-p06.png',
      '/a2-biology/a2-008-p07.png',
      '/a2-biology/a2-008-p08.png',
      '/a2-biology/a2-008-p09.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 25.20',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-009-p03.png',
      '/a2-biology/a2-009-p14.png',
      '/a2-biology/a2-009-p23.png',
      '/a2-biology/a2-009-p36.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 21.12',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-2-barrier-defenses-and-the-innate-immune-response',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-009-p19.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 21.21',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-4-the-adaptive-immune-response-b-lymphocytes-and-antibodies',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-009-p20.png',
      '/a2-biology/a2-011-p06.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.25',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-3-antibodies',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-009-p21.png',
      '/a2-biology/a2-011-p14.png',
      '/a2-biology/a2-011-p19.png',
      '/a2-biology/a2-011-p20.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.24',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-3-antibodies',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-immunity-10-humoral-cell-mediated-photorealistic.png',
      '/a2-biology/a2-010-p10.png',
      '/a2-biology/a2-010-p12.png',
      '/a2-biology/a2-013-p11.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.11',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-010-p08.png',
      '/a2-biology/a2-010-p09.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.16',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-010-p11.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 21.23',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-4-the-adaptive-immune-response-b-lymphocytes-and-antibodies',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-010-p19.png',
      '/a2-biology/a2-013-p08.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 21.19',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-3-the-adaptive-immune-response-t-lymphocytes-and-their-functional-types',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-010-p15.png',
      '/a2-biology/a2-010-p26.png',
      '/a2-biology/a2-012-p10.png',
      '/a2-biology/a2-012-p11.png',
      '/a2-biology/a2-012-p13.png',
      '/a2-biology/a2-012-p19.png',
      '/a2-biology/a2-012-p26.png',
      '/a2-biology/a2-012-p27.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.17',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-011-p11.png',
      '/a2-biology/a2-011-p12.png',
      '/a2-biology/a2-011-p13.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.8',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-1-innate-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-immunity-12-active-passive-immunity-photorealistic.png',
      '/a2-biology/a2-012-p06.png',
      '/a2-biology/a2-012-p08.png',
      '/a2-biology/a2-012-p09.png',
      '/a2-biology/a2-012-p12.png',
      '/a2-biology/a2-012-p20.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 18.24',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/18-5-vaccines',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-012-p07.png'],
    book: 'Biology 2e',
    figure: 'Figure 42.18',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-013-p06.png',
      '/a2-biology/a2-013-p07.png',
      '/a2-biology/a2-013-p09.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 42.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-immunity-14-abo-rhesus-photorealistic.png',
      '/a2-biology/a2-014-p06.png',
      '/a2-biology/a2-014-p07.png',
      '/a2-biology/a2-014-p08.png',
      '/a2-biology/a2-014-p15.png',
      '/lesson-assets/a2-biology/a2-immunity-15-transfusion-compatibility-photorealistic.png',
      '/a2-biology/a2-015-p06.png',
      '/a2-biology/a2-015-p07.png',
      '/a2-biology/a2-015-p08.png',
      '/a2-biology/a2-015-p09.png',
      '/a2-biology/a2-015-p10.png',
      '/a2-biology/a2-015-p12.png',
      '/a2-biology/a2-015-p20.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 18.17',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-6-blood-typing',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-014-p09.png',
      '/a2-biology/a2-014-p10.png',
      '/a2-biology/a2-014-p11.png',
      '/a2-biology/a2-014-p12.png',
      '/a2-biology/a2-014-p13.png',
      '/a2-biology/a2-014-p14.png',
      '/a2-biology/a2-014-p19.png',
      '/a2-biology/a2-014-p20.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 18.15',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-6-blood-typing',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-014-p26.png',
      '/a2-biology/a2-014-p27.png',
      '/a2-biology/a2-015-p19.png',
      '/a2-biology/a2-015-p26.png',
      '/a2-biology/a2-015-p27.png',
    ],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 18.16',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-6-blood-typing',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-015-p11.png',
      '/a2-biology/a2-015-p14.png',
      '/a2-biology/a2-015-p15.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 19.5',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/19-1-hypersensitivities',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-016-p08.png',
      '/a2-biology/a2-016-p09.png',
      '/a2-biology/a2-016-p10.png',
      '/a2-biology/a2-016-p20.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 14.18',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/14-5-drug-resistance',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-016-p15.png',
      '/a2-biology/a2-016-p19.png',
      '/a2-biology/a2-016-p26.png',
      '/a2-biology/a2-016-p27.png',
      '/a2-biology/a2-018-p10.png',
      '/a2-biology/a2-018-p11.png',
      '/a2-biology/a2-018-p13.png',
      '/a2-biology/a2-018-p15.png',
      '/a2-biology/a2-018-p26.png',
      '/a2-biology/a2-018-p27.png',
      '/a2-biology/a2-019-p09.png',
      '/a2-biology/a2-019-p10.png',
      '/a2-biology/a2-019-p11.png',
      '/a2-biology/a2-019-p12.png',
      '/a2-biology/a2-019-p13.png',
      '/a2-biology/a2-019-p14.png',
      '/a2-biology/a2-019-p15.png',
      '/a2-biology/a2-019-p19.png',
      '/a2-biology/a2-019-p26.png',
      '/a2-biology/a2-019-p27.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 13.31',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/13-4-testing-the-effectiveness-of-antiseptics-and-disinfectants',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/lesson-assets/a2-biology/a2-immunity-17-elisa-photorealistic.png',
      '/a2-biology/a2-017-p06.png',
      '/a2-biology/a2-017-p07.png',
      '/a2-biology/a2-017-p08.png',
      '/a2-biology/a2-017-p09.png',
      '/a2-biology/a2-017-p10.png',
      '/a2-biology/a2-017-p12.png',
      '/a2-biology/a2-017-p13.png',
      '/a2-biology/a2-017-p14.png',
      '/a2-biology/a2-017-p19.png',
      '/a2-biology/a2-017-p26.png',
      '/a2-biology/a2-017-p27.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 20.24',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/20-4-eias-and-elisas',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-017-p11.png',
      '/a2-biology/a2-017-p15.png',
      '/a2-biology/a2-017-p20.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 17.10',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/17-2-chemical-defenses',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-018-p07.png',
      '/a2-biology/a2-018-p09.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 1.7',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/1-1-what-our-ancestors-knew',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-018-p08.png'],
    book: 'Microbiology',
    figure: 'Figure 9.13',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/9-1-how-microbes-grow',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-018-p14.png',
      '/a2-biology/a2-018-p19.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 14.21',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/14-6-testing-the-effectiveness-of-antimicrobials',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-019-p06.png',
      '/a2-biology/a2-019-p07.png',
    ],
    book: 'Microbiology',
    figure: 'Figure 14.2',
    sectionUrl: 'https://openstax.org/books/microbiology/pages/14-1-history-of-chemotherapy-and-antimicrobial-discovery',
    bookUrl: 'https://openstax.org/books/microbiology/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-020-p03.png',
      '/a2-biology/a2-020-p04.png',
      '/a2-biology/a2-020-p05.png',
      '/a2-biology/a2-020-p10.png',
      '/a2-biology/a2-020-p19.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 30.38',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/30-6-plant-sensory-systems-and-responses',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-021-p04.png'],
    book: 'Biology 2e',
    figure: 'Figure 30.39',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/30-6-plant-sensory-systems-and-responses',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-021-p06.png',
      '/a2-biology/a2-021-p11.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 30.40',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/30-6-plant-sensory-systems-and-responses',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-022-p03.png',
      '/a2-biology/a2-022-p04.png',
      '/a2-biology/a2-022-p08.png',
      '/a2-biology/a2-022-p13.png',
      '/a2-biology/a2-022-p16.png',
      '/a2-biology/a2-022-p20.png',
      '/a2-biology/a2-022-p24.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.3',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-1-neurons-and-glial-cells',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-022-p07.png',
      '/a2-biology/a2-022-p14.png',
      '/a2-biology/a2-022-p22.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.5',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-1-neurons-and-glial-cells',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-022-p05.png',
      '/a2-biology/a2-022-p06.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.7',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-1-neurons-and-glial-cells',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-023-p03.png',
      '/a2-biology/a2-023-p04.png',
      '/a2-biology/a2-023-p05.png',
      '/a2-biology/a2-023-p07.png',
      '/a2-biology/a2-023-p10.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.10',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-023-p06.png',
      '/a2-biology/a2-023-p08.png',
      '/a2-biology/a2-023-p09.png',
      '/a2-biology/a2-023-p11.png',
      '/a2-biology/a2-023-p18.png',
      '/a2-biology/a2-023-p19.png',
      '/a2-biology/a2-023-p22.png',
      '/a2-biology/a2-023-p23.png',
      '/a2-biology/a2-023-p24.png',
      '/a2-biology/a2-023-p25.png',
      '/a2-biology/a2-023-p27.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.11',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-023-p12.png',
      '/a2-biology/a2-023-p13.png',
      '/a2-biology/a2-023-p14.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.12',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [
      '/a2-biology/a2-023-p15.png',
      '/a2-biology/a2-023-p16.png',
      '/a2-biology/a2-023-p20.png',
      '/a2-biology/a2-023-p28.png',
    ],
    book: 'Biology 2e',
    figure: 'Figure 35.13',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-024-p05.png'],
    book: 'Biology 2e',
    figure: 'Figure 35.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-024-p03.png', '/a2-biology/a2-024-p04.png', '/a2-biology/a2-024-p06.png', '/a2-biology/a2-024-p07.png', '/a2-biology/a2-024-p10.png', '/a2-biology/a2-024-p13.png', '/a2-biology/a2-024-p14.png', '/a2-biology/a2-024-p16.png', '/a2-biology/a2-024-p18.png', '/a2-biology/a2-024-p20.png', '/a2-biology/a2-024-p22.png', '/a2-biology/a2-024-p23.png', '/a2-biology/a2-024-p24.png', '/a2-biology/a2-024-p25.png', '/a2-biology/a2-024-p26.png', '/a2-biology/a2-024-p27.png', '/a2-biology/a2-024-p28.png'],
    book: 'Biology 2e',
    figure: 'Figure 35.15',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-024-p08.png', '/a2-biology/a2-024-p09.png', '/a2-biology/a2-024-p11.png', '/a2-biology/a2-024-p12.png', '/a2-biology/a2-024-p15.png', '/a2-biology/a2-024-p17.png', '/a2-biology/a2-024-p19.png', '/a2-biology/a2-024-p21.png'],
    book: 'Biology 2e',
    figure: 'Figure 35.16',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/35-2-how-neurons-communicate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p03.png', '/a2-biology/a2-025-p04.png', '/a2-biology/a2-025-p05.png', '/a2-biology/a2-025-p11.png', '/a2-biology/a2-025-p12.png', '/a2-biology/a2-025-p22.png', '/a2-biology/a2-025-p24.png', '/a2-biology/a2-025-p26.png', '/a2-biology/a2-025-p28.png', '/a2-biology/a2-025-p29.png', '/a2-biology/a2-025-p30.png', '/a2-biology/a2-026-p04.png', '/a2-biology/a2-026-p05.png', '/a2-biology/a2-026-p11.png', '/a2-biology/a2-026-p12.png', '/a2-biology/a2-026-p13.png', '/a2-biology/a2-026-p14.png', '/a2-biology/a2-026-p15.png', '/a2-biology/a2-026-p16.png', '/a2-biology/a2-026-p17.png', '/a2-biology/a2-026-p18.png'],
    book: 'Biology 2e',
    figure: 'Figure 36.18',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/36-5-vision',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p13.png', '/a2-biology/a2-025-p16.png', '/a2-biology/a2-025-p17.png', '/a2-biology/a2-025-p18.png', '/a2-biology/a2-025-p20.png', '/a2-biology/a2-025-p23.png', '/a2-biology/a2-025-p25.png', '/a2-biology/a2-026-p06.png'],
    book: 'Biology 2e',
    figure: 'Figure 36.19',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/36-5-vision',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p21.png'],
    book: 'Biology 2e',
    figure: 'Figure 36.20',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/36-5-vision',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p19.png'],
    book: 'Biology 2e',
    figure: 'Figure 36.22',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/36-5-vision',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p06.png', '/a2-biology/a2-025-p07.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 15.9',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/15-2-autonomic-reflexes-and-homeostasis',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-025-p08.png', '/a2-biology/a2-025-p09.png', '/a2-biology/a2-025-p10.png'],
    book: 'College Physics 2e',
    figure: 'Figure 26.4',
    sectionUrl: 'https://openstax.org/books/college-physics-2e/pages/26-1-physics-of-the-eye',
    bookUrl: 'https://openstax.org/books/college-physics-2e/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units',
  },
  {
    paths: ['/a2-biology/a2-027-p03.png', '/a2-biology/a2-027-p04.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.3',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-027-p05.png', '/a2-biology/a2-027-p18.png', '/a2-biology/a2-027-p26.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.4',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-027-p06.png', '/a2-biology/a2-027-p07.png', '/a2-biology/a2-027-p08.png', '/a2-biology/a2-027-p20.png', '/a2-biology/a2-027-p21.png', '/a2-biology/a2-027-p23.png', '/a2-biology/a2-027-p24.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.5',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-027-p13.png', '/a2-biology/a2-027-p28.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.8',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-027-p09.png', '/a2-biology/a2-027-p10.png', '/a2-biology/a2-027-p11.png', '/a2-biology/a2-027-p16.png', '/a2-biology/a2-027-p19.png', '/a2-biology/a2-027-p22.png', '/a2-biology/a2-027-p27.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.10',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-027-p12.png', '/a2-biology/a2-027-p14.png', '/a2-biology/a2-027-p15.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.11',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-028-p03.png', '/a2-biology/a2-028-p04.png', '/a2-biology/a2-028-p05.png', '/a2-biology/a2-028-p06.png', '/a2-biology/a2-028-p07.png', '/a2-biology/a2-028-p11.png', '/a2-biology/a2-028-p12.png', '/a2-biology/a2-028-p13.png', '/a2-biology/a2-028-p14.png', '/a2-biology/a2-028-p15.png', '/a2-biology/a2-028-p16.png', '/a2-biology/a2-028-p17.png', '/a2-biology/a2-028-p18.png'],
    book: 'Anatomy and Physiology 2e',
    figure: 'Figure 10.2',
    sectionUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-1-overview-of-muscle-tissues',
    bookUrl: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 16, 17, 18, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-029-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-29-population-growth-curves-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 45.9',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [12, 15, 20, 26].map((page) => `/a2-biology/a2-029-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.10',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-030-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-30-r-k-selection-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 45.13',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-4-population-dynamics-and-regulation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [11, 13, 25, 26, 27].map((page) => `/a2-biology/a2-030-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-1-population-demography',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 4, 9, 10, 15, 16, 17, 18, 21, 22, 23, 25, 26, 27, 28, 29, 30].map((page) => `/a2-biology/a2-031-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-31-population-interactions-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 45.18',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [3, 6, 7, 8, 11, 19, 20, 24].map((page) => `/a2-biology/a2-031-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.24',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-031-p12.png'],
    book: 'Biology 2e',
    figure: 'Figure 45.27',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-031-p14.png'],
    book: 'Biology 2e',
    figure: 'Figure 45.26',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-032-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-32-biological-control-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 24.28',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/24-5-importance-of-fungi-in-human-life',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 9, 11, 14, 18, 20, 21, 22, 23, 25, 28, 29, 30].map((page) => `/a2-biology/a2-033-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 19.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/19-2-population-genetics',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 12, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-034-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-34-yeast-cmr-practical-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 24.3',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/24-1-characteristics-of-fungi',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [11, 13, 16, 17].map((page) => `/a2-biology/a2-034-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.10',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [14, 15, 18, 19, 20, 25, 26, 27].map((page) => `/a2-biology/a2-034-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.4',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-1-population-demography',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-035-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-35-community-ecosystem-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 44.2',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/44-1-the-scope-of-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [7, 14, 19, 20].map((page) => `/a2-biology/a2-035-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 46.2',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [8, 9, 10, 11, 15, 16, 17, 18, 25].map((page) => `/a2-biology/a2-035-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 46.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [6, 9, 11, 21, 22, 23, 24, 28].map((page) => `/a2-biology/a2-036-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 45.32',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 7, 8, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 29, 30].map((page) => `/a2-biology/a2-036-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-36-succession-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 45.33',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [6, 7, 11, 12, 24].map((page) => `/a2-biology/a2-037-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 46.4',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 10, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 28, 29, 30].map((page) => `/a2-biology/a2-037-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-37-food-chains-webs-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [6, 7, 8, 24].map((page) => `/a2-biology/a2-038-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 46.4',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 28, 29, 30].map((page) => `/a2-biology/a2-038-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-38-gpp-npp-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.8',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 16, 17, 18, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-039-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-39-pyramids-efficiency-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.10',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [12, 13, 14, 15, 19, 20].map((page) => `/a2-biology/a2-039-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 46.8',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 9, 10, 11, 16, 17, 18, 19, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-040-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-40-agricultural-energetics-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.8',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-1-ecology-of-ecosystems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [7, 8, 20].map((page) => `/a2-biology/a2-040-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 31.4',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/31-1-nutritional-requirements-of-plants',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-040-p15.png'],
    book: 'Biology 2e',
    figure: 'Figure 31.5',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/31-1-nutritional-requirements-of-plants',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-041-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-41-carbon-cycle-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.15',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-042-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-ecology-42-nitrogen-cycle-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 46.17',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-042-p19.png'],
    book: 'Biology 2e',
    figure: 'Figure 46.19',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/46-3-biogeochemical-cycles',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-042-p20.png'],
    book: 'Biology 2e',
    figure: 'Figure 31.11',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/31-3-nutritional-adaptations-of-plants',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 10, 11, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 30].map((page) => `/a2-biology/a2-043-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-43-atp-energy-coupling-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 6.13',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/6-4-atp-adenosine-triphosphate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [9, 12, 13, 20, 25].map((page) => `/a2-biology/a2-043-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 6.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/6-4-atp-adenosine-triphosphate',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9].map((page) => `/a2-biology/a2-044-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-44-glycolysis-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.8',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-2-glycolysis',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-044-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.9',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-2-glycolysis',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-045-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-45-mitochondrial-organisation-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.6',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [12, 13, 14, 25, 26, 27].map((page) => `/a2-biology/a2-045-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30].map((page) => `/a2-biology/a2-046-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-46-anaerobic-nad-regeneration-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.16',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [6, 12].map((page) => `/a2-biology/a2-046-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.9',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-2-glycolysis',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 16, 17, 18, 21, 22, 23, 24].map((page) => `/a2-biology/a2-047-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-47-link-krebs-cycle-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.10',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [10, 11, 12, 13, 14, 15, 19, 20, 25, 28, 29, 30].map((page) => `/a2-biology/a2-047-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.11',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30].map((page) => `/a2-biology/a2-048-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-48-electron-transport-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.12',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: ['/a2-biology/a2-048-p14.png'],
    book: 'Biology 2e',
    figure: 'Figure 7.13',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [13, 25].map((page) => `/a2-biology/a2-048-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [1, 3, 4, 6, 7, 9, 10, 11, 15, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30].map((page) => `/a2-biology/a2-049-p${String(page).padStart(2, '0')}.png`).concat('/lesson-assets/a2-biology/a2-respiration-49-aerobic-anaerobic-comparison-photorealistic.png'),
    book: 'Biology 2e',
    figure: 'Figure 7.14',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
  {
    paths: [8, 12, 13, 19, 20, 25].map((page) => `/a2-biology/a2-049-p${String(page).padStart(2, '0')}.png`),
    book: 'Biology 2e',
    figure: 'Figure 7.16',
    sectionUrl: 'https://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen',
    bookUrl: 'https://openstax.org/books/biology-2e/pages/1-introduction',
  },
];
const lessonInteractiveRequests = new Map();

export default function EnhancedLessonPlayer({
  lesson,
  course,
  isCompleted,
  onComplete,
  onNext,
  onPrev,
  user,
  enrollment,
  courseId
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [showTopicQuiz, setShowTopicQuiz] = useState(false);
  const [topicQuizCompleted, setTopicQuizCompleted] = useState(false);
  const [showMobileOutline, setShowMobileOutline] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [defineTerm, setDefineTerm] = useState('');
  const [interactiveContent, setInteractiveContent] = useState(null);
  const [loadingInteractives, setLoadingInteractives] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [currentContentSlide, setCurrentContentSlide] = useState(0);
  const containerRef = useRef(null);
  const mainContentRef = useRef(null);
  const touchStartRef = useRef(null);

  const {
    isFullscreen, toggleFullscreen, showAI, setShowAI,
    aiTab, setAiTab, aiLoading, aiResponse, setAiResponse,
    aiSummary, aiTranslation, targetLanguage, setTargetLanguage,
    askAI, summariseSlide, defineWord, translateSlide,
    notes, showNotes, setShowNotes, saveNote, exportNotes,
    bookmarks, toggleBookmark
  } = useLessonPlayer({
    lessonId: lesson?.id,
    containerRef,
    user
  });

  // Get course lessons
  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 500),
    enabled: !!courseId,
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const mathPathwayUnits = {
    m1_m5: ['M1', 'M5'],
    m2_m6: ['M2', 'M6'],
    m3_m7: ['M3', 'M7'],
    m4_m8: ['M4', 'M8'],
  };
  const selectedMathUnits = mathPathwayUnits[enrollment?.math_pathway] || [];
  const hasMappedMathLessons = courseLessons.some(lessonItem => lessonItem.ccea_units?.length > 0);
  const pathwayLessons = course?.requires_math_pathway && enrollment?.math_pathway && hasMappedMathLessons
    ? courseLessons.filter(lessonItem => !lessonItem.ccea_units?.length || lessonItem.ccea_units.some(unitCode => selectedMathUnits.includes(unitCode)))
    : courseLessons;
  const sortedLessons = [...pathwayLessons].sort((a, b) => a.order - b.order);
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = sortedLessons[currentLessonIndex + 1];
  const prevLesson = sortedLessons[currentLessonIndex - 1];
  const progressPercent = sortedLessons.length > 0 ? ((currentLessonIndex + 1) / sortedLessons.length * 100) : 0;
  const contentSlides = lesson?.slides || [];
  const activeContentSlide = contentSlides[currentContentSlide];
  const a2LessonOrder = Number(lesson?.order);
  const a2GeneratedVisualLesson = a2LessonOrder === 9 || (a2LessonOrder >= 20 && a2LessonOrder <= 28)
    ? a2LessonOrder
    : null;
  const needsA2GeneratedVisual = (courseId === A2_BIOLOGY_COURSE_ID || lesson?.course_id === A2_BIOLOGY_COURSE_ID)
    && a2GeneratedVisualLesson
    && activeContentSlide
    && !/<img\b/i.test(activeContentSlide.content || '');
  const a2GeneratedVisualPath = needsA2GeneratedVisual
    ? `/a2-biology/a2-${String(a2GeneratedVisualLesson).padStart(3, '0')}-p${String(currentContentSlide + 1).padStart(2, '0')}.png`
    : null;
  const renderedSlideHtml = a2GeneratedVisualPath
    ? `<figure class='page-visual'><img src='${a2GeneratedVisualPath}' alt='Teaching diagram aligned to this biology page.' loading='lazy' /><figcaption>Biology process diagram aligned to this page.</figcaption></figure>${activeContentSlide.content || ''}`
    : (activeContentSlide?.content || '');
  const isWaterPolarityPage = lesson?.id === WATER_INTERACTIVE_LESSON_ID
    && activeContentSlide?.notes === WATER_POLARITY_MARKER;
  const asBiologyPanelPageIndex = contentSlides.length > 1 ? 1 : 0;
  const isASBiologyPanelPage = (courseId === AS_BIOLOGY_COURSE_ID || lesson?.course_id === AS_BIOLOGY_COURSE_ID)
    && lesson?.id !== WATER_INTERACTIVE_LESSON_ID
    && currentContentSlide === asBiologyPanelPageIndex;

  useEffect(() => {
    if (!lesson?.id) return;

    const savedPage = Number.parseInt(sessionStorage.getItem('lesson-player-page:' + lesson.id), 10);
    const restoredPage = Number.isInteger(savedPage) && savedPage >= 0 && savedPage < contentSlides.length
      ? savedPage
      : 0;

    setCurrentContentSlide(restoredPage);
    setShowTopicQuiz(false);
    setTopicQuizCompleted(false);
  }, [lesson?.id, contentSlides.length]);

  useEffect(() => {
    if (!lesson?.id || contentSlides.length === 0) return;
    sessionStorage.setItem('lesson-player-page:' + lesson.id, String(currentContentSlide));
  }, [lesson?.id, contentSlides.length, currentContentSlide]);

  useEffect(() => {
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    const previousBodyOverscroll = document.body.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.overscrollBehaviorY = 'none';

    const lessonScroller = mainContentRef.current;
    let gestureStartX = 0;
    let gestureStartY = 0;

    const preventRefreshStart = (event) => {
      if (event.touches.length !== 1) return;
      gestureStartX = event.touches[0].clientX;
      gestureStartY = event.touches[0].clientY;
    };

    const preventRefreshMove = (event) => {
      if (!lessonScroller || event.touches.length !== 1 || lessonScroller.scrollTop > 0) return;

      const deltaX = event.touches[0].clientX - gestureStartX;
      const deltaY = event.touches[0].clientY - gestureStartY;
      const isDownwardVerticalPull = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
      if (isDownwardVerticalPull) event.preventDefault();
    };

    lessonScroller?.addEventListener('touchstart', preventRefreshStart, { passive: true });
    lessonScroller?.addEventListener('touchmove', preventRefreshMove, { passive: false });

    return () => {
      document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
      document.body.style.overscrollBehaviorY = previousBodyOverscroll;
      lessonScroller?.removeEventListener('touchstart', preventRefreshStart);
      lessonScroller?.removeEventListener('touchmove', preventRefreshMove);
    };
  }, []);

  useEffect(() => {
    if (lesson?.section) {
      setExpandedSections(prev => ({ ...prev, [lesson.section]: true }));
    }
  }, [lesson?.id, lesson?.section]);

  useEffect(() => {
    const handlePageKeys = (event) => {
      const tag = event.target?.tagName;
      if (showTopicQuiz || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentContentSlide < contentSlides.length - 1) {
          setCurrentContentSlide(index => index + 1);
        } else if (contentSlides.length > 0 && !topicQuizCompleted) {
          setShowTopicQuiz(true);
        } else {
          onNext?.();
        }
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentContentSlide > 0) {
          setCurrentContentSlide(index => index - 1);
        } else {
          onPrev?.();
        }
      }
    };
    window.addEventListener('keydown', handlePageKeys);
    return () => window.removeEventListener('keydown', handlePageKeys);
  }, [currentContentSlide, contentSlides.length, onNext, onPrev, showTopicQuiz, topicQuizCompleted]);

  useEffect(() => {
    mainContentRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [currentContentSlide, lesson?.id]);

  // Load one cached topic quiz per lesson. The shared promise prevents duplicate
  // requests when React re-runs effects in development.
  useEffect(() => {
    if (!lesson?.id || courseId === AS_BIOLOGY_COURSE_ID || lesson.course_id === AS_BIOLOGY_COURSE_ID) return;

    let cancelled = false;
    const cacheKey = `lesson_topic_quiz_${lesson.id}_v3`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setInteractiveContent(JSON.parse(cached));
        return;
      }
    } catch {
      try {
        sessionStorage.removeItem(cacheKey);
      } catch {
        // Continue without browser storage.
      }
    }

    setLoadingInteractives(true);

    let request = lessonInteractiveRequests.get(cacheKey);
    if (!request) {
      request = base44.functions.invoke('generateLessonInteractives', {
        lessonId: lesson.id,
        difficulty: 'intermediate',
        questionTypes: ['multiple_choice'],
        keywords: lesson.learning_objectives || []
      }).then(response => {
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Interactive content generation failed');
        }
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        } catch {
          // The lesson still works when browser storage is unavailable.
        }
        return response.data;
      }).finally(() => {
        lessonInteractiveRequests.delete(cacheKey);
      });
      lessonInteractiveRequests.set(cacheKey, request);
    }

    request.then(content => {
      if (!cancelled) setInteractiveContent(content);
    }).catch(err => {
      if (cancelled) return;
      console.error('Failed to load interactive content:', err);
      if (err.response?.status === 429) {
        toast.error('The quiz service is busy. Please try again shortly.');
      } else {
        toast.error('Interactive practice could not be loaded. You can still read the lesson.');
      }
    }).finally(() => {
      if (!cancelled) setLoadingInteractives(false);
    });

    return () => {
      cancelled = true;
    };
  }, [lesson?.id, lesson?.course_id, courseId]);

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const completedLessons = enrollment.completed_lessons || [];
      if (!completedLessons.includes(lesson.id)) {
        await base44.entities.Enrollment.update(enrollment.id, {
          completed_lessons: [...completedLessons, lesson.id],
          progress_percent: Math.round(((completedLessons.length + 1) / Math.max(sortedLessons.length, 1)) * 100)
        });
        
        const response = await base44.functions.invoke('awardPoints', {
          action: 'complete_lesson'
        });
        
        if (response.data.success) {
          setEarnedPoints(response.data.pointsEarned);
          setShowPointsAnimation(true);
          if (response.data.newBadges?.length > 0) {
            setNewBadges(response.data.newBadges);
            setShowBadges(true);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      onComplete?.();
      toast.success('Lesson completed!');
    }
  });

  if (!lesson) return null;

  const groupedLessons = sortedLessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Lessons';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  const completedIds = enrollment?.completed_lessons || [];
  const lessonProgress = sortedLessons.length > 0
    ? Math.round((completedIds.length / sortedLessons.length) * 100)
    : Math.round(progressPercent);
  const hasPages = contentSlides.length > 0;
  const isFirstPage = !hasPages || currentContentSlide === 0;
  const isLastPage = !hasPages || currentContentSlide === contentSlides.length - 1;
  const pageProgress = hasPages ? ((currentContentSlide + 1) / contentSlides.length) * 100 : 100;
  const estimatedMinutes = lesson.duration_minutes || Math.max(2, contentSlides.length * 2);
  const currentPageKey = lesson.id + ':' + currentContentSlide;
  const animatedStemContent = /mathematics|maths|physics|chemistry/i.test([
    course?.title,
    course?.subject,
    course?.category,
    lesson?.subject
  ].filter(Boolean).join(' '));
  const isBookmarked = bookmarks.includes(currentPageKey);
  const topicQuizQuestions = interactiveContent?.quizQuestions || [];
  const canOpenTopicQuiz = isLastPage && hasPages && topicQuizQuestions.length > 0 && !topicQuizCompleted;

  const closeTools = () => {
    setShowAI(false);
    setShowNotes(false);
    setShowQuizPanel(false);
  };

  const toggleTool = (tool) => {
    const opening = tool === 'ai' ? !showAI : tool === 'notes' ? !showNotes : !showQuizPanel;
    closeTools();
    if (opening && tool === 'ai') setShowAI(true);
    if (opening && tool === 'notes') setShowNotes(true);
    if (opening && tool === 'quiz') setShowQuizPanel(true);
  };

  const goToPrevious = () => {
    if (hasPages && currentContentSlide > 0) {
      setCurrentContentSlide(index => index - 1);
    } else {
      onPrev?.();
    }
  };

  const goToNext = () => {
    if (hasPages && currentContentSlide < contentSlides.length - 1) {
      setCurrentContentSlide(index => index + 1);
    } else if (hasPages && !topicQuizCompleted) {
      setShowTopicQuiz(true);
    } else {
      onNext?.();
    }
  };

  const handleTopicQuizContinue = () => {
    setTopicQuizCompleted(true);
    setShowTopicQuiz(false);
    if (nextLesson) onNext?.();
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1 || event.target?.closest?.('button, a, input, textarea, select, [role="button"], [data-no-swipe]')) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const isDeliberateHorizontalSwipe = Math.abs(deltaX) >= 64 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;
    if (!isDeliberateHorizontalSwipe) return;

    if (deltaX < 0) goToNext();
    else goToPrevious();
  };

  const selectLesson = (id) => {
    navigate('/LessonPlayerClassic?lesson=' + id + '&course=' + courseId);
    setShowMobileOutline(false);
  };

  const richContentClasses = [
    'lesson-rich-content text-[16px] sm:text-[17px] leading-7 sm:leading-8 text-slate-700',
    '[&_p]:mb-5 [&_p]:max-w-none',
    '[&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#0b1b32]',
    '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#12345a]',
    '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2',
    '[&_strong]:font-semibold [&_strong]:text-[#0b1b32]',
    '[&_a]:text-indigo-700 [&_a]:underline [&_a]:underline-offset-2',
    '[&_details]:my-5 [&_details]:rounded-xl [&_details]:border [&_details]:border-slate-200 [&_details]:bg-white [&_details]:p-4',
    '[&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-[#10233f]',
    '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:text-[15px]',
    '[&_th]:border [&_th]:border-slate-200 [&_th]:p-3 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:p-3',
    '[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain [&_video]:h-auto [&_video]:max-w-full [&_video]:rounded-xl [&_svg]:h-auto [&_svg]:max-w-full [&_figure]:my-7 [&_figure]:overflow-visible',
    '[&_math]:mx-1 [&_math]:inline-block [&_math]:align-middle [&_math]:font-serif [&_math]:text-[1.1em] [&_math]:text-[#0b1b32]',
    '[&_.key-rule]:my-6 [&_.key-rule]:rounded-xl [&_.key-rule]:border [&_.key-rule]:border-emerald-200 [&_.key-rule]:bg-emerald-50 [&_.key-rule]:p-5',
    '[&_.notation-note]:my-6 [&_.notation-note]:rounded-xl [&_.notation-note]:border [&_.notation-note]:border-orange-200 [&_.notation-note]:bg-orange-50 [&_.notation-note]:p-5',
    '[&_.worked-example]:my-6 [&_.worked-example]:rounded-xl [&_.worked-example]:border [&_.worked-example]:border-blue-200 [&_.worked-example]:bg-blue-50 [&_.worked-example]:p-5',
    '[&_.method-steps]:my-6 [&_.method-steps]:rounded-xl [&_.method-steps]:border [&_.method-steps]:border-indigo-200 [&_.method-steps]:bg-indigo-50 [&_.method-steps]:p-5',
    '[&_.practice-block]:my-6 [&_.practice-block]:rounded-xl [&_.practice-block]:border [&_.practice-block]:border-amber-200 [&_.practice-block]:bg-amber-50 [&_.practice-block]:p-5',
    '[&_.answer-block]:my-5 [&_.answer-block]:rounded-xl [&_.answer-block]:border [&_.answer-block]:border-green-200 [&_.answer-block]:bg-green-50 [&_.answer-block]:p-5',
    '[&_.check-point]:my-5 [&_.check-point]:rounded-xl [&_.check-point]:border [&_.check-point]:border-violet-200 [&_.check-point]:bg-violet-50 [&_.check-point]:p-5',
    '[&_.step-number]:mr-2 [&_.step-number]:inline-flex [&_.step-number]:h-7 [&_.step-number]:w-7 [&_.step-number]:items-center [&_.step-number]:justify-center [&_.step-number]:rounded-full [&_.step-number]:bg-indigo-600 [&_.step-number]:text-sm [&_.step-number]:font-bold [&_.step-number]:text-white'
  ].join(' ');

  const outlineContent = (
    <>
      <div className="border-b border-white/10 px-5 pb-5 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Course outline</span>
          <button
            type="button"
            onClick={() => { setShowSidebar(false); setShowMobileOutline(false); }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Collapse course outline"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/CourseDetails?id=' + courseId)}
          className="mb-4 flex w-full items-start gap-3 text-left"
        >
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
          <span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-slate-400">CCEA course</span>
            <span className="mt-1 block text-sm font-semibold leading-5 text-white">{course?.title || 'Course'}</span>
          </span>
        </button>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>{lessonProgress}% complete</span>
          <span>{completedIds.length} of {sortedLessons.length} lessons</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: lessonProgress + '%' }} />
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search course outline"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Course outline">
        {Object.entries(groupedLessons).map(([section, sectionLessons]) => {
          const isExpanded = expandedSections[section] !== false;
          const filtered = sectionLessons.filter(item =>
            !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (searchQuery && filtered.length === 0) return null;
          return (
            <div key={section} className="border-b border-white/10 py-1">
              <button
                type="button"
                onClick={() => setExpandedSections(previous => ({ ...previous, [section]: !isExpanded }))}
                className="flex min-h-12 w-full items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-200 hover:bg-white/5"
              >
                <span>{section}</span>
                <ChevronRight className={'h-4 w-4 transition-transform ' + (isExpanded ? 'rotate-90' : '')} />
              </button>
              {isExpanded && (
                <div className="px-2 pb-3">
                  {filtered.map((item, index) => {
                    const completed = completedIds.includes(item.id);
                    const current = item.id === lesson.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => selectLesson(item.id)}
                        aria-current={current ? 'page' : undefined}
                        className={'relative mb-1 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ' + (current ? 'bg-[#16314f] text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white')}
                      >
                        {current && <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-orange-500" />}
                        <span className={'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ' + (completed ? 'border-emerald-400 bg-emerald-500 text-white' : current ? 'border-orange-400 text-orange-300' : 'border-slate-600 text-slate-400')}>
                          {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span className="line-clamp-2 flex-1 leading-5">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400">
        Use <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-slate-200">←</kbd>
        <span className="mx-1">/</span>
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-slate-200">→</kbd> to change pages
      </div>
    </>
  );

  return (
    <div ref={containerRef} className={'flex h-[100dvh] overscroll-y-none overflow-hidden bg-[#071326] text-white ' + (isFullscreen ? 'fixed inset-0 z-[100]' : '')}>
      {showSidebar && (
        <aside className="hidden h-full w-[288px] shrink-0 flex-col border-r border-white/10 bg-[#07182b] lg:flex">
          {outlineContent}
        </aside>
      )}

      {showMobileOutline && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileOutline(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close course outline"
          />
          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col bg-[#07182b] shadow-2xl">
            {outlineContent}
          </aside>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#eef1f5]">
        <header className="z-30 flex min-h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#071326] px-3 text-white sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => window.innerWidth < 1024 ? setShowMobileOutline(true) : setShowSidebar(!showSidebar)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10"
              aria-label="Toggle course outline"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/CourseDetails?id=' + courseId)}
              className="hidden min-w-0 items-center gap-2 text-left sm:flex"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 text-slate-300" />
              <span className="hidden min-w-0 xl:block">
                <span className="block truncate text-sm font-semibold">{course?.title || 'Course'}</span>
                <span className="block truncate text-xs text-slate-400">{lesson.section || 'Lesson'}</span>
              </span>
            </button>
          </div>

          <div className="min-w-0 flex-1 px-2 text-left sm:px-5 sm:text-center">
            <h1 className="truncate font-serif text-base font-semibold sm:text-lg">{lesson.title}</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {hasPages ? 'Page ' + (currentContentSlide + 1) + ' of ' + contentSlides.length : 'Lesson ' + (currentLessonIndex + 1) + ' of ' + sortedLessons.length}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => toggleTool('ai')}
              className={'inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs transition sm:gap-2 ' + (showAI ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open AI learning assistant"
              title="AI learning assistant"
            >
              <Sparkles className="h-4 w-4" /><span className="hidden 2xl:inline">Ask</span>
            </button>
            <button
              type="button"
              onClick={() => toggleTool('notes')}
              className={'inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs transition sm:gap-2 ' + (showNotes ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open notes"
              title="Notes"
            >
              <MessageSquare className="h-4 w-4" /><span className="hidden 2xl:inline">Notes</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden h-11 w-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 md:inline-flex"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => toggleTool('quiz')}
              className={'inline-flex h-11 w-11 items-center justify-center rounded-lg sm:hidden ' + (showQuizPanel ? 'bg-orange-500 text-[#071326]' : 'text-slate-200 hover:bg-white/10')}
              aria-label="Open lesson tools"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main
            ref={mainContentRef}
            className="min-w-0 flex-1 touch-pan-y touch-pinch-zoom overscroll-y-none overflow-y-auto scroll-smooth px-3 py-4 sm:px-6 sm:py-7 lg:px-8"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none', touchAction: 'pan-y pinch-zoom' }}
            aria-label="Lesson content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
          >
            {lesson.manus_slides_url ? (
              <div className="mx-auto min-h-full max-w-5xl rounded-xl bg-white p-4 shadow-sm">
                <ManusSlidePlayer url={lesson.manus_slides_url} title={lesson.title} />
              </div>
            ) : lesson.google_slides_url || lesson.video_url || lesson.file_url ? (
              <div className="mx-auto min-h-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-sm">
                <UniversalLessonPlayer
                  lesson={lesson}
                  totalSlides={lesson.total_slides || lesson.slides?.length || 1}
                  isFullscreen={isFullscreen}
                  toggleFullscreen={toggleFullscreen}
                />
              </div>
            ) : hasPages && activeContentSlide ? (
                <motion.article
                  key={currentPageKey}
                  className={'mx-auto w-full max-w-[920px] rounded-xl border border-slate-200 bg-[#fbfcfe] px-5 py-7 text-[#13233b] shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10 lg:px-14 lg:py-12' + (animatedStemContent ? ' lesson-page-stagger' : '')}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                >
                <div className="lesson-page-meta mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
                      Page {currentContentSlide + 1} of {contentSlides.length} <span className="mx-1.5 text-slate-300">•</span> {lesson.section || 'Lesson'}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-4 w-4" /> About {estimatedMinutes} min for this lesson
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentPageKey)}
                    className={'inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ' + (isBookmarked ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
                    aria-label={isBookmarked ? 'Remove page bookmark' : 'Bookmark this page'}
                  >
                    {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                </div>
                <h2 className="lesson-page-title mb-6 font-serif text-3xl font-bold leading-tight text-[#0b1b32] sm:text-4xl">{activeContentSlide.title}</h2>
                  {isWaterPolarityPage ? (
                    <WaterPolarityLessonVisual shouldReduceMotion={shouldReduceMotion} />
                  ) : isASBiologyPanelPage ? (
                    <LessonABPanels
                      html={renderedSlideHtml}
                      pageTitle={activeContentSlide.title}
                      lessonTitle={lesson.title}
                    />
                  ) : (
                    <MathJaxContent
                      className={richContentClasses + (animatedStemContent ? ' lesson-page-body' : '')}
                      html={renderedSlideHtml}
                    />
                  )}
                  {OPENSTAX_FIGURES.filter((figure) => (figure.paths || [figure.path]).some((path) => renderedSlideHtml.includes(path))).map((figure) => (
                    <p key={`${figure.book}-${figure.figure}`} className="mt-3 text-center text-xs leading-5 text-slate-500">
                      Image: <a className="underline underline-offset-2" href={figure.sectionUrl} target="_blank" rel="noreferrer">OpenStax, {figure.book}, {figure.figure}</a>. Licensed under <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>. <a className="underline underline-offset-2" href={figure.bookUrl} target="_blank" rel="noreferrer">Access for free at OpenStax.</a>
                    </p>
                  ))}
                  {activeContentSlide.content?.includes('data-interactive="solar-system-3d"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading interactive Solar System" />}>
                      <SolarSystem3D />
                    </React.Suspense>
                  )}
                  {activeContentSlide.content?.includes('data-interactive="crystal-lattice-3d"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading interactive crystal structure" />}>
                      <CrystalLattice3D model={activeContentSlide.content.includes('data-model="graphite"') ? 'graphite' : 'diamond'} />
                    </React.Suspense>
                  )}
                  {activeContentSlide.content?.includes('data-interactive="ammonia-fountain-live"') && (
                    <React.Suspense fallback={<div className="mt-6 min-h-[420px] animate-pulse rounded-xl bg-slate-100" aria-label="Loading live ammonia fountain" />}>
                      <AmmoniaFountainLive />
                    </React.Suspense>
                  )}
                </motion.article>
            ) : (
              <div className="mx-auto flex min-h-[420px] max-w-[920px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                No lesson content is available yet.
              </div>
            )}
          </main>

          <aside className="hidden w-[78px] shrink-0 flex-col items-center gap-2 border-l border-slate-200 bg-[#f7f8fb] px-2 py-6 xl:flex" aria-label="Lesson tools">
            {[
              { id: 'ai', label: 'Ask', icon: Sparkles, active: showAI },
              { id: 'notes', label: 'Notes', icon: MessageSquare, active: showNotes },
              { id: 'quiz', label: 'Practice', icon: Brain, active: showQuizPanel }
            ].map(tool => {
              const ToolIcon = tool.icon;
              return (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={'flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition ' + (tool.active ? 'bg-[#071326] text-white' : 'text-slate-600 hover:bg-white hover:text-[#071326]')}
                  aria-pressed={tool.active}
                >
                  <ToolIcon className="h-5 w-5" />
                  {tool.label}
                </button>
              );
            })}
          </aside>

          {(showAI || showNotes || showQuizPanel) && (
            <aside className="fixed inset-x-0 bottom-[72px] top-[72px] z-[70] flex flex-col overflow-hidden border-t border-slate-200 bg-white text-slate-900 shadow-2xl sm:left-auto sm:w-[360px] sm:border-l sm:border-t-0 lg:relative lg:inset-auto lg:z-20 lg:w-[360px] lg:shrink-0 lg:shadow-none">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#0b1b32]">
                  {showAI && <><Sparkles className="h-5 w-5 text-orange-500" /> Learning assistant</>}
                  {showNotes && <><MessageSquare className="h-5 w-5 text-indigo-600" /> Page notes</>}
                  {showQuizPanel && <><Brain className="h-5 w-5 text-violet-600" /> Practice questions</>}
                </h3>
                <button type="button" onClick={closeTools} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close lesson tools">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {showAI && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="grid grid-cols-4 gap-1 border-b border-slate-200 p-2">
                    {['ask', 'summary', 'define', 'translate'].map(tab => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setAiTab(tab)}
                        className={'min-h-10 rounded-md px-2 text-xs font-semibold capitalize ' + (aiTab === tab ? 'bg-[#071326] text-white' : 'text-slate-600 hover:bg-slate-100')}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {aiTab === 'ask' && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="lesson-ai-question">Ask about this page</label>
                        <textarea
                          id="lesson-ai-question"
                          value={aiQuestion}
                          onChange={event => setAiQuestion(event.target.value)}
                          placeholder="What would you like explained?"
                          className="min-h-28 w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => { askAI(aiQuestion, activeContentSlide?.content || lesson.title); setAiQuestion(''); }}
                          disabled={!aiQuestion.trim() || aiLoading}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-[#071326] hover:bg-orange-400 disabled:opacity-50"
                        >
                          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Ask
                        </button>
                      </div>
                    )}
                    {aiTab === 'summary' && (
                      <button type="button" onClick={() => summariseSlide(activeContentSlide?.content || '')} disabled={aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">
                        {aiLoading ? 'Creating summary…' : 'Summarise this page'}
                      </button>
                    )}
                    {aiTab === 'define' && (
                      <div className="space-y-3">
                        <input value={defineTerm} onChange={event => setDefineTerm(event.target.value)} placeholder="Enter a word or term" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-500" />
                        <button type="button" onClick={() => { defineWord(defineTerm); setDefineTerm(''); }} disabled={!defineTerm.trim() || aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">Explain this term</button>
                      </div>
                    )}
                    {aiTab === 'translate' && (
                      <div className="space-y-3">
                        <select value={targetLanguage} onChange={event => setTargetLanguage(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                          <option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="zh">Chinese</option><option value="ar">Arabic</option><option value="ur">Urdu</option><option value="pl">Polish</option>
                        </select>
                        <button type="button" onClick={() => translateSlide(activeContentSlide?.content || '', targetLanguage)} disabled={aiLoading} className="min-h-11 w-full rounded-lg bg-[#071326] px-4 text-sm font-semibold text-white disabled:opacity-50">Translate this page</button>
                      </div>
                    )}
                    {(aiResponse || aiSummary || aiTranslation) && (
                      <div className="mt-5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {aiTab === 'summary' ? aiSummary : aiTab === 'translate' ? aiTranslation : aiResponse}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showNotes && (
                <div className="flex min-h-0 flex-1 flex-col p-5">
                  <p className="mb-3 text-sm text-slate-500">Notes are saved for page {currentContentSlide + 1}.</p>
                  <textarea
                    value={notes[currentPageKey] || ''}
                    onChange={event => saveNote(currentPageKey, event.target.value)}
                    className="min-h-0 flex-1 resize-none rounded-lg border border-slate-300 bg-amber-50/40 p-4 text-sm leading-6 outline-none focus:border-indigo-500"
                    placeholder="Write your notes here…"
                  />
                  <button type="button" onClick={exportNotes} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-4 w-4" /> Export notes
                  </button>
                </div>
              )}

              {showQuizPanel && <div className="min-h-0 flex-1 overflow-y-auto"><QuizGeneratorPanel lesson={lesson} onClose={closeTools} /></div>}
            </aside>
          )}
        </div>

        <footer className="z-40 flex min-h-[72px] shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 text-slate-900 sm:px-5">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={isFirstPage && !prevLesson}
            aria-label={isFirstPage ? 'Go to previous topic' : 'Go to previous page'}
            title={isFirstPage ? 'Previous topic' : 'Previous page'}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">{isFirstPage ? 'Previous topic' : 'Previous page'}</span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>{hasPages ? 'Page ' + (currentContentSlide + 1) + ' of ' + contentSlides.length : 'Lesson'}</span>
              <span className="sm:hidden">Swipe or tap</span>
              <span className="hidden sm:inline">Use ← / → to navigate</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: pageProgress + '%' }} />
            </div>
          </div>

          {hasPages && (
            <select
              value={currentContentSlide}
              onChange={event => setCurrentContentSlide(Number(event.target.value))}
              aria-label="Choose lesson page"
              className="hidden h-11 max-w-[210px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500 md:block"
            >
              {contentSlides.map((slide, index) => <option key={index} value={index}>Page {index + 1}: {slide.title || 'Untitled'}</option>)}
            </select>
          )}

          {(!isCompleted && isLastPage) && (
            <button
              type="button"
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 sm:px-4"
            >
              <CheckCircle className="h-4 w-4" /><span className="hidden sm:inline">{markCompleteMutation.isPending ? 'Saving…' : 'Mark complete'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={goToNext}
            disabled={isLastPage && !nextLesson && !canOpenTopicQuiz}
            aria-label={canOpenTopicQuiz ? 'Open topic quiz' : isLastPage ? 'Go to next topic' : 'Go to next page'}
            title={canOpenTopicQuiz ? 'Topic quiz' : isLastPage ? 'Next topic' : 'Next page'}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-[#071326] shadow-sm hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
          >
            <span className="hidden sm:inline">{canOpenTopicQuiz ? 'Topic quiz' : isLastPage ? 'Next topic' : 'Next page'}</span><ChevronRight className="h-5 w-5" />
          </button>
        </footer>
      </section>

      <TopicQuizModal
        open={showTopicQuiz}
        lesson={lesson}
        questions={topicQuizQuestions}
        loading={loadingInteractives}
        hasNextTopic={!!nextLesson}
        onClose={() => setShowTopicQuiz(false)}
        onContinue={handleTopicQuizContinue}
      />

      <PointsAnimation show={showPointsAnimation} points={earnedPoints} onComplete={() => setShowPointsAnimation(false)} />
      <BadgeUnlock badges={newBadges} onClose={() => setShowBadges(false)} />
      <LessonUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        lessonId={lesson.id}
        courseId={courseId}
        lessonTitle={lesson.title}
        onUnlockSuccess={() => setIsLessonLocked(false)}
      />
    </div>
  );
}