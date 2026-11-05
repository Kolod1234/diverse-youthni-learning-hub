import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function ChallengePlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const challengeId = params.get('id');

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const queryClient = useQueryClient();

  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.filter({ id: challengeId });
      return challenges[0];
    },
    enabled: !!challengeId
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      return base44.entities.ChallengeParticipant.create({
        challenge_id: challengeId,
        participant_name: user.username || 'Learner',
        status: 'completed',
        score: data.score,
        time_taken_seconds: timeTaken,
        answers: data.answers,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge', challengeId]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  });

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (started && timeLeft === 0 && !completed) {
      handleComplete();
    }
  }, [started, timeLeft, completed]);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
    setTimeLeft(challenge.time_limit_minutes * 60);
  };

  const handleAnswer = (answerIndex) => {
    const question = challenge.quiz_questions[currentQuestion];
    const isCorrect = question.correct_answer === answerIndex;
    
    setAnswers([...answers, { questionIndex: currentQuestion, answer: answerIndex, correct: isCorrect }]);
    
    if (isCorrect) {
      setScore(score + (question.points || 10));
    }

    if (currentQuestion < challenge.quiz_questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setCompleted(true);
    await submitMutation.mutateAsync({ score, answers });
    toast.success(`Challenge completed! You scored ${score} points!`);
  };

  if (!challenge) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">{challenge.time_limit_minutes} minutes</p>
              <p className="text-sm text-muted-foreground">Time Limit</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">{challenge.quiz_questions?.length || 0} questions</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-semibold">{challenge.points_reward} XP</p>
              <p className="text-sm text-muted-foreground">Reward</p>
            </div>
          </div>

          <Button onClick={handleStart} size="lg" className="w-full">
            Start Challenge
          </Button>
        </Card>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / (challenge.quiz_questions.reduce((sum, q) => sum + (q.points || 10), 0))) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-2">Challenge Complete!</h1>
          <p className="text-muted-foreground mb-8">Great job! Here's your result:</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg">
              <p className="text-5xl font-bold text-blue-600 mb-2">{score}</p>
              <p className="text-muted-foreground">Points Earned</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg">
              <p className="text-5xl font-bold text-purple-600 mb-2">{percentage}%</p>
              <p className="text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate(createPageUrl('Challenges'))} className="flex-1">
              Back to Challenges
            </Button>
            <Button onClick={() => navigate(`${createPageUrl('ChallengeLeaderboard')}?id=${challengeId}`)} className="flex-1">
              View Leaderboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = challenge.quiz_questions[currentQuestion];
  const progress = ((currentQuestion + 1) / challenge.quiz_questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Timer & Progress */}
        <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-mono text-xl font-bold">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-xl">{score} pts</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Question {currentQuestion + 1} of {challenge.quiz_questions.length}</p>
        </div>

        {/* Question */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-400"
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}