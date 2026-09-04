/* A2 Biology, Lesson 2 — The Kidney in Excretion and Osmoregulation.
 * 30 diagrams matching the 30 slides. Slide 5 targets the lesson-assets path
 * the slide HTML already uses, so no slide markup has to change. */

module.exports = {
  dir: 'a2-biology',
  prefix: 'a2-002-p',
  pages: [

// 1 — two jobs, one urine
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, SLATE } = K;
  const d = newSheet('One organ, two different jobs, one urine');
  d.box(280,336,200,58,'THE KIDNEY',INDIGO,12);
  d.box(40,208,300,86,'EXCRETION - remove toxic waste made by cells (urea, creatinine)',BLUE,11);
  d.box(420,208,300,86,'OSMOREGULATION - adjust how much water leaves the body',TEAL,11);
  d.arrow([340,336],[240,296],BLUE,1.9); d.arrow([420,336],[520,296],TEAL,1.9);
  d.arrow([190,208],[300,152],BLUE,1.9); d.arrow([570,208],[460,152],TEAL,1.9);
  d.box(250,92,260,58,'URINE carries both outcomes',AMBER,11.5);
  d.fitlabel(380,64,660,'The same fluid does both jobs at once, which is why urine volume can change without changing the waste being removed.',SLATE,10,false);
  return d; },

// 2 — outcomes and starting points
(K) => { const { newSheet, TEAL, SLATE, GREY } = K;
  const d = newSheet('What you must be able to do by the end of this lesson');
  d.steps(['Define excretion and osmoregulation',
           'Explain urea and creatinine removal',
           'Explain control of body-fluid water potential',
           'Distinguish urine formation from egestion'],
          {x:40,y0:336,w:680,rowh:40,gap:10,colour:TEAL,size:11});
  d.label(380,160,'You should already know',SLATE,11.5,{bold:true});
  d.chain(['Metabolism produces waste','Water moves by osmosis down a water-potential gradient','Blood transports dissolved substances'],
          {y:88,x0:40,x1:720,h:56,colour:GREY,size:9.5});
  return d; },

// 3 — terminology
(K) => { const { newSheet, INDIGO } = K;
  const d = newSheet('The terms this lesson depends on');
  d.cards([['Excretion','removal of toxic products of metabolism from the body'],
           ['Urea','nitrogen waste formed from excess amino-acid nitrogen'],
           ['Creatinine','nitrogen waste from muscle creatine turnover'],
           ['Osmoregulation','control of the water potential of body fluids'],
           ['Water potential','tendency of water to move; lower values hold less free water'],
           ['Urine','fluid carrying excreted waste plus adjusted water and ions'],
           ['Egestion','removal of undigested gut contents - NOT excretion']],
          {y0:330,x:32,w:696,rowh:39,gap:6,colour:INDIGO,size:10});
  d.caption('Metabolic waste is made by cell reactions and may become toxic. Plasma is the liquid part of blood that carries these solutes to the kidney.',{y:30,size:9.5,wrap:110});
  return d; },

// 4 — the sequence in one line
(K) => { const { newSheet, TEAL } = K;
  const d = newSheet('The whole sequence in one line');
  d.steps(['Metabolism in cells produces waste',
           'Blood carries the dissolved waste to the kidneys',
           'Filtration moves small molecules into the nephron',
           'Useful solutes and required water return to the blood',
           'Urea and creatinine stay behind for excretion',
           'Final water recovery is varied to suit the body',
           'Urine passes to the ureter',
           'Body-fluid water potential moves back toward optimum'],
          {x:40,y0:352,w:680,rowh:33,gap:6,colour:TEAL,size:10.5});
  d.caption('Every long answer on this topic should follow this order. Marks come from the links between stages, not from the facts alone.',{y:38,size:10});
  return d; },

// 5 — kidney section: served by the OpenStax figure decoded from assets-b64,
//     so nothing is drawn for this slide.
{ skip: true },


// 6 — excretion removes metabolic waste
(K) => { const { newSheet, TEAL, BLUE, RED } = K;
  const d = newSheet('Excretion removes waste made by cells');
  d.chain(['cell METABOLISM','waste enters the BLOOD','removed by the KIDNEY'],
          {y:280,x0:40,x1:720,h:76,colour:[BLUE,TEAL,TEAL],size:11});
  d.box(40,150,680,72,'If waste accumulates it disrupts enzyme activity, ion gradients and organ function',RED,11);
  d.caption('The waste comes from reactions inside cells, not from undigested food. That single sentence separates excretion from egestion.',{y:56,size:10.5});
  return d; },

// 7 — urea carries excess nitrogen
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, RED } = K;
  const d = newSheet('Urea carries excess nitrogen out of the body');
  d.chain(['excess AMINO ACIDS','nitrogen removed','AMMONIA - very toxic','converted to UREA'],
          {y:262,x0:36,x1:724,h:82,colour:[BLUE,INDIGO,RED,TEAL],size:10});
  d.box(40,150,680,70,'Amino acids cannot be stored as a reserve, so surplus nitrogen must be dealt with rather than kept',AMBER,10.5);
  d.caption('Urea is far less toxic than ammonia, so it can be carried safely in the blood to the kidney.',{y:56,size:10.5});
  return d; },

// 8 — creatinine
(K) => { const { newSheet, TEAL, BLUE, AMBER } = K;
  const d = newSheet('Creatinine comes from muscle metabolism');
  d.chain(['MUSCLE activity','creatine turnover','CREATININE formed','filtered and excreted'],
          {y:262,x0:36,x1:724,h:82,colour:[AMBER,AMBER,BLUE,TEAL],size:10});
  d.box(40,150,680,70,'CCEA names urea AND creatinine as the nitrogen-containing wastes removed by the kidney',TEAL,11);
  d.caption('Because it is produced at a fairly steady rate, its concentration in blood indicates how well the kidney is filtering.',{y:56,size:10.5});
  return d; },

// 9 — blood delivers wastes
(K) => { const { newSheet, TEAL, BLUE, AMBER, RED, SLATE } = K;
  const d = newSheet('Blood delivers the waste; urine completes the removal');
  d.box(40,272,190,76,'renal PLASMA carries dissolved waste',RED,10.5);
  d.box(285,272,190,76,'waste passes into the FILTRATE',BLUE,10.5);
  d.box(530,272,190,76,'waste leaves in URINE',AMBER,10.5);
  d.arrow([230,310],[285,310]); d.arrow([475,310],[530,310]);
  d.box(40,140,680,74,'Entering the filtrate only BEGINS removal. Nothing has been excreted until the urine leaves the body.',TEAL,11);
  d.label(380,106,'This is a favourite examiner distinction',SLATE,10.5,{bold:true});
  return d; },

// 10 — filtered, reabsorbed, excreted
(K) => { const { newSheet, TEAL, BLUE, AMBER } = K;
  const d = newSheet('Filtered is not the same as excreted');
  d.twocol(['glucose','amino acids','most water','most sodium ions'],
           ['urea','creatinine','surplus water','surplus ions'],
           {y0:270,rowh:44,gap:9,lc:BLUE,rc:AMBER,heads:['FILTERED, then REABSORBED','FILTERED, then EXCRETED']});
  d.box(40,50,680,54,'Excretion is selective processing of the filtrate - the kidney is not simply draining plasma',TEAL,11);
  return d; },

// 11 — evidence and meaning
(K) => { const { newSheet, TEAL, INDIGO, RED } = K;
  const d = newSheet('Turning the evidence into a biological argument');
  d.chain(['what CHANGES first','the PROCESS responsible','the measurable CONSEQUENCE'],
          {y:278,x0:40,x1:720,h:76,colour:[RED,INDIGO,TEAL],size:11});
  d.box(40,150,680,72,'body water falls  ->  ADH raises collecting-duct permeability  ->  urine volume falls and its concentration rises',TEAL,10.5);
  d.caption('Correct facts with no links between them is the commonest reason a long answer stalls at half marks.',{y:58,size:10.5});
  return d; },

// 12 — osmoregulation controls water potential
(K) => { const { newSheet, TEAL, BLUE, RED, SLATE } = K;
  const d = newSheet('Cells need a steady water potential around them');
  d.box(40,246,200,92,'surroundings TOO DILUTE - water enters cells',BLUE,10.5);
  d.box(280,246,200,92,'OPTIMUM - cells keep their volume',TEAL,10.5);
  d.box(520,246,200,92,'surroundings TOO CONCENTRATED - water leaves cells',RED,10.5);
  d.arrow([240,292],[278,292],SLATE,1.7); d.arrow([520,292],[482,292],SLATE,1.7);
  d.box(40,128,680,72,'The kidney is the effector: it varies how much of the filtered water is returned to the blood',TEAL,11);
  d.caption('Osmoregulation is about the water potential of the body fluids, not about salt alone.',{y:52,size:10.5});
  return d; },

// 13 — urine volume can change
(K) => { const { newSheet, TEAL, BLUE, AMBER } = K;
  const d = newSheet('Urine volume changes, but waste removal continues');
  d.twocol(['plenty of water available','little water reabsorbed','LARGE volume of urine','DILUTE urine'],
           ['dehydrated','much water reabsorbed','SMALL volume of urine','CONCENTRATED urine'],
           {y0:276,rowh:44,gap:9,lc:BLUE,rc:AMBER,heads:['Well hydrated','Dehydrated']});
  d.box(40,52,680,56,'In BOTH cases urea and creatinine still have to leave - only the water changes',TEAL,11);
  return d; },

// 14 — kidney and hormones
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, SLATE } = K;
  const d = newSheet('Osmoreceptors detect; the kidney corrects');
  d.chain(['OSMORECEPTORS in the hypothalamus detect the change','ADH released from the posterior pituitary','COLLECTING DUCT permeability changes','water recovery changes'],
          {y:250,x0:30,x1:730,h:96,colour:[BLUE,INDIGO,AMBER,TEAL],size:9.5});
  d.box(40,130,680,68,'Sensor = osmoreceptor.   Co-ordinator = hypothalamus and pituitary.   Effector = kidney tubule.',TEAL,11);
  d.fitlabel(380,96,700,'This is the negative-feedback pattern from Lesson 1, applied to water',SLATE,10.5,true);
  d.caption('Naming the sensor, the co-ordinator and the effector separately turns a description into an explanation.',{y:50,size:10});
  return d; },

// 15 — excretion vs egestion
(K) => { const { newSheet, TEAL, BLUE, AMBER } = K;
  const d = newSheet('Excretion is not egestion');
  d.twocol(['waste MADE by cell metabolism','was absorbed into the body','urea, creatinine, carbon dioxide','leaves in urine or breath'],
           ['undigested FOOD material','was never absorbed into cells','fibre and gut contents','leaves as faeces'],
           {y0:276,rowh:44,gap:9,lc:TEAL,rc:AMBER,heads:['EXCRETION','EGESTION']});
  d.box(40,52,680,56,'Test to apply: did the substance ever take part in the metabolism of a cell?',BLUE,11);
  return d; },

// 16 — worked example 1, decode
(K) => { const { newSheet, TEAL, BLUE, SLATE } = K;
  const d = newSheet('Worked example 1 - decoding what the question wants');
  d.box(40,326,680,66,'Explain why a dehydrated person still forms urine, but produces less water-rich urine.',BLUE,11);
  d.label(380,300,'Three things must appear in the answer',SLATE,11.5,{bold:true});
  d.steps(['Keep excretion separate from water balance',
           'Use water reabsorption to explain the change',
           'State the outcome for urine volume and concentration'],
          {x:90,y0:220,w:580,rowh:44,gap:12,colour:TEAL,size:11});
  d.caption('The trap is answering only half the question. Waste removal must continue even while water is conserved.',{y:44,size:10.5});
  return d; },

// 17 — worked example 1, microsteps
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Worked example 1 - every microstep written out',13.5);
  const L=['Cell metabolism continues to produce urea and creatinine',
    'Blood carries these dissolved wastes to the kidneys',
    'They must still be excreted to prevent harmful accumulation',
    'Dehydration lowers body-fluid water potential',
    'Osmoreceptors stimulate greater ADH release',
    'ADH raises water permeability of DCT and collecting duct',
    'More water moves from filtrate into the medulla and blood',
    'Less water remains in the collecting-duct fluid',
    'Urea and creatinine remain behind for removal',
    'Urine volume falls while its solute concentration rises',
    'Excretion therefore continues while water is conserved',
    'CHECK: urine does not stop in ordinary dehydration'];
  let y=386;
  L.forEach((t,i)=>{ d.box(40,y,680,26,`${i+1}.  ${t}`, i<8?TEAL:INDIGO, 9.5); y-=28; });
  d.caption('Steps 9-12 are the ones candidates leave out - they answer the second half of the question.',{y:30,size:10});
  return d; },

// 18 — worked example 1, conclusion
(K) => { const { newSheet, TEAL, INDIGO, AMBER } = K;
  const d = newSheet('Worked example 1 - conclusion and check');
  d.box(40,300,680,80,'The kidney conserves water without stopping the removal of metabolic waste',TEAL,12.5);
  d.box(40,190,680,80,'CHECK: do NOT write that urine production stops during ordinary dehydration - it becomes smaller and more concentrated',AMBER,11.5);
  d.cards([['Urine','fluid carrying excreted waste plus adjusted water and ions'],
           ['Osmoregulation','control of the water potential of the body fluids']],
          {y0:112,x:40,w:680,rowh:48,gap:10,colour:INDIGO,size:10});
  return d; },

// 19 — compare the two roles
(K) => { const { newSheet, TEAL, BLUE, INDIGO } = K;
  const d = newSheet('Comparing the two roles of the kidney');
  d.twocol(['removes toxic metabolic waste','urea and creatinine','failure lets waste accumulate','judged by blood creatinine'],
           ['controls body-fluid water potential','water and ions','failure causes water imbalance','judged by urine concentration'],
           {y0:274,rowh:48,gap:10,lc:BLUE,rc:TEAL,heads:['EXCRETION','OSMOREGULATION']});
  d.box(40,48,680,50,'Both happen in the same nephron, at the same time, in the same fluid',INDIGO,10.5);
  return d; },

// 20 — application: dilute urine
(K) => { const { newSheet, BLUE } = K;
  const d = newSheet('Application: what happens after drinking a lot of water');
  d.steps(['Water is absorbed into the blood from the gut',
           'Blood water potential rises, becoming less negative',
           'Hypothalamic osmoreceptors are stimulated less',
           'ADH synthesis and release fall',
           'DCT and collecting duct become less permeable to water',
           'Less water is reabsorbed from the filtrate',
           'A larger volume of dilute urine is produced',
           'Losing the surplus returns water potential to optimum'],
          {x:40,y0:352,w:680,rowh:33,gap:6,colour:BLUE,size:10.5});
  d.caption('This is the mirror image of the dehydration example - the same mechanism running the other way.',{y:38,size:10});
  return d; },

// 21 — misconceptions
(K) => { const { newSheet, TEAL, RED, SLATE } = K;
  const d = newSheet('Three misconceptions, corrected');
  const data=[['Excretion means getting rid of faeces','Egestion removes undigested gut contents'],
              ['Everything filtered ends up as urine','Useful solutes and most water are reabsorbed'],
              ['Osmoregulation controls salt only','It maintains the WATER POTENTIAL of body fluids']];
  let y=326;
  for(const pair of data){
    d.box(40,y,326,70,'WRONG:  '+pair[0],RED,10);
    d.box(398,y,322,70,'RIGHT:  '+pair[1],TEAL,10);
    d.arrow([370,y+35],[394,y+35],SLATE,1.6);
    y-=90;
  }
  return d; },

// 22 — specification checkpoint
(K) => { const { newSheet, TEAL, AMBER } = K;
  const d = newSheet('CCEA specification checkpoint - 4.1.2');
  d.steps(['define excretion and osmoregulation',
           'explain urea and creatinine removal',
           'explain control of body-fluid water potential',
           'distinguish urine formation from egestion'],
          {x:40,y0:326,w:680,rowh:42,gap:10,colour:TEAL,size:11});
  d.box(40,84,680,72,'The specification requires BOTH kidney roles: removal of the named nitrogenous wastes, AND maintenance of an optimal body-fluid water potential',AMBER,10.5);
  return d; },

// 23 — check your understanding
(K) => { const { newSheet, BLUE } = K;
  const d = newSheet('Check your understanding');
  d.steps(['Define excretion','Why must urea be removed?','Define osmoregulation',
           'Distinguish excretion from egestion'],
          {x:60,y0:330,w:640,rowh:52,gap:14,colour:BLUE,size:11.5});
  d.caption('Write full sentences. Each answer should name the substance or structure and state what happens to it.',{y:46,size:10.5});
  return d; },

// 24 — answers 1 and 2
(K) => { const { newSheet, TEAL, BLUE } = K;
  const d = newSheet('Answers to questions 1 and 2');
  d.label(60,378,'1   Define excretion',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['Removal of toxic products of metabolism from the body',
           'The waste was produced by reactions inside cells',
           'The kidney removes the dissolved nitrogenous products'],
          {x:60,y0:302,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  d.label(60,168,'2   Why must urea be removed?',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['It carries excess nitrogen from amino-acid metabolism',
           'Allowing it to accumulate would be harmful',
           'Blood transports it to the kidney for excretion in urine'],
          {x:60,y0:92,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  return d; },

// 25 — answers 3 and 4
(K) => { const { newSheet, TEAL, BLUE } = K;
  const d = newSheet('Answers to questions 3 and 4');
  d.label(60,378,'3   Define osmoregulation',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['Maintenance of the optimal water potential of body fluids',
           'The kidney varies water reabsorption and urine concentration'],
          {x:60,y0:302,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  d.label(60,168,'4   Distinguish excretion from egestion',BLUE,11.5,{ha:'left',bold:true});
  d.steps(['Excretion removes metabolic products such as urea',
           'Egestion removes undigested food from the gut',
           'Only excretion concerns waste made by cells'],
          {x:60,y0:92,w:640,rowh:34,gap:7,colour:TEAL,size:10.5});
  return d; },

// 26 — data task
(K) => { const { newSheet, TEAL, BLUE, AMBER, RED } = K;
  const d = newSheet('Data task - percentage decrease in urine volume');
  d.axesbox(140,140,420,190,{xlabel:'',ylabel:'urine volume / dm3 per day'});
  d.rect(200,140,90,171,'#eff6ff');
  d.rect(380,140,90,71,'#fffbeb');
  d.plot([[200,311],[290,311],[290,140]],{colour:BLUE,lw:2});
  d.plot([[200,140],[200,311]],{colour:BLUE,lw:2});
  d.plot([[380,211],[470,211],[470,140]],{colour:AMBER,lw:2});
  d.plot([[380,140],[380,211]],{colour:AMBER,lw:2});
  d.label(245,324,'1.8',BLUE,10,{bold:true}); d.label(425,224,'0.75',AMBER,10,{bold:true});
  d.label(245,124,'before',BLUE,9.5); d.label(425,124,'after',AMBER,9.5);
  d.darrow([600,211],[600,311],RED,1.8);
  d.label(610,262,'the fall',RED,9.5,{ha:'left'});
  d.box(140,48,480,54,'Daily urine volume falls from 1.8 to 0.75 dm3. Calculate the percentage decrease.',TEAL,11);
  return d; },

// 27 — the calculation
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Working out the percentage decrease');
  d.steps(['Decrease  =  1.8 - 0.75  =  1.05 dm3',
           'Fraction  =  decrease / original  =  1.05 / 1.8',
           '1.05 / 1.8  =  0.5833',
           'Percentage  =  0.5833 x 100',
           'Percentage decrease  =  58.3 %  (3 s.f.)'],
          {x:70,y0:330,w:620,rowh:44,gap:11,colour:INDIGO,size:11.5});
  d.box(150,44,460,52,'Daily urine volume decreased by about 58.3 per cent',TEAL,11.5);
  return d; },

// 28 — exam question
(K) => { const { newSheet, TEAL, BLUE, INDIGO, AMBER, SLATE } = K;
  const d = newSheet('CCEA exam-style question - 12 marks');
  d.box(40,320,680,80,'Explain the role of the kidney in excretion and osmoregulation, using a connected biological argument and relevant evidence',BLUE,12);
  d.label(380,292,'How the 12 marks are earned',SLATE,11.5,{bold:true});
  d.chain(['8 marks for the eight linked stages','2 marks for correct terminology','2 marks for a worked example'],
          {y:166,x0:60,x1:700,h:92,colour:[TEAL,INDIGO,AMBER],size:10.5});
  d.caption('Develop BOTH roles. An answer that explains waste removal only cannot reach the top band.',{y:50,size:10.5});
  return d; },

// 29 — the eight-stage answer
(K) => { const { newSheet, TEAL, AMBER, SLATE } = K;
  const d = newSheet('The eight-stage answer, one mark per stage',13.5);
  const L=['Excretion removes waste made by cell metabolism',
    'Urea carries excess nitrogen from amino acids',
    'Creatinine comes from muscle creatine turnover',
    'Blood delivers the dissolved wastes to the kidney',
    'Useful solutes are reabsorbed, so filtering is selective',
    'Osmoregulation maintains body-fluid water potential',
    'Urine volume and concentration vary with water need',
    'Osmoreceptors and ADH make the kidney the effector'];
  let y=368;
  L.forEach((t,i)=>{ d.box(40,y,636,34,`${i+1}.  ${t}`,TEAL,10);
                     d.label(700,y+17,'[1]',SLATE,10,{bold:true}); y-=38; });
  d.box(40,38,680,44,'Examiner note: develop both roles - named waste removal AND optimal water-potential control',AMBER,10);
  return d; },

// 30 — recap
(K) => { const { newSheet, TEAL, INDIGO } = K;
  const d = newSheet('Recap, and where this leads next');
  d.steps(['The kidney removes urea and creatinine, made by cell metabolism',
           'It reabsorbs useful solutes and a variable amount of water',
           'Urine output balances excretion against osmoregulation'],
          {x:40,y0:330,w:680,rowh:50,gap:12,colour:TEAL,size:11.5});
  d.box(40,110,680,70,'NEXT LESSON: the gross structure of the mammalian kidney and the urinary system',INDIGO,11.5);
  return d; },

  ],
};
