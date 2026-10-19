import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Partner-system credentials are kept in Base44 Secrets, not in the LMSIntegration table
// (every signed-in user could read that table). Secret names: LMS_<integrationId>_<KEY>,
// e.g. LMS_6650ab12cd_API_KEY.
const CREDENTIAL_KEYS = ['api_key', 'api_secret', 'username', 'password', 'access_token', 'auth_header'];
function credentialsFromSecrets(integrationId) {
  const creds = {};
  for (const key of CREDENTIAL_KEYS) {
    const value = Deno.env.get(`LMS_${integrationId}_${key.toUpperCase()}`);
    if (value) creds[key] = value;
  }
  return creds;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { integrationId } = await req.json();

    const integration = await base44.entities.LMSIntegration.get(integrationId);
    integration.credentials = credentialsFromSecrets(integration.id);

    if (!integration.sync_enabled) {
      return Response.json({ error: 'Sync not enabled' }, { status: 400 });
    }

    const syncResults = {
      users_synced: 0,
      progress_synced: 0,
      errors: []
    };

    try {
      // Fetch data based on provider
      if (integration.provider === 'moodle') {
        await syncMoodleData(base44, integration, syncResults);
      } else if (integration.provider === 'canvas') {
        await syncCanvasData(base44, integration, syncResults);
      } else if (integration.provider === 'workday' || integration.provider === 'successfactors') {
        await syncHRISData(base44, integration, syncResults);
      }

      // Update sync status
      await base44.entities.LMSIntegration.update(integrationId, {
        last_sync_date: new Date().toISOString(),
        last_sync_status: syncResults.errors.length > 0 ? 'partial' : 'success',
        sync_log: [
          ...(integration.sync_log || []),
          {
            timestamp: new Date().toISOString(),
            status: syncResults.errors.length > 0 ? 'partial' : 'success',
            records_synced: syncResults.users_synced + syncResults.progress_synced,
            errors: syncResults.errors
          }
        ].slice(-10) // Keep last 10 logs
      });

      return Response.json({ success: true, ...syncResults });
    } catch (error) {
      syncResults.errors.push(error.message);
      
      await base44.entities.LMSIntegration.update(integrationId, {
        last_sync_date: new Date().toISOString(),
        last_sync_status: 'failed',
        sync_log: [
          ...(integration.sync_log || []),
          {
            timestamp: new Date().toISOString(),
            status: 'failed',
            records_synced: 0,
            errors: syncResults.errors
          }
        ].slice(-10)
      });

      return Response.json({ success: false, ...syncResults }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing LMS data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncMoodleData(base44, integration, results) {
  const response = await fetch(`${integration.endpoint_url}/webservice/rest/server.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      wstoken: integration.credentials.api_key,
      wsfunction: 'core_enrol_get_enrolled_users',
      moodlewsrestformat: 'json'
    })
  });

  const users = await response.json();
  
  for (const user of users) {
    try {
      // Map Moodle user to platform
      const mappedData = applyDataMappings(user, integration.data_mappings);
      
      // Sync user data
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email: user.email });
      if (existingUsers.length > 0) {
        // Update user progress based on Moodle data
        results.users_synced++;
      }
    } catch (error) {
      results.errors.push(`Failed to sync user ${user.email}: ${error.message}`);
    }
  }
}

async function syncCanvasData(base44, integration, results) {
  const response = await fetch(`${integration.endpoint_url}/api/v1/courses`, {
    headers: {
      'Authorization': `Bearer ${integration.credentials.access_token}`
    }
  });

  const courses = await response.json();
  
  for (const course of courses) {
    try {
      const mappedData = applyDataMappings(course, integration.data_mappings);
      results.progress_synced++;
    } catch (error) {
      results.errors.push(`Failed to sync course ${course.id}: ${error.message}`);
    }
  }
}

async function syncHRISData(base44, integration, results) {
  // Sync employee data for user provisioning
  const response = await fetch(`${integration.endpoint_url}/employees`, {
    headers: {
      'Authorization': integration.credentials.auth_header || `Bearer ${integration.credentials.access_token}`
    }
  });

  const employees = await response.json();
  
  for (const employee of employees.data || employees) {
    try {
      const mappedData = applyDataMappings(employee, integration.data_mappings);
      
      // Create or update user
      const existingUsers = await base44.asServiceRole.entities.User.filter({ 
        email: mappedData.email 
      });
      
      if (existingUsers.length === 0) {
        // Invite new user
        await base44.asServiceRole.users.inviteUser(mappedData.email, 'user');
        results.users_synced++;
      }
    } catch (error) {
      results.errors.push(`Failed to sync employee ${employee.email}: ${error.message}`);
    }
  }
}

function applyDataMappings(sourceData, mappings) {
  const result = {};
  
  for (const mapping of mappings || []) {
    const sourceValue = sourceData[mapping.source_field];
    
    // Apply transformation if specified
    let transformedValue = sourceValue;
    if (mapping.transformation) {
      // Simple transformations
      if (mapping.transformation === 'lowercase') {
        transformedValue = sourceValue?.toLowerCase();
      } else if (mapping.transformation === 'uppercase') {
        transformedValue = sourceValue?.toUpperCase();
      }
    }
    
    result[mapping.target_field] = transformedValue;
  }
  
  return result;
}