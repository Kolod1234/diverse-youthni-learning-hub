import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageUrl, courseId, lessonId } = await req.json();
    const validationReport = {
      isValid: true,
      errors: [],
      warnings: [],
      info: []
    };

    // Download SCORM package
    const response = await fetch(packageUrl);
    if (!response.ok) {
      throw new Error('Failed to download SCORM package');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Extract ZIP
    const zip = new JSZip();
    let zipData;
    try {
      zipData = await zip.loadAsync(arrayBuffer);
    } catch (error) {
      validationReport.isValid = false;
      validationReport.errors.push('Invalid ZIP file format');
      return Response.json({ success: false, validationReport }, { status: 400 });
    }

    // Find and parse imsmanifest.xml
    const manifestFile = zipData.file('imsmanifest.xml');
    if (!manifestFile) {
      validationReport.isValid = false;
      validationReport.errors.push('Missing imsmanifest.xml file - this is not a valid SCORM package');
      return Response.json({ success: false, validationReport }, { status: 400 });
    }

    const manifestXml = await manifestFile.async('text');
    
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifestXml, 'text/xml');
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      validationReport.isValid = false;
      validationReport.errors.push('Invalid XML in imsmanifest.xml: ' + parserError.textContent);
      return Response.json({ success: false, validationReport }, { status: 400 });
    }

    // Detect SCORM version
    const schemaversion = xmlDoc.querySelector('schemaversion')?.textContent;
    let scormVersion = '1.2';
    
    if (schemaversion) {
      if (schemaversion.includes('1.2')) {
        scormVersion = '1.2';
        validationReport.info.push('Detected SCORM 1.2 package');
      } else if (schemaversion.includes('2004')) {
        scormVersion = '2004';
        validationReport.info.push('Detected SCORM 2004 package');
      } else {
        validationReport.warnings.push(`Unknown SCORM version: ${schemaversion}, defaulting to 1.2`);
      }
    } else {
      validationReport.warnings.push('SCORM version not specified, assuming 1.2');
    }

    // Extract metadata
    const metadata = xmlDoc.querySelector('metadata');
    const title = metadata?.querySelector('title')?.textContent || 
                  xmlDoc.querySelector('organization')?.getAttribute('title') ||
                  'SCORM Content';
    
    const description = metadata?.querySelector('description')?.textContent || '';

    // Find resources
    const resources = xmlDoc.querySelectorAll('resource');
    if (resources.length === 0) {
      validationReport.isValid = false;
      validationReport.errors.push('No resources found in manifest');
      return Response.json({ success: false, validationReport }, { status: 400 });
    }

    // Find launch file
    let launchFile = null;
    let scormType = null;
    
    for (const resource of resources) {
      const type = resource.getAttribute('type') || resource.getAttribute('adlcp:scormtype');
      if (type && type.toLowerCase().includes('sco')) {
        launchFile = resource.getAttribute('href');
        scormType = type;
        break;
      }
    }

    if (!launchFile) {
      // Fallback: use first resource
      launchFile = resources[0].getAttribute('href');
      validationReport.warnings.push('No SCO resource found, using first resource as launch file');
    }

    // Validate launch file exists
    const launchFileExists = zipData.file(launchFile);
    if (!launchFileExists) {
      validationReport.isValid = false;
      validationReport.errors.push(`Launch file not found in package: ${launchFile}`);
      return Response.json({ success: false, validationReport }, { status: 400 });
    }

    validationReport.info.push(`Launch file: ${launchFile}`);

    // Check for required files
    const requiredFiles = ['imsmanifest.xml', launchFile];
    for (const file of requiredFiles) {
      if (!zipData.file(file)) {
        validationReport.errors.push(`Required file missing: ${file}`);
        validationReport.isValid = false;
      }
    }

    // Extract mastery score
    let masteryScore = null;
    const masteryScoreNode = xmlDoc.querySelector('masteryscore');
    if (masteryScoreNode) {
      masteryScore = parseFloat(masteryScoreNode.textContent);
      validationReport.info.push(`Mastery score: ${masteryScore}`);
    }

    // Check for completion threshold
    const completionThreshold = xmlDoc.querySelector('completionThreshold')?.textContent;
    if (completionThreshold) {
      validationReport.info.push(`Completion threshold: ${completionThreshold}`);
    }

    // Validate organizations
    const organizations = xmlDoc.querySelectorAll('organization');
    if (organizations.length === 0) {
      validationReport.warnings.push('No organizations found in manifest');
    } else {
      validationReport.info.push(`Found ${organizations.length} organization(s)`);
    }

    // Final validation check
    if (validationReport.errors.length > 0) {
      validationReport.isValid = false;
    }

    // If valid, create SCORM package record
    if (validationReport.isValid) {
      const extractedUrl = packageUrl.replace('.zip', '');
      const launchUrl = `${extractedUrl}/${launchFile}`;

      const scormPackage = await base44.asServiceRole.entities.SCORMPackage.create({
        course_id: courseId,
        lesson_id: lessonId,
        title: title,
        description: description,
        package_url: packageUrl,
        scorm_version: scormVersion,
        launch_url: launchUrl,
        manifest_xml: manifestXml,
        mastery_score: masteryScore,
        completion_threshold: completionThreshold ? parseFloat(completionThreshold) : null,
        is_published: true
      });

      // Track xAPI statement
      await base44.asServiceRole.entities.xAPIStatement.create({
        actor: {
          objectType: 'Agent',
          name: user.full_name,
          mbox: `mailto:${user.email}`
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/uploaded',
          display: { 'en-US': 'uploaded' }
        },
        object: {
          objectType: 'Activity',
          id: scormPackage.id,
          definition: {
            name: { 'en-US': title },
            type: 'http://adlnet.gov/expapi/activities/module'
          }
        },
        timestamp: new Date().toISOString(),
        course_id: courseId,
        lesson_id: lessonId
      });

      return Response.json({
        success: true,
        packageId: scormPackage.id,
        title: title,
        description: description,
        scorm_version: scormVersion,
        launch_url: launchUrl,
        mastery_score: masteryScore,
        validationReport
      });
    } else {
      return Response.json({ 
        success: false, 
        validationReport 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing SCORM package:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      validationReport: {
        isValid: false,
        errors: [error.message],
        warnings: [],
        info: []
      }
    }, { status: 500 });
  }
});