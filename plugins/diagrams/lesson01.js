/* A2 Biology, Lesson 1 — Principles of Homeostasis.
 * 30 slide diagrams, one drawing function per slide.
 * Each function receives the toolkit and returns a finished Diagram. */

module.exports = {
  dir: 'a2-biology',
  prefix: 'a2-001-p',
  pages: [

// 1 — the negative feedback loop
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, RED, SLATE } = K;
  const d = newSheet('Negative feedback holds a controlled factor in its set range');
  const P=[[37,330],[286,330],[535,330],[535,186],[286,186],[37,186]];
  const T=['Controlled factor RISES above the set range','SENSOR detects the change and its direction',
           'CO-ORDINATOR compares it with the set range','EFFECTOR is switched on',
           'RESPONSE lowers the factor back down','Deviation SHRINKS, so correction is switched down'];
  const C=[RED,BLUE,INDIGO,AMBER,TEAL,TEAL];
  P.forEach((p,i)=>d.box(p[0],p[1],188,62,T[i],C[i],10.5));
  d.arrow([225,361],[286,361]); d.arrow([474,361],[535,361]);
  d.arrow([629,330],[629,248]); d.arrow([535,217],[474,217]); d.arrow([286,217],[225,217]);
  d.arrow([131,186],[131,142]);
  d.plot([[131,128],[629,128]],{colour:TEAL,lw:1.6,dashed:true});
  d.plot([[131,142],[131,128]],{colour:SLATE,lw:1.8});
  d.arrow([629,128],[629,186],TEAL,2.0,{dashed:true});
  d.fitlabel(380,104,700,'NEGATIVE FEEDBACK - the returning factor reduces the sensor signal, so correction is turned down',TEAL,10.5,true);
  d.caption('The response always acts AGAINST the original change, and is switched down as the factor returns. That is what prevents over-correction.',{y:52,size:10});
  return d; },

// 2 — learning outcomes
(K) => { const { newSheet, TEAL, SLATE, GREY } = K;
  const d = newSheet('What you must be able to do by the end of this lesson');
  d.steps(['Define homeostasis as maintenance of a constant state',
           'Identify the sensor and the corrective mechanism',
           'Explain negative feedback',
           'Apply feedback reasoning to an unfamiliar variable'],
          {x:40,y0:336,w:680,rowh:40,gap:10,colour:TEAL,size:11});
  d.label(380,160,'You should already know',SLATE,11.5,{bold:true});
  d.chain(['Cells work only within limited conditions','Receptors detect stimuli','Effectors produce responses'],
          {y:88,x0:40,x1:720,h:56,colour:GREY,size:9.5});
  return d; },

// 3 — terminology
(K) => { const { newSheet, INDIGO } = K;
  const d = newSheet('The terms this lesson depends on');
  d.cards([['Homeostasis','maintenance of a constant internal state within tolerable limits'],
           ['Controlled factor','the internal variable being regulated'],
           ['Sensor','receptor that monitors the controlled factor'],
           ['Corrective mechanism','the response that regulates the factor'],
           ['Effector','cell, tissue or organ that carries out the correction'],
           ['Negative feedback','reduces the deviation and stops correction as the factor is restored'],
           ['Set range','an acceptable interval, not one fixed number']],
          {y0:330,x:32,w:696,rowh:39,gap:6,colour:INDIGO,size:10});
  d.caption('Over-correction = a response continuing beyond the regulated state.   Dynamic equilibrium = continual small adjustments around a stable condition.',{y:30,size:9.5,wrap:110});
  return d; },

// 4 — the whole sequence
(K) => { const { newSheet, TEAL } = K;
  const d = newSheet('The whole sequence in one line');
  d.steps(['Controlled factor departs from its regulated state',
           'Sensor detects the direction and the size of the change',
           'Information reaches the co-ordinator',
           'Corrective mechanism activates the effectors',
           'The factor moves back toward the regulated state',
           'Sensor detects that the deviation is now smaller',
           'Corrective output falls and correction stops'],
          {x:40,y0:356,w:680,rowh:36,gap:7,colour:TEAL,size:10.5});
  d.caption('Every homeostasis answer you write should follow this order. Missing a step is the commonest way marks are lost.',{y:44,size:10});
  return d; },

// 5 — the control loop
(K) => { const { newSheet, TEAL, BLUE, RED } = K;
  const d = newSheet('Negative feedback shown as a control loop');
  d.box(286,330,188,60,'SET RANGE - the regulated state',TEAL,11);
  d.box(40,222,188,60,'deviation ABOVE the set range',RED,11);
  d.box(532,222,188,60,'deviation BELOW the set range',BLUE,11);
  d.box(40,110,188,56,'response LOWERS the factor',TEAL,10.5);
  d.box(532,110,188,56,'response RAISES the factor',TEAL,10.5);
  d.arrow([286,352],[228,282],RED,1.8); d.arrow([474,352],[532,282],BLUE,1.8);
  d.arrow([134,222],[134,166],RED); d.arrow([626,222],[626,166],BLUE);
  d.plot([[134,110],[134,76]],{colour:TEAL,lw:1.6,dashed:true});
  d.plot([[626,110],[626,76]],{colour:TEAL,lw:1.6,dashed:true});
  d.plot([[134,76],[626,76]],{colour:TEAL,lw:1.6,dashed:true});
  d.arrow([380,76],[380,326],TEAL,2.0,{dashed:true});
  d.fitlabel(380,58,640,'both corrections return the factor to the set range',TEAL,10.5,true);
  return d; },

// 6 — "constant" means fluctuating within limits
(K) => { const { newSheet, TEAL, BLUE, SLATE } = K;
  const d = newSheet("'Constant' means fluctuating within narrow limits");
  d.rect(90,182,560,64,'#dcfce7');
  d.axesbox(90,96,560,236,{xlabel:'time',ylabel:'value of the factor'});
  d.plot([[90,214],[650,214]],{colour:TEAL,lw:1.4,dashed:true});
  const pts=[]; for(let i=0;i<=300;i++){ const t=i*560/300;
    pts.push([90+t, 214+13*Math.sin(t/38)+5*Math.sin(t/11+1)]); }
  d.plot(pts,{colour:BLUE,lw:2.2});
  d.label(658,214,'set point',TEAL,9.5,{ha:'left'});
  d.label(658,252,'upper limit',SLATE,9,{ha:'left'});
  d.label(658,176,'lower limit',SLATE,9,{ha:'left'});
  d.caption('The value is never mathematically fixed. Regulation keeps it inside limits that protect enzyme activity, membrane processes and cell water balance.',{y:48,size:10});
  return d; },

// 7 — controlled factors
(K) => { const { newSheet, TEAL, BLUE, AMBER, RED, GREY } = K;
  const d = newSheet('A controlled factor is something you can measure');
  d.chain(['blood temperature','blood glucose','carbon dioxide','water potential'],
          {y:248,x0:40,x1:720,h:86,colour:[RED,AMBER,BLUE,TEAL],size:11});
  d.cards([['about 37 C','normal core body temperature'],
           ['4-7 mmol per dm3','normal fasting blood glucose']],
          {y0:170,x:40,w:680,rowh:46,gap:10,colour:GREY,size:10});
  d.caption('Always name and define the factor before you describe the system that controls it.',{y:52,size:10.5});
  return d; },

// 8 — sensor is not effector
(K) => { const { newSheet, BLUE, AMBER } = K;
  const d = newSheet('A sensor detects - it does not correct');
  d.twocol(['Monitors the controlled factor','Changes activity when the value changes','Sends information into the pathway','Example: a thermoreceptor'],
           ['Produces the response','Changes the controlled factor itself','Receives instructions from the co-ordinator','Example: a sweat gland'],
           {y0:280,rowh:50,gap:10,lc:BLUE,rc:AMBER,heads:['SENSOR (receptor)','EFFECTOR']});
  d.caption('A very common exam error is to say the receptor corrects the factor. It only detects; the effector executes the correction.',{y:48,size:10.5});
  return d; },

// 9 — the co-ordinator
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER } = K;
  const d = newSheet('The co-ordinator compares the input with the set range');
  d.box(40,262,180,72,'input from the SENSOR',BLUE,10.5);
  d.box(290,262,180,72,'CO-ORDINATOR compares with required conditions',INDIGO,10.5);
  d.box(540,262,180,72,'instructions to the EFFECTORS',AMBER,10.5);
  d.arrow([220,298],[290,298]); d.arrow([470,298],[540,298]);
  d.twocol(['nervous centres','fast, short-lived','impulses along neurones'],
           ['endocrine centres','slower, longer-lasting','hormones in the blood'],
           {y0:146,rowh:42,gap:8,lc:INDIGO,rc:TEAL,heads:['Nervous co-ordination','Endocrine co-ordination']});
  d.caption('CCEA names the sensor and the corrective mechanism as the essential components.',{y:26,size:10});
  return d; },

// 10 — effectors
(K) => { const { newSheet, AMBER } = K;
  const d = newSheet('Effectors change the factor in a stated direction');
  d.cards([['Muscle','arterioles narrow, so less heat is lost'],
           ['Gland','a sweat gland increases evaporative cooling'],
           ['Kidney tubule','more water is returned to the blood'],
           ['Liver','glucose is stored as glycogen']],
          {y0:330,x:40,w:680,rowh:54,gap:12,colour:AMBER,size:10.5});
  d.caption("State the DIRECTION of the effect, not just the organ. 'The sweat gland responds' scores nothing; 'sweating increases, so more heat is lost' scores the mark.",{y:52,size:10});
  return d; },

// 11 — evidence chain
(K) => { const { newSheet, TEAL, INDIGO, RED } = K;
  const d = newSheet('Every mark comes from a link, not from a fact');
  d.chain(['what CHANGES first','the PROCESS responsible','the measurable CONSEQUENCE'],
          {y:278,x0:40,x1:720,h:76,colour:[RED,INDIGO,TEAL],size:11});
  d.box(40,150,680,72,'blood temperature rises  ->  thermoreceptors increase impulses to the hypothalamus  ->  skin arterioles vasodilate, so more heat is lost',TEAL,10.5);
  d.caption('A list of correct facts with no links between them is the commonest reason a long answer scores half marks.',{y:60,size:10.5});
  return d; },

// 12 — opposition
(K) => { const { newSheet, TEAL, BLUE, RED } = K;
  const d = newSheet('Negative feedback: the response opposes the change');
  d.twocol(['Factor RISES above the set range','Response LOWERS it','the deviation is reduced'],
           ['Factor FALLS below the set range','Response RAISES it','the deviation is reduced'],
           {y0:264,rowh:58,gap:12,lc:RED,rc:BLUE,heads:['If the value goes UP','If the value goes DOWN']});
  d.box(150,70,460,54,"'Negative' means OPPOSING the change - it does not mean harmful",TEAL,11);
  return d; },

// 13 — correction switches itself off
(K) => { const { newSheet, TEAL, AMBER, RED } = K;
  const d = newSheet('Correction switches itself off as the factor returns');
  d.axesbox(90,110,540,216,{xlabel:'time',ylabel:''});
  const a=[],b=[];
  for(let i=0;i<=300;i++){ const t=i*540/300; const dev=58*Math.exp(-t/150);
    a.push([90+t,150+dev]); b.push([90+t,150+dev*0.9]); }
  d.plot(a,{colour:RED,lw:2.4}); d.plot(b,{colour:AMBER,lw:2.0,dashed:true});
  d.plot([[90,150],[630,150]],{colour:TEAL,lw:1.4,dashed:true});
  d.label(640,208,'deviation',RED,9.5,{ha:'left'});
  d.label(640,188,'corrective output',AMBER,9.5,{ha:'left'});
  d.label(640,150,'set point',TEAL,9.5,{ha:'left'});
  d.caption('As the factor returns, receptor stimulation falls, so the corrective signal falls with it. Correction stops before the factor is driven past the set point.',{y:50,size:10});
  return d; },

// 14 — several effectors
(K) => { const { newSheet, TEAL, BLUE, RED } = K;
  const d = newSheet('Several effectors can correct the same factor together');
  d.box(286,336,188,60,'one controlled factor is too low',RED,10.5);
  d.box(40,208,270,72,'PATHWAY 1 increases the input of the factor',TEAL,10.5);
  d.box(450,208,270,72,'PATHWAY 2 reduces the loss of the factor',BLUE,10.5);
  d.arrow([330,336],[190,282],TEAL,1.8); d.arrow([430,336],[570,282],BLUE,1.8);
  d.arrow([175,208],[330,150],TEAL,1.8); d.arrow([585,208],[430,150],BLUE,1.8);
  d.box(250,86,260,60,'combined effect restores the factor faster',TEAL,11);
  return d; },

// 15 — a broken link
(K) => { const { newSheet, BLUE, INDIGO, AMBER, RED } = K;
  const d = newSheet('If one link breaks, regulation fails');
  d.chain(['SENSOR','CO-ORDINATOR','EFFECTOR'],{y:300,x0:90,x1:670,h:64,colour:[BLUE,INDIGO,AMBER],size:11});
  [252,468].forEach(x=>d.label(x,332,'X',RED,17,{bold:true}));
  d.cards([['Sensor damaged','the change is never detected, so no correction begins'],
           ['Pathway blocked','the message never reaches the effector'],
           ['Effector damaged','the instruction arrives but no response is produced']],
          {y0:222,x:40,w:680,rowh:52,gap:10,colour:RED,size:10.5});
  d.caption('To predict the outcome, follow the broken link and state which step can no longer happen.',{y:38,size:10.5});
  return d; },

// 16 — worked example 1, decoding the question
(K) => { const { newSheet, TEAL, BLUE, SLATE } = K;
  const d = newSheet('Worked example 1 - decoding what the question wants');
  d.box(40,326,680,66,'Blood temperature rises above its regulated state. Explain a complete generic negative-feedback response.',BLUE,11);
  d.label(380,300,'Three things must appear in the answer',SLATE,11.5,{bold:true});
  d.steps(['Identify the controlled factor and the sensor',
           'State the direction of the correction',
           'Explain how the correction is stopped'],
          {x:90,y0:220,w:580,rowh:44,gap:12,colour:TEAL,size:11});
  d.caption("'Explain' means give the causal chain. A description of what happens, with no 'because', will not reach full marks.",{y:46,size:10.5});
  return d; },

// 17 — worked example 1, every microstep
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Worked example 1 - every microstep written out',13.5);
  const L=['The controlled factor is blood temperature','Its value rises above the regulated range',
    'Thermoreceptors act as sensors and detect the increase','Information reaches a co-ordinating centre',
    'The centre increases signals to heat-loss effectors','Skin blood flow and evaporative heat loss rise',
    'These responses transfer more heat from the body','Blood temperature moves back toward the range',
    'Sensors detect that the deviation is smaller','Corrective output decreases',
    'Heat-loss responses return toward baseline','Stopping prevents temperature falling too far'];
  let y=386;
  L.forEach((t,i)=>{ d.box(40,y,680,26,`${i+1}.  ${t}`, i<8?TEAL:INDIGO, 9.5); y-=28; });
  d.caption('Steps 9-12 are the ones candidates leave out - they are what make the feedback negative.',{y:30,size:10});
  return d; },

// 18 — worked example 1, conclusion
(K) => { const { newSheet, TEAL, INDIGO, AMBER } = K;
  const d = newSheet('Worked example 1 - conclusion and check');
  d.box(40,300,680,80,'Negative feedback reverses the rise and then switches the correction down',TEAL,12.5);
  d.box(40,190,680,80,'CHECK: a response that simply continued would cause OVER-CORRECTION - the temperature would fall below the set range',AMBER,11.5);
  d.cards([['Negative feedback','reduces the deviation and stops correction as the factor is restored'],
           ['Over-correction','a response continuing beyond the required regulated state']],
          {y0:112,x:40,w:680,rowh:48,gap:10,colour:INDIGO,size:10});
  return d; },

// 19 — comparing the parts
(K) => { const { newSheet, BLUE, INDIGO, AMBER } = K;
  const d = newSheet('Comparing the parts of the control system');
  d.twocol(['detects the change','does not alter the factor','information in','a thermoreceptor'],
           ['produces the change','alters the factor directly','instruction out','a sweat gland'],
           {y0:274,rowh:48,gap:10,lc:BLUE,rc:AMBER,heads:['SENSOR','EFFECTOR']});
  d.box(40,50,680,50,'The co-ordinator sits between them: it compares the input with the set range and decides the output',INDIGO,10.5);
  return d; },

// 20 — a sensor reporting the wrong value
(K) => { const { newSheet, TEAL, AMBER, RED } = K;
  const d = newSheet('Application: a sensor that reports the wrong value');
  d.box(40,352,680,50,'The factor is actually HIGH, but the sensor reports it as LOW',RED,11.5);
  d.steps(['The co-ordinator receives inaccurate information',
           'It interprets the factor as below the regulated state',
           'It activates a response that RAISES the factor',
           'The already-high value rises further',
           'Feedback cannot operate while the sensor error persists'],
          {x:40,y0:286,w:680,rowh:38,gap:9,colour:AMBER,size:10.5});
  d.box(40,42,680,50,'Independent measurement reveals the mismatch; repairing or bypassing the sensor restores regulation',TEAL,10.5);
  return d; },

// 21 — misconceptions corrected
(K) => { const { newSheet, TEAL, RED, SLATE } = K;
  const d = newSheet('Three misconceptions, corrected');
  const data=[['Homeostasis keeps everything perfectly fixed','Values fluctuate within regulated limits'],
              ['Negative feedback means a harmful response',"'Negative' describes opposition to change"],
              ['The receptor corrects the factor','The receptor senses; effectors correct']];
  let y=326;
  for(const [wrong,right] of data){
    d.box(40,y,326,70,'WRONG:  '+wrong,RED,10);
    d.box(398,y,322,70,'RIGHT:  '+right,TEAL,10);
    d.arrow([370,y+35],[394,y+35],SLATE,1.6);
    y-=90;
  }
  return d; },

// 22 — specification checkpoint
(K) => { const { newSheet, TEAL, AMBER } = K;
  const d = newSheet('CCEA specification checkpoint - 4.1.1');
  d.steps(['define homeostasis as maintenance of a constant state',
           'identify the sensor and the corrective mechanism',
           'explain negative feedback',
           'apply feedback reasoning to unfamiliar variables'],
          {x:40,y0:326,w:680,rowh:42,gap:10,colour:TEAL,size:11});
  d.box(40,84,680,72,'The specification requires negative feedback to be described as STOPPING the correction and PREVENTING over-correction - not merely as opposing the change',AMBER,10.5);
  return d; },

// 23 — check your understanding
(K) => { const { newSheet, BLUE } = K;
  const d = newSheet('Check your understanding');
  d.steps(['Define homeostasis','What does the sensor do?','What makes feedback negative?',
           'How is over-correction prevented?'],
          {x:60,y0:330,w:640,rowh:52,gap:14,colour:BLUE,size:11.5});
  d.caption('Write full sentences. Each answer should name the structure and state what it does.',{y:48,size:10.5});
  return d; },

// 24 — answers 1 and 2
(K) => { const { newSheet, TEAL, BLUE } = K;
  const d = newSheet('Answers to questions 1 and 2');
  d.label(60,378,'1   Define homeostasis',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['Maintenance of a constant internal state','Constant means within limits compatible with normal function',
           'Active adjustments maintain the condition'],
          {x:60,y0:302,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  d.label(60,168,'2   What does the sensor do?',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['It monitors the controlled factor','It detects a change and its direction',
           'It provides information to the control pathway'],
          {x:60,y0:92,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  return d; },

// 25 — answers 3 and 4
(K) => { const { newSheet, TEAL, BLUE } = K;
  const d = newSheet('Answers to questions 3 and 4');
  d.label(60,378,'3   What makes feedback negative?',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['The response opposes the original change','A rise triggers lowering; a fall triggers raising',
           'The deviation therefore decreases'],
          {x:60,y0:302,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  d.label(60,168,'4   How is over-correction prevented?',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['Restoration reduces receptor stimulation','Corrective signals decline',
           'Effectors stop or return toward baseline'],
          {x:60,y0:92,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  return d; },

// 26 — data task
(K) => { const { newSheet, TEAL, BLUE, AMBER, RED } = K;
  const d = newSheet('Data task - how much of the deviation was corrected?');
  d.axesbox(120,130,470,200,{xlabel:'',ylabel:'value'});
  const rows=[['37.0   set point',TEAL,150],['38.2   after the rise',RED,300],['37.3   after correction',AMBER,196]];
  for(const [lab,c,yy] of rows){
    d.plot([[120,yy],[590,yy]],{colour:c,lw:1.8,dashed:true});
    d.label(600,yy,lab,c,9.5,{ha:'left'});
  }
  d.darrow([200,150],[200,300],RED,1.8);
  d.label(192,226,'original\ndeviation',RED,9,{ha:'right'});
  d.darrow([420,150],[420,196],AMBER,1.8);
  d.label(430,172,'remaining',AMBER,9,{ha:'left'});
  d.box(150,46,460,54,'Calculate the percentage of the original deviation that was corrected',BLUE,11);
  return d; },

// 27 — the calculation
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Working out the percentage corrected');
  d.steps(['Original deviation  =  38.2 - 37.0  =  1.2',
           'Remaining deviation  =  37.3 - 37.0  =  0.3',
           'Correction achieved  =  1.2 - 0.3  =  0.9',
           'Fraction corrected  =  0.9 / 1.2  =  0.75',
           'Percentage corrected  =  0.75 x 100  =  75 %'],
          {x:70,y0:330,w:620,rowh:44,gap:11,colour:INDIGO,size:11.5});
  d.box(150,46,460,52,'Seventy-five per cent of the original deviation was corrected',TEAL,11.5);
  return d; },

// 28 — exam question
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, SLATE } = K;
  const d = newSheet('CCEA exam-style question - 12 marks');
  d.box(40,320,680,80,'Explain the principles of homeostasis using a connected biological argument and relevant evidence',BLUE,12);
  d.label(380,292,'How the 12 marks are earned',SLATE,11.5,{bold:true});
  d.chain(['8 marks for the eight linked stages','2 marks for correct terminology','2 marks for a worked example'],
          {y:166,x0:60,x1:700,h:92,colour:[TEAL,INDIGO,AMBER],size:10.5});
  d.caption('Plan the eight stages before you start writing. An unordered list of true statements cannot reach the top band.',{y:52,size:10.5});
  return d; },

// 29 — the eight-stage answer
(K) => { const { newSheet, TEAL, AMBER, SLATE } = K;
  const d = newSheet('The eight-stage answer, one mark per stage',13.5);
  const L=['Homeostasis maintains a constant state within functional limits',
    'A controlled factor is measurable and must be named',
    'Sensors monitor the factor and detect change',
    'A co-ordinator compares the input with the required conditions',
    'Effectors create the correction in a stated direction',
    'Negative feedback means the response opposes the deviation',
    'Feedback stops the response as the factor returns',
    'Several effectors may co-operate to restore the factor'];
  let y=368;
  L.forEach((t,i)=>{ d.box(40,y,636,34,`${i+1}.  ${t}`,TEAL,10);
                     d.label(700,y+17,'[1]',SLATE,10,{bold:true}); y-=38; });
  d.box(40,40,680,44,'Examiner note: use the full chain sensor -> corrective mechanism -> restored factor -> reduced correction',AMBER,10);
  return d; },

// 30 — recap
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Recap, and where this leads next');
  d.steps(['Homeostasis keeps internal factors within functional limits',
           'Sensors detect deviations and effectors correct them',
           'Negative feedback switches the correction down as the factor returns'],
          {x:40,y0:330,w:680,rowh:50,gap:12,colour:TEAL,size:11.5});
  d.box(40,110,680,70,'NEXT LESSON: the same principles applied to the kidney - excretion, osmoregulation and water balance',INDIGO,11.5);
  return d; },

  ],
};
