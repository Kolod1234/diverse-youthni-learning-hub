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
      category: 'religious_studies'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getReligiousStudiesAS() : getReligiousStudiesA2();
        
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

function getReligiousStudiesAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: An Introduction to the Gospel of Luke
  
  // 1.1 Luke's Gospel Context (8 lessons)
  lessons.push(
    { s: 'AS1: Luke Introduction', o: o++, t: 'Authorship of Luke', d: 'Who wrote Luke\'s Gospel', obj: ['Examine evidence for Lukan authorship', 'Understand Luke as physician historian', 'Assess companion of Paul tradition'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Date and Purpose', d: 'When and why Luke wrote', obj: ['Examine dating evidence 80-90 CE', 'Understand purpose for Gentile audience', 'Assess orderly account for Theophilus'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Sources and Structure', d: 'Luke\'s source material', obj: ['Explain Synoptic problem', 'Describe Mark Q L sources', 'Understand Gospel structure'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Literary Features', d: 'Luke\'s writing style', obj: ['Identify parables unique to Luke', 'Explain travel narrative', 'Understand Greek literary style'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Themes in Luke', d: 'Major theological themes', obj: ['Explain salvation for all', 'Describe role of Holy Spirit', 'Understand prayer and worship'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Luke and the Marginalized', d: 'Concern for outcasts', obj: ['Examine women in Luke', 'Understand poor and rich theme', 'Assess Samaritans and outcasts'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Historical Context', d: 'First century Palestine', obj: ['Describe Roman occupation', 'Explain Jewish religious groups', 'Understand social context'] },
    { s: 'AS1: Luke Introduction', o: o++, t: 'Luke-Acts Connection', d: 'Two-volume work', obj: ['Explain Luke-Acts unity', 'Describe salvation history', 'Understand theological continuity'] }
  );
  
  // 1.2 Birth and Infancy Narratives (6 lessons)
  lessons.push(
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Annunciation to Zechariah', d: 'John the Baptist foretold', obj: ['Examine Luke 1:5-25', 'Understand angelic announcement', 'Assess Zechariah\'s doubt'] },
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Annunciation to Mary', d: 'Jesus\' birth foretold', obj: ['Examine Luke 1:26-38', 'Explain virgin conception', 'Understand Mary\'s response'] },
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Magnificat', d: 'Mary\'s song of praise', obj: ['Analyze Luke 1:46-55', 'Explain theological themes', 'Understand social reversal'] },
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Birth of Jesus', d: 'Nativity narrative', obj: ['Examine Luke 2:1-20', 'Understand census context', 'Assess shepherds significance'] },
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Presentation in Temple', d: 'Simeon and Anna', obj: ['Examine Luke 2:21-40', 'Understand Jewish customs', 'Assess prophetic recognition'] },
    { s: 'AS1: Luke Birth Narratives', o: o++, t: 'Boy Jesus in Temple', d: 'Childhood narrative', obj: ['Examine Luke 2:41-52', 'Understand Jesus\' self-awareness', 'Assess wisdom and growth'] }
  );
  
  // 1.3 Ministry of Jesus (12 lessons)
  lessons.push(
    { s: 'AS1: Luke Ministry', o: o++, t: 'John the Baptist', d: 'Preparing the way', obj: ['Examine Luke 3:1-20', 'Understand baptism of repentance', 'Assess prophetic role'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Baptism and Temptation', d: 'Jesus\' preparation', obj: ['Examine Luke 3:21-22 4:1-13', 'Understand Spirit descent', 'Assess wilderness testing'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Nazareth Synagogue', d: 'Manifesto of ministry', obj: ['Examine Luke 4:16-30', 'Understand Isaiah fulfillment', 'Assess rejection'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Calling Disciples', d: 'Miraculous catch of fish', obj: ['Examine Luke 5:1-11', 'Understand discipleship call', 'Assess Peter\'s response'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Healing Ministry', d: 'Jesus\' miracles of healing', obj: ['Examine various healing accounts', 'Understand compassion for sick', 'Assess faith and healing'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Sermon on the Plain', d: 'Teaching on discipleship', obj: ['Examine Luke 6:20-49', 'Compare Beatitudes', 'Understand ethical teaching'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Parables of Compassion', d: 'Good Samaritan Lost Sheep', obj: ['Examine Luke 10:25-37 15:1-7', 'Understand neighbor love', 'Assess God\'s seeking nature'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Parables of Lost and Found', d: 'Lost coin lost son', obj: ['Examine Luke 15:8-32', 'Understand divine joy', 'Assess prodigal son theology'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Parables on Wealth', d: 'Rich fool rich man and Lazarus', obj: ['Examine Luke 12:13-21 16:19-31', 'Understand wealth dangers', 'Assess reversal theme'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Pharisee and Tax Collector', d: 'Parable on prayer', obj: ['Examine Luke 18:9-14', 'Understand humility', 'Assess justification'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Zacchaeus', d: 'Salvation comes to tax collector', obj: ['Examine Luke 19:1-10', 'Understand repentance', 'Assess salvation for outcasts'] },
    { s: 'AS1: Luke Ministry', o: o++, t: 'Journey to Jerusalem', d: 'Travel narrative theme', obj: ['Understand Luke 9:51-19:44', 'Explain journey motif', 'Assess discipleship teaching'] }
  );
  
  // 1.4 Passion and Resurrection (10 lessons)
  lessons.push(
    { s: 'AS1: Luke Passion', o: o++, t: 'Triumphal Entry', d: 'Entry into Jerusalem', obj: ['Examine Luke 19:28-44', 'Understand messianic claim', 'Assess temple cleansing'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Last Supper', d: 'Final meal with disciples', obj: ['Examine Luke 22:7-38', 'Understand Passover context', 'Assess new covenant'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Gethsemane', d: 'Prayer and arrest', obj: ['Examine Luke 22:39-53', 'Understand agony prayer', 'Assess betrayal'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Trials of Jesus', d: 'Before Sanhedrin and Pilate', obj: ['Examine Luke 22:54-23:25', 'Understand Jewish Roman trials', 'Assess Peter\'s denial'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Crucifixion', d: 'Death on the cross', obj: ['Examine Luke 23:26-49', 'Understand seven words', 'Assess forgiveness theme'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Burial', d: 'Joseph of Arimathea', obj: ['Examine Luke 23:50-56', 'Understand burial customs', 'Assess women witnesses'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Empty Tomb', d: 'Resurrection discovery', obj: ['Examine Luke 24:1-12', 'Understand women\'s testimony', 'Assess empty tomb significance'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Road to Emmaus', d: 'Resurrection appearance', obj: ['Examine Luke 24:13-35', 'Understand recognition in breaking bread', 'Assess Scripture interpretation'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Appearances to Disciples', d: 'Post-resurrection encounters', obj: ['Examine Luke 24:36-49', 'Understand physical resurrection', 'Assess commission'] },
    { s: 'AS1: Luke Passion', o: o++, t: 'Ascension', d: 'Jesus\' departure', obj: ['Examine Luke 24:50-53', 'Understand ascension theology', 'Assess continuity to Acts'] }
  );
  
  // AS2: The Theology of Luke / Mark's Gospel
  
  // 2.1 Lukan Theology (8 lessons)
  lessons.push(
    { s: 'AS2: Lukan Theology', o: o++, t: 'Universal Salvation', d: 'Salvation for all people', obj: ['Examine Gentile inclusion', 'Understand salvation history', 'Assess universalism theme'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'The Holy Spirit', d: 'Role of Spirit in Luke', obj: ['Examine Spirit in ministry', 'Understand empowerment', 'Assess Pentecost anticipation'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Prayer in Luke', d: 'Jesus as man of prayer', obj: ['Examine prayer at key moments', 'Understand Lord\'s Prayer', 'Assess persistent prayer teaching'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Women in Luke', d: 'Prominent female figures', obj: ['Examine Mary Elizabeth women disciples', 'Understand women as witnesses', 'Assess gender inclusion'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Wealth and Poverty', d: 'Economic justice theme', obj: ['Examine warnings to rich', 'Understand concern for poor', 'Assess social reversal'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Meals and Fellowship', d: 'Table fellowship significance', obj: ['Examine meal narratives', 'Understand inclusive community', 'Assess Eucharistic echoes'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Joy and Praise', d: 'Worship in Luke', obj: ['Examine songs and praise', 'Understand joy theme', 'Assess worship response'] },
    { s: 'AS2: Lukan Theology', o: o++, t: 'Eschatology', d: 'End times teaching', obj: ['Examine kingdom of God', 'Understand future hope', 'Assess realized vs future'] }
  );
  
  // 2.2 Mark's Gospel Overview (8 lessons)
  lessons.push(
    { s: 'AS2: Mark Gospel', o: o++, t: 'Introduction to Mark', d: 'Earliest Gospel', obj: ['Examine authorship and date', 'Understand Mark as interpreter of Peter', 'Assess purpose for Roman audience'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Messianic Secret', d: 'Hidden identity theme', obj: ['Examine commands to silence', 'Understand concealment motif', 'Assess revelation timing'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Discipleship Failure', d: 'Disciples misunderstanding', obj: ['Examine disciples\' incomprehension', 'Understand realistic portrayal', 'Assess encouragement for readers'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Son of God Christology', d: 'Jesus\' divine identity', obj: ['Examine Son of God declarations', 'Understand divine sonship', 'Assess centurion\'s confession'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Suffering Servant', d: 'Servant Christology', obj: ['Examine passion predictions', 'Understand Isaiah 53 background', 'Assess ransom saying'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Kingdom of God', d: 'Central message', obj: ['Examine kingdom parables', 'Understand present and future', 'Assess kingdom ethics'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Miracles in Mark', d: 'Signs of authority', obj: ['Examine nature exorcism healing miracles', 'Understand demonstrations of power', 'Assess faith responses'] },
    { s: 'AS2: Mark Gospel', o: o++, t: 'Mark\'s Ending', d: 'Abrupt conclusion', obj: ['Examine Mark 16:1-8', 'Understand shorter vs longer ending', 'Assess literary impact'] }
  );
  
  // AS3: Celtic Christianity
  
  // 3.1 Origins and Development (6 lessons)
  lessons.push(
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Origins of Celtic Christianity', d: 'Early Irish and British Christianity', obj: ['Examine Patrick\'s mission', 'Understand pre-Augustinian Christianity', 'Assess Celtic vs Roman traditions'] },
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Monastic Tradition', d: 'Celtic monasticism', obj: ['Examine monastic communities', 'Understand ascetic practices', 'Assess Columba Columbanus'] },
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Celtic Spirituality', d: 'Distinctive spiritual characteristics', obj: ['Examine creation spirituality', 'Understand Trinity theology', 'Assess immanent view of God'] },
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Missionaries and Scholars', d: 'Celtic influence in Europe', obj: ['Examine Irish missionaries', 'Understand scholarship preservation', 'Assess cultural impact'] },
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Synod of Whitby', d: 'Roman-Celtic controversy', obj: ['Examine dating of Easter dispute', 'Understand Roman victory', 'Assess Celtic decline'] },
    { s: 'AS3: Celtic Christianity', o: o++, t: 'Celtic Revival', d: 'Modern rediscovery', obj: ['Examine 19th-20th century interest', 'Understand contemporary appeal', 'Assess authenticity questions'] }
  );
  
  return lessons;
}

function getReligiousStudiesA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Acts of the Apostles
  
  // 1.1 Introduction to Acts (6 lessons)
  lessons.push(
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Authorship and Date', d: 'Luke as author of Acts', obj: ['Examine evidence for Lukan authorship', 'Understand date 80-90 CE', 'Assess Luke-Acts continuity'] },
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Purpose and Themes', d: 'Why Acts was written', obj: ['Examine apologetic purpose', 'Understand spread of gospel theme', 'Assess Gentile mission legitimation'] },
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Structure of Acts', d: 'Organization of narrative', obj: ['Examine geographical structure', 'Understand Jerusalem to Rome', 'Assess parallel patterns'] },
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Historical Reliability', d: 'Acts as history', obj: ['Examine archaeological evidence', 'Assess historical accuracy debates', 'Understand theological history'] },
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Holy Spirit in Acts', d: 'Empowerment for mission', obj: ['Examine Pentecost event', 'Understand Spirit guidance', 'Assess charismatic phenomena'] },
    { s: 'A2-1: Acts Introduction', o: o++, t: 'Speeches in Acts', d: 'Kerygma and theology', obj: ['Examine Peter and Paul speeches', 'Understand apostolic preaching', 'Assess Lukan composition'] }
  );
  
  // 1.2 Early Jerusalem Church (8 lessons)
  lessons.push(
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Ascension and Matthias', d: 'Replacing Judas', obj: ['Examine Acts 1:1-26', 'Understand ascension', 'Assess apostolic restoration'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Pentecost', d: 'Coming of Holy Spirit', obj: ['Examine Acts 2:1-41', 'Understand Spirit manifestations', 'Assess Peter\'s sermon'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Early Community Life', d: 'Sharing possessions', obj: ['Examine Acts 2:42-47 4:32-37', 'Understand communal living', 'Assess ideal community'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Healing and Opposition', d: 'Apostles before Sanhedrin', obj: ['Examine Acts 3-4', 'Understand healing miracles', 'Assess Jewish opposition'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Ananias and Sapphira', d: 'Deception judgment', obj: ['Examine Acts 5:1-11', 'Understand community discipline', 'Assess divine judgment'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Stephen\'s Martyrdom', d: 'First Christian martyr', obj: ['Examine Acts 6-7', 'Understand Stephen\'s speech', 'Assess persecution trigger'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Philip\'s Mission', d: 'Samaritans and Ethiopian', obj: ['Examine Acts 8', 'Understand mission expansion', 'Assess Spirit guidance'] },
    { s: 'A2-1: Acts Jerusalem', o: o++, t: 'Saul\'s Conversion', d: 'Damascus road experience', obj: ['Examine Acts 9', 'Understand conversion accounts', 'Assess theological significance'] }
  );
  
  // 1.3 Peter and Gentile Mission (8 lessons)
  lessons.push(
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Peter\'s Ministry', d: 'Healing and raising dead', obj: ['Examine Acts 9:32-43', 'Understand Aeneas Tabitha', 'Assess Peter\'s authority'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Cornelius', d: 'First Gentile convert', obj: ['Examine Acts 10', 'Understand vision and conversion', 'Assess clean-unclean barrier broken'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Peter\'s Defense', d: 'Justifying Gentile inclusion', obj: ['Examine Acts 11:1-18', 'Understand Jerusalem church response', 'Assess Spirit\'s leading'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Antioch Church', d: 'First Gentile church', obj: ['Examine Acts 11:19-30', 'Understand Barnabas and Saul', 'Assess Christian name origin'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Peter\'s Imprisonment', d: 'Angel rescue', obj: ['Examine Acts 12', 'Understand Herod\'s persecution', 'Assess miraculous deliverance'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Jerusalem Council', d: 'Gentile requirements debate', obj: ['Examine Acts 15', 'Understand circumcision controversy', 'Assess apostolic decree'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Law and Grace', d: 'Theological issues', obj: ['Examine salvation by grace', 'Understand Torah observance', 'Assess Paul-Peter tension'] },
    { s: 'A2-1: Acts Peter Gentiles', o: o++, t: 'Table Fellowship', d: 'Eating together', obj: ['Examine social implications', 'Understand purity concerns', 'Assess unity challenges'] }
  );
  
  // 1.4 Paul's Missionary Journeys (10 lessons)
  lessons.push(
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'First Missionary Journey', d: 'Cyprus and Galatia', obj: ['Examine Acts 13-14', 'Understand synagogue strategy', 'Assess opposition and success'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Second Missionary Journey', d: 'Macedonia and Greece', obj: ['Examine Acts 15:36-18:22', 'Understand Philippi Thessalonica Athens', 'Assess Corinthian ministry'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Third Missionary Journey', d: 'Ephesus focus', obj: ['Examine Acts 18:23-21:16', 'Understand Ephesian ministry', 'Assess miracles and opposition'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Paul\'s Speeches', d: 'Missionary preaching', obj: ['Examine Pisidian Antioch Athens Miletus', 'Understand apologetic approaches', 'Assess Jewish vs Gentile audiences'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Miracles and Opposition', d: 'Signs and persecution', obj: ['Examine healing exorcism accounts', 'Understand riot at Ephesus', 'Assess conflict with authorities'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Jerusalem Arrest', d: 'Paul\'s final visit', obj: ['Examine Acts 21:17-23:35', 'Understand temple incident', 'Assess Roman custody'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Trial Before Felix', d: 'Caesarea imprisonment', obj: ['Examine Acts 24', 'Understand charges', 'Assess two-year detention'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Appeals to Caesar', d: 'Before Festus and Agrippa', obj: ['Examine Acts 25-26', 'Understand Roman citizenship rights', 'Assess defense speeches'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Journey to Rome', d: 'Shipwreck and arrival', obj: ['Examine Acts 27-28', 'Understand divine protection', 'Assess Malta ministry'] },
    { s: 'A2-1: Acts Paul Missions', o: o++, t: 'Rome and Ending', d: 'Paul\'s Roman ministry', obj: ['Examine Acts 28:16-31', 'Understand house arrest preaching', 'Assess open ending'] }
  );
  
  // A2-2: Worship and Christian Spirituality / Religion and Ethics
  
  // 2.1 Christian Worship (8 lessons)
  lessons.push(
    { s: 'A2-2: Worship', o: o++, t: 'Nature of Worship', d: 'Defining Christian worship', obj: ['Explain worship concepts', 'Understand adoration thanksgiving', 'Assess corporate and individual'] },
    { s: 'A2-2: Worship', o: o++, t: 'Biblical Foundations', d: 'Worship in Scripture', obj: ['Examine Old Testament worship', 'Understand New Testament patterns', 'Assess continuity and change'] },
    { s: 'A2-2: Worship', o: o++, t: 'Sacraments', d: 'Baptism and Eucharist', obj: ['Explain sacramental theology', 'Compare denominational views', 'Assess grace means'] },
    { s: 'A2-2: Worship', o: o++, t: 'Liturgical Worship', d: 'Structured services', obj: ['Examine liturgical traditions', 'Understand lectionary calendar', 'Assess ritual meaning'] },
    { s: 'A2-2: Worship', o: o++, t: 'Contemporary Worship', d: 'Modern expressions', obj: ['Examine praise and worship movement', 'Understand charismatic worship', 'Assess contextualization'] },
    { s: 'A2-2: Worship', o: o++, t: 'Music in Worship', d: 'Hymns and songs', obj: ['Examine worship music history', 'Understand theological content', 'Assess contemporary debates'] },
    { s: 'A2-2: Worship', o: o++, t: 'Prayer', d: 'Communication with God', obj: ['Explain types of prayer', 'Understand prayer theology', 'Assess answered prayer'] },
    { s: 'A2-2: Worship', o: o++, t: 'Architecture and Art', d: 'Sacred space', obj: ['Examine church architecture', 'Understand symbolism', 'Assess worship environment'] }
  );
  
  // 2.2 Christian Spirituality (8 lessons)
  lessons.push(
    { s: 'A2-2: Spirituality', o: o++, t: 'Nature of Spirituality', d: 'Defining Christian spirituality', obj: ['Explain spirituality concepts', 'Understand relationship with God', 'Assess spiritual formation'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Biblical Spirituality', d: 'Scriptural foundations', obj: ['Examine Jesus\' spirituality', 'Understand apostolic teaching', 'Assess discipleship'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Contemplative Tradition', d: 'Meditation and contemplation', obj: ['Examine mystics and monastics', 'Understand contemplative prayer', 'Assess silence and solitude'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Charismatic Spirituality', d: 'Spirit-filled life', obj: ['Explain Pentecostal spirituality', 'Understand spiritual gifts', 'Assess renewal movements'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Social Justice Spirituality', d: 'Faith and action', obj: ['Examine liberation theology', 'Understand prophetic spirituality', 'Assess activism'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Spiritual Disciplines', d: 'Practices for growth', obj: ['Explain classic disciplines', 'Understand formation practices', 'Assess spiritual growth'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Celtic Spirituality', d: 'Creation-centered approach', obj: ['Examine Celtic tradition', 'Understand nature spirituality', 'Assess contemporary relevance'] },
    { s: 'A2-2: Spirituality', o: o++, t: 'Contemporary Expressions', d: 'Modern spirituality forms', obj: ['Examine emerging expressions', 'Understand cultural adaptation', 'Assess authenticity'] }
  );
  
  // 2.3 Religion and Ethics (10 lessons)
  lessons.push(
    { s: 'A2-2: Ethics', o: o++, t: 'Nature of Ethics', d: 'Moral philosophy foundations', obj: ['Define ethics morality', 'Explain normative descriptive meta-ethics', 'Understand ethical reasoning'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Christian Ethics Foundations', d: 'Biblical basis', obj: ['Examine Ten Commandments', 'Understand Jesus\' teaching', 'Assess love command'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Natural Law', d: 'Aquinas and reason', obj: ['Explain natural law theory', 'Understand primary precepts', 'Assess Catholic moral theology'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Situation Ethics', d: 'Fletcher\'s love ethics', obj: ['Explain agape principle', 'Understand situational approach', 'Assess relativism concerns'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Utilitarianism', d: 'Consequentialist ethics', obj: ['Explain Bentham Mill', 'Understand greatest happiness principle', 'Assess act rule utilitarianism'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Kantian Ethics', d: 'Deontological approach', obj: ['Explain categorical imperative', 'Understand duty-based ethics', 'Assess moral absolutes'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Virtue Ethics', d: 'Character-based morality', obj: ['Explain Aristotelian virtue', 'Understand character formation', 'Assess contemporary relevance'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Applied Ethics Bioethics', d: 'Life and death issues', obj: ['Examine abortion euthanasia', 'Understand sanctity of life', 'Assess competing values'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Applied Ethics Sexual', d: 'Sexuality and relationships', obj: ['Examine marriage divorce', 'Understand sexual ethics', 'Assess LGBTQ issues'] },
    { s: 'A2-2: Ethics', o: o++, t: 'Applied Ethics Social', d: 'Justice and society', obj: ['Examine war and peace', 'Understand poverty and wealth', 'Assess environmental ethics'] }
  );
  
  return lessons;
}