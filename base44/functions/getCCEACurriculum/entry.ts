import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hardcoded list of CCEA subjects with their past papers URLs
    const subjects = [
      // GCSE Subjects
      { name: 'GCSE Art and Design', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-art-and-design/past-papers' },
      { name: 'GCSE Biology', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-biology-2017/past-papers-mark-schemes/archived-past-papers-mark-schemes' },
      { name: 'GCSE Business Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-business-studies/past-papers' },
      { name: 'GCSE Chemistry', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-chemistry/past-papers' },
      { name: 'GCSE Computer Science', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-computer-science/past-papers' },
      { name: 'GCSE Digital Technology', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-digital-technology/past-papers' },
      { name: 'GCSE Drama', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-drama/past-papers' },
      { name: 'GCSE English Language', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-english-language/past-papers' },
      { name: 'GCSE English Literature', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-english-literature/past-papers' },
      { name: 'GCSE French', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-french/past-papers' },
      { name: 'GCSE Geography', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-geography/past-papers' },
      { name: 'GCSE German', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-german/past-papers' },
      { name: 'GCSE History', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-history/past-papers' },
      { name: 'GCSE Home Economics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-home-economics/past-papers' },
      { name: 'GCSE Irish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-irish/past-papers' },
      { name: 'GCSE Journalism', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-journalism/past-papers' },
      { name: 'GCSE Learning for Life and Work', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-learning-life-and-work/past-papers' },
      { name: 'GCSE Mathematics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics/past-papers' },
      { name: 'GCSE Motor Vehicle and Road User Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-motor-vehicle-and-road-user-studies/past-papers' },
      { name: 'GCSE Moving Image Arts', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-moving-image-arts/past-papers' },
      { name: 'GCSE Music', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-music/past-papers' },
      { name: 'GCSE Performing Arts', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-performing-arts/past-papers' },
      { name: 'GCSE Physical Education', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-physical-education/past-papers' },
      { name: 'GCSE Physics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-physics/past-papers' },
      { name: 'GCSE Polish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-polish/past-papers' },
      { name: 'GCSE Portuguese', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-portuguese/past-papers' },
      { name: 'GCSE Prince\'s Trust', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-princes-trust/past-papers' },
      { name: 'GCSE Religious Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-religious-studies/past-papers' },
      { name: 'GCSE Science: Double Award', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award/past-papers' },
      { name: 'GCSE Science: Single Award', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-single-award/past-papers' },
      { name: 'GCSE Spanish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-spanish/past-papers' },
      { name: 'GCSE Technology and Design', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-technology-and-design/past-papers' },
      
      // GCE A-Level Subjects
      { name: 'GCE Applied Art and Design', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-applied-art-and-design' },
      { name: 'GCE Applied Business', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-applied-business' },
      { name: 'GCE Applied Science', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-applied-science' },
      { name: 'GCE Art and Design', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-art-and-design-2017' },
      { name: 'GCE Biology', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-biology-2016' },
      { name: 'GCE Business Studies', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-business-studies-2016' },
      { name: 'GCE Chemistry', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-chemistry-2016' },
      { name: 'GCE Digital Technology', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-digital-technology-2016' },
      { name: 'GCE English Language and Literature', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-english-language-and-literature-2015' },
      { name: 'GCE English Literature', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-english-literature-2016' },
      { name: 'GCE Environmental Technology', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-environmental-technology-2016' },
      { name: 'GCE Further Mathematics', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-further-mathematics-2018' },
      { name: 'GCE Geography', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-geography-2016' },
      { name: 'GCE Government and Politics', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-government-and-politics-2016' },
      { name: 'GCE Health and Social Care', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-health-and-social-care' },
      { name: 'GCE History', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-history-2016' },
      { name: 'GCE Life and Health Sciences', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-life-and-health-sciences' },
      { name: 'GCE Mathematics', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-mathematics-2018' },
      { name: 'GCE Moving Image Arts', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-moving-image-arts-2016' },
      { name: 'GCE Music', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-music-2016' },
      { name: 'GCE Music Technology', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-music-technology-2016' },
      { name: 'GCE Nutrition and Food Science', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-nutrition-and-food-science-2016' },
      { name: 'GCE Performing Arts', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-performing-arts' },
      { name: 'GCE Physical Education', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-physical-education-2016' },
      { name: 'GCE Physics', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-physics-2016' },
      { name: 'GCE Religious Studies', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-religious-studies-2016' },
      { name: 'GCE Sociology', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-sociology-2016' },
      { name: 'GCE Software Systems Development', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-software-systems-development-2016' },
      { name: 'GCE Technology and Design', url: 'https://ccea.org.uk/post-16/gce/subjects/gce-technology-and-design-2016' }
    ];

    return Response.json({ subjects });
    
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return Response.json({ 
      error: error.message,
      subjects: []
    }, { status: 500 });
  }
});