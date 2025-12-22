import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, type } = await req.json();
    
    if (!prompt || !type) {
      return Response.json({ error: 'Missing prompt or type' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MANUS_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'MANUS_API_KEY not configured. Please add it in Settings → Environment Variables.' 
      }, { status: 500 });
    }

    // Step 1: Create task with Manus AI
    const createTaskResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt + '\n\nIMPORTANT: Return ONLY valid JSON in your response, no markdown formatting or code blocks.',
        agentProfile: 'manus-1.6-max',
        taskMode: 'agent',
        hideInTaskList: true
      })
    });

    if (!createTaskResponse.ok) {
      const error = await createTaskResponse.text();
      console.error('Manus API error:', error);
      return Response.json({ 
        error: 'Manus API error',
        details: error 
      }, { status: createTaskResponse.status });
    }

    const taskData = await createTaskResponse.json();
    const taskId = taskData.task_id;

    if (!taskId) {
      return Response.json({ 
        error: 'No task_id returned from Manus API' 
      }, { status: 500 });
    }

    // Step 2: Poll for task completion (wait up to 60 seconds)
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds
    let taskResult = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const getTaskResponse = await fetch(`https://api.manus.ai/v1/tasks?status=completed&status=failed`, {
        method: 'GET',
        headers: {
          'API_KEY': apiKey,
          'accept': 'application/json'
        }
      });

      if (getTaskResponse.ok) {
        const tasksData = await getTaskResponse.json();
        const completedTask = tasksData.data?.find(t => t.id === taskId);
        
        if (completedTask) {
          if (completedTask.status === 'failed') {
            return Response.json({ 
              error: 'Manus task failed',
              details: completedTask.error || 'Unknown error'
            }, { status: 500 });
          }
          
          if (completedTask.status === 'completed' && completedTask.output) {
            // Extract text from output
            const textContent = completedTask.output
              .filter(msg => msg.role === 'assistant')
              .flatMap(msg => msg.content)
              .filter(c => c.type === 'output_text')
              .map(c => c.text)
              .join('\n\n');
            
            taskResult = textContent;
            break;
          }
        }
      }
      
      attempts++;
    }

    if (!taskResult) {
      return Response.json({ 
        error: 'Task did not complete within 60 seconds',
        task_id: taskId
      }, { status: 408 });
    }

    // Parse JSON response
    let parsedResult;
    try {
      // Remove markdown code blocks if present
      let cleanedText = taskResult.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Manus response:', taskResult);
      return Response.json({ 
        error: 'Failed to parse AI response',
        rawResponse: taskResult 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      result: parsedResult,
      type,
      task_id: taskId
    });

  } catch (error) {
    console.error('Error in generateWithGemini:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});