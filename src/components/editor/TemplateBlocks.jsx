import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, AlertTriangle, CheckCircle, Info, MessageSquare, 
  BookOpen, Target, Zap, Award, Code, FileText, Image as ImageIcon,
  Plus, X, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const TEMPLATE_BLOCKS = {
  callouts: {
    name: 'Callouts',
    icon: MessageSquare,
    blocks: [
      {
        name: 'Tip Box',
        icon: Lightbulb,
        color: 'blue',
        html: '<div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-left: 5px solid #3B82F6; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">💡</div><div style="flex: 1;"><h4 style="color: #1E40AF; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Pro Tip</h4><p style="color: #1E3A8A; font-size: 15px; line-height: 1.6; margin: 0;">Add your helpful tip or advice here. This helps students remember key points.</p></div></div></div>'
      },
      {
        name: 'Important Notice',
        icon: AlertTriangle,
        color: 'red',
        html: '<div style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-left: 5px solid #EF4444; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #EF4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">⚠️</div><div style="flex: 1;"><h4 style="color: #991B1B; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Important</h4><p style="color: #7F1D1D; font-size: 15px; line-height: 1.6; margin: 0;">Highlight critical information students need to remember.</p></div></div></div>'
      },
      {
        name: 'Key Concept',
        icon: CheckCircle,
        color: 'green',
        html: '<div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-left: 5px solid #10B981; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">✓</div><div style="flex: 1;"><h4 style="color: #065F46; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Key Concept</h4><p style="color: #064E3B; font-size: 15px; line-height: 1.6; margin: 0;">Emphasize essential concepts and learning objectives.</p></div></div></div>'
      },
      {
        name: 'Info Box',
        icon: Info,
        color: 'purple',
        html: '<div style="background: linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%); border-left: 5px solid #A855F7; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #A855F7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">ℹ️</div><div style="flex: 1;"><h4 style="color: #6B21A8; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Did You Know?</h4><p style="color: #581C87; font-size: 15px; line-height: 1.6; margin: 0;">Share interesting facts or additional context.</p></div></div></div>'
      },
      {
        name: 'Warning Box',
        icon: AlertTriangle,
        color: 'orange',
        html: '<div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #F59E0B; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">⚡</div><div style="flex: 1;"><h4 style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Warning</h4><p style="color: #78350F; font-size: 15px; line-height: 1.6; margin: 0;">Caution students about common pitfalls or dangerous misconceptions.</p></div></div></div>'
      },
      {
        name: 'Success Box',
        icon: CheckCircle,
        color: 'emerald',
        html: '<div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border: 2px solid #10B981; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">🎉</div><div style="flex: 1;"><h4 style="color: #065F46; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Well Done!</h4><p style="color: #064E3B; font-size: 15px; line-height: 1.6; margin: 0;">Celebrate achievements and reinforce positive learning outcomes.</p></div></div></div>'
      },
      {
        name: 'Question Box',
        icon: MessageSquare,
        color: 'indigo',
        html: '<div style="background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%); border-left: 5px solid #6366F1; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">❓</div><div style="flex: 1;"><h4 style="color: #3730A3; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Think About It</h4><p style="color: #312E81; font-size: 15px; line-height: 1.6; margin: 0;">Pose thought-provoking questions to encourage critical thinking.</p></div></div></div>'
      },
      {
        name: 'Remember Box',
        icon: Target,
        color: 'rose',
        html: '<div style="background: linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%); border-left: 5px solid #F43F5E; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #F43F5E; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">📌</div><div style="flex: 1;"><h4 style="color: #9F1239; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Remember</h4><p style="color: #881337; font-size: 15px; line-height: 1.6; margin: 0;">Highlight key facts that students must memorize.</p></div></div></div>'
      },
      {
        name: 'Common Mistake',
        icon: AlertTriangle,
        color: 'red',
        html: '<div style="background: white; border: 2px dashed #DC2626; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">❌</div><div style="flex: 1;"><h4 style="color: #991B1B; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Common Mistake</h4><p style="color: #7F1D1D; font-size: 15px; line-height: 1.6; margin: 0;">Point out typical errors students make and how to avoid them.</p></div></div></div>'
      },
      {
        name: 'Fun Fact',
        icon: Zap,
        color: 'pink',
        html: '<div style="background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #EC4899;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #EC4899; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">🎨</div><div style="flex: 1;"><h4 style="color: #9F1239; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Fun Fact</h4><p style="color: #831843; font-size: 15px; line-height: 1.6; margin: 0;">Share interesting trivia to engage students and make learning fun.</p></div></div></div>'
      },
      {
        name: 'Study Tip',
        icon: BookOpen,
        color: 'cyan',
        html: '<div style="background: linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%); border-left: 5px solid #06B6D4; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: flex-start; gap: 12px;"><div style="flex-shrink: 0; width: 32px; height: 32px; background: #06B6D4; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">📚</div><div style="flex: 1;"><h4 style="color: #164E63; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Study Tip</h4><p style="color: #155E75; font-size: 15px; line-height: 1.6; margin: 0;">Provide effective study strategies and learning techniques.</p></div></div></div>'
      }
    ]
  },
  definitions: {
    name: 'Definitions',
    icon: BookOpen,
    blocks: [
      {
        name: 'Term Definition',
        icon: BookOpen,
        color: 'indigo',
        html: '<div style="background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 24px; margin: 20px 0;"><h3 style="color: #0369A1; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Term or Concept</h3><p style="color: #0C4A6E; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic;">Clear definition goes here. Explain the term in simple, understandable language.</p></div>'
      },
      {
        name: 'Formula Box',
        icon: Code,
        color: 'cyan',
        html: '<div style="background: #F0FDFA; border: 2px solid #14B8A6; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;"><div style="background: white; border: 1px solid #5EEAD4; border-radius: 8px; padding: 16px; margin-bottom: 16px;"><h3 style="color: #0F766E; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace;">Formula = A + B</h3></div><p style="color: #134E4A; font-size: 15px; line-height: 1.6; margin: 0;">Where A represents... and B represents...</p></div>'
      },
      {
        name: 'Vocabulary Card',
        icon: FileText,
        color: 'purple',
        html: '<div style="background: white; border: 2px solid #A855F7; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="background: #A855F7; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase;">Vocabulary</span></div><h3 style="color: #7E22CE; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Word</h3><p style="color: #581C87; font-size: 14px; font-style: italic; margin: 0 0 12px 0;">/pronunciation/</p><p style="color: #6B21A8; font-size: 16px; line-height: 1.6; margin: 0;">Definition and meaning of the word.</p></div>'
      },
      {
        name: 'Glossary Item',
        icon: BookOpen,
        color: 'teal',
        html: '<div style="background: #F0FDFA; border-left: 4px solid #14B8A6; padding: 16px 20px; margin: 20px 0; border-radius: 8px;"><h4 style="color: #0F766E; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; display: inline-block;">Term:</h4> <p style="display: inline; color: #134E4A; font-size: 15px; line-height: 1.7;">Brief explanation of the glossary term.</p></div>'
      },
      {
        name: 'Theorem Box',
        icon: Award,
        color: 'blue',
        html: '<div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border: 3px solid #3B82F6; border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="text-align: center; margin-bottom: 16px;"><span style="background: #3B82F6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">Theorem</span></div><h3 style="color: #1E40AF; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">Theorem Name</h3><div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px;"><p style="color: #1E3A8A; font-size: 16px; line-height: 1.7; margin: 0; font-style: italic; text-align: center;">Statement of the theorem</p></div><p style="color: #1E40AF; font-size: 14px; margin: 0;"><strong>Proof:</strong> Provide proof or explanation here.</p></div>'
      },
      {
        name: 'Law/Principle',
        icon: Target,
        color: 'indigo',
        html: '<div style="background: white; border: 2px solid #6366F1; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);"><div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 16px; text-align: center;"><h3 style="font-size: 20px; font-weight: 700; margin: 0;">Law/Principle Name</h3></div><p style="color: #312E81; font-size: 16px; line-height: 1.7; margin: 0;">Description of the law or principle and its applications.</p></div>'
      },
      {
        name: 'Equation Breakdown',
        icon: Code,
        color: 'emerald',
        html: '<div style="background: #F0FDF4; border: 2px solid #10B981; border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;"><h3 style="color: #065F46; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace;">E = mc²</h3></div><div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 16px;"><p style="color: #065F46; font-size: 15px; line-height: 2; margin: 0;"><strong>E</strong> = Energy<br><strong>m</strong> = Mass<br><strong>c</strong> = Speed of light</p></div></div>'
      },
      {
        name: 'Step Definition',
        icon: FileText,
        color: 'orange',
        html: '<div style="background: #FFF7ED; border-left: 5px solid #F97316; border-radius: 12px; padding: 20px; margin: 20px 0;"><h4 style="color: #9A3412; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">Step-by-Step Definition</h4><ol style="margin: 0; padding-left: 24px; color: #7C2D12; font-size: 15px; line-height: 2;"><li>First, understand that...</li><li>Then, recognize that...</li><li>Finally, conclude that...</li></ol></div>'
      },
      {
        name: 'Comparison Definition',
        icon: Target,
        color: 'pink',
        html: '<div style="background: white; border: 2px solid #EC4899; border-radius: 12px; padding: 24px; margin: 20px 0;"><h3 style="color: #BE185D; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Term A vs Term B</h3><table style="width: 100%; border-collapse: collapse;"><tr><td style="width: 50%; padding: 12px; background: #FCE7F3; border-radius: 8px; vertical-align: top;"><h4 style="color: #9F1239; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Term A</h4><p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0;">Definition of first term</p></td><td style="width: 50%; padding: 12px; padding-left: 16px; vertical-align: top;"><h4 style="color: #9F1239; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Term B</h4><p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0;">Definition of second term</p></td></tr></table></div>'
      },
      {
        name: 'Etymology Box',
        icon: BookOpen,
        color: 'amber',
        html: '<div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; margin: 20px 0;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="font-size: 24px;">📖</span><h4 style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0;">Word Origin</h4></div><p style="color: #78350F; font-size: 15px; line-height: 1.6; margin: 0;"><strong>Origin:</strong> Latin/Greek root<br><strong>Meaning:</strong> Original meaning<br><strong>Evolution:</strong> How the term evolved</p></div>'
      }
    ]
  },
  examples: {
    name: 'Examples',
    icon: Target,
    blocks: [
      {
        name: 'Example Block',
        icon: Zap,
        color: 'yellow',
        html: '<div style="background: white; border: 2px solid #FCD34D; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);"><div style="display: inline-block; background: #FEF3C7; color: #92400E; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 16px;">EXAMPLE</div><h4 style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Example Title</h4><p style="color: #78350F; font-size: 15px; line-height: 1.7; margin: 0;">Walk through a specific example step-by-step to illustrate the concept.</p></div>'
      },
      {
        name: 'Practice Problem',
        icon: Award,
        color: 'orange',
        html: '<div style="background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%); border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><div style="background: #EA580C; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700;">TRY IT</div></div><h4 style="color: #7C2D12; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Practice Question</h4><p style="color: #9A3412; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Present a problem for students to solve on their own.</p><div style="background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); border-radius: 8px; padding: 16px;"><p style="color: #7C2D12; font-size: 14px; margin: 0; font-style: italic;">💡 Solution: Click to reveal answer or provide hints.</p></div></div>'
      },
      {
        name: 'Real-World Example',
        icon: Target,
        color: 'blue',
        html: '<div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 5px solid #3B82F6;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="font-size: 24px;">🌍</span><h4 style="color: #1E40AF; font-size: 18px; font-weight: 700; margin: 0;">Real-World Application</h4></div><p style="color: #1E3A8A; font-size: 15px; line-height: 1.7; margin: 0;">Show how this concept applies in everyday life or professional settings.</p></div>'
      },
      {
        name: 'Case Study',
        icon: FileText,
        color: 'purple',
        html: '<div style="background: white; border: 2px solid #A855F7; border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="background: #A855F7; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 16px;"><h4 style="font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase;">Case Study</h4></div><h4 style="color: #7E22CE; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Case Title</h4><p style="color: #6B21A8; font-size: 15px; line-height: 1.7; margin: 0;">Detailed case study with context, analysis, and outcomes.</p></div>'
      },
      {
        name: 'Worked Example',
        icon: CheckCircle,
        color: 'green',
        html: '<div style="background: #F0FDF4; border: 2px solid #10B981; border-radius: 12px; padding: 24px; margin: 20px 0;"><h4 style="color: #065F46; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;"><span>📐</span> Worked Example</h4><div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px;"><p style="color: #064E3B; font-size: 15px; margin: 0;"><strong>Given:</strong> Initial conditions</p></div><div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 12px;"><p style="color: #064E3B; font-size: 15px; margin: 0;"><strong>Step 1:</strong> First calculation<br><strong>Step 2:</strong> Second calculation<br><strong>Step 3:</strong> Final result</p></div><div style="background: #10B981; color: white; border-radius: 8px; padding: 12px;"><p style="font-size: 15px; margin: 0;"><strong>Answer:</strong> Final solution</p></div></div>'
      },
      {
        name: 'Problem-Solution',
        icon: Zap,
        color: 'indigo',
        html: '<div style="background: white; border-radius: 12px; padding: 0; margin: 20px 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"><div style="background: #EF4444; color: white; padding: 16px;"><h4 style="font-size: 16px; font-weight: 700; margin: 0;">❌ Problem</h4></div><div style="padding: 20px;"><p style="color: #1F2937; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">Describe the problem or challenge.</p></div><div style="background: #10B981; color: white; padding: 16px;"><h4 style="font-size: 16px; font-weight: 700; margin: 0;">✓ Solution</h4></div><div style="padding: 20px;"><p style="color: #1F2937; font-size: 15px; line-height: 1.7; margin: 0;">Explain the solution or resolution.</p></div></div>'
      },
      {
        name: 'Before/After',
        icon: Target,
        color: 'teal',
        html: '<div style="margin: 20px 0;"><table style="width: 100%; border-collapse: collapse;"><tr><td style="width: 50%; padding: 16px; background: #FEE2E2; border: 2px solid #EF4444; border-radius: 12px; vertical-align: top;"><h4 style="color: #991B1B; font-size: 16px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;"><span>📍</span>Before</h4><p style="color: #7F1D1D; font-size: 14px; line-height: 1.6; margin: 0;">Initial state or condition</p></td><td style="width: 50%; padding: 16px; padding-left: 20px; background: #D1FAE5; border: 2px solid #10B981; border-radius: 12px; vertical-align: top;"><h4 style="color: #065F46; font-size: 16px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;"><span>✨</span>After</h4><p style="color: #064E3B; font-size: 14px; line-height: 1.6; margin: 0;">Final state or result</p></td></tr></table></div>'
      },
      {
        name: 'Counter-Example',
        icon: AlertTriangle,
        color: 'red',
        html: '<div style="background: #FEF2F2; border: 2px dashed #DC2626; border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="font-size: 24px;">🚫</span><h4 style="color: #991B1B; font-size: 18px; font-weight: 700; margin: 0;">Counter-Example</h4></div><p style="color: #7F1D1D; font-size: 15px; line-height: 1.7; margin: 0;">Show an example that contradicts a common assumption to deepen understanding.</p></div>'
      },
      {
        name: 'Application Example',
        icon: Target,
        color: 'cyan',
        html: '<div style="background: linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%); border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="background: #06B6D4; color: white; padding: 10px 16px; border-radius: 8px; display: inline-block; margin-bottom: 16px; font-size: 14px; font-weight: 700;">APPLICATION</div><h4 style="color: #164E63; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">How to Apply This</h4><p style="color: #155E75; font-size: 15px; line-height: 1.7; margin: 0;">Practical steps to apply this concept in real situations.</p></div>'
      },
      {
        name: 'Historical Example',
        icon: BookOpen,
        color: 'amber',
        html: '<div style="background: white; border: 2px solid #F59E0B; border-radius: 12px; padding: 24px; margin: 20px 0;"><div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="font-size: 24px;">📜</span><h4 style="color: #92400E; font-size: 18px; font-weight: 700; margin: 0;">Historical Context</h4></div><p style="color: #78350F; font-size: 15px; line-height: 1.7; margin: 0;">Provide historical background or examples from the past.</p></div>'
      }
    ]
  },
  content: {
    name: 'Content',
    icon: FileText,
    blocks: [
      {
        name: 'Quote Box',
        icon: MessageSquare,
        color: 'pink',
        html: '<div style="background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); border-radius: 12px; padding: 32px; margin: 20px 0; text-align: center;"><div style="font-size: 48px; color: #DB2777; margin-bottom: 16px; line-height: 1;">"</div><blockquote style="color: #831843; font-size: 20px; font-weight: 500; font-style: italic; line-height: 1.6; margin: 0 0 16px 0; max-width: 700px; margin-left: auto; margin-right: auto;">"Insert meaningful quote or key statement here"</blockquote><p style="color: #9F1239; font-size: 14px; font-weight: 600; margin: 0;">— Source or Author</p></div>'
      },
      {
        name: 'Summary Box',
        icon: CheckCircle,
        color: 'teal',
        html: '<div style="background: white; border: 2px dashed #14B8A6; border-radius: 12px; padding: 24px; margin: 20px 0;"><h4 style="color: #0F766E; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;"><span style="background: #14B8A6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">📝</span>Summary</h4><ul style="margin: 0; padding-left: 24px; color: #134E4A; font-size: 15px; line-height: 2;"><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul></div>'
      },
      {
        name: 'Image Placeholder',
        icon: ImageIcon,
        color: 'gray',
        html: '<div style="margin: 20px 0; text-align: center;"><img src="https://via.placeholder.com/800x400/6366F1/FFFFFF?text=Click+to+Replace+Image" style="width: 100%; max-width: 800px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" /><p style="margin-top: 12px; color: #6B7280; font-size: 14px; font-style: italic;">Click image to replace - Add descriptive caption here</p></div>'
      },
      {
        name: 'Numbered Steps',
        icon: FileText,
        color: 'blue',
        html: '<div style="background: #F0F9FF; border-radius: 12px; padding: 24px; margin: 20px 0;"><h4 style="color: #1E40AF; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Step-by-Step Process</h4><ol style="margin: 0; padding-left: 24px; color: #1E3A8A; font-size: 15px; line-height: 2;"><li><strong>First Step:</strong> Description</li><li><strong>Second Step:</strong> Description</li><li><strong>Third Step:</strong> Description</li></ol></div>'
      },
      {
        name: 'Checklist',
        icon: CheckCircle,
        color: 'green',
        html: '<div style="background: white; border: 2px solid #10B981; border-radius: 12px; padding: 24px; margin: 20px 0;"><h4 style="color: #065F46; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;"><span>✅</span> Checklist</h4><div style="space-y: 12px;"><label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #F0FDF4; border-radius: 8px; cursor: pointer; margin-bottom: 8px;"><input type="checkbox" style="width: 18px; height: 18px;"><span style="color: #064E3B; font-size: 15px;">Item 1</span></label><label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #F0FDF4; border-radius: 8px; cursor: pointer; margin-bottom: 8px;"><input type="checkbox" style="width: 18px; height: 18px;"><span style="color: #064E3B; font-size: 15px;">Item 2</span></label><label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #F0FDF4; border-radius: 8px; cursor: pointer;"><input type="checkbox" style="width: 18px; height: 18px;"><span style="color: #064E3B; font-size: 15px;">Item 3</span></label></div></div>'
      },
      {
        name: 'Timeline Item',
        icon: Target,
        color: 'purple',
        html: '<div style="background: white; border-left: 4px solid #A855F7; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.15);"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><div style="background: #A855F7; color: white; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700;">1850</div><h4 style="color: #7E22CE; font-size: 18px; font-weight: 700; margin: 0;">Event Title</h4></div><p style="color: #6B21A8; font-size: 15px; line-height: 1.6; margin: 0;">Description of the event and its significance.</p></div>'
      },
      {
        name: 'Comparison Table',
        icon: FileText,
        color: 'indigo',
        html: '<div style="background: white; border: 2px solid #6366F1; border-radius: 12px; padding: 24px; margin: 20px 0; overflow-x: auto;"><h4 style="color: #4338CA; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Comparison</h4><table style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #EEF2FF;"><th style="padding: 12px; text-align: left; border: 1px solid #C7D2FE; color: #4338CA; font-weight: 700;">Feature</th><th style="padding: 12px; text-align: left; border: 1px solid #C7D2FE; color: #4338CA; font-weight: 700;">Option A</th><th style="padding: 12px; text-align: left; border: 1px solid #C7D2FE; color: #4338CA; font-weight: 700;">Option B</th></tr></thead><tbody><tr><td style="padding: 12px; border: 1px solid #E0E7FF; color: #312E81;">Feature 1</td><td style="padding: 12px; border: 1px solid #E0E7FF; color: #4338CA;">✓</td><td style="padding: 12px; border: 1px solid #E0E7FF; color: #4338CA;">✗</td></tr><tr><td style="padding: 12px; border: 1px solid #E0E7FF; color: #312E81;">Feature 2</td><td style="padding: 12px; border: 1px solid #E0E7FF; color: #4338CA;">✗</td><td style="padding: 12px; border: 1px solid #E0E7FF; color: #4338CA;">✓</td></tr></tbody></table></div>'
      },
      {
        name: 'Pros/Cons List',
        icon: Target,
        color: 'slate',
        html: '<div style="margin: 20px 0;"><table style="width: 100%; border-collapse: collapse;"><tr><td style="width: 50%; padding: 20px; background: #D1FAE5; border-radius: 12px; vertical-align: top;"><h4 style="color: #065F46; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;"><span>✓</span> Pros</h4><ul style="margin: 0; padding-left: 20px; color: #064E3B; font-size: 15px; line-height: 2;"><li>Advantage 1</li><li>Advantage 2</li><li>Advantage 3</li></ul></td><td style="width: 50%; padding: 20px; padding-left: 24px; background: #FEE2E2; border-radius: 12px; vertical-align: top;"><h4 style="color: #991B1B; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;"><span>✗</span> Cons</h4><ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 15px; line-height: 2;"><li>Disadvantage 1</li><li>Disadvantage 2</li><li>Disadvantage 3</li></ul></td></tr></table></div>'
      },
      {
        name: 'FAQ Item',
        icon: MessageSquare,
        color: 'cyan',
        html: '<div style="background: white; border: 2px solid #06B6D4; border-radius: 12px; padding: 20px; margin: 20px 0;"><h4 style="color: #164E63; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;"><span style="background: #06B6D4; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">Q</span>Question goes here?</h4><p style="color: #155E75; font-size: 15px; line-height: 1.7; margin: 0; padding-left: 36px;">Answer to the question with detailed explanation.</p></div>'
      },
      {
        name: 'Video Placeholder',
        icon: FileText,
        color: 'red',
        html: '<div style="margin: 20px 0;"><div style="position: relative; width: 100%; padding-bottom: 56.25%; background: linear-gradient(135deg, #1F2937 0%, #374151 100%); border-radius: 12px; overflow: hidden;"><div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;"><div style="font-size: 48px; margin-bottom: 16px;">▶️</div><p style="font-size: 18px; font-weight: 600; margin: 0;">Video Title</p><p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.8;">Click to add video link</p></div></div><p style="margin-top: 12px; color: #6B7280; font-size: 14px; text-align: center; font-style: italic;">Video description and key learning points</p></div>'
      },
      {
        name: 'Code Snippet',
        icon: Code,
        color: 'gray',
        html: '<div style="background: #1F2937; border-radius: 12px; padding: 20px; margin: 20px 0; font-family: monospace;"><div style="display: flex; align-items: center; justify-content: between; margin-bottom: 12px;"><span style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; font-weight: 700;">Code Example</span></div><pre style="margin: 0; color: #E5E7EB; font-size: 14px; line-height: 1.6; overflow-x: auto;"><code>function example() {\n  // Add your code here\n  return true;\n}</code></pre></div>'
      }
    ]
  }
};

export default function TemplateBlocks({ onInsert, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('callouts');

  const filteredBlocks = searchTerm 
    ? Object.values(TEMPLATE_BLOCKS).flatMap(category => 
        category.blocks.filter(block => 
          block.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : TEMPLATE_BLOCKS[selectedCategory]?.blocks || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card 
        className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Template Blocks</h2>
              <p className="text-sm text-gray-500 mt-1">Click any block to insert it into your slide</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Category Sidebar */}
          {!searchTerm && (
            <div className="w-48 border-r bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Categories</p>
              <div className="space-y-1">
                {Object.entries(TEMPLATE_BLOCKS).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        selectedCategory === key
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blocks Grid */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {searchTerm && (
                <p className="text-sm text-gray-500 mb-4">
                  Found {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBlocks.map((block, index) => {
                  const Icon = block.icon;
                  return (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-indigo-300 group"
                      onClick={() => {
                        onInsert(block.html);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-${block.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${block.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {block.name}
                          </h4>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      
                      <div 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-hidden"
                        dangerouslySetInnerHTML={{ 
                          __html: block.html.replace(/style="[^"]*"/g, 'style="transform: scale(0.7); transform-origin: top left; width: 142%; pointer-events: none;"')
                        }}
                      />
                    </Card>
                  );
                })}
              </div>

              {filteredBlocks.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No blocks found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}