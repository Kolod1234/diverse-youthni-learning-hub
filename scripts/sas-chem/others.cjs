const K=require('./common.cjs'); const {make,save,text,circle,line,arrow,atom,rep,C}=K;
module.exports=function(dir){
{ const W=1100,H=720; const [c,x]=make(W,H); const L=110,R=1040,T=50,B=610;
  const vx=v=>L+(v/35)*(R-L), py=p=>B-(p/14)*(B-T);
  for(let v=0;v<=35;v+=5){ line(x,vx(v),T,vx(v),B,{color:'#e2e8f0',lw:1.5}); text(x,String(v),vx(v),B+28,{size:22}); }
  for(let p=0;p<=14;p+=2){ line(x,L,py(p),R,py(p),{color:'#e2e8f0',lw:1.5}); text(x,String(p),L-18,py(p),{size:22,align:'right'}); }
  line(x,L,T,L,B,{lw:3}); line(x,L,B,R,B,{lw:3});
  text(x,'Volume of hydrochloric acid added / cm³',(L+R)/2,B+75,{size:26,bold:true});
  x.save(); x.translate(35,(T+B)/2); x.rotate(-Math.PI/2); text(x,'pH',0,0,{size:26,bold:true}); x.restore();
  line(x,L,py(7),vx(25),py(7),{color:C.red,lw:2.5,dash:[10,8]}); line(x,vx(25),py(7),vx(25),B,{color:C.red,lw:2.5,dash:[10,8]});
  const d=[[0,13],[5,12.8],[10,12.6],[15,12.3],[20,11.8],[24,10.9],[25,7],[26,2.8],[30,1.8],[35,1.5]];
  const n=d.length, X=d.map(p=>p[0]), Y=d.map(p=>p[1]); const dl=[], m=[]; for(let i=0;i<n-1;i++) dl.push((Y[i+1]-Y[i])/(X[i+1]-X[i]));
  m[0]=dl[0]; m[n-1]=dl[n-2]; for(let i=1;i<n-1;i++) m[i]=(dl[i-1]*dl[i]<=0)?0:(dl[i-1]+dl[i])/2; for(let i=0;i<n-1;i++){ if(dl[i]===0){m[i]=m[i+1]=0;continue;} const a=m[i]/dl[i], b=m[i+1]/dl[i]; const h=a*a+b*b; if(h>9){ const t=3/Math.sqrt(h); m[i]=t*a*dl[i]; m[i+1]=t*b*dl[i]; } }
  x.beginPath(); x.moveTo(vx(X[0]),py(Y[0])); for(let i=0;i<n-1;i++){ const h=X[i+1]-X[i]; x.bezierCurveTo(vx(X[i]+h/3),py(Y[i]+m[i]*h/3),vx(X[i+1]-h/3),py(Y[i+1]-m[i+1]*h/3),vx(X[i+1]),py(Y[i+1])); } x.strokeStyle=C.blue; x.lineWidth=4; x.stroke();
  d.forEach(([v,p])=>{ K.electron(x,vx(v),py(p),'x',7); });
  text(x,'neutral, pH 7, at 25 cm³',vx(25)+20,py(7)-5,{size:22,color:C.red,align:'left'});
  text(x,'alkali in excess',vx(9),py(13)+40,{size:22,color:C.soft}); text(x,'acid in excess',vx(31),py(1.5)-40,{size:22,color:C.soft});
  save(c,'sas-chem-neutralisation-ph-curve.png',dir); }
{ const W=1100,H=420; const [c,x]=make(W,H); const r=22;
  [[60,'Solid'],[420,'Liquid'],[780,'Gas']].forEach(([bx,t])=>{ x.strokeStyle=C.ink; x.lineWidth=4; x.strokeRect(bx,40,260,280); text(x,t,bx+130,370,{size:30,bold:true}); });
  const P=(px,py)=>circle(x,px,py,r,{fill:'#93c5fd',stroke:'#1e3a8a',lw:2.5});
  for(let row=0;row<5;row++) for(let col=0;col<5;col++) P(60+42+col*44,320-2-r-row*44);
  const liq=[[102,296],[146,297],[190,296],[236,298],[280,295],[122,256],[166,258],[212,256],[258,258],[104,216],[146,218],[190,214],[234,220],[278,222],[166,178],[210,176]]; liq.forEach(([a,b])=>P(420+a-60,b));
  [[830,90],[1000,110],[900,200],[1040,250],[820,270],[960,300]].forEach(([a,b])=>P(a,b));
  save(c,'sas-chem-particle-model.png',dir); }
{ const W=1200,H=420; const [c,x]=make(W,H); const r=18;
  const A=(px,py)=>circle(x,px,py,r,{fill:'#93c5fd',stroke:'#1e3a8a',lw:2.5}); const Bc=(px,py)=>circle(x,px,py,r,{fill:'#fca5a5',stroke:'#7f1d1d',lw:2.5});
  const bx=[30,325,620,915]; bx.forEach(b=>{ x.strokeStyle=C.ink; x.lineWidth=4; x.strokeRect(b,40,255,255); });
  [[80,90],[180,80],[130,160],[220,190],[70,240],[170,250]].forEach(([a,b])=>A(bx[0]-30+a,b));
  [[70,90],[190,110],[100,210],[210,240],[150,165]].forEach(([a,b])=>{A(bx[1]-30+a,b);A(bx[1]-30+a+34,b);});
  [[70,90],[190,110],[100,210],[210,240],[150,165]].forEach(([a,b])=>{A(bx[2]-30+a,b);Bc(bx[2]-30+a+34,b);});
  const m=bx[3]-30; A(m+70,90); A(m+230,120); A(m+130,240); Bc(m+160,90);Bc(m+194,90); Bc(m+70,180);Bc(m+104,180); Bc(m+200,220);Bc(m+234,220);
  const t=[['Element','one type of atom',''],['Element','molecules made of','one type of atom'],['Compound','different atoms','chemically joined'],['Mixture','different substances','not chemically joined']];
  bx.forEach((b,i)=>{ text(x,t[i][0],b+127,335,{size:28,bold:true}); text(x,t[i][1],b+127,370,{size:20,color:C.soft}); text(x,t[i][2],b+127,396,{size:20,color:C.soft}); });
  save(c,'sas-chem-elements-compounds-mixtures.png',dir); }
{ const W=1150,H=760; const [c,x]=make(W,H); x.translate(250,0); const cx=380;
  line(x,700,120,700,720,{lw:8,color:'#94a3b8'}); line(x,600,720,780,720,{lw:10,color:'#94a3b8'}); line(x,700,250,cx+100,250,{lw:6,color:'#94a3b8'});
  x.beginPath(); x.moveTo(cx-40,420); x.lineTo(cx-40,500); x.lineTo(cx-170,700); x.lineTo(cx+170,700); x.lineTo(cx+40,500); x.lineTo(cx+40,420); x.strokeStyle=C.ink; x.lineWidth=4; x.stroke();
  x.beginPath(); x.moveTo(cx-135,646); x.lineTo(cx-170,700); x.lineTo(cx+170,700); x.lineTo(cx+135,646); x.closePath(); x.fillStyle='#bfdbfe'; x.fill(); line(x,cx-135,646,cx+135,646,{color:'#60a5fa',lw:3});
  x.beginPath(); x.moveTo(cx-170,170); x.lineTo(cx+170,170); x.lineTo(cx+18,380); x.lineTo(cx+18,470); x.moveTo(cx-18,470); x.lineTo(cx-18,380); x.lineTo(cx-170,170); x.strokeStyle=C.ink; x.lineWidth=4; x.stroke();
  x.beginPath(); x.moveTo(cx-150,185); x.lineTo(cx+150,185); x.lineTo(cx,375); x.closePath(); x.fillStyle='#f8fafc'; x.fill(); x.strokeStyle='#94a3b8'; x.lineWidth=3; x.stroke();
  x.beginPath(); x.moveTo(cx-70,285); x.lineTo(cx+70,285); x.lineTo(cx,370); x.closePath(); x.fillStyle='#d6a55a'; x.fill();
  for(let i=0;i<60;i++){ const t=Math.random(); circle(x,cx-60+120*Math.random()*0.9+6, 290+t*70, 2.5,{fill:'#92400e',stroke:false}); }
  circle(x,cx,500,6,{fill:'#60a5fa',stroke:false}); circle(x,cx,560,6,{fill:'#60a5fa',stroke:false});
  const lab=(s,tx,ty,px,py)=>{ line(x,tx,ty,px,py,{lw:2,color:C.soft}); text(x,s,tx+(tx<px?-10:10),ty,{size:26,align:tx<px?'right':'left'}); };
  lab('filter funnel',170,120,cx-120,178); lab('filter paper',120,250,cx-110,230); lab('residue (sand)',110,330,cx-45,315);
  lab('filtrate (salt solution)',110,670,cx-120,672); lab('conical flask',110,560,cx-90,590);
  save(c,'sas-chem-filtration.png',dir); }
{ const W=1050,H=780; const [c,x]=make(W,H); x.translate(150,0);
  x.fillStyle='#fffbeb'; x.fillRect(150,40,520,640); x.strokeStyle=C.ink; x.lineWidth=4; x.strokeRect(150,40,520,640);
  line(x,150,600,670,600,{color:'#475569',lw:3}); line(x,150,120,670,120,{color:C.blue,lw:3,dash:[14,10]});
  const cols={X:250,A:370,B:490,C:610}; const spot=(px,py,col)=>{ x.save(); x.beginPath(); x.ellipse(px,py,20,14,0,0,Math.PI*2); x.fillStyle=col; x.globalAlpha=0.85; x.fill(); x.restore(); };
  spot(cols.X,240,'#ef4444'); spot(cols.X,400,'#22c55e'); spot(cols.X,500,'#3b82f6');
  spot(cols.A,240,'#ef4444'); spot(cols.B,330,'#a855f7'); spot(cols.C,500,'#3b82f6');
  Object.entries(cols).forEach(([k,v])=>{ circle(x,v,600,5,{fill:'#334155',stroke:false}); text(x,k,v,640,{size:28,bold:true}); });
  text(x,'solvent front',680,120,{size:24,color:C.blue,align:'left'}); text(x,'baseline',680,600,{size:24,align:'left'}); text(x,'(pencil)',680,630,{size:20,color:C.soft,align:'left'});
  arrow(x,110,600,110,126,{lw:3,color:C.blue}); arrow(x,110,126,110,594,{lw:0.1,color:C.blue}); text(x,'distance moved',100,330,{size:20,color:C.blue,align:'right'}); text(x,'by solvent',100,356,{size:20,color:C.blue,align:'right'});
  arrow(x,200,600,200,246,{lw:3,color:'#b91c1c'}); arrow(x,200,246,200,594,{lw:0.1,color:'#b91c1c'});
  text(x,'distance moved by the red dye: baseline to centre of spot',410,720,{size:21,color:'#b91c1c'});
  save(c,'sas-chem-chromatogram.png',dir); }
{ const W=900,H=640; const [c,x]=make(W,H); const cx=330,cy=320;
  circle(x,cx,cy,120); circle(x,cx,cy,230); circle(x,cx,cy,58,{fill:'#fef3c7',stroke:'#a16207',lw:3});
  const nuc=[[-22,-20,'p'],[14,-26,'n'],[30,4,'p'],[-30,12,'n'],[0,8,'n'],[-10,34,'p'],[20,32,'n']];
  nuc.forEach(([dx,dy,t])=>{ circle(x,cx+dx,cy+dy,17,{fill:t==='p'?'#ef4444':'#94a3b8',stroke:'#334155',lw:2}); text(x,t==='p'?'+':'',cx+dx,cy+dy+1,{size:22,bold:true,color:'#fff'}); });
  [[cx-120,cy],[cx+120,cy],[cx,cy-230]].forEach(([a,b])=>{ circle(x,a,b,13,{fill:C.blue,stroke:false}); text(x,'−',a,b,{size:20,bold:true,color:'#fff'}); });
  const k=620; circle(x,k,120,16,{fill:'#ef4444',stroke:'#334155',lw:2}); text(x,'+',k,121,{size:22,bold:true,color:'#fff'}); text(x,'proton (3)',k+30,120,{size:26,align:'left'});
  circle(x,k,180,16,{fill:'#94a3b8',stroke:'#334155',lw:2}); text(x,'neutron (4)',k+30,180,{size:26,align:'left'});
  circle(x,k,240,13,{fill:C.blue,stroke:false}); text(x,'−',k,240,{size:20,bold:true,color:'#fff'}); text(x,'electron (3)',k+30,240,{size:26,align:'left'});
  line(x,cx+45,cy+40,600,420,{lw:2,color:C.soft}); text(x,'nucleus',610,420,{size:26,align:'left'});
  line(x,cx+160,cy+165,600,500,{lw:2,color:C.soft}); text(x,'electron shells',610,500,{size:26,align:'left'});
  text(x,'Lithium atom (not to scale)',cx,610,{size:24,color:C.soft});
  save(c,'sas-chem-lithium-atom.png',dir); }
{ const W=1100,H=560; const [c,x]=make(W,H);
  atom(x,280,260,'O',[{r:70,e:rep('x',2)},{r:150,e:rep('x',6),first:false}],{symSize:40});
  atom(x,800,260,'Na',[{r:60,e:rep('x',2)},{r:130,e:rep('x',8),first:false},{r:200,e:rep('x',1),first:false}],{symSize:40});
  text(x,'Oxygen: 2,6',280,500,{size:30,bold:true}); text(x,'Sodium: 2,8,1',800,500,{size:30,bold:true});
  save(c,'sas-chem-shell-diagrams-o-na.png',dir); }
{ const W=1320,H=700; const [c,x]=make(W,H); const cw=66,ch=66,ox=70,oy=70;
  const rows=[
    ['H',...Array(16).fill(''),'He'],
    ['Li','Be',...Array(10).fill(''),'B','C','N','O','F','Ne'],
    ['Na','Mg',...Array(10).fill(''),'Al','Si','P','S','Cl','Ar'],
    ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
    ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
    ['Cs','Ba','La','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
    ['Fr','Ra','Ac','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']];
  const nonmetal=new Set(['H','He','B','C','N','O','F','Ne','Si','P','S','Cl','Ar','As','Se','Br','Kr','Te','I','Xe','At','Rn','Ts','Og']);
  rows.forEach((r,ri)=>r.forEach((s,ci)=>{ if(!s) return; const px=ox+ci*cw, py=oy+ri*ch; x.fillStyle=nonmetal.has(s)?'#fcd34d':'#93c5fd'; x.fillRect(px,py,cw,ch); x.strokeStyle='#fff'; x.lineWidth=2; x.strokeRect(px,py,cw,ch); text(x,s,px+cw/2,py+ch/2,{size:24,bold:true}); }));
  x.beginPath(); x.moveTo(ox+12*cw,oy+1*ch);
  [[12,1],[12,2],[13,2],[13,3],[14,3],[14,4],[15,4],[15,5],[16,5],[16,6],[16,7]].forEach(([ci,ri])=>x.lineTo(ox+ci*cw,oy+ri*ch)); x.strokeStyle=C.ink; x.lineWidth=6; x.stroke();
  const g=[[0,'1',0],[1,'2',1],[12,'3',1],[13,'4',1],[14,'5',1],[15,'6',1],[16,'7',1],[17,'0',0]]; g.forEach(([ci,l,r])=>text(x,l,ox+ci*cw+cw/2,oy+r*ch-20,{size:24,bold:true,color:C.soft}));
  for(let p=1;p<=7;p++) text(x,String(p),ox-25,oy+(p-1)*ch+ch/2,{size:22,color:C.soft});
  text(x,'Period',38,oy-30,{size:20,color:C.soft});
  x.fillStyle='#93c5fd'; x.fillRect(ox+4*cw,oy+7*ch+25,40,30); text(x,'metals',ox+4*cw+50,oy+7*ch+40,{size:24,align:'left'});
  x.fillStyle='#fcd34d'; x.fillRect(ox+7.5*cw,oy+7*ch+25,40,30); text(x,'non-metals',ox+7.5*cw+50,oy+7*ch+40,{size:24,align:'left'}); text(x,'The thick stepped line separates metals from non-metals.',ox+cw*9,oy+7*ch+85,{size:22,color:C.soft});
  save(c,'sas-chem-periodic-table-metals.png',dir); }
{ const W=1000,H=560; const [c,x]=make(W,H); const s=46; const hw=s*Math.sqrt(3);
  const pts=new Map(); const edges=[];
  for(let row=0;row<7;row++) for(let col=0;col<9;col++){ const cx=90+col*hw+(row%2?hw/2:0), cy=70+row*s*1.5; const v=[]; for(let k=0;k<6;k++){ const a=Math.PI/6+k*Math.PI/3; v.push([Math.round(cx+s*Math.cos(a)),Math.round(cy+s*Math.sin(a))]); } for(let k=0;k<6;k++) edges.push([v[k],v[(k+1)%6]]); v.forEach(p=>pts.set(p.join(','),p)); }
  x.save(); x.beginPath(); x.rect(40,30,740,500); x.clip();
  edges.forEach(([a,b])=>line(x,a[0],a[1],b[0],b[1],{color:'#334155',lw:4}));
  pts.forEach(p=>circle(x,p[0],p[1],10,{fill:'#111827',stroke:false}));
  x.restore(); x.strokeStyle=C.light; x.lineWidth=2; x.strokeRect(40,30,740,500);
  const ax=Math.round(90+7*hw+s*Math.cos(Math.PI/6)), ay=Math.round(70+s*Math.sin(Math.PI/6)); circle(x,ax,ay,16,{stroke:C.red,lw:4}); line(x,ax+16,ay,805,110,{lw:2.5,color:C.red}); text(x,'carbon atom',815,110,{size:24,align:'left'});
  const bx1=90+7*hw+hw/2, by1=70+3*s; line(x,bx1,by1,805,250,{lw:2.5,color:C.red}); text(x,'covalent bond',815,250,{size:24,align:'left'});
  const hx=90+6*hw, hy=70+6*s; x.beginPath(); for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3; x.lineTo(hx+s*Math.cos(a),hy+s*Math.sin(a));} x.closePath(); x.fillStyle='rgba(220,38,38,0.18)'; x.fill(); line(x,hx+hw/2,hy,805,390,{lw:2.5,color:C.red}); text(x,'hexagon of',815,380,{size:24,align:'left'}); text(x,'6 carbon atoms',815,410,{size:24,align:'left'});
  text(x,'A single layer, one atom thick. Each carbon is bonded to 3 others.',410,550,{size:22,color:C.soft});
  save(c,'sas-chem-graphene.png',dir); }
};
