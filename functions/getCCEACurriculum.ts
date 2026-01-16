import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hardcoded list of CCEA GCSE subjects with their past papers URLs
    const subjects = [
      { name: 'Art and Design', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-art-and-design/past-papers' },
      { name: 'Biology', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-biology/past-papers' },
      { name: 'Business Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-business-studies/past-papers' },
      { name: 'Chemistry', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-chemistry/past-papers' },
      { name: 'Computer Science', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-computer-science/past-papers' },
      { name: 'Digital Technology', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-digital-technology/past-papers' },
      { name: 'Drama', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-drama/past-papers' },
      { name: 'English Language', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-english-language/past-papers' },
      { name: 'English Literature', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-english-literature/past-papers' },
      { name: 'French', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-french/past-papers' },
      { name: 'Geography', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-geography/past-papers' },
      { name: 'German', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-german/past-papers' },
      { name: 'History', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-history/past-papers' },
      { name: 'Home Economics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-home-economics/past-papers' },
      { name: 'Irish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-irish/past-papers' },
      { name: 'Journalism', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-journalism/past-papers' },
      { name: 'Learning for Life and Work', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-learning-life-and-work/past-papers' },
      { name: 'Mathematics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics/past-papers' },
      { name: 'Motor Vehicle and Road User Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-motor-vehicle-and-road-user-studies/past-papers' },
      { name: 'Moving Image Arts', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-moving-image-arts/past-papers' },
      { name: 'Music', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-music/past-papers' },
      { name: 'Performing Arts', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-performing-arts/past-papers' },
      { name: 'Physical Education', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-physical-education/past-papers' },
      { name: 'Physics', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-physics/past-papers' },
      { name: 'Polish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-polish/past-papers' },
      { name: 'Portuguese', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-portuguese/past-papers' },
      { name: 'Prince\'s Trust', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-princes-trust/past-papers' },
      { name: 'Religious Studies', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-religious-studies/past-papers' },
      { name: 'Science: Double Award', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award/past-papers' },
      { name: 'Science: Single Award', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-single-award/past-papers' },
      { name: 'Spanish', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-spanish/past-papers' },
      { name: 'Technology and Design', url: 'https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-technology-and-design/past-papers' }
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