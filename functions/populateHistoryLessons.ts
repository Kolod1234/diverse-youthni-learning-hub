import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Course definitions with lessons
    const courses = [
      // AS 1 Options
      {
        title: 'A-Level History AS 1: England 1509-58',
        description: 'CCEA A-Level History - The rule of English monarchs including Henry VIII, covering the English Reformation, religious reforms under Edward VI and Mary I.',
        stage: 'as',
        unit: 'AS 1',
        lessons: [
          { title: 'Religious Belief and Practice on the Eve of the Reformation', order: 1 },
          { title: 'Henry VIII and the Divorce Question', order: 2 },
          { title: 'The Break with Rome', order: 3 },
          { title: 'The English Reformation and Religious Change', order: 4 },
          { title: 'Opposition to Religious Change', order: 5 },
          { title: 'The Pilgrimage of Grace', order: 6 },
          { title: 'Political Developments 1547-58', order: 7 },
          { title: 'Religious Developments under Edward VI', order: 8 },
          { title: 'Religious Developments under Mary I', order: 9 },
          { title: 'Economic and Social Problems of the Period', order: 10 },
          { title: 'Revision: Religious Change 1509-58', order: 11 },
          { title: 'Revision: Political and Social Developments', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 1: England 1603-49',
        description: 'CCEA A-Level History - The reigns of James I and Charles I, the origins of the English Civil War, and the political revolution that followed.',
        stage: 'as',
        unit: 'AS 1',
        lessons: [
          { title: 'James I 1603-25: Early Reign and Problems', order: 1 },
          { title: 'James I: Financial and Foreign Policy', order: 2 },
          { title: 'James I: Religious Policy', order: 3 },
          { title: 'Charles I 1625-40: Personal Rule', order: 4 },
          { title: 'Charles I: Financial and Religious Policies', order: 5 },
          { title: 'The Road to Civil War 1640-42', order: 6 },
          { title: 'The English Civil War 1642-46', order: 7 },
          { title: 'The First Civil War: Key Battles', order: 8 },
          { title: 'Revolution 1646-49: Trial and Execution', order: 9 },
          { title: 'Political Revolution and the New Commonwealth', order: 10 },
          { title: 'Revision: Causes of the Civil War', order: 11 },
          { title: 'Revision: Civil War and Revolution', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 1: Britain in the Age of Reform 1830-80',
        description: 'CCEA A-Level History - Political, economic and social reform in Britain, the Reform Acts, and the emergence of modern Conservative and Liberal parties.',
        stage: 'as',
        unit: 'AS 1',
        lessons: [
          { title: 'The Reform Crisis and Parliamentary Reform Act 1830-32', order: 1 },
          { title: 'The Whig Reforms under Grey and Melbourne 1833-40', order: 2 },
          { title: 'Social and Economic Reforms 1833-40', order: 3 },
          { title: 'The Rise of the Chartists 1838-48', order: 4 },
          { title: 'The Anti-Corn Law League 1838-48', order: 5 },
          { title: 'Robert Peel and the Modern Conservative Party 1833-46', order: 6 },
          { title: 'The Repeal of the Corn Laws 1846', order: 7 },
          { title: 'Benjamin Disraeli and Tory Democracy 1846-80', order: 8 },
          { title: 'Disraeli\'s Social Reforms', order: 9 },
          { title: 'William Gladstone and the Liberal Party 1849-80', order: 10 },
          { title: 'Gladstone\'s Reforms and Policies', order: 11 },
          { title: 'Revision: Reform and Political Development 1830-80', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 1: Italy and Germany 1815-71',
        description: 'CCEA A-Level History - The unification of Italy and Germany, the 1848 revolutions, and the roles of Bismarck and Cavour.',
        stage: 'as',
        unit: 'AS 1',
        lessons: [
          { title: 'Germany 1815-48: Liberalism and Nationalism', order: 1 },
          { title: 'The 1848 Revolutions in Germany', order: 2 },
          { title: 'German Unification 1849-71: Bismarck\'s Rise', order: 3 },
          { title: 'German Unification: The Wars of Unification', order: 4 },
          { title: 'The Creation of the German Empire 1871', order: 5 },
          { title: 'Italy 1815-48: Political and Cultural Movements', order: 6 },
          { title: 'The 1848 Revolutions in Italy', order: 7 },
          { title: 'Italian Unification 1849-70: Cavour and Piedmont', order: 8 },
          { title: 'Italian Unification: Garibaldi and the South', order: 9 },
          { title: 'The Completion of Italian Unification 1866-70', order: 10 },
          { title: 'Revision: German Unification', order: 11 },
          { title: 'Revision: Italian Unification', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 1: Germany 1919-45',
        description: 'CCEA A-Level History - The Weimar Republic, the rise of Hitler and the Nazi Party, and Nazi Germany up to 1945.',
        stage: 'as',
        unit: 'AS 1',
        lessons: [
          { title: 'The Weimar Republic 1919-29: Foundation and Early Challenges', order: 1 },
          { title: 'Political and Economic Developments in Weimar Germany', order: 2 },
          { title: 'The Golden Years of Weimar 1924-29', order: 3 },
          { title: 'The Decline of Weimar 1929-33', order: 4 },
          { title: 'The Rise of the Nazi Party', order: 5 },
          { title: 'Hitler\'s Rise to Power 1933', order: 6 },
          { title: 'Nazi Germany 1933-39: Political Developments', order: 7 },
          { title: 'Nazi Economic Policies', order: 8 },
          { title: 'Nazi Social Policies and Propaganda', order: 9 },
          { title: 'Persecution and the Holocaust', order: 10 },
          { title: 'The Impact of War on Nazi Germany 1939-45', order: 11 },
          { title: 'Occupied Territories in Eastern Europe', order: 12 },
          { title: 'Revision: Weimar and Nazi Germany', order: 13 }
        ]
      },

      // AS 2 Options
      {
        title: 'A-Level History AS 2: Spain and Europe 1556-98',
        description: 'CCEA A-Level History - Spain under Philip II, economic and political development, and Spain\'s relationship with Europe.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'Philip II: Political Control and Authority', order: 1 },
          { title: 'Philip II and the Spanish Economy', order: 2 },
          { title: 'Philip II and Religion: The Inquisition', order: 3 },
          { title: 'Foreign Policy: Relations with France and Portugal', order: 4 },
          { title: 'Foreign Policy: The Dutch Revolt', order: 5 },
          { title: 'Foreign Policy: Relations with England', order: 6 },
          { title: 'The Spanish Armada 1588', order: 7 },
          { title: 'Assessment of Philip II\'s Foreign Policy', order: 8 },
          { title: 'Revision: Spain under Philip II', order: 9 }
        ]
      },
      {
        title: 'A-Level History AS 2: The Ascendancy of France in Europe 1660-1714',
        description: 'CCEA A-Level History - France under Louis XIV, the Nine Years\' War, and the War of the Spanish Succession.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'The Growing Power of France 1660-89', order: 1 },
          { title: 'Louis XIV\'s Domestic and Foreign Policies', order: 2 },
          { title: 'The Outbreak of the Nine Years\' War', order: 3 },
          { title: 'The Nine Years\' War 1688-97', order: 4 },
          { title: 'The Peace of Ryswick 1697', order: 5 },
          { title: 'The Problem of Spanish Succession 1697-1702', order: 6 },
          { title: 'The War of the Spanish Succession 1702-14', order: 7 },
          { title: 'Marlborough and the Grand Alliance', order: 8 },
          { title: 'The Treaty of Utrecht 1713', order: 9 },
          { title: 'Revision: France\'s Ascendancy in Europe', order: 10 }
        ]
      },
      {
        title: 'A-Level History AS 2: Ireland 1823-67',
        description: 'CCEA A-Level History - O\'Connell\'s campaigns, the Irish Famine, Young Irelanders and the Fenian Rising.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'O\'Connell and Catholic Emancipation 1823-34', order: 1 },
          { title: 'The Catholic Association', order: 2 },
          { title: 'Reform, Repeal and Failure 1835-47', order: 3 },
          { title: 'O\'Connell\'s Repeal Campaign', order: 4 },
          { title: 'Causes of the Irish Famine 1824-67', order: 5 },
          { title: 'The Course of the Irish Famine', order: 6 },
          { title: 'Impact of the Irish Famine: Economic and Social', order: 7 },
          { title: 'Impact of the Irish Famine: Political Consequences', order: 8 },
          { title: 'The Young Irelanders and the 1848 Rebellion', order: 9 },
          { title: 'The Fenian Movement', order: 10 },
          { title: 'The Fenian Rising of 1867', order: 11 },
          { title: 'Revision: Ireland 1823-67', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 2: France 1815-70',
        description: 'CCEA A-Level History - France\'s search for political stability from the Bourbon Restoration to the Second Empire.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'The Bourbon Monarchy 1815-30: Restoration', order: 1 },
          { title: 'The Reign of Louis XVIII and Charles X', order: 2 },
          { title: 'The July Revolution 1830', order: 3 },
          { title: 'The Reign of Louis Philippe 1830-48', order: 4 },
          { title: 'The 1848 Revolution in France', order: 5 },
          { title: 'The Second Republic 1848-52', order: 6 },
          { title: 'Louis Napoleon and the Second Empire 1852-70', order: 7 },
          { title: 'Economic and Social Policies of Napoleon III', order: 8 },
          { title: 'Foreign Policy of the Second Empire', order: 9 },
          { title: 'The Fall of the Second Empire 1870', order: 10 },
          { title: 'Revision: France 1815-70', order: 11 }
        ]
      },
      {
        title: 'A-Level History AS 2: Russia 1914-41',
        description: 'CCEA A-Level History - The Russian Revolutions of 1917, Lenin\'s Russia, Stalin\'s rise to power and dictatorship.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'The Collapse of Tsarist Russia 1914-17', order: 1 },
          { title: 'The February Revolution 1917', order: 2 },
          { title: 'The October Revolution 1917', order: 3 },
          { title: 'Lenin\'s Russia 1917-24: Civil War', order: 4 },
          { title: 'War Communism and the New Economic Policy', order: 5 },
          { title: 'Lenin\'s Political System', order: 6 },
          { title: 'Stalin\'s Rise to Power 1924-29', order: 7 },
          { title: 'The Great Purges 1934-38', order: 8 },
          { title: 'Stalinist Dictatorship: Politics and Society', order: 9 },
          { title: 'Stalin\'s Economic Policies: Collectivization', order: 10 },
          { title: 'Stalin\'s Economic Policies: Five Year Plans', order: 11 },
          { title: 'Revision: Russia 1914-41', order: 12 }
        ]
      },
      {
        title: 'A-Level History AS 2: Italy\'s Quest for Great Power Status 1871-1943',
        description: 'CCEA A-Level History - Italy\'s foreign policy from unification to Mussolini, the quest for Great Power status.',
        stage: 'as',
        unit: 'AS 2',
        lessons: [
          { title: 'Italy\'s Quest for Great Power Status 1871-1914', order: 1 },
          { title: 'Italian Colonial Ambitions', order: 2 },
          { title: 'Italy and the Triple Alliance', order: 3 },
          { title: 'The First World War and Italy 1914-19', order: 4 },
          { title: 'The Paris Peace Settlement and Italy', order: 5 },
          { title: 'The Rise of Fascism 1919-26', order: 6 },
          { title: 'Mussolini\'s Consolidation of Power', order: 7 },
          { title: 'Mussolini\'s Foreign Policy 1922-43: Objectives', order: 8 },
          { title: 'Mussolini and Ethiopia', order: 9 },
          { title: 'Italy and the Second World War', order: 10 },
          { title: 'The Fall of Mussolini 1943', order: 11 },
          { title: 'Revision: Italy 1871-1943', order: 12 }
        ]
      },

      // A2 1 Options
      {
        title: 'A-Level History A2 1: Crown and Parliament in England 1625-1714',
        description: 'CCEA A-Level History - The changing relationship between Crown and Parliament from Charles I to Queen Anne.',
        stage: 'a2',
        unit: 'A2 1',
        lessons: [
          { title: 'The Reign of Charles I 1625-49: Constitutional Conflict', order: 1 },
          { title: 'Charles I and Parliament: Finance and Religion', order: 2 },
          { title: 'The Personal Rule 1629-40', order: 3 },
          { title: 'The English Civil War and Regicide', order: 4 },
          { title: 'The Reign of Charles II 1660-85: The Restoration', order: 5 },
          { title: 'Charles II: Religious and Political Tensions', order: 6 },
          { title: 'The Exclusion Crisis 1678-81', order: 7 },
          { title: 'The Reign of James II 1685-88', order: 8 },
          { title: 'The Glorious Revolution 1688', order: 9 },
          { title: 'The Reign of William III 1688-1702', order: 10 },
          { title: 'The Bill of Rights and Constitutional Monarchy', order: 11 },
          { title: 'The Reign of Anne 1702-14', order: 12 },
          { title: 'The Act of Union 1707', order: 13 },
          { title: 'Synoptic Review: Crown and Parliament 1625-1714', order: 14 }
        ]
      },
      {
        title: 'A-Level History A2 1: Ireland Under the Union 1800-1900',
        description: 'CCEA A-Level History - Ireland\'s relationship with Great Britain, unionism, nationalism and political movements.',
        stage: 'a2',
        unit: 'A2 1',
        lessons: [
          { title: 'Support for the Union in Ireland', order: 1 },
          { title: 'Ulster Unionism in the 19th Century', order: 2 },
          { title: 'Opposition to the Union', order: 3 },
          { title: 'Daniel O\'Connell and Constitutional Nationalism', order: 4 },
          { title: 'The Home Rule Movement', order: 5 },
          { title: 'Charles Stewart Parnell and the Irish Party', order: 6 },
          { title: 'Revolutionary Nationalism: The Fenians', order: 7 },
          { title: 'Revolutionary Nationalism: Later Developments', order: 8 },
          { title: 'Cultural Nationalism: The Gaelic Revival', order: 9 },
          { title: 'British Government Response: Coercion and Reform', order: 10 },
          { title: 'Gladstone and Irish Policy', order: 11 },
          { title: 'Social and Economic Issues: Land and Famine', order: 12 },
          { title: 'Social and Economic Issues: Disestablishment', order: 13 },
          { title: 'Synoptic Review: Ireland Under the Union', order: 14 }
        ]
      },
      {
        title: 'A-Level History A2 1: Great Power Conflict 1848-1945',
        description: 'CCEA A-Level History - The causes and consequences of the First and Second World Wars.',
        stage: 'a2',
        unit: 'A2 1',
        lessons: [
          { title: 'Legacy of Political Events in Germany 1848-90', order: 1 },
          { title: 'German Unification and European Balance', order: 2 },
          { title: 'The Eastern Question and Balkan Nationalism', order: 3 },
          { title: 'The Balkan Wars 1912-13', order: 4 },
          { title: 'Causes of the First World War: Alliances', order: 5 },
          { title: 'Causes of the First World War: Imperial Rivalry', order: 6 },
          { title: 'The July Crisis 1914', order: 7 },
          { title: 'Consequences of WWI: Treaty of Versailles', order: 8 },
          { title: 'The League of Nations and Post-War Order', order: 9 },
          { title: 'The Rise of Hitler and Nazi Germany', order: 10 },
          { title: 'British Appeasement Policy', order: 11 },
          { title: 'The Road to World War II 1935-39', order: 12 },
          { title: 'Consequences of the Second World War', order: 13 },
          { title: 'Synoptic Review: Great Power Conflict', order: 14 }
        ]
      },
      {
        title: 'A-Level History A2 1: The American Presidency 1901-2000',
        description: 'CCEA A-Level History - The changing nature of the American presidency from Theodore Roosevelt to Bill Clinton.',
        stage: 'a2',
        unit: 'A2 1',
        lessons: [
          { title: 'Theodore Roosevelt 1901-09', order: 1 },
          { title: 'Woodrow Wilson 1913-20', order: 2 },
          { title: 'The Passive Presidents: Harding, Coolidge, Hoover', order: 3 },
          { title: 'FDR and the New Deal 1933-45', order: 4 },
          { title: 'FDR and World War II', order: 5 },
          { title: 'The Imperial Presidency: Truman 1945-53', order: 6 },
          { title: 'Eisenhower 1953-61', order: 7 },
          { title: 'Kennedy 1961-63', order: 8 },
          { title: 'Johnson and Vietnam 1963-69', order: 9 },
          { title: 'Nixon and Watergate 1969-74', order: 10 },
          { title: 'Ford and Carter: Presidency Weakened 1974-80', order: 11 },
          { title: 'Reagan: Recovery 1981-89', order: 12 },
          { title: 'Bush and Clinton 1989-2000', order: 13 },
          { title: 'Synoptic Review: American Presidency 1901-2000', order: 14 }
        ]
      },
      {
        title: 'A-Level History A2 1: Clash of Ideologies in Europe 1900-2000',
        description: 'CCEA A-Level History - Communist Russia and the West from 1917 to the collapse of the USSR.',
        stage: 'a2',
        unit: 'A2 1',
        lessons: [
          { title: 'Russia and Europe 1900-17', order: 1 },
          { title: 'Revolutionary Russia and Western Opposition 1917-33', order: 2 },
          { title: 'Soviet Foreign Policy in the 1920s', order: 3 },
          { title: 'The Struggle for Survival 1933-45', order: 4 },
          { title: 'Stalin and the Spanish Civil War', order: 5 },
          { title: 'The Nazi-Soviet Pact 1939', order: 6 },
          { title: 'The Search for Security 1945-56', order: 7 },
          { title: 'The Cold War and Soviet Control of Eastern Europe', order: 8 },
          { title: 'Co-operation and Coexistence 1956-79', order: 9 },
          { title: 'Détente and Its Limits', order: 10 },
          { title: 'Soviet Aggression and Decline 1979-91', order: 11 },
          { title: 'The Collapse of the USSR 1989-91', order: 12 },
          { title: 'Synoptic Review: Clash of Ideologies', order: 13 }
        ]
      },

      // A2 2 Options
      {
        title: 'A-Level History A2 2: England 1558-1603',
        description: 'CCEA A-Level History - The reign of Elizabeth I, religious settlement, foreign policy and social change.',
        stage: 'a2',
        unit: 'A2 2',
        lessons: [
          { title: 'Consolidation of Power 1558-69', order: 1 },
          { title: 'The Elizabethan Religious Settlement', order: 2 },
          { title: 'Political Developments 1558-1603', order: 3 },
          { title: 'Elizabeth and Parliament', order: 4 },
          { title: 'Religious Developments: Catholic Opposition', order: 5 },
          { title: 'Religious Developments: Puritan Challenge', order: 6 },
          { title: 'Elizabethan Foreign Policy: France and Scotland', order: 7 },
          { title: 'Elizabethan Foreign Policy: Spain and the Armada', order: 8 },
          { title: 'Economic and Social Developments', order: 9 },
          { title: 'Poor Law and Social Legislation', order: 10 },
          { title: 'Interpretations of Elizabeth\'s Reign', order: 11 },
          { title: 'Revision: Elizabethan England', order: 12 }
        ]
      },
      {
        title: 'A-Level History A2 2: Ireland 1685-1714',
        description: 'CCEA A-Level History - James II, the Williamite War, the Treaty of Limerick and the Penal Laws.',
        stage: 'a2',
        unit: 'A2 2',
        lessons: [
          { title: 'The Catholicising Policies of James II in Ireland', order: 1 },
          { title: 'Tyrconnell\'s Administration 1685-89', order: 2 },
          { title: 'The Catholicising Policies in England 1685-88', order: 3 },
          { title: 'The Glorious Revolution and Ireland', order: 4 },
          { title: 'The Conflict in Ireland: The Siege of Derry', order: 5 },
          { title: 'The Battle of the Boyne 1690', order: 6 },
          { title: 'The Battle of Aughrim 1691', order: 7 },
          { title: 'The Treaty of Limerick 1691', order: 8 },
          { title: 'The Results of the Conflict 1691-1714', order: 9 },
          { title: 'The Penal Laws', order: 10 },
          { title: 'Interpretations of the Williamite War', order: 11 },
          { title: 'Revision: Ireland 1685-1714', order: 12 }
        ]
      },
      {
        title: 'A-Level History A2 2: Ireland 1778-1803',
        description: 'CCEA A-Level History - The Volunteers, Grattan\'s Parliament, the United Irishmen and the 1798 Rebellion.',
        stage: 'a2',
        unit: 'A2 2',
        lessons: [
          { title: 'The Rise and Fall of the Volunteers 1778-89', order: 1 },
          { title: 'The Volunteer Movement and Reform', order: 2 },
          { title: 'Grattan\'s Parliament 1782-1800', order: 3 },
          { title: 'Legislative Independence and Its Limits', order: 4 },
          { title: 'The Rise of the United Irishmen 1789-98', order: 5 },
          { title: 'Wolfe Tone and Republican Ideology', order: 6 },
          { title: 'The Catholic Question 1778-98', order: 7 },
          { title: 'The 1798 Rebellion: Causes', order: 8 },
          { title: 'The 1798 Rebellion: Course and Defeat', order: 9 },
          { title: 'The Act of Union 1798-1800', order: 10 },
          { title: 'Emmet\'s Rebellion 1803', order: 11 },
          { title: 'Interpretations of the 1798 Rebellion', order: 12 },
          { title: 'Revision: Ireland 1778-1803', order: 13 }
        ]
      },
      {
        title: 'A-Level History A2 2: Partition of Ireland 1900-25',
        description: 'CCEA A-Level History - The Third Home Rule crisis, partition and the creation of Northern Ireland.',
        stage: 'a2',
        unit: 'A2 2',
        lessons: [
          { title: 'The Crisis Over the Third Home Rule Bill', order: 1 },
          { title: 'Ulster Unionist Resistance 1912-14', order: 2 },
          { title: 'The Ulster Volunteer Force', order: 3 },
          { title: 'Political Developments 1914-18: WWI Impact', order: 4 },
          { title: 'The Easter Rising 1916', order: 5 },
          { title: 'Political Developments 1919-23: The War of Independence', order: 6 },
          { title: 'The Treaty Negotiations 1921', order: 7 },
          { title: 'The Irish Civil War 1922-23', order: 8 },
          { title: 'Northern Ireland 1921-25: Foundation', order: 9 },
          { title: 'The Government of Ireland Act 1920', order: 10 },
          { title: 'Northern Ireland: Early Governance', order: 11 },
          { title: 'Interpretations of Partition', order: 12 },
          { title: 'Revision: Partition of Ireland', order: 13 }
        ]
      }
    ];

    let createdCourses = [];
    let totalLessons = 0;

    for (const courseData of courses) {
      // Check if course already exists
      const existing = await base44.entities.Course.filter({
        title: courseData.title
      });

      let course;
      if (existing.length === 0) {
        course = await base44.entities.Course.create({
          title: courseData.title,
          description: courseData.description,
          instructor: 'DYNI History Team',
          instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20History&background=dc2626&color=fff',
          thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800',
          qualification_type: 'alevel',
          alevel_stage: courseData.stage,
          category: 'history',
          level: 'advanced',
          duration_hours: courseData.stage === 'as' ? 90 : 120,
          total_lessons: courseData.lessons.length,
          price: 0,
          is_featured: true,
          exam_board: 'CCEA'
        });
        createdCourses.push(course.id);
      } else {
        course = existing[0];
        // Update the course to ensure correct metadata
        await base44.asServiceRole.entities.Course.update(course.id, {
          category: 'history',
          qualification_type: 'alevel',
          alevel_stage: courseData.stage,
          total_lessons: courseData.lessons.length
        });
      }

      // Delete existing lessons for this course first
      const existingLessons = await base44.entities.Lesson.filter({ course_id: course.id });
      for (const lesson of existingLessons) {
        await base44.asServiceRole.entities.Lesson.delete(lesson.id);
      }

      // Create lessons using bulkCreate
      const lessonsToCreate = courseData.lessons.map(lesson => ({
        course_id: course.id,
        title: lesson.title,
        description: `${courseData.unit}: ${lesson.title}`,
        order: lesson.order,
        section: courseData.unit,
        is_preview: true,
        content_type: 'richtext',
        slides: [{
          title: lesson.title,
          content: `<p>This lesson covers: ${lesson.title}</p>`,
          order: 1
        }]
      }));

      await base44.entities.Lesson.bulkCreate(lessonsToCreate);
      totalLessons += lessonsToCreate.length;
    }

    return Response.json({
      success: true,
      message: `Created ${createdCourses.length} History courses with ${totalLessons} lessons`,
      coursesCreated: createdCourses.length,
      lessonsCreated: totalLessons
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});