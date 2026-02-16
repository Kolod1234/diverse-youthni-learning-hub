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
      category: 'government_politics'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getGovernmentPoliticsAS() : getGovernmentPoliticsA2();
        
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

function getGovernmentPoliticsAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Democracy and Participation
  
  // 1.1 Democracy (8 lessons)
  lessons.push(
    { s: 'AS1: Democracy', o: o++, t: 'Nature of Democracy', d: 'Direct and representative democracy', obj: ['Define democracy concepts', 'Compare direct representative democracy', 'Understand democratic principles'] },
    { s: 'AS1: Democracy', o: o++, t: 'Features of Democracy', d: 'Democratic characteristics', obj: ['Explain free fair elections', 'Describe rule of law', 'Understand political pluralism'] },
    { s: 'AS1: Democracy', o: o++, t: 'Democracy in UK', d: 'UK democratic system', obj: ['Describe UK as representative democracy', 'Explain parliamentary sovereignty', 'Understand constitutional monarchy'] },
    { s: 'AS1: Democracy', o: o++, t: 'Participation in Democracy', d: 'Citizen involvement', obj: ['Explain voting participation', 'Describe party membership', 'Understand pressure group activity'] },
    { s: 'AS1: Democracy', o: o++, t: 'Referendums', d: 'Direct democracy in UK', obj: ['Explain referendum use', 'Assess advantages disadvantages', 'Evaluate recent referendums Brexit'] },
    { s: 'AS1: Democracy', o: o++, t: 'E-Democracy', d: 'Digital participation', obj: ['Explain e-petitions', 'Describe online campaigning', 'Understand digital engagement'] },
    { s: 'AS1: Democracy', o: o++, t: 'Democratic Deficit', d: 'Weaknesses in UK democracy', obj: ['Explain democratic deficit concept', 'Identify participation issues', 'Assess accountability problems'] },
    { s: 'AS1: Democracy', o: o++, t: 'Improving Democracy', d: 'Reform proposals', obj: ['Evaluate electoral reform', 'Assess House of Lords reform', 'Understand devolution'] }
  );
  
  // 1.2 Political Parties (10 lessons)
  lessons.push(
    { s: 'AS1: Political Parties', o: o++, t: 'Functions of Parties', d: 'Role in democracy', obj: ['Explain representation function', 'Describe recruitment of candidates', 'Understand policy formulation'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Party Systems', d: 'Multi-party two-party dominant', obj: ['Compare party system types', 'Explain UK party system', 'Understand party competition'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Conservative Party', d: 'Ideology and policies', obj: ['Explain Conservative ideology', 'Describe one-nation traditional New Right', 'Assess recent policies'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Labour Party', d: 'Ideology and policies', obj: ['Explain Labour ideology socialism', 'Describe Old Labour New Labour', 'Assess recent policies'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Liberal Democrats', d: 'Ideology and policies', obj: ['Explain liberal ideology', 'Describe LD policies', 'Assess coalition experience'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Minor Parties', d: 'SNP Plaid Cymru UKIP Green', obj: ['Describe nationalist parties', 'Explain single-issue parties', 'Assess minor party influence'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Party Funding', d: 'Financing political parties', obj: ['Explain funding sources', 'Assess state funding debate', 'Understand donation regulations'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Party Membership', d: 'Declining membership', obj: ['Analyze membership trends', 'Explain decline causes', 'Assess impact on parties'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Party Leadership', d: 'Selecting leaders', obj: ['Compare leadership selection methods', 'Explain membership ballots', 'Assess leadership power'] },
    { s: 'AS1: Political Parties', o: o++, t: 'Ideology and Policy', d: 'Left-right spectrum', obj: ['Explain political spectrum', 'Describe consensus politics', 'Understand adversarial politics'] }
  );
  
  // 1.3 Electoral Systems (10 lessons)
  lessons.push(
    { s: 'AS1: Electoral Systems', o: o++, t: 'First-Past-The-Post', d: 'UK general election system', obj: ['Explain FPTP operation', 'Assess advantages strong government', 'Evaluate disadvantages disproportionality'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Additional Member System', d: 'Scottish Parliament Welsh Assembly', obj: ['Explain AMS operation', 'Describe constituency and list seats', 'Assess proportionality'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Single Transferable Vote', d: 'Northern Ireland Assembly', obj: ['Explain STV operation', 'Describe preference voting', 'Assess proportional representation'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Supplementary Vote', d: 'London Mayor elections', obj: ['Explain SV operation', 'Describe first second preferences', 'Assess system effectiveness'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Electoral Reform Debate', d: 'Arguments for and against change', obj: ['Assess case for PR', 'Evaluate FPTP defense', 'Understand 2011 AV referendum'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Voting Behaviour Class', d: 'Social class and voting', obj: ['Explain class dealignment', 'Assess class voting patterns', 'Understand partisan dealignment'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Voting Behaviour Age Gender', d: 'Demographic factors', obj: ['Analyze age voting patterns', 'Assess gender differences', 'Understand generational effects'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Voting Behaviour Media', d: 'Media influence on voters', obj: ['Assess newspaper influence', 'Evaluate TV debates impact', 'Understand social media effects'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Election Campaigns', d: 'Modern campaigning', obj: ['Describe campaign strategies', 'Explain opinion polling', 'Assess campaign effectiveness'] },
    { s: 'AS1: Electoral Systems', o: o++, t: 'Turnout and Participation', d: 'Voter engagement', obj: ['Analyze turnout trends', 'Explain low turnout causes', 'Assess compulsory voting'] }
  );
  
  // AS2: Government of the UK
  
  // 2.1 The Constitution (8 lessons)
  lessons.push(
    { s: 'AS2: Constitution', o: o++, t: 'UK Constitution Nature', d: 'Uncodified flexible constitution', obj: ['Explain uncodified nature', 'Describe sources statute common law', 'Understand conventions'] },
    { s: 'AS2: Constitution', o: o++, t: 'Constitutional Principles', d: 'Parliamentary sovereignty rule of law', obj: ['Explain parliamentary sovereignty', 'Describe rule of law Dicey', 'Understand unitary state'] },
    { s: 'AS2: Constitution', o: o++, t: 'Constitutional Reform', d: 'Changes since 1997', obj: ['Assess devolution', 'Evaluate Human Rights Act', 'Understand Lords reform'] },
    { s: 'AS2: Constitution', o: o++, t: 'Devolution', d: 'Power to Scotland Wales NI', obj: ['Explain devolution arrangements', 'Assess powers devolved', 'Understand asymmetric devolution'] },
    { s: 'AS2: Constitution', o: o++, t: 'Human Rights', d: 'Protection of rights', obj: ['Explain Human Rights Act 1998', 'Describe ECHR incorporation', 'Assess rights protection'] },
    { s: 'AS2: Constitution', o: o++, t: 'EU and UK Constitution', d: 'Impact of EU membership', obj: ['Explain EU law supremacy', 'Assess pooled sovereignty', 'Understand Brexit implications'] },
    { s: 'AS2: Constitution', o: o++, t: 'Codified Constitution Debate', d: 'Arguments for codification', obj: ['Assess case for written constitution', 'Evaluate arguments against', 'Understand reform proposals'] },
    { s: 'AS2: Constitution', o: o++, t: 'Constitutional Monarchy', d: 'Role of the Crown', obj: ['Explain royal prerogative', 'Describe ceremonial role', 'Understand constitutional position'] }
  );
  
  // 2.2 Parliament (12 lessons)
  lessons.push(
    { s: 'AS2: Parliament', o: o++, t: 'House of Commons Composition', d: 'MPs and representation', obj: ['Describe Commons composition 650 MPs', 'Explain constituency representation', 'Understand party composition'] },
    { s: 'AS2: Parliament', o: o++, t: 'House of Lords Composition', d: 'Unelected upper house', obj: ['Describe Lords composition', 'Explain life peers hereditary peers', 'Understand appointment process'] },
    { s: 'AS2: Parliament', o: o++, t: 'Functions of Parliament', d: 'Legislative scrutiny representative', obj: ['Explain legislation function', 'Describe scrutiny of government', 'Understand representation'] },
    { s: 'AS2: Parliament', o: o++, t: 'Legislative Process', d: 'How bills become law', obj: ['Describe bill stages', 'Explain readings committee report', 'Understand royal assent'] },
    { s: 'AS2: Parliament', o: o++, t: 'Parliamentary Sovereignty', d: 'Supreme legal authority', obj: ['Explain parliamentary sovereignty principle', 'Assess limitations EU devolution', 'Understand Brexit impact'] },
    { s: 'AS2: Parliament', o: o++, t: 'Backbench MPs', d: 'Influence of backbenchers', obj: ['Assess backbench power', 'Explain rebellion voting', 'Understand select committees'] },
    { s: 'AS2: Parliament', o: o++, t: 'Select Committees', d: 'Scrutiny of departments', obj: ['Explain select committee role', 'Assess investigative powers', 'Evaluate effectiveness'] },
    { s: 'AS2: Parliament', o: o++, t: 'Opposition Role', d: 'Her Majesty\'s Opposition', obj: ['Explain opposition functions', 'Describe shadow cabinet', 'Understand opposition days'] },
    { s: 'AS2: Parliament', o: o++, t: 'Prime Minister\'s Questions', d: 'Accountability mechanism', obj: ['Describe PMQs format', 'Assess accountability value', 'Evaluate effectiveness'] },
    { s: 'AS2: Parliament', o: o++, t: 'House of Lords Powers', d: 'Delaying and revising', obj: ['Explain Lords legislative powers', 'Describe Salisbury convention', 'Understand Parliament Acts'] },
    { s: 'AS2: Parliament', o: o++, t: 'Lords Reform', d: 'Debates over composition', obj: ['Assess elected Lords proposals', 'Evaluate current reforms', 'Understand reform obstacles'] },
    { s: 'AS2: Parliament', o: o++, t: 'Parliamentary Privilege', d: 'MPs rights and immunities', obj: ['Explain freedom of speech', 'Describe parliamentary privilege', 'Understand contempt of parliament'] }
  );
  
  // 2.3 The Executive (10 lessons)
  lessons.push(
    { s: 'AS2: Executive', o: o++, t: 'Prime Minister Powers', d: 'PM role and authority', obj: ['Describe PM powers patronage', 'Explain prerogative powers', 'Assess primus inter pares'] },
    { s: 'AS2: Executive', o: o++, t: 'Prime Minister Constraints', d: 'Limitations on PM power', obj: ['Assess cabinet constraints', 'Explain parliament limitations', 'Understand party media public opinion'] },
    { s: 'AS2: Executive', o: o++, t: 'Presidential vs Prime Ministerial', d: 'Presidentialism debate', obj: ['Assess presidential thesis', 'Compare PM and US President', 'Evaluate prime ministerial government'] },
    { s: 'AS2: Executive', o: o++, t: 'Cabinet Government', d: 'Collective decision making', obj: ['Explain cabinet role', 'Describe collective responsibility', 'Understand cabinet committees'] },
    { s: 'AS2: Executive', o: o++, t: 'Cabinet vs PM Dominance', d: 'Power relationship', obj: ['Assess cabinet government', 'Evaluate PM dominance', 'Compare different PMs'] },
    { s: 'AS2: Executive', o: o++, t: 'Ministers and Departments', d: 'Government ministers', obj: ['Explain ministerial roles', 'Describe individual responsibility', 'Understand departmental structure'] },
    { s: 'AS2: Executive', o: o++, t: 'Civil Service', d: 'Administrative bureaucracy', obj: ['Describe civil service functions', 'Explain political neutrality', 'Understand permanence anonymity'] },
    { s: 'AS2: Executive', o: o++, t: 'Special Advisers', d: 'Political appointments', obj: ['Explain SPAD role', 'Assess political advice', 'Understand civil service relationship'] },
    { s: 'AS2: Executive', o: o++, t: 'Executive and Parliament', d: 'Power relationship', obj: ['Assess executive dominance', 'Explain whip system', 'Understand party discipline'] },
    { s: 'AS2: Executive', o: o++, t: 'Coalition Government', d: '2010-2015 coalition', obj: ['Explain coalition formation', 'Assess coalition agreement', 'Evaluate coalition effectiveness'] }
  );
  
  // 2.4 The Judiciary (8 lessons)
  lessons.push(
    { s: 'AS2: Judiciary', o: o++, t: 'UK Court System', d: 'Hierarchy of courts', obj: ['Describe court structure', 'Explain Supreme Court role', 'Understand appellate system'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judicial Independence', d: 'Separation from politics', obj: ['Explain judicial independence principle', 'Describe security of tenure', 'Understand appointment reforms'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judicial Neutrality', d: 'Political impartiality', obj: ['Explain neutrality requirement', 'Assess political background', 'Understand bias concerns'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judicial Review', d: 'Reviewing executive action', obj: ['Explain judicial review power', 'Describe ultra vires', 'Assess judicial activism'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Supreme Court', d: 'Highest UK court', obj: ['Explain Supreme Court creation 2009', 'Describe composition powers', 'Assess separation of powers'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Human Rights Protection', d: 'Judicial role in rights', obj: ['Explain HRA enforcement', 'Describe declaration of incompatibility', 'Assess rights protection'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judicial Appointments', d: 'Selecting judges', obj: ['Explain JAC role', 'Describe appointment process', 'Assess diversity issues'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judiciary and Politics', d: 'Relationship tensions', obj: ['Assess politicization claims', 'Evaluate judicial activism', 'Understand parliamentary sovereignty tension'] }
  );
  
  return lessons;
}

function getGovernmentPoliticsA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Comparative Politics - USA
  
  // 3.1 US Constitution (8 lessons)
  lessons.push(
    { s: 'A2-1: US Constitution', o: o++, t: 'Constitutional Framework', d: 'Founding principles', obj: ['Explain constitutional origins', 'Describe Philadelphia Convention', 'Understand Founding Fathers'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Separation of Powers', d: 'Division of government', obj: ['Explain three branches', 'Describe separation principle', 'Assess power distribution'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Checks and Balances', d: 'Preventing tyranny', obj: ['Identify checks between branches', 'Explain veto override judicial review', 'Assess effectiveness'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Federalism', d: 'Federal and state powers', obj: ['Explain federal system', 'Describe enumerated reserved concurrent powers', 'Assess federal-state relations'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Bill of Rights', d: 'First ten amendments', obj: ['Explain Bill of Rights', 'Describe key freedoms', 'Understand individual rights protection'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Constitutional Amendments', d: 'Changing the Constitution', obj: ['Explain amendment process', 'Assess difficulty of amendment', 'Describe key amendments'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Codified Constitution', d: 'Written constitution features', obj: ['Compare codified vs uncodified', 'Assess rigidity flexibility', 'Understand entrenched law'] },
    { s: 'A2-1: US Constitution', o: o++, t: 'Constitutional Interpretation', d: 'Strict vs loose construction', obj: ['Explain originalism', 'Describe living constitution', 'Assess judicial interpretation'] }
  );
  
  // 3.2 US Congress (10 lessons)
  lessons.push(
    { s: 'A2-1: US Congress', o: o++, t: 'Congress Structure', d: 'Senate and House', obj: ['Compare Senate House composition', 'Explain bicameral legislature', 'Understand representation differences'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Congressional Powers', d: 'Legislative authority', obj: ['Explain enumerated powers', 'Describe power of purse', 'Understand war powers'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Legislative Process', d: 'How bills become law', obj: ['Describe bill stages', 'Explain committee role', 'Understand conference committees'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Congressional Committees', d: 'Committee system', obj: ['Explain standing committees', 'Describe committee power', 'Assess committee chairs'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Congressional Leadership', d: 'Speaker and majority leaders', obj: ['Explain Speaker of House role', 'Describe Senate majority leader', 'Assess leadership power'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Representation vs Delegation', d: 'How members act', obj: ['Explain trustee delegate models', 'Describe constituency work', 'Assess representational roles'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Congressional Oversight', d: 'Checking executive', obj: ['Explain oversight mechanisms', 'Describe investigative powers', 'Assess effectiveness'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Partisanship in Congress', d: 'Party influence', obj: ['Assess party unity', 'Explain divided government', 'Understand polarization'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Filibuster', d: 'Senate delaying tactic', obj: ['Explain filibuster use', 'Describe cloture', 'Assess reform debate'] },
    { s: 'A2-1: US Congress', o: o++, t: 'Congress Effectiveness', d: 'Legislative success', obj: ['Assess legislative productivity', 'Evaluate gridlock', 'Understand congressional power'] }
  );
  
  // 3.3 US Presidency (10 lessons)
  lessons.push(
    { s: 'A2-1: US Presidency', o: o++, t: 'Presidential Powers Constitutional', d: 'Formal powers', obj: ['Explain enumerated powers', 'Describe veto power', 'Understand appointment powers'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Presidential Powers Informal', d: 'Implied powers', obj: ['Explain executive orders', 'Describe executive agreements', 'Assess signing statements'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Presidential Leadership', d: 'Chief executive role', obj: ['Explain administrative leadership', 'Describe cabinet role', 'Understand EXOP'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'President and Congress', d: 'Legislative relationship', obj: ['Assess presidential legislative power', 'Explain veto override', 'Understand persuasion'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Presidential Elections', d: 'Nomination and election', obj: ['Explain primary system', 'Describe Electoral College', 'Assess election process'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Imperial Presidency', d: 'Growth of presidential power', obj: ['Explain imperial presidency thesis Schlesinger', 'Assess expansion of power', 'Understand war powers'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Presidential Limits', d: 'Constraints on president', obj: ['Assess congressional checks', 'Explain judicial review limits', 'Understand public opinion media'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Vice Presidency', d: 'Role of VP', obj: ['Explain VP constitutional role', 'Describe tie-breaking Senate', 'Assess modern VP influence'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Cabinet', d: 'Presidential advisers', obj: ['Describe cabinet composition', 'Explain cabinet government absence', 'Assess cabinet influence'] },
    { s: 'A2-1: US Presidency', o: o++, t: 'Impeachment', d: 'Removing the president', obj: ['Explain impeachment process', 'Describe high crimes misdemeanors', 'Assess historical cases'] }
  );
  
  // 3.4 US Supreme Court (8 lessons)
  lessons.push(
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Supreme Court Structure', d: 'Composition and jurisdiction', obj: ['Describe nine justices', 'Explain appellate jurisdiction', 'Understand original jurisdiction'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Judicial Review Power', d: 'Constitutional interpretation', obj: ['Explain Marbury v Madison', 'Assess judicial review power', 'Understand constitutional guardianship'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Appointment Process', d: 'Selecting justices', obj: ['Explain presidential nomination', 'Describe Senate confirmation', 'Assess politicization'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Judicial Philosophy', d: 'Strict vs loose construction', obj: ['Explain judicial restraint', 'Describe judicial activism', 'Assess conservative liberal justices'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Landmark Cases Rights', d: 'Civil liberties decisions', obj: ['Explain Brown v Board', 'Describe Roe v Wade', 'Assess rights protection'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Landmark Cases Presidential Power', d: 'Separation of powers cases', obj: ['Explain US v Nixon', 'Describe steel seizure case', 'Assess checks on president'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Supreme Court Independence', d: 'Judicial autonomy', obj: ['Explain lifetime tenure', 'Assess political pressures', 'Understand public opinion influence'] },
    { s: 'A2-1: US Supreme Court', o: o++, t: 'Court Effectiveness', d: 'Impact and limitations', obj: ['Assess policy-making role', 'Explain implementation challenges', 'Understand political backlash'] }
  );
  
  // A2-2: Political Ideas and Ideologies
  
  // 4.1 Liberalism (6 lessons)
  lessons.push(
    { s: 'A2-2: Liberalism', o: o++, t: 'Core Liberal Values', d: 'Individualism freedom', obj: ['Explain liberal individualism', 'Describe negative positive freedom', 'Understand tolerance'] },
    { s: 'A2-2: Liberalism', o: o++, t: 'Classical Liberalism', d: 'Early liberal thought', obj: ['Explain Locke natural rights', 'Describe minimal state', 'Understand laissez-faire economics'] },
    { s: 'A2-2: Liberalism', o: o++, t: 'Modern Liberalism', d: 'Social liberalism', obj: ['Explain positive freedom', 'Describe enabling state', 'Understand Rawls Keynes'] },
    { s: 'A2-2: Liberalism', o: o++, t: 'Liberal Democracy', d: 'Democratic principles', obj: ['Explain constitutional government', 'Describe representative democracy', 'Assess liberal democratic values'] },
    { s: 'A2-2: Liberalism', o: o++, t: 'Liberal Tensions', d: 'Internal contradictions', obj: ['Assess freedom vs equality', 'Explain state intervention debate', 'Understand classical vs modern split'] },
    { s: 'A2-2: Liberalism', o: o++, t: 'Liberalism Today', d: 'Contemporary relevance', obj: ['Assess neoliberalism', 'Evaluate liberal parties', 'Understand liberal challenges'] }
  );
  
  // 4.2 Conservatism (6 lessons)
  lessons.push(
    { s: 'A2-2: Conservatism', o: o++, t: 'Core Conservative Values', d: 'Tradition pragmatism', obj: ['Explain conservative tradition', 'Describe pragmatism', 'Understand human imperfection'] },
    { s: 'A2-2: Conservatism', o: o++, t: 'Traditional Conservatism', d: 'Burke organic society', obj: ['Explain Burke philosophy', 'Describe organic society', 'Understand hierarchy authority'] },
    { s: 'A2-2: Conservatism', o: o++, t: 'One-Nation Conservatism', d: 'Paternalistic conservatism', obj: ['Explain one-nation tradition', 'Describe social obligation', 'Understand Disraeli'] },
    { s: 'A2-2: Conservatism', o: o++, t: 'New Right', d: 'Neoliberalism and neoconservatism', obj: ['Explain Thatcherism', 'Describe free market emphasis', 'Assess Reagan Thatcher'] },
    { s: 'A2-2: Conservatism', o: o++, t: 'Conservative Tensions', d: 'Internal divisions', obj: ['Assess one-nation vs New Right', 'Explain economic vs social conservatism', 'Understand EU divisions'] },
    { s: 'A2-2: Conservatism', o: o++, t: 'Conservatism Today', d: 'Contemporary conservatism', obj: ['Assess modern Conservative Party', 'Evaluate Cameron May Johnson', 'Understand Brexit impact'] }
  );
  
  // 4.3 Socialism (6 lessons)
  lessons.push(
    { s: 'A2-2: Socialism', o: o++, t: 'Core Socialist Values', d: 'Equality community', obj: ['Explain socialist equality', 'Describe social class', 'Understand common ownership'] },
    { s: 'A2-2: Socialism', o: o++, t: 'Revolutionary Socialism', d: 'Marx and communism', obj: ['Explain Marxist theory', 'Describe class struggle', 'Understand revolution'] },
    { s: 'A2-2: Socialism', o: o++, t: 'Democratic Socialism', d: 'Evolutionary socialism', obj: ['Explain parliamentary socialism', 'Describe gradual change', 'Understand Webb Crosland'] },
    { s: 'A2-2: Socialism', o: o++, t: 'Social Democracy', d: 'Revisionist socialism', obj: ['Explain social democratic welfare state', 'Describe mixed economy', 'Assess Keynesianism'] },
    { s: 'A2-2: Socialism', o: o++, t: 'Third Way', d: 'New Labour', obj: ['Explain Blair Third Way', 'Describe acceptance of markets', 'Assess social investment'] },
    { s: 'A2-2: Socialism', o: o++, t: 'Socialism Today', d: 'Contemporary socialism', obj: ['Assess Corbyn socialism', 'Evaluate socialist parties', 'Understand socialism relevance'] }
  );
  
  // 4.4 Other Ideologies (8 lessons)
  lessons.push(
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Nationalism', d: 'National identity', obj: ['Define nationalism', 'Compare civic ethnic nationalism', 'Understand self-determination'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Multiculturalism', d: 'Diversity and integration', obj: ['Explain multiculturalism', 'Assess integration policies', 'Understand identity politics'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Feminism', d: 'Gender equality', obj: ['Explain feminist waves', 'Describe liberal radical socialist feminism', 'Assess gender equality progress'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Ecologism', d: 'Environmental politics', obj: ['Explain green ideology', 'Describe sustainability', 'Assess environmental movement'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Anarchism', d: 'Rejection of state', obj: ['Explain anarchist principles', 'Describe collectivist individualist anarchism', 'Assess viability'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Fascism', d: 'Extreme right ideology', obj: ['Explain fascist characteristics', 'Describe nationalism authoritarianism', 'Understand historical context'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Populism', d: 'Anti-establishment politics', obj: ['Define populism', 'Explain left and right populism', 'Assess contemporary examples'] },
    { s: 'A2-2: Other Ideologies', o: o++, t: 'Political Spectrum', d: 'Left-right and beyond', obj: ['Explain traditional spectrum', 'Describe libertarian-authoritarian axis', 'Understand ideological positioning'] }
  );
  
  return lessons;
}