import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizAttemptId } = await req.json();

    if (!quizAttemptId) {
      return Response.json({ error: 'Quiz attempt ID required' }, { status: 400 });
    }

    // Get quiz attempt
    const attempts = await base44.entities.QuizAttempt.filter({ id: quizAttemptId });
    const attempt = attempts[0];

    if (!attempt) {
      return Response.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    // Get quiz details
    const quizzes = await base44.entities.Quiz.filter({ id: attempt.quiz_id });
    const quiz = quizzes[0];

    // Get course details
    const courses = await base44.entities.Course.filter({ id: attempt.course_id });
    const course = courses[0];

    // Get student's other attempts for this quiz
    const allAttempts = await base44.entities.QuizAttempt.filter({ 
      quiz_id: attempt.quiz_id,
      created_by: attempt.created_by 
    });

    // Analyze weak areas
    const weakQuestions = attempt.answers
      .filter(a => !a.is_correct)
      .map(a => ({
        questionIndex: a.question_index,
        question: quiz.questions[a.question_index],
        selectedAnswer: a.selected_answer
      }));

    // Generate AI feedback
    const feedbackPrompt = `Analyze this student's quiz performance and provide personalized feedback and recommendations.

QUIZ: ${quiz.title}
COURSE: ${course.title}
SCORE: ${attempt.score}%
PASSED: ${attempt.passed ? 'Yes' : 'No'}
PASSING SCORE: ${quiz.passing_score}%
ATTEMPT NUMBER: ${allAttempts.length}
TIME TAKEN: ${Math.round(attempt.time_taken_seconds / 60)} minutes

INCORRECT QUESTIONS:
${weakQuestions.map((q, i) => `${i + 1}. ${q.question.question}\n   Student selected: ${q.question.options[q.selectedAnswer]}\n   Correct answer: ${q.question.options[q.question.correct_answer]}`).join('\n\n')}

Provide detailed feedback in JSON format:
{
  "overall_feedback": "Encouraging assessment of their performance",
  "strengths": ["strength 1", "strength 2"],
  "areas_to_review": [
    {
      "topic": "Topic name",
      "reason": "Why they struggled",
      "resources": "What to study"
    }
  ],
  "specific_recommendations": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ],
  "next_steps": "What to do next",
  "tutor_notes": "Notes for the tutor about this student's performance"
}`;

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: feedbackPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_feedback: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          areas_to_review: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                reason: { type: "string" },
                resources: { type: "string" }
              }
            }
          },
          specific_recommendations: { type: "array", items: { type: "string" } },
          next_steps: { type: "string" },
          tutor_notes: { type: "string" }
        }
      }
    });

    // Send feedback email to student
    const studentUser = await base44.asServiceRole.entities.User.filter({ 
      email: attempt.created_by 
    });

    if (studentUser.length > 0) {
      await base44.integrations.Core.SendEmail({
        to: attempt.created_by,
        subject: `Quiz Results: ${quiz.title}`,
        body: `
          <h2>Quiz Results</h2>
          <p>Score: <strong>${attempt.score}%</strong> (${attempt.passed ? 'Passed ✓' : 'Not Passed'})</p>
          
          <h3>Feedback:</h3>
          <p>${feedback.overall_feedback}</p>
          
          <h3>Your Strengths:</h3>
          <ul>
            ${feedback.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
          
          <h3>Areas to Review:</h3>
          ${feedback.areas_to_review.map(area => `
            <p><strong>${area.topic}:</strong> ${area.reason}<br>
            <em>Resource: ${area.resources}</em></p>
          `).join('')}
          
          <h3>Recommendations:</h3>
          <ul>
            ${feedback.specific_recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
          
          <p><strong>Next Steps:</strong> ${feedback.next_steps}</p>
        `
      });
    }

    // Notify tutor with grade
    const tutorEmail = course.instructor_email || course.created_by;
    if (tutorEmail) {
      await base44.integrations.Core.SendEmail({
        to: tutorEmail,
        subject: `Student Quiz Submission: ${studentUser[0]?.full_name || attempt.created_by}`,
        body: `
          <h2>Quiz Submission Alert</h2>
          <p><strong>Student:</strong> ${studentUser[0]?.full_name || attempt.created_by}</p>
          <p><strong>Quiz:</strong> ${quiz.title}</p>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Score:</strong> ${attempt.score}% (${attempt.passed ? 'Passed ✓' : 'Not Passed ✗'})</p>
          <p><strong>Time Taken:</strong> ${Math.round(attempt.time_taken_seconds / 60)} minutes</p>
          <p><strong>Attempt:</strong> ${allAttempts.length}</p>
          
          <h3>Tutor Notes:</h3>
          <p>${feedback.tutor_notes}</p>
          
          <h3>Areas Student Needs Help With:</h3>
          <ul>
            ${feedback.areas_to_review.map(area => `<li><strong>${area.topic}:</strong> ${area.reason}</li>`).join('')}
          </ul>
        `
      });
    }

    return Response.json({ 
      success: true,
      feedback,
      emailSent: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});