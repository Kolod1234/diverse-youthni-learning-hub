import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: 'digital_technology'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getDigitalTechnologyAS() : getDigitalTechnologyA2();
        
        if (!lessons || lessons.length === 0) {
          results.push({ course: course.title, status: 'no data' });
          continue;
        }

        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        await base44.entities.Lesson.bulkCreate(lessons.map(l => ({
          course_id: course.id,
          title: l.t,
          description: l.d,
          section: l.s,
          order: l.o,
          learning_objectives: l.obj || [],
          content_type: 'richtext',
          slides: [],
          is_preview: l.o <= 3,
          duration_minutes: 50
        })));

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({ course: course.title, lessons: lessons.length, status: 'success' });
        await new Promise(r => setTimeout(r, 6000));

      } catch (error) {
        results.push({ course: course.title, status: 'error', error: error.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDigitalTechnologyAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Computer Systems
  
  // 1.1 Hardware and Software (10 lessons)
  lessons.push(
    { s: 'AS1: Hardware Software', o: o++, t: 'Computer Architecture', d: 'Von Neumann architecture', obj: ['Describe CPU components', 'Explain fetch-decode-execute cycle', 'Understand stored program concept'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'CPU Components', d: 'ALU control unit registers', obj: ['Explain ALU function', 'Describe control unit role', 'Understand register types'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Memory Types', d: 'RAM ROM cache', obj: ['Compare volatile non-volatile memory', 'Explain cache hierarchy', 'Understand memory management'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Storage Devices', d: 'HDD SSD optical cloud', obj: ['Compare storage technologies', 'Explain capacity speed cost', 'Assess suitability for different purposes'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Input Output Devices', d: 'Peripherals and interfaces', obj: ['Identify input devices', 'Describe output devices', 'Understand device interfaces'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Operating Systems', d: 'OS functions and types', obj: ['Explain OS purpose', 'Describe memory management', 'Understand file management'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'System Software', d: 'Utilities compilers interpreters', obj: ['Explain utility software', 'Compare compilers interpreters', 'Understand assemblers'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Application Software', d: 'General and specific purpose', obj: ['Compare application types', 'Explain bespoke vs off-shelf', 'Assess software selection'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Boolean Logic', d: 'Logic gates and circuits', obj: ['Describe AND OR NOT gates', 'Construct truth tables', 'Design simple circuits'] },
    { s: 'AS1: Hardware Software', o: o++, t: 'Number Systems', d: 'Binary hexadecimal conversion', obj: ['Convert between number systems', 'Explain binary arithmetic', 'Understand hexadecimal use'] }
  );
  
  // 1.2 Data Representation (8 lessons)
  lessons.push(
    { s: 'AS1: Data Representation', o: o++, t: 'Binary Data', d: 'Bits bytes and binary', obj: ['Explain bit byte kilobyte', 'Convert decimal to binary', 'Understand binary place value'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Character Encoding', d: 'ASCII Unicode', obj: ['Explain ASCII character set', 'Describe Unicode UTF-8', 'Understand character representation'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Image Representation', d: 'Bitmap and vector graphics', obj: ['Explain pixel resolution', 'Describe bitmap vs vector', 'Calculate image file sizes'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Sound Representation', d: 'Digital audio', obj: ['Explain sampling rate depth', 'Calculate audio file size', 'Understand digitization'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Video Representation', d: 'Moving images', obj: ['Explain frame rate', 'Calculate video file size', 'Understand compression'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Data Compression', d: 'Lossy and lossless', obj: ['Compare compression types', 'Explain RLE Huffman', 'Assess compression suitability'] },
    { s: 'AS1: Data Representation', o: o++, t: 'File Formats', d: 'Common file types', obj: ['Identify file extensions', 'Explain format purposes', 'Understand format selection'] },
    { s: 'AS1: Data Representation', o: o++, t: 'Data Types', d: 'Integer real Boolean string', obj: ['Define primitive data types', 'Explain type selection', 'Understand type conversion'] }
  );
  
  // 1.3 Programming Fundamentals (12 lessons)
  lessons.push(
    { s: 'AS1: Programming', o: o++, t: 'Programming Concepts', d: 'Variables constants operators', obj: ['Declare variables', 'Use arithmetic operators', 'Understand assignment'] },
    { s: 'AS1: Programming', o: o++, t: 'Selection Statements', d: 'IF statements', obj: ['Write IF-THEN-ELSE', 'Use nested IF statements', 'Apply logical operators'] },
    { s: 'AS1: Programming', o: o++, t: 'Iteration', d: 'Loops and repetition', obj: ['Write FOR loops', 'Use WHILE loops', 'Apply REPEAT-UNTIL'] },
    { s: 'AS1: Programming', o: o++, t: 'Arrays', d: 'One-dimensional arrays', obj: ['Declare and initialize arrays', 'Access array elements', 'Traverse arrays'] },
    { s: 'AS1: Programming', o: o++, t: 'String Manipulation', d: 'String operations', obj: ['Concatenate strings', 'Extract substrings', 'Search within strings'] },
    { s: 'AS1: Programming', o: o++, t: 'Procedures and Functions', d: 'Subroutines', obj: ['Define procedures', 'Create functions with return values', 'Understand parameters'] },
    { s: 'AS1: Programming', o: o++, t: 'File Handling', d: 'Reading and writing files', obj: ['Open close files', 'Read from text files', 'Write to files'] },
    { s: 'AS1: Programming', o: o++, t: 'Input Validation', d: 'Checking user input', obj: ['Validate data types', 'Check range limits', 'Handle invalid input'] },
    { s: 'AS1: Programming', o: o++, t: 'Algorithm Design', d: 'Problem solving', obj: ['Decompose problems', 'Design algorithms', 'Use pseudocode'] },
    { s: 'AS1: Programming', o: o++, t: 'Flowcharts', d: 'Visual algorithm representation', obj: ['Draw flowcharts', 'Use standard symbols', 'Represent algorithms visually'] },
    { s: 'AS1: Programming', o: o++, t: 'Testing', d: 'Test planning and execution', obj: ['Design test plans', 'Use normal boundary erroneous data', 'Document test results'] },
    { s: 'AS1: Programming', o: o++, t: 'Debugging', d: 'Finding and fixing errors', obj: ['Identify syntax errors', 'Fix logical errors', 'Use debugging techniques'] }
  );
  
  // AS2: Networks and Web Technologies
  
  // 2.1 Networks (10 lessons)
  lessons.push(
    { s: 'AS2: Networks', o: o++, t: 'Network Types', d: 'LAN WAN PAN', obj: ['Define LAN WAN', 'Compare network types', 'Understand network characteristics'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Topologies', d: 'Bus star ring mesh', obj: ['Describe topology types', 'Compare advantages disadvantages', 'Assess suitability'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Hardware', d: 'Routers switches hubs', obj: ['Explain router function', 'Describe switch operation', 'Compare networking devices'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Protocols', d: 'TCP/IP HTTP FTP', obj: ['Explain protocol purpose', 'Describe TCP/IP layers', 'Understand common protocols'] },
    { s: 'AS2: Networks', o: o++, t: 'IP Addressing', d: 'IPv4 and IPv6', obj: ['Explain IP address format', 'Describe subnet masks', 'Understand DHCP DNS'] },
    { s: 'AS2: Networks', o: o++, t: 'Wireless Networks', d: 'WiFi and mobile', obj: ['Explain WiFi standards', 'Describe wireless security', 'Understand mobile networks'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Security', d: 'Protecting networks', obj: ['Explain firewalls', 'Describe encryption', 'Understand authentication'] },
    { s: 'AS2: Networks', o: o++, t: 'Cloud Computing', d: 'Cloud services and models', obj: ['Explain SaaS PaaS IaaS', 'Describe cloud benefits', 'Assess cloud risks'] },
    { s: 'AS2: Networks', o: o++, t: 'Internet Services', d: 'Email web FTP', obj: ['Explain email protocols', 'Describe web services', 'Understand file transfer'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Performance', d: 'Bandwidth latency', obj: ['Explain bandwidth', 'Understand latency', 'Assess network performance'] }
  );
  
  // 2.2 Web Development (10 lessons)
  lessons.push(
    { s: 'AS2: Web Development', o: o++, t: 'HTML Basics', d: 'Structure of web pages', obj: ['Write HTML structure', 'Use common tags', 'Create hyperlinks'] },
    { s: 'AS2: Web Development', o: o++, t: 'HTML Elements', d: 'Lists tables forms', obj: ['Create ordered unordered lists', 'Build tables', 'Design forms'] },
    { s: 'AS2: Web Development', o: o++, t: 'CSS Fundamentals', d: 'Styling web pages', obj: ['Apply CSS selectors', 'Set colors fonts', 'Use external stylesheets'] },
    { s: 'AS2: Web Development', o: o++, t: 'CSS Layout', d: 'Box model positioning', obj: ['Understand box model', 'Use positioning', 'Apply floats'] },
    { s: 'AS2: Web Development', o: o++, t: 'Responsive Design', d: 'Mobile-friendly websites', obj: ['Use media queries', 'Design responsive layouts', 'Apply viewport meta tag'] },
    { s: 'AS2: Web Development', o: o++, t: 'JavaScript Basics', d: 'Client-side scripting', obj: ['Write JavaScript code', 'Use variables operators', 'Create functions'] },
    { s: 'AS2: Web Development', o: o++, t: 'DOM Manipulation', d: 'Accessing HTML elements', obj: ['Select DOM elements', 'Modify element content', 'Change styles dynamically'] },
    { s: 'AS2: Web Development', o: o++, t: 'Event Handling', d: 'Responding to user actions', obj: ['Handle click events', 'Validate forms', 'Create interactive pages'] },
    { s: 'AS2: Web Development', o: o++, t: 'Web Standards', d: 'Accessibility usability', obj: ['Apply accessibility principles', 'Follow web standards', 'Design for usability'] },
    { s: 'AS2: Web Development', o: o++, t: 'Website Testing', d: 'Testing web pages', obj: ['Test across browsers', 'Validate HTML CSS', 'Check responsiveness'] }
  );
  
  return lessons;
}

function getDigitalTechnologyA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Advanced Programming and Software Development
  
  // 3.1 Advanced Programming (12 lessons)
  lessons.push(
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Two-Dimensional Arrays', d: 'Multi-dimensional data structures', obj: ['Declare 2D arrays', 'Access elements with indices', 'Traverse 2D arrays'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Records and Structures', d: 'Composite data types', obj: ['Define record structures', 'Create arrays of records', 'Access record fields'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Object-Oriented Programming', d: 'OOP concepts', obj: ['Understand classes objects', 'Explain encapsulation', 'Apply inheritance'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Classes and Objects', d: 'Creating classes', obj: ['Define classes', 'Create objects', 'Use constructors'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Methods and Properties', d: 'Class members', obj: ['Define methods', 'Create properties', 'Use get set accessors'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Recursion', d: 'Recursive algorithms', obj: ['Understand recursion concept', 'Write recursive functions', 'Compare iteration vs recursion'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Searching Algorithms', d: 'Linear and binary search', obj: ['Implement linear search', 'Code binary search', 'Compare efficiency'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Sorting Algorithms', d: 'Bubble insertion merge sort', obj: ['Implement bubble sort', 'Code insertion sort', 'Understand merge sort'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Algorithm Efficiency', d: 'Big O notation', obj: ['Explain time complexity', 'Analyze algorithm efficiency', 'Compare algorithmic approaches'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Exception Handling', d: 'Error management', obj: ['Use try-catch blocks', 'Handle exceptions', 'Create custom exceptions'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Design Patterns', d: 'Common programming patterns', obj: ['Understand singleton pattern', 'Explain factory pattern', 'Apply design principles'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Code Optimization', d: 'Improving performance', obj: ['Identify inefficiencies', 'Refactor code', 'Apply optimization techniques'] }
  );
  
  // 3.2 Software Development (10 lessons)
  lessons.push(
    { s: 'A2-1: Software Development', o: o++, t: 'Software Development Lifecycle', d: 'SDLC models', obj: ['Explain waterfall model', 'Describe agile methodologies', 'Compare SDLC approaches'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Requirements Analysis', d: 'Gathering requirements', obj: ['Conduct stakeholder interviews', 'Document requirements', 'Create user stories'] },
    { s: 'A2-1: Software Development', o: o++, t: 'System Design', d: 'Designing solutions', obj: ['Create system diagrams', 'Design interfaces', 'Plan system architecture'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Implementation', d: 'Coding phase', obj: ['Follow coding standards', 'Use version control', 'Apply best practices'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Testing Strategies', d: 'Types of testing', obj: ['Explain unit testing', 'Describe integration testing', 'Understand system testing'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Version Control', d: 'Managing code changes', obj: ['Use Git basics', 'Understand branching merging', 'Collaborate using repositories'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Documentation', d: 'Technical and user documentation', obj: ['Write technical documentation', 'Create user guides', 'Document code effectively'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Software Maintenance', d: 'Post-deployment activities', obj: ['Explain corrective maintenance', 'Describe adaptive maintenance', 'Understand perfective maintenance'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Project Management', d: 'Managing software projects', obj: ['Use Gantt charts', 'Estimate timescales', 'Manage resources'] },
    { s: 'A2-1: Software Development', o: o++, t: 'Prototyping', d: 'Creating prototypes', obj: ['Design mockups', 'Build functional prototypes', 'Gather user feedback'] }
  );
  
  // A2-2: Databases and Data Management
  
  // 4.1 Database Concepts (10 lessons)
  lessons.push(
    { s: 'A2-2: Databases', o: o++, t: 'Database Fundamentals', d: 'Database concepts', obj: ['Define database terminology', 'Explain flat file limitations', 'Understand relational databases'] },
    { s: 'A2-2: Databases', o: o++, t: 'Entity Relationship Modeling', d: 'ER diagrams', obj: ['Identify entities attributes', 'Define relationships', 'Draw ER diagrams'] },
    { s: 'A2-2: Databases', o: o++, t: 'Relationships', d: 'One-to-many many-to-many', obj: ['Explain relationship types', 'Define cardinality', 'Resolve many-to-many'] },
    { s: 'A2-2: Databases', o: o++, t: 'Normalization', d: 'Reducing redundancy', obj: ['Apply 1NF 2NF 3NF', 'Eliminate data anomalies', 'Design normalized tables'] },
    { s: 'A2-2: Databases', o: o++, t: 'Primary and Foreign Keys', d: 'Key constraints', obj: ['Define primary keys', 'Use foreign keys', 'Maintain referential integrity'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Queries', d: 'Retrieving data', obj: ['Write SELECT statements', 'Use WHERE clauses', 'Apply ORDER BY'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Joins', d: 'Combining tables', obj: ['Perform INNER JOIN', 'Use LEFT JOIN', 'Understand join operations'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Data Manipulation', d: 'INSERT UPDATE DELETE', obj: ['Insert records', 'Update existing data', 'Delete records'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Aggregate Functions', d: 'Summary queries', obj: ['Use COUNT SUM AVG', 'Apply GROUP BY', 'Filter with HAVING'] },
    { s: 'A2-2: Databases', o: o++, t: 'Database Security', d: 'Protecting data', obj: ['Implement user permissions', 'Apply access controls', 'Understand backup recovery'] }
  );
  
  // A2-3: Information Systems and Society
  
  // 5.1 Information Systems (8 lessons)
  lessons.push(
    { s: 'A2-3: Information Systems', o: o++, t: 'Types of Information Systems', d: 'TPS MIS DSS', obj: ['Explain transaction processing systems', 'Describe management information systems', 'Understand decision support systems'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'Systems Analysis', d: 'Analyzing existing systems', obj: ['Conduct fact-finding', 'Analyze current systems', 'Identify problems opportunities'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'Data Flow Diagrams', d: 'Modeling information flow', obj: ['Draw DFDs', 'Use standard symbols', 'Create context and level diagrams'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'System Implementation', d: 'Changeover methods', obj: ['Explain direct changeover', 'Describe parallel running', 'Understand phased pilot'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'User Training', d: 'Preparing users', obj: ['Design training programs', 'Create training materials', 'Evaluate training effectiveness'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'System Evaluation', d: 'Post-implementation review', obj: ['Assess system success', 'Gather user feedback', 'Identify improvements'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'Backup and Recovery', d: 'Data protection strategies', obj: ['Explain backup types', 'Design recovery procedures', 'Understand disaster recovery'] },
    { s: 'A2-3: Information Systems', o: o++, t: 'Transaction Processing', d: 'ACID properties', obj: ['Explain atomicity consistency', 'Understand isolation durability', 'Apply transaction principles'] }
  );
  
  // 5.2 Digital Society (10 lessons)
  lessons.push(
    { s: 'A2-3: Digital Society', o: o++, t: 'Data Protection', d: 'GDPR and privacy laws', obj: ['Explain GDPR principles', 'Understand data subject rights', 'Apply privacy by design'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Computer Misuse Act', d: 'Cybercrime legislation', obj: ['Explain unauthorized access offenses', 'Understand hacking laws', 'Apply legal frameworks'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Intellectual Property', d: 'Copyright patents trademarks', obj: ['Explain copyright protection', 'Understand software licensing', 'Apply IP principles'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Cybersecurity Threats', d: 'Malware phishing attacks', obj: ['Identify malware types', 'Explain social engineering', 'Understand attack vectors'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Security Measures', d: 'Protecting systems', obj: ['Implement strong passwords', 'Use encryption', 'Apply security protocols'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Ethical Issues', d: 'Digital ethics', obj: ['Discuss privacy concerns', 'Examine surveillance debates', 'Assess AI ethics'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Environmental Impact', d: 'Green computing', obj: ['Assess energy consumption', 'Explain e-waste', 'Understand sustainability'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Digital Divide', d: 'Access inequality', obj: ['Explain digital exclusion', 'Assess socioeconomic factors', 'Understand accessibility'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Artificial Intelligence', d: 'AI applications and implications', obj: ['Explain machine learning', 'Assess AI benefits risks', 'Understand automation impact'] },
    { s: 'A2-3: Digital Society', o: o++, t: 'Future Technologies', d: 'Emerging trends', obj: ['Examine IoT developments', 'Understand quantum computing', 'Assess future digital society'] }
  );
  
  return lessons;
}