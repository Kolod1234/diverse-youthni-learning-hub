import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulationId, action, nodeId, choiceText, points, pathTaken, choicesMade, duration, timestamp } = await req.json();

    const simulation = await base44.entities.InteractiveSimulation.get(simulationId);
    if (!simulation) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Map actions to xAPI verbs
    const verbMap = {
      'node_visited': {
        id: 'http://adlnet.gov/expapi/verbs/experienced',
        display: { 'en-US': 'experienced' }
      },
      'choice_made': {
        id: 'http://adlnet.gov/expapi/verbs/responded',
        display: { 'en-US': 'responded' }
      },
      'completed': {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: { 'en-US': 'completed' }
      }
    };

    const verb = verbMap[action] || verbMap['experienced'];

    // Build xAPI statement
    const statement = {
      actor: {
        objectType: 'Agent',
        name: user.full_name,
        mbox: `mailto:${user.email}`
      },
      verb: verb,
      object: {
        objectType: 'Activity',
        id: `simulation:${simulationId}${nodeId ? ':' + nodeId : ''}`,
        definition: {
          name: { 'en-US': simulation.title + (nodeId ? ` - ${nodeId}` : '') },
          type: 'http://adlnet.gov/expapi/activities/simulation',
          description: { 'en-US': simulation.description || '' }
        }
      },
      timestamp: timestamp || new Date().toISOString(),
      course_id: simulation.course_id,
      lesson_id: simulation.lesson_id
    };

    // Add result data based on action
    if (action === 'choice_made') {
      statement.result = {
        response: choiceText,
        score: points ? { raw: points } : undefined
      };
    }

    if (action === 'completed') {
      statement.result = {
        completion: true,
        success: true,
        score: { raw: points || 0 },
        duration: duration ? `PT${duration}S` : undefined,
        extensions: {
          'http://base44.io/expapi/path_taken': pathTaken,
          'http://base44.io/expapi/choices_made': choicesMade
        }
      };
    }

    // Create xAPI statement
    await base44.asServiceRole.entities.xAPIStatement.create(statement);

    // Update simulation interaction data
    const interactionData = simulation.interaction_data || {};
    const userInteractions = interactionData[user.email] || [];
    
    await base44.asServiceRole.entities.InteractiveSimulation.update(simulationId, {
      interaction_data: {
        ...interactionData,
        [user.email]: [
          ...userInteractions,
          {
            action,
            nodeId,
            choiceText,
            points,
            timestamp
          }
        ].slice(-100) // Keep last 100 interactions per user
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error tracking simulation interaction:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});