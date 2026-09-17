const K=require('./common.cjs'); const {make,save,text,circle,line,arrow,atom,rep,bracket,C}=K;
module.exports=function(dir){
{ const W=1300,H=840; const [c,x]=make(W,H);
  atom(x,230,230,'Na',[{r:45,e:rep('x',2)},{r:95,e:rep('x',8)},{r:145,e:rep('x',1),first:false}]);
  atom(x,760,230,'Cl',[{r:45,e:rep('.',2)},{r:95,e:rep('.',8)},{r:145,e:rep('.',7),first:false}]);
  text(x,'Sodium atom 2,8,1',230,410,{size:27,bold:true}); text(x,'Chlorine atom 2,8,7',760,410,{size:27,bold:true});
  x.beginPath(); x.moveTo(230,70); x.bezierCurveTo(330,0,520,10,600,190); x.strokeStyle=C.red; x.lineWidth=4; x.stroke();
  K.arrowHead(x,575,140,603,196,{color:C.red,len:22});
  text(x,'1 electron transferred',470,60,{size:22,color:C.red});
  arrow(x,500,430,500,520,{lw:5,len:24});
  text(x,'Sodium ion, Na⁺',230,470,{size:28,bold:true}); text(x,'Chloride ion, Cl⁻',840,470,{size:28,bold:true});
  atom(x,230,660,'Na',[{r:45,e:rep('x',2)},{r:95,e:rep('x',8)}]);
  bracket(x,110,500,350,815,'+');
  atom(x,840,660,'Cl',[{r:45,e:rep('.',2)},{r:95,e:rep('.',8)},{r:140,e:['x',...rep('.',7)],first:false}]);
  bracket(x,680,500,1000,815,'−');
  text(x,'[2,8]⁺',470,660,{size:26,color:C.soft}); text(x,'[2,8,8]⁻',1150,660,{size:26,color:C.soft});
  K.electron(x,1060,90,'.'); text(x,'chlorine electron',1080,90,{size:22,align:'left'});
  K.electron(x,1060,130,'x'); text(x,'sodium electron',1080,130,{size:22,align:'left'});
  save(c,'sas-chem-nacl-dot-cross.png',dir); }
function outerIonic(name,m,nm,me,ne,mc,nc,mlab,nlab,mion,nion){
  const W=1400,H=560; const [c,x]=make(W,H);
  text(x,mlab,170,40,{size:26,bold:true}); text(x,nlab,480,40,{size:26,bold:true});
  circle(x,170,200,95); text(x,m,170,201,{size:34,bold:true}); (me===1?[0]:[-0.22,0.22]).forEach(a=>K.electron(x,170+95*Math.cos(a),200+95*Math.sin(a),'x'));
  atom(x,480,200,nm,[{r:95,e:rep('.',ne),first:false}],{outerOnly:true});
  x.strokeStyle=C.red; x.lineWidth=3.5;
  const ys = me===1?[200]:[179,221];
  ys.forEach((y,i)=>{ x.beginPath(); x.moveTo(275,y); x.quadraticCurveTo(330,y+(i?50:-50),378,y); x.stroke(); K.arrowHead(x,340,y+(i?25:-25),380,y,{color:C.red}); });
  arrow(x,630,200,700,200,{lw:4});
  text(x,mion,860,40,{size:26,bold:true}); text(x,nion,1180,40,{size:26,bold:true});
  circle(x,860,200,95,{stroke:C.light,lw:3,dash:[10,8]}); text(x,m,860,201,{size:34,bold:true});
  bracket(x,745,90,975,310,mc);
  atom(x,1180,200,nm,[{r:95,e:[...rep('x',me),...rep('.',ne)],first:false}],{outerOnly:true});
  bracket(x,1065,90,1295,310,nc);
  text(x,'outer shell lost;',860,345,{size:19,color:C.soft}); text(x,'next shell in is full',860,370,{size:19,color:C.soft});
  text(x,'outer shell full:',1180,345,{size:19,color:C.soft}); text(x,'8 electrons',1180,370,{size:19,color:C.soft});
  K.electron(x,470,440,'x'); text(x,`electron from ${mlab.split(' ')[0].toLowerCase()}`,490,440,{size:22,align:'left'});
  K.electron(x,470,480,'.'); text(x,`electron from ${nlab.split(' ')[0].toLowerCase()}`,490,480,{size:22,align:'left'});
  text(x,'Outer shells only are shown',700,530,{size:20,color:C.soft});
  save(c,name,dir);
}
outerIonic('sas-chem-kf-dot-cross.png','K','F',1,7,'+','−','Potassium atom','Fluorine atom','K⁺ ion','F⁻ ion');
outerIonic('sas-chem-mgo-dot-cross.png','Mg','O',2,6,'2+','2−','Magnesium atom','Oxygen atom','Mg²⁺ ion','O²⁻ ion');
function shared(x,px,py){ K.electron(x,px,py-13,'.'); K.electron(x,px,py+13,'x'); }
{ const W=1200,H=480; const [c,x]=make(W,H);
  text(x,'Hydrogen, H₂',230,40,{size:28,bold:true}); text(x,'Hydrogen chloride, HCl',830,40,{size:28,bold:true});
  circle(x,175,220,85); circle(x,285,220,85); text(x,'H',140,220,{size:34,bold:true}); text(x,'H',320,220,{size:34,bold:true});
  shared(x,230,220);
  circle(x,660,220,80); circle(x,860,220,125); text(x,'H',630,220,{size:34,bold:true}); text(x,'Cl',885,220,{size:34,bold:true});
  shared(x,752,220);
  [-Math.PI/2,0,Math.PI/2].forEach(a=>{ const d=0.17; [a-d,a+d].forEach(b=>K.electron(x,860+125*Math.cos(b),220+125*Math.sin(b),'x')); });
  line(x,1000,95,940,112,{color:'#7c3aed',lw:2.5}); text(x,'lone pair',1010,90,{size:22,color:'#7c3aed',align:'left'});
  line(x,752,380,752,250,{color:'#7c3aed',lw:2.5}); text(x,'shared (bonding) pair',752,400,{size:22,color:'#7c3aed'});
  line(x,230,380,230,250,{color:'#7c3aed',lw:2.5}); text(x,'shared pair',230,400,{size:22,color:'#7c3aed'});
  K.electron(x,380,445,'.'); text(x,'electron from one atom',400,445,{size:21,align:'left'}); K.electron(x,680,445,'x'); text(x,'electron from the other atom',700,445,{size:21,align:'left'});
  save(c,'sas-chem-h2-hcl-dot-cross.png',dir); }
{ const W=1250,H=660; const [c,x]=make(W,H);
  text(x,'Water, H₂O',300,40,{size:28,bold:true}); text(x,'Methane, CH₄',930,40,{size:28,bold:true});
  const oc=[300,300], R=115, hr=70;
  const hL=[oc[0]-130,oc[1]+80], hR=[oc[0]+130,oc[1]+80];
  circle(x,...oc,R); circle(x,...hL,hr); circle(x,...hR,hr);
  text(x,'O',oc[0],oc[1]-5,{size:36,bold:true}); text(x,'H',hL[0]-18,hL[1]+15,{size:32,bold:true}); text(x,'H',hR[0]+18,hR[1]+15,{size:32,bold:true});
  [hL,hR].forEach(h=>{ const dx=h[0]-oc[0], dy=h[1]-oc[1], L=Math.hypot(dx,dy); const t=(R+(L-hr))/2/L; const px=oc[0]+dx*t, py=oc[1]+dy*t; const ux=-dy/L*13, uy=dx/L*13; K.electron(x,px+ux,py+uy,'x'); K.electron(x,px-ux,py-uy,'.'); });
  [-2.2,-0.95].forEach(a=>{ [a-0.15,a+0.15].forEach(b=>K.electron(x,oc[0]+R*Math.cos(b),oc[1]+R*Math.sin(b),'x')); });
  text(x,'2 lone pairs on oxygen',oc[0],140,{size:22,color:'#7c3aed'});
  const cc=[930,320], cr=105, hr2=70, dist=140;
  circle(x,...cc,cr); text(x,'C',...cc,{size:36,bold:true});
  [[0,-1],[1,0],[0,1],[-1,0]].forEach(([ux,uy])=>{ const h=[cc[0]+ux*dist,cc[1]+uy*dist]; circle(x,...h,hr2); text(x,'H',cc[0]+ux*(dist+22),cc[1]+uy*(dist+22),{size:32,bold:true}); const m=(cr+(dist-hr2))/2; const px=cc[0]+ux*m, py=cc[1]+uy*m; K.electron(x,px-uy*13,py+ux*13,'x'); K.electron(x,px+uy*13,py-ux*13,'.'); });
  text(x,'no lone pairs on carbon',cc[0],cc[1]+262,{size:22,color:'#7c3aed'});
  K.electron(x,380,630,'.'); text(x,'hydrogen electron',400,630,{size:21,align:'left'}); K.electron(x,640,630,'x'); text(x,'oxygen / carbon electron',660,630,{size:21,align:'left'});
  save(c,'sas-chem-h2o-ch4-dot-cross.png',dir); }
{ const W=1200,H=380; const [c,x]=make(W,H);
  [['hydrogen, H₂',150],['hydrogen chloride, HCl',440],['water, H₂O',740],['methane, CH₄',1040]].forEach(([t,px])=>text(x,t,px,340,{size:24,color:C.soft}));
  const S=40; const bond=(x1,y1,x2,y2)=>line(x,x1,y1,x2,y2,{lw:5});
  text(x,'H',90,170,{size:S,bold:true}); bond(115,170,185,170); text(x,'H',210,170,{size:S,bold:true});
  text(x,'H',370,170,{size:S,bold:true}); bond(395,170,465,170); text(x,'Cl',500,170,{size:S,bold:true});
  text(x,'H',650,170,{size:S,bold:true}); bond(675,170,715,170); text(x,'O',740,170,{size:S,bold:true}); bond(765,170,805,170); text(x,'H',830,170,{size:S,bold:true});
  text(x,'C',1040,170,{size:S,bold:true}); text(x,'H',1040,60,{size:S,bold:true}); text(x,'H',1040,280,{size:S,bold:true}); text(x,'H',930,170,{size:S,bold:true}); text(x,'H',1150,170,{size:S,bold:true});
  bond(1040,85,1040,145); bond(1040,195,1040,255); bond(955,170,1015,170); bond(1065,170,1125,170);
  save(c,'sas-chem-displayed-formulae.png',dir); }
};
