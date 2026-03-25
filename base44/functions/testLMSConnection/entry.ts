import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { integrationId } = await req.json();

    const integration = await base44.entities.LMSIntegration.get(integrationId);
    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Test connection based on provider
    let testResult = { success: false, error: null, details: {} };

    try {
      switch (integration.provider) {
        case 'moodle':
          testResult = await testMoodleConnection(integration);
          break;
        case 'canvas':
          testResult = await testCanvasConnection(integration);
          break;
        case 'blackboard':
          testResult = await testBlackboardConnection(integration);
          break;
        case 'custom_lrs':
          testResult = await testLRSConnection(integration);
          break;
        default:
          testResult = { success: false, error: 'Provider not supported for testing' };
      }
    } catch (error) {
      testResult = { success: false, error: error.message };
    }

    // Update integration with test result
    await base44.asServiceRole.entities.LMSIntegration.update(integrationId, {
      last_sync_date: new Date().toISOString(),
      last_sync_status: testResult.success ? 'success' : 'failed'
    });

    return Response.json(testResult);
  } catch (error) {
    console.error('Error testing LMS connection:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

async function testMoodleConnection(integration) {
  const { endpoint_url, credentials } = integration;
  const apiKey = credentials.api_key;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  // Test Moodle Web Services API
  const testUrl = `${endpoint_url}/webservice/rest/server.php?wstoken=${apiKey}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`;

  const response = await fetch(testUrl);
  const data = await response.json();

  if (data.errorcode) {
    return { success: false, error: data.message || 'Moodle API error' };
  }

  return {
    success: true,
    details: {
      sitename: data.sitename,
      version: data.release,
      username: data.username
    }
  };
}

async function testCanvasConnection(integration) {
  const { endpoint_url, credentials } = integration;
  const apiKey = credentials.api_key;

  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  // Test Canvas API
  const response = await fetch(`${endpoint_url}/api/v1/users/self`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Canvas API error: ${error}` };
  }

  const data = await response.json();

  return {
    success: true,
    details: {
      username: data.name,
      user_id: data.id
    }
  };
}

async function testBlackboardConnection(integration) {
  const { endpoint_url, credentials } = integration;
  const { api_key, api_secret } = credentials;

  if (!api_key || !api_secret) {
    return { success: false, error: 'API credentials not configured' };
  }

  // Blackboard requires OAuth token exchange - simplified test
  const response = await fetch(`${endpoint_url}/learn/api/public/v1/system/version`, {
    headers: {
      'Authorization': `Bearer ${api_key}`
    }
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to connect to Blackboard API' };
  }

  const data = await response.json();

  return {
    success: true,
    details: {
      version: data.learn?.major + '.' + data.learn?.minor
    }
  };
}

async function testLRSConnection(integration) {
  const { endpoint_url, credentials } = integration;
  const { username, password } = credentials;

  if (!username || !password) {
    return { success: false, error: 'LRS credentials not configured' };
  }

  // Test xAPI LRS with about endpoint
  const auth = btoa(`${username}:${password}`);
  const response = await fetch(`${endpoint_url}/about`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'X-Experience-API-Version': '1.0.3'
    }
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to connect to LRS' };
  }

  const data = await response.json();

  return {
    success: true,
    details: {
      version: data.version
    }
  };
}