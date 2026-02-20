import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verb, objectId, objectName, result, courseId, lessonId, contextData } = await req.json();

    // Create xAPI statement
    const statement = {
      actor: {
        objectType: 'Agent',
        name: user.full_name,
        mbox: `mailto:${user.email}`
      },
      verb: {
        id: `http://adlnet.gov/expapi/verbs/${verb}`,
        display: { 'en-US': verb }
      },
      object: {
        objectType: 'Activity',
        id: objectId,
        definition: {
          name: { 'en-US': objectName },
          type: 'http://adlnet.gov/expapi/activities/lesson'
        }
      },
      result: result || {},
      context: contextData || {},
      timestamp: new Date().toISOString(),
      course_id: courseId,
      lesson_id: lessonId,
      synced_to_lrs: false
    };

    // Save to database
    const saved = await base44.asServiceRole.entities.xAPIStatement.create(statement);

    // Try to sync to external LRS if configured
    try {
      const integrations = await base44.asServiceRole.entities.LMSIntegration.filter({
        integration_type: 'lrs',
        is_active: true,
        sync_enabled: true
      });

      for (const integration of integrations) {
        if (integration.endpoint_url && integration.credentials) {
          await fetch(integration.endpoint_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': integration.credentials.auth_header || '',
              'X-Experience-API-Version': '1.0.3'
            },
            body: JSON.stringify(statement)
          });

          await base44.asServiceRole.entities.xAPIStatement.update(saved.id, {
            synced_to_lrs: true
          });
        }
      }
    } catch (lrsError) {
      console.error('Failed to sync to LRS:', lrsError);
    }

    return Response.json({ success: true, statementId: saved.id });
  } catch (error) {
    console.error('Error tracking xAPI statement:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});