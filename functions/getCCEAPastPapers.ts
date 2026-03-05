import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getMsg(e) {
  return e && e['message'] ? e['message'] : String(e);
}

const CCEA_PAPERS = {
  mathematics: {
    name: 'Mathematics',
    gcse: {
      2024: [
        { title: 'GCSE Mathematics 2024 - Unit 1 Foundation', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2024-Summer/Standard/0/GCSE-Mathematics-480-Summer2024-Foundation%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Mathematics 2024 - Unit 2 Foundation', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2024-Summer/Standard/0/GCSE-Mathematics-480-Summer2024-Foundation%20Tier%2C%20Unit%202-Paper.pdf' },
        { title: 'GCSE Mathematics 2024 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2024-Summer/Standard/0/GCSE-Mathematics-480-Summer2024-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Mathematics 2024 - Unit 2 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2024-Summer/Standard/0/GCSE-Mathematics-480-Summer2024-Higher%20Tier%2C%20Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE Mathematics 2023 - Unit 1 Foundation', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2023-Summer/Standard/0/GCSE-Mathematics-480-Summer2023-Foundation%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Mathematics 2023 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2023-Summer/Standard/0/GCSE-Mathematics-480-Summer2023-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Mathematics AS1 2024 - Pure Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2024-Summer/Standard/0/GCE-Mathematics-Summer2024-AS%201%3A%20Pure%20Mathematics-Paper.pdf' },
        { title: 'A-Level Mathematics AS2 2024 - Applied Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2024-Summer/Standard/0/GCE-Mathematics-Summer2024-AS%202%3A%20Applied%20Mathematics-Paper.pdf' },
        { title: 'A-Level Mathematics A21 2024 - Pure Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2024-Summer/Standard/0/GCE-Mathematics-Summer2024-A2%201%3A%20Pure%20Mathematics-Paper.pdf' },
        { title: 'A-Level Mathematics A22 2024 - Applied Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2024-Summer/Standard/0/GCE-Mathematics-Summer2024-A2%202%3A%20Applied%20Mathematics-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level Mathematics AS1 2023 - Pure Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2023-Summer/Standard/0/GCE-Mathematics-Summer2023-AS%201%3A%20Pure%20Mathematics-Paper.pdf' },
        { title: 'A-Level Mathematics AS2 2023 - Applied Mathematics', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Mathematics/2023-Summer/Standard/0/GCE-Mathematics-Summer2023-AS%202%3A%20Applied%20Mathematics-Paper.pdf' },
      ],
    },
  },
  biology: {
    name: 'Biology',
    gcse: {
      2024: [
        { title: 'GCSE Biology 2024 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Biology%20%282017%29/2024-Summer/Standard/0/GCSE-Biology-540-Summer2024-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Biology 2024 - Unit 2 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Biology%20%282017%29/2024-Summer/Standard/0/GCSE-Biology-540-Summer2024-Higher%20Tier%2C%20Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE Biology 2023 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Biology%20%282017%29/2023-Summer/Standard/0/GCSE-Biology-540-Summer2023-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Biology AS1 2024 - Molecules and Cells', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2024-Summer/Standard/0/GCE-Biology-Summer2024-AS%201%3A%20Molecules%20and%20Cells-Paper.pdf' },
        { title: 'A-Level Biology AS2 2024 - Organisms and Biodiversity', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2024-Summer/Standard/0/GCE-Biology-Summer2024-AS%202%3A%20Organisms%20and%20Biodiversity-Paper.pdf' },
        { title: 'A-Level Biology A21 2024 - Physiology and Ecosystems', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2024-Summer/Standard/0/GCE-Biology-Summer2024-A2%201%3A%20Physiology%20and%20Ecosystems-Paper.pdf' },
        { title: 'A-Level Biology A22 2024 - Genetics Evolution Ecosystems', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2024-Summer/Standard/0/GCE-Biology-Summer2024-A2%202%3A%20Genetics%2C%20Evolution%20and%20Ecosystems-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level Biology AS1 2023 - Molecules and Cells', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2023-Summer/Standard/0/GCE-Biology-Summer2023-AS%201%3A%20Molecules%20and%20Cells-Paper.pdf' },
        { title: 'A-Level Biology AS2 2023 - Organisms and Biodiversity', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Biology/2023-Summer/Standard/0/GCE-Biology-Summer2023-AS%202%3A%20Organisms%20and%20Biodiversity-Paper.pdf' },
      ],
    },
  },
  chemistry: {
    name: 'Chemistry',
    gcse: {
      2024: [
        { title: 'GCSE Chemistry 2024 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Chemistry%20%282017%29/2024-Summer/Standard/0/GCSE-Chemistry-550-Summer2024-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Chemistry 2024 - Unit 2 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Chemistry%20%282017%29/2024-Summer/Standard/0/GCSE-Chemistry-550-Summer2024-Higher%20Tier%2C%20Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE Chemistry 2023 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Chemistry%20%282017%29/2023-Summer/Standard/0/GCSE-Chemistry-550-Summer2023-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Chemistry AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2024-Summer/Standard/0/GCE-Chemistry-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level Chemistry AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2024-Summer/Standard/0/GCE-Chemistry-Summer2024-AS%202-Paper.pdf' },
        { title: 'A-Level Chemistry A21 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2024-Summer/Standard/0/GCE-Chemistry-Summer2024-A2%201-Paper.pdf' },
        { title: 'A-Level Chemistry A22 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2024-Summer/Standard/0/GCE-Chemistry-Summer2024-A2%202-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level Chemistry AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2023-Summer/Standard/0/GCE-Chemistry-Summer2023-AS%201-Paper.pdf' },
        { title: 'A-Level Chemistry AS2 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Chemistry/2023-Summer/Standard/0/GCE-Chemistry-Summer2023-AS%202-Paper.pdf' },
      ],
    },
  },
  physics: {
    name: 'Physics',
    gcse: {
      2024: [
        { title: 'GCSE Physics 2024 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Physics%20%282017%29/2024-Summer/Standard/0/GCSE-Physics-575-Summer2024-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
        { title: 'GCSE Physics 2024 - Unit 2 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Physics%20%282017%29/2024-Summer/Standard/0/GCSE-Physics-575-Summer2024-Higher%20Tier%2C%20Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE Physics 2023 - Unit 1 Higher', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Physics%20%282017%29/2023-Summer/Standard/0/GCSE-Physics-575-Summer2023-Higher%20Tier%2C%20Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Physics AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Physics/2024-Summer/Standard/0/GCE-Physics-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level Physics AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Physics/2024-Summer/Standard/0/GCE-Physics-Summer2024-AS%202-Paper.pdf' },
        { title: 'A-Level Physics A21 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Physics/2024-Summer/Standard/0/GCE-Physics-Summer2024-A2%201-Paper.pdf' },
        { title: 'A-Level Physics A22 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Physics/2024-Summer/Standard/0/GCE-Physics-Summer2024-A2%202-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level Physics AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Physics/2023-Summer/Standard/0/GCE-Physics-Summer2023-AS%201-Paper.pdf' },
      ],
    },
  },
  history: {
    name: 'History',
    gcse: {
      2024: [
        { title: 'GCSE History 2024 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20History%20%282017%29/2024-Summer/Standard/0/GCSE-History-Summer2024-Unit%201-Paper.pdf' },
        { title: 'GCSE History 2024 - Unit 2', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20History%20%282017%29/2024-Summer/Standard/0/GCSE-History-Summer2024-Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE History 2023 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20History%20%282017%29/2023-Summer/Standard/0/GCSE-History-Summer2023-Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level History AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20History/2024-Summer/Standard/0/GCE-History-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level History AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20History/2024-Summer/Standard/0/GCE-History-Summer2024-AS%202-Paper.pdf' },
        { title: 'A-Level History A21 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20History/2024-Summer/Standard/0/GCE-History-Summer2024-A2%201-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level History AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20History/2023-Summer/Standard/0/GCE-History-Summer2023-AS%201-Paper.pdf' },
      ],
    },
  },
  english_language: {
    name: 'English Language',
    gcse: {
      2024: [
        { title: 'GCSE English Language 2024 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20Language%20%282017%29/2024-Summer/Standard/0/GCSE-English%20Language-Summer2024-Unit%201-Paper.pdf' },
        { title: 'GCSE English Language 2024 - Unit 2', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20Language%20%282017%29/2024-Summer/Standard/0/GCSE-English%20Language-Summer2024-Unit%202-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE English Language 2023 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20Language%20%282017%29/2023-Summer/Standard/0/GCSE-English%20Language-Summer2023-Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level English Language AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Language/2024-Summer/Standard/0/GCE-English%20Language-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level English Language AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Language/2024-Summer/Standard/0/GCE-English%20Language-Summer2024-AS%202-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level English Language AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Language/2023-Summer/Standard/0/GCE-English%20Language-Summer2023-AS%201-Paper.pdf' },
      ],
    },
  },
  english_literature: {
    name: 'English Literature',
    gcse: {
      2024: [
        { title: 'GCSE English Literature 2024 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20Literature%20%282017%29/2024-Summer/Standard/0/GCSE-English%20Literature-Summer2024-Unit%201-Paper.pdf' },
      ],
      2023: [
        { title: 'GCSE English Literature 2023 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20English%20Literature%20%282017%29/2023-Summer/Standard/0/GCSE-English%20Literature-Summer2023-Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level English Literature AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Literature/2024-Summer/Standard/0/GCE-English%20Literature-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level English Literature AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Literature/2024-Summer/Standard/0/GCE-English%20Literature-Summer2024-AS%202-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level English Literature AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20English%20Literature/2023-Summer/Standard/0/GCE-English%20Literature-Summer2023-AS%201-Paper.pdf' },
      ],
    },
  },
  geography: {
    name: 'Geography',
    gcse: {
      2024: [
        { title: 'GCSE Geography 2024 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Geography%20%282017%29/2024-Summer/Standard/0/GCSE-Geography-Summer2024-Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Geography AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Geography/2024-Summer/Standard/0/GCE-Geography-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level Geography A21 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Geography/2024-Summer/Standard/0/GCE-Geography-Summer2024-A2%201-Paper.pdf' },
      ],
    },
  },
  business_studies: {
    name: 'Business Studies',
    gcse: {
      2024: [
        { title: 'GCSE Business Studies 2024 - Unit 1', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Business%20Studies%20%282017%29/2024-Summer/Standard/0/GCSE-Business%20Studies-Summer2024-Unit%201-Paper.pdf' },
      ],
    },
    alevel: {
      2024: [
        { title: 'A-Level Business Studies AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Business%20Studies/2024-Summer/Standard/0/GCE-Business%20Studies-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level Business Studies AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Business%20Studies/2024-Summer/Standard/0/GCE-Business%20Studies-Summer2024-AS%202-Paper.pdf' },
      ],
    },
  },
  economics: {
    name: 'Economics',
    alevel: {
      2024: [
        { title: 'A-Level Economics AS1 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Economics/2024-Summer/Standard/0/GCE-Economics-Summer2024-AS%201-Paper.pdf' },
        { title: 'A-Level Economics AS2 2024', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Economics/2024-Summer/Standard/0/GCE-Economics-Summer2024-AS%202-Paper.pdf' },
      ],
      2023: [
        { title: 'A-Level Economics AS1 2023', url: 'https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCE/GCE%20Economics/2023-Summer/Standard/0/GCE-Economics-Summer2023-AS%201-Paper.pdf' },
      ],
    },
  },
};

const KEYWORD_MAP = [
  { keywords: ['math'], key: 'mathematics' },
  { keywords: ['biology', 'bio'], key: 'biology' },
  { keywords: ['chemistry', 'chem'], key: 'chemistry' },
  { keywords: ['physics'], key: 'physics' },
  { keywords: ['history'], key: 'history' },
  { keywords: ['english language'], key: 'english_language' },
  { keywords: ['english literature', 'english lit'], key: 'english_literature' },
  { keywords: ['geography', 'geo'], key: 'geography' },
  { keywords: ['business'], key: 'business_studies' },
  { keywords: ['economics', 'econ'], key: 'economics' },
];

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const category = (body['category'] || '').toLowerCase();
    const qualType = (body['qualification_type'] || 'alevel').toLowerCase();
    const year = parseInt(body['year'] || '2024');
    const courseTitle = (body['course_title'] || '').toLowerCase();

    const searchStr = category + ' ' + courseTitle;

    let paperKey = null;
    for (const entry of KEYWORD_MAP) {
      for (const kw of entry.keywords) {
        if (searchStr.includes(kw)) {
          paperKey = entry.key;
          break;
        }
      }
      if (paperKey) break;
    }

    const subjectData = paperKey ? CCEA_PAPERS[paperKey] : null;

    if (!subjectData) {
      return Response.json({
        success: false,
        message: 'No CCEA past papers found for this subject. Try visiting [ccea.org](https://ccea.org).uk directly.',
        ccea_url: 'https://ccea.org.uk/past-papers-mark-schemes',
      });
    }

    const levelKey = qualType === 'gcse' ? 'gcse' : 'alevel';
    const yearPapers = subjectData[levelKey] && subjectData[levelKey][year] ? subjectData[levelKey][year] : null;

    if (!yearPapers || yearPapers.length === 0) {
      return Response.json({
        success: false,
        message: 'No papers found for ' + year + '. Try a different year or visit [ccea.org](https://ccea.org).uk directly.',
        ccea_url: 'https://ccea.org.uk/past-papers-mark-schemes',
      });
    }

    return Response.json({
      success: true,
      subject: subjectData['name'],
      year: year,
      qualification: qualType.toUpperCase(),
      papers: yearPapers,
    });

  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
});