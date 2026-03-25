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
      category: 'software_systems_development'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getSoftwareSystemsAS() : getSoftwareSystemsA2();
        
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

function getSoftwareSystemsAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Fundamentals of Software Development
  
  // 1.1 Programming Concepts (12 lessons)
  lessons.push(
    { s: 'AS1: Programming', o: o++, t: 'Variables and Data Types', d: 'Declaring and using variables', obj: ['Declare variables appropriately', 'Use integer real string boolean char types', 'Understand type conversion'] },
    { s: 'AS1: Programming', o: o++, t: 'Constants', d: 'Using constant values', obj: ['Define constants', 'Understand when to use constants', 'Apply naming conventions'] },
    { s: 'AS1: Programming', o: o++, t: 'Operators', d: 'Arithmetic relational logical operators', obj: ['Use arithmetic operators + - * / DIV MOD', 'Apply relational operators = < > ≤ ≥ ≠', 'Use logical operators AND OR NOT'] },
    { s: 'AS1: Programming', o: o++, t: 'Input and Output', d: 'Reading and displaying data', obj: ['Read input from user', 'Display output to screen', 'Format output appropriately'] },
    { s: 'AS1: Programming', o: o++, t: 'Selection IF Statement', d: 'Conditional execution', obj: ['Implement IF-THEN-ELSE statements', 'Use nested selection', 'Apply appropriate conditions'] },
    { s: 'AS1: Programming', o: o++, t: 'Selection CASE Statement', d: 'Multi-way selection', obj: ['Implement CASE statements', 'Use CASE for multiple conditions', 'Understand when to use CASE vs IF'] },
    { s: 'AS1: Programming', o: o++, t: 'Iteration FOR Loop', d: 'Count-controlled loops', obj: ['Implement FOR loops', 'Use loop counter variable', 'Understand loop termination'] },
    { s: 'AS1: Programming', o: o++, t: 'Iteration WHILE Loop', d: 'Condition-controlled loops', obj: ['Implement WHILE loops', 'Use pre-condition testing', 'Avoid infinite loops'] },
    { s: 'AS1: Programming', o: o++, t: 'Iteration REPEAT Loop', d: 'Post-condition loops', obj: ['Implement REPEAT-UNTIL loops', 'Understand post-condition testing', 'Choose appropriate loop type'] },
    { s: 'AS1: Programming', o: o++, t: 'Nested Loops', d: 'Loops within loops', obj: ['Implement nested loops', 'Understand loop execution order', 'Apply to matrix problems'] },
    { s: 'AS1: Programming', o: o++, t: 'String Operations', d: 'Manipulating text data', obj: ['Use LENGTH LEFT RIGHT MID functions', 'Concatenate strings', 'Compare strings'] },
    { s: 'AS1: Programming', o: o++, t: 'String Processing', d: 'Advanced string manipulation', obj: ['Search within strings', 'Convert case UCASE LCASE', 'Validate string input'] }
  );
  
  // 1.2 Arrays (6 lessons)
  lessons.push(
    { s: 'AS1: Arrays', o: o++, t: 'One-Dimensional Arrays', d: 'Linear data structures', obj: ['Declare one-dimensional arrays', 'Access array elements by index', 'Initialize arrays'] },
    { s: 'AS1: Arrays', o: o++, t: 'Array Processing', d: 'Common array operations', obj: ['Populate arrays with data', 'Search arrays linearly', 'Find maximum minimum values'] },
    { s: 'AS1: Arrays', o: o++, t: 'Two-Dimensional Arrays', d: 'Matrix structures', obj: ['Declare two-dimensional arrays', 'Access elements using row column', 'Process 2D arrays'] },
    { s: 'AS1: Arrays', o: o++, t: 'Array Algorithms', d: 'Standard array operations', obj: ['Sum array elements', 'Calculate average', 'Count occurrences'] },
    { s: 'AS1: Arrays', o: o++, t: 'Parallel Arrays', d: 'Related data in separate arrays', obj: ['Use parallel arrays for related data', 'Maintain correspondence between arrays', 'Search parallel arrays'] },
    { s: 'AS1: Arrays', o: o++, t: 'Array Validation', d: 'Checking array data', obj: ['Validate array input', 'Check array bounds', 'Handle array errors'] }
  );
  
  // 1.3 Procedures and Functions (8 lessons)
  lessons.push(
    { s: 'AS1: Procedures Functions', o: o++, t: 'Procedures', d: 'Reusable code blocks', obj: ['Define procedures', 'Call procedures', 'Understand procedure scope'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Functions', d: 'Returning values', obj: ['Define functions with return values', 'Call functions in expressions', 'Return appropriate data types'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Parameters', d: 'Passing data to subprograms', obj: ['Use parameters in procedures functions', 'Pass arguments by value', 'Match parameter data types'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Value and Reference Parameters', d: 'Parameter passing mechanisms', obj: ['Understand pass by value', 'Understand pass by reference', 'Choose appropriate parameter type'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Local and Global Variables', d: 'Variable scope', obj: ['Understand local variable scope', 'Use global variables appropriately', 'Avoid scope conflicts'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Modular Design', d: 'Breaking programs into modules', obj: ['Decompose problems into subprograms', 'Design cohesive modules', 'Minimize coupling'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Library Functions', d: 'Using built-in functions', obj: ['Use mathematical functions', 'Apply string functions', 'Understand standard libraries'] },
    { s: 'AS1: Procedures Functions', o: o++, t: 'Recursion', d: 'Functions calling themselves', obj: ['Understand recursive function calls', 'Implement base case', 'Apply recursion appropriately'] }
  );
  
  // 1.4 File Handling (6 lessons)
  lessons.push(
    { s: 'AS1: File Handling', o: o++, t: 'Text Files', d: 'Reading and writing text files', obj: ['Open text files for reading writing', 'Read data from files', 'Write data to files'] },
    { s: 'AS1: File Handling', o: o++, t: 'File Operations', d: 'Common file operations', obj: ['Check end of file EOF', 'Close files properly', 'Handle file errors'] },
    { s: 'AS1: File Handling', o: o++, t: 'Sequential File Access', d: 'Processing files sequentially', obj: ['Read files line by line', 'Process all file records', 'Append to existing files'] },
    { s: 'AS1: File Handling', o: o++, t: 'File Validation', d: 'Checking file data', obj: ['Validate file input', 'Handle missing files', 'Check data formats'] },
    { s: 'AS1: File Handling', o: o++, t: 'CSV Files', d: 'Comma-separated values', obj: ['Read CSV files', 'Parse CSV data', 'Write CSV format'] },
    { s: 'AS1: File Handling', o: o++, t: 'File-Based Applications', d: 'Programs using persistent storage', obj: ['Design file structures', 'Implement file-based programs', 'Maintain data integrity'] }
  );
  
  // AS2: Software Development Methodologies
  
  // 2.1 Problem Analysis (6 lessons)
  lessons.push(
    { s: 'AS2: Analysis', o: o++, t: 'Understanding Requirements', d: 'Gathering user needs', obj: ['Identify user requirements', 'Distinguish functional non-functional requirements', 'Document requirements clearly'] },
    { s: 'AS2: Analysis', o: o++, t: 'Problem Decomposition', d: 'Breaking down problems', obj: ['Decompose complex problems', 'Identify sub-problems', 'Create hierarchy diagrams'] },
    { s: 'AS2: Analysis', o: o++, t: 'Data Requirements', d: 'Identifying data needs', obj: ['Identify required data items', 'Determine data types', 'Plan data structures'] },
    { s: 'AS2: Analysis', o: o++, t: 'Input Process Output', d: 'IPO analysis', obj: ['Identify inputs to system', 'Define processing requirements', 'Specify outputs needed'] },
    { s: 'AS2: Analysis', o: o++, t: 'Constraints', d: 'Identifying limitations', obj: ['Identify time constraints', 'Recognize resource limitations', 'Understand technical constraints'] },
    { s: 'AS2: Analysis', o: o++, t: 'Feasibility', d: 'Assessing viability', obj: ['Assess technical feasibility', 'Evaluate economic feasibility', 'Consider operational feasibility'] }
  );
  
  // 2.2 Algorithm Design (8 lessons)
  lessons.push(
    { s: 'AS2: Algorithm Design', o: o++, t: 'Algorithm Concepts', d: 'Understanding algorithms', obj: ['Define algorithm', 'Understand algorithm properties', 'Recognize good algorithm characteristics'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Pseudocode', d: 'Algorithm notation', obj: ['Write pseudocode', 'Use standard pseudocode conventions', 'Translate pseudocode to code'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Flowcharts', d: 'Visual algorithm representation', obj: ['Draw flowcharts using standard symbols', 'Represent sequence selection iteration', 'Use flowcharts for planning'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Structure Diagrams', d: 'Hierarchical design', obj: ['Create structure diagrams', 'Show module relationships', 'Design top-down solutions'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Linear Search', d: 'Sequential searching', obj: ['Implement linear search algorithm', 'Understand search efficiency', 'Apply to unsorted data'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Binary Search', d: 'Efficient searching', obj: ['Implement binary search algorithm', 'Understand prerequisites sorted data', 'Compare with linear search'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Bubble Sort', d: 'Simple sorting algorithm', obj: ['Implement bubble sort algorithm', 'Understand swap operations', 'Analyze sorting efficiency'] },
    { s: 'AS2: Algorithm Design', o: o++, t: 'Algorithm Efficiency', d: 'Comparing algorithms', obj: ['Understand time complexity', 'Compare algorithm efficiency', 'Choose appropriate algorithms'] }
  );
  
  // 2.3 Testing and Debugging (8 lessons)
  lessons.push(
    { s: 'AS2: Testing', o: o++, t: 'Types of Testing', d: 'Testing strategies', obj: ['Understand dry run testing', 'Apply unit testing', 'Perform integration testing'] },
    { s: 'AS2: Testing', o: o++, t: 'Test Data', d: 'Selecting test cases', obj: ['Design normal test data', 'Create boundary test data', 'Use erroneous test data'] },
    { s: 'AS2: Testing', o: o++, t: 'Test Plans', d: 'Systematic testing approach', obj: ['Create test plan tables', 'Document expected results', 'Record actual results'] },
    { s: 'AS2: Testing', o: o++, t: 'Trace Tables', d: 'Manual program execution', obj: ['Create trace tables', 'Track variable values', 'Identify logic errors'] },
    { s: 'AS2: Testing', o: o++, t: 'Debugging Techniques', d: 'Finding and fixing errors', obj: ['Identify syntax errors', 'Locate logic errors', 'Fix runtime errors'] },
    { s: 'AS2: Testing', o: o++, t: 'Error Types', d: 'Classifying errors', obj: ['Distinguish syntax errors', 'Identify runtime errors', 'Recognize logic errors'] },
    { s: 'AS2: Testing', o: o++, t: 'Validation', d: 'Checking input data', obj: ['Implement range checks', 'Use type checks', 'Apply presence checks'] },
    { s: 'AS2: Testing', o: o++, t: 'Test Documentation', d: 'Recording test results', obj: ['Document test cases', 'Record test outcomes', 'Report defects clearly'] }
  );
  
  // 2.4 Documentation (4 lessons)
  lessons.push(
    { s: 'AS2: Documentation', o: o++, t: 'Code Documentation', d: 'Comments and readability', obj: ['Write meaningful comments', 'Use descriptive identifiers', 'Follow coding conventions'] },
    { s: 'AS2: Documentation', o: o++, t: 'User Documentation', d: 'Guides for end users', obj: ['Create user manuals', 'Write clear instructions', 'Include screenshots examples'] },
    { s: 'AS2: Documentation', o: o++, t: 'Technical Documentation', d: 'Documentation for developers', obj: ['Document system architecture', 'Explain algorithms used', 'Provide maintenance guides'] },
    { s: 'AS2: Documentation', o: o++, t: 'Version Control', d: 'Managing code changes', obj: ['Understand version control concepts', 'Track changes systematically', 'Maintain change logs'] }
  );
  
  return lessons;
}

function getSoftwareSystemsA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Advanced Programming Concepts
  
  // 3.1 Object-Oriented Programming (10 lessons)
  lessons.push(
    { s: 'A2-1: OOP', o: o++, t: 'OOP Concepts', d: 'Object-oriented paradigm', obj: ['Understand objects and classes', 'Explain encapsulation principle', 'Recognize OOP benefits'] },
    { s: 'A2-1: OOP', o: o++, t: 'Classes and Objects', d: 'Defining and instantiating', obj: ['Define classes with attributes methods', 'Create object instances', 'Access object properties'] },
    { s: 'A2-1: OOP', o: o++, t: 'Constructors', d: 'Object initialization', obj: ['Define constructor methods', 'Initialize object attributes', 'Use parameterized constructors'] },
    { s: 'A2-1: OOP', o: o++, t: 'Encapsulation', d: 'Data hiding and access control', obj: ['Implement private attributes', 'Create public methods', 'Use accessor mutator methods'] },
    { s: 'A2-1: OOP', o: o++, t: 'Inheritance', d: 'Class hierarchies', obj: ['Implement inheritance relationships', 'Understand parent child classes', 'Override inherited methods'] },
    { s: 'A2-1: OOP', o: o++, t: 'Polymorphism', d: 'Multiple forms', obj: ['Understand polymorphism concept', 'Implement method overriding', 'Apply polymorphic behavior'] },
    { s: 'A2-1: OOP', o: o++, t: 'Abstract Classes', d: 'Template classes', obj: ['Define abstract classes', 'Understand cannot instantiate', 'Use for common interfaces'] },
    { s: 'A2-1: OOP', o: o++, t: 'UML Class Diagrams', d: 'Visual class representation', obj: ['Read UML class diagrams', 'Show attributes methods relationships', 'Design using UML'] },
    { s: 'A2-1: OOP', o: o++, t: 'Aggregation and Composition', d: 'Object relationships', obj: ['Understand has-a relationships', 'Distinguish aggregation composition', 'Implement object associations'] },
    { s: 'A2-1: OOP', o: o++, t: 'OOP Design Principles', d: 'Best practices', obj: ['Apply SOLID principles', 'Design cohesive classes', 'Minimize coupling'] }
  );
  
  // 3.2 Data Structures (8 lessons)
  lessons.push(
    { s: 'A2-1: Data Structures', o: o++, t: 'Stacks', d: 'LIFO data structure', obj: ['Implement stack operations PUSH POP', 'Understand LIFO principle', 'Apply stacks to problems'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Stack Applications', d: 'Using stacks', obj: ['Implement function call stack', 'Use stack for expression evaluation', 'Apply to undo functionality'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Queues', d: 'FIFO data structure', obj: ['Implement queue operations ENQUEUE DEQUEUE', 'Understand FIFO principle', 'Apply queues to problems'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Queue Applications', d: 'Using queues', obj: ['Implement print queue', 'Model waiting lines', 'Apply to scheduling'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Linked Lists', d: 'Dynamic data structures', obj: ['Understand node structure', 'Implement singly linked list', 'Traverse linked lists'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Linked List Operations', d: 'Manipulating linked lists', obj: ['Insert nodes at beginning end', 'Delete nodes', 'Search linked lists'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Binary Trees', d: 'Hierarchical structures', obj: ['Understand tree terminology', 'Implement binary tree', 'Traverse trees in-order pre-order post-order'] },
    { s: 'A2-1: Data Structures', o: o++, t: 'Hash Tables', d: 'Fast data lookup', obj: ['Understand hash function concept', 'Implement hash table', 'Handle collisions'] }
  );
  
  // 3.3 Advanced Algorithms (8 lessons)
  lessons.push(
    { s: 'A2-1: Algorithms', o: o++, t: 'Insertion Sort', d: 'Efficient small data sorting', obj: ['Implement insertion sort algorithm', 'Understand in-place sorting', 'Analyze efficiency'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Merge Sort', d: 'Divide and conquer sorting', obj: ['Implement merge sort algorithm', 'Understand divide conquer strategy', 'Analyze recursive efficiency'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Quick Sort', d: 'Fast average-case sorting', obj: ['Implement quick sort algorithm', 'Use pivot selection', 'Compare sorting algorithms'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Algorithm Complexity', d: 'Big O notation', obj: ['Understand Big O notation', 'Analyze time complexity', 'Compare algorithm efficiency'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Graph Algorithms', d: 'Network problems', obj: ['Represent graphs', 'Implement breadth-first search', 'Apply depth-first search'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Shortest Path', d: 'Finding optimal routes', obj: ['Implement Dijkstra algorithm', 'Find shortest paths', 'Apply to route planning'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Dynamic Programming', d: 'Optimization technique', obj: ['Understand memoization', 'Apply dynamic programming', 'Solve optimization problems'] },
    { s: 'A2-1: Algorithms', o: o++, t: 'Greedy Algorithms', d: 'Local optimal choices', obj: ['Understand greedy approach', 'Implement greedy algorithms', 'Recognize limitations'] }
  );
  
  // A2-2: Software Engineering and Development
  
  // 4.1 Software Development Life Cycle (6 lessons)
  lessons.push(
    { s: 'A2-2: SDLC', o: o++, t: 'SDLC Overview', d: 'Software development process', obj: ['Understand SDLC stages', 'Explain analysis design implementation testing', 'Recognize maintenance phase'] },
    { s: 'A2-2: SDLC', o: o++, t: 'Waterfall Model', d: 'Sequential development', obj: ['Explain waterfall methodology', 'Identify advantages disadvantages', 'Understand sequential phases'] },
    { s: 'A2-2: SDLC', o: o++, t: 'Agile Development', d: 'Iterative incremental approach', obj: ['Explain agile principles', 'Understand sprints iterations', 'Apply agile practices'] },
    { s: 'A2-2: SDLC', o: o++, t: 'Rapid Application Development', d: 'Fast prototyping', obj: ['Understand RAD approach', 'Explain prototyping benefits', 'Apply iterative refinement'] },
    { s: 'A2-2: SDLC', o: o++, t: 'DevOps', d: 'Development and operations integration', obj: ['Understand DevOps principles', 'Explain continuous integration deployment', 'Apply automation'] },
    { s: 'A2-2: SDLC', o: o++, t: 'Project Management', d: 'Planning and control', obj: ['Create project plans', 'Estimate time resources', 'Track project progress'] }
  );
  
  // 4.2 Database Systems (10 lessons)
  lessons.push(
    { s: 'A2-2: Databases', o: o++, t: 'Database Concepts', d: 'Data organization', obj: ['Define database terminology', 'Understand tables records fields', 'Explain database benefits'] },
    { s: 'A2-2: Databases', o: o++, t: 'Relational Databases', d: 'Table relationships', obj: ['Understand relational model', 'Define primary keys', 'Create foreign key relationships'] },
    { s: 'A2-2: Databases', o: o++, t: 'Entity-Relationship Diagrams', d: 'Database design', obj: ['Create ER diagrams', 'Show entities attributes relationships', 'Design database schema'] },
    { s: 'A2-2: Databases', o: o++, t: 'Normalization', d: 'Reducing redundancy', obj: ['Understand normalization principles', 'Apply first normal form', 'Apply second third normal forms'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL SELECT Queries', d: 'Retrieving data', obj: ['Write SELECT statements', 'Use WHERE clauses', 'Apply ORDER BY'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL JOIN Operations', d: 'Combining tables', obj: ['Implement INNER JOIN', 'Use LEFT RIGHT JOIN', 'Query multiple tables'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Data Manipulation', d: 'Modifying data', obj: ['Use INSERT statements', 'Apply UPDATE operations', 'Implement DELETE'] },
    { s: 'A2-2: Databases', o: o++, t: 'SQL Aggregate Functions', d: 'Summary calculations', obj: ['Use COUNT SUM AVG functions', 'Apply GROUP BY', 'Filter with HAVING'] },
    { s: 'A2-2: Databases', o: o++, t: 'Database Connectivity', d: 'Connecting programs to databases', obj: ['Connect applications to databases', 'Execute SQL from code', 'Process query results'] },
    { s: 'A2-2: Databases', o: o++, t: 'Database Security', d: 'Protecting data', obj: ['Implement user authentication', 'Apply access controls', 'Ensure data integrity'] }
  );
  
  // 4.3 Web Development (8 lessons)
  lessons.push(
    { s: 'A2-2: Web Development', o: o++, t: 'HTML Fundamentals', d: 'Web page structure', obj: ['Create HTML documents', 'Use semantic HTML5 elements', 'Structure web pages'] },
    { s: 'A2-2: Web Development', o: o++, t: 'HTML Forms', d: 'User input collection', obj: ['Create forms with input elements', 'Use different input types', 'Implement form validation'] },
    { s: 'A2-2: Web Development', o: o++, t: 'CSS Styling', d: 'Presentation and layout', obj: ['Apply CSS styles', 'Use selectors classes IDs', 'Implement CSS box model'] },
    { s: 'A2-2: Web Development', o: o++, t: 'CSS Layouts', d: 'Page layout techniques', obj: ['Use flexbox layout', 'Implement grid layout', 'Create responsive designs'] },
    { s: 'A2-2: Web Development', o: o++, t: 'JavaScript Basics', d: 'Client-side scripting', obj: ['Write JavaScript code', 'Manipulate DOM elements', 'Handle events'] },
    { s: 'A2-2: Web Development', o: o++, t: 'JavaScript Functions', d: 'Reusable code', obj: ['Define JavaScript functions', 'Use parameters return values', 'Apply arrow functions'] },
    { s: 'A2-2: Web Development', o: o++, t: 'AJAX and APIs', d: 'Asynchronous communication', obj: ['Understand AJAX concepts', 'Fetch data from APIs', 'Update pages dynamically'] },
    { s: 'A2-2: Web Development', o: o++, t: 'Web Security', d: 'Securing web applications', obj: ['Understand common vulnerabilities', 'Prevent SQL injection XSS', 'Implement secure practices'] }
  );
  
  return lessons;
}