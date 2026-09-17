const K=require('./common.cjs'); const {make,save,text,circle,line,arrow,C}=K;
function wire(x,pts){ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); pts.slice(1).forEach(p=>x.lineTo(p[0],p[1])); x.strokeStyle=C.ink; x.lineWidth=4; x.stroke(); }
function cell(x,cx,cy,horiz=true,dbl=false){
  if(horiz){ line(x,cx-6,cy-26,cx-6,cy+26,{lw:5}); line(x,cx+6,cy-13,cx+6,cy+13,{lw:8});
    if(dbl){ line(x,cx+22,cy-26,cx+22,cy+26,{lw:5}); line(x,cx+34,cy-13,cx+34,cy+13,{lw:8}); } }
  else { line(x,cx-26,cy-6,cx+26,cy-6,{lw:5}); line(x,cx-13,cy+6,cx+13,cy+6,{lw:8}); }
}
function lamp(x,cx,cy,r=24){ circle(x,cx,cy,r,{stroke:C.ink,lw:4,fill:'#fff'}); const d=r*0.66; line(x,cx-d,cy-d,cx+d,cy+d,{lw:3}); line(x,cx-d,cy+d,cx+d,cy-d,{lw:3}); }
function resistor(x,cx,cy,w=70,h=28,horiz=true){ x.fillStyle='#fff'; if(horiz){x.fillRect(cx-w/2,cy-h/2,w,h); x.strokeStyle=C.ink;x.lineWidth=4;x.strokeRect(cx-w/2,cy-h/2,w,h);} else {x.fillRect(cx-h/2,cy-w/2,h,w); x.strokeStyle=C.ink;x.lineWidth=4;x.strokeRect(cx-h/2,cy-w/2,h,w);} }
function varres(x,cx,cy){ resistor(x,cx,cy); arrow(x,cx-34,cy+34,cx+30,cy-30,{lw:4,len:16}); }
function meter(x,cx,cy,letter,r=26){ circle(x,cx,cy,r,{stroke:C.ink,lw:4,fill:'#fff'}); text(x,letter,cx,cy+1,{size:26,bold:true}); }
function switchOpen(x,cx,cy){ circle(x,cx-26,cy,5,{fill:C.ink,stroke:false}); circle(x,cx+26,cy,5,{fill:C.ink,stroke:false}); line(x,cx-26,cy,cx+18,cy-26,{lw:4}); }
function switchClosed(x,cx,cy){ circle(x,cx-26,cy,5,{fill:C.ink,stroke:false}); circle(x,cx+26,cy,5,{fill:C.ink,stroke:false}); line(x,cx-26,cy,cx+26,cy,{lw:4}); }
function motor(x,cx,cy){ circle(x,cx,cy,26,{stroke:C.ink,lw:4,fill:'#fff'}); text(x,'M',cx,cy+1,{size:26,bold:true}); }
function buzzer(x,cx,cy){ x.beginPath(); x.moveTo(cx-26,cy+14); x.lineTo(cx+26,cy+14); x.arc(cx,cy+14,26,Math.PI,0,true); x.closePath(); x.fillStyle='#fff'; x.fill(); x.strokeStyle=C.ink; x.lineWidth=4; x.stroke(); }
function ldr(x,cx,cy){ resistor(x,cx,cy,64,26); circle(x,cx,cy,44,{stroke:C.ink,lw:3}); arrow(x,cx-70,cy-56,cx-40,cy-30,{lw:3,len:12}); arrow(x,cx-48,cy-70,cx-18,cy-44,{lw:3,len:12}); }
module.exports=function(dir){
{ const W=1200,H=760; const [c,x]=make(W,H);
  const items=[['cell',(px,py)=>{wire(x,[[px-70,py],[px-6,py]]); cell(x,px,py); wire(x,[[px+6,py],[px+70,py]]);}],
   ['battery (2 cells)',(px,py)=>{wire(x,[[px-80,py],[px-20,py]]); cell(x,px-14,py,true,true); wire(x,[[px+34,py],[px+80,py]]);}],
   ['switch (open)',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); switchOpen(x,px,py); wire(x,[[px+26,py],[px+70,py]]);}],
   ['switch (closed)',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); switchClosed(x,px,py); wire(x,[[px+26,py],[px+70,py]]);}],
   ['lamp',(px,py)=>{wire(x,[[px-70,py],[px-24,py]]); lamp(x,px,py); wire(x,[[px+24,py],[px+70,py]]);}],
   ['fixed resistor',(px,py)=>{wire(x,[[px-70,py],[px-35,py]]); resistor(x,px,py); wire(x,[[px+35,py],[px+70,py]]);}],
   ['variable resistor',(px,py)=>{wire(x,[[px-70,py],[px-35,py]]); varres(x,px,py); wire(x,[[px+35,py],[px+70,py]]);}],
   ['ammeter',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); meter(x,px,py,'A'); wire(x,[[px+26,py],[px+70,py]]);}],
   ['voltmeter',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); meter(x,px,py,'V'); wire(x,[[px+26,py],[px+70,py]]);}],
   ['motor',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); motor(x,px,py); wire(x,[[px+26,py],[px+70,py]]);}],
   ['buzzer',(px,py)=>{wire(x,[[px-70,py],[px-26,py]]); buzzer(x,px,py-14); wire(x,[[px+26,py],[px+70,py]]);}],
   ['light-dependent resistor',(px,py)=>{wire(x,[[px-80,py],[px-32,py]]); ldr(x,px,py); wire(x,[[px+32,py],[px+80,py]]);}]];
  items.forEach((it,i)=>{ const col=i%3, row=(i-col)/3; const px=200+col*400, py=120+row*175;
    x.strokeStyle='#e2e8f0'; x.lineWidth=2; x.strokeRect(px-180,py-72,360,150);
    it[1](px,py); text(x,it[0],px,py+58,{size:22,color:C.soft}); });
  text(x,'Standard circuit symbols',600,40,{size:32,bold:true});
  save(c,'sas-phys-circuit-symbols.png',dir); }
{ const W=1240,H=620; const [c,x]=make(W,H);
  text(x,'Series circuit',310,40,{size:30,bold:true}); text(x,'Parallel circuit',930,40,{size:30,bold:true});
  const L=90,R=530,T=110,B=430;
  wire(x,[[L,T],[R,T],[R,B],[L,B],[L,T]]);
  x.fillStyle='#fff'; x.fillRect(L+150,T-24,60,48); cell(x,L+180,T);
  x.fillStyle='#fff'; x.fillRect(R-24,220,48,60); lamp(x,R,250);
  x.fillStyle='#fff'; x.fillRect(250,B-26,60,52); lamp(x,280,B);
  x.fillStyle='#fff'; x.fillRect(L-26,210,52,60); meter(x,L,240,'A');
  text(x,'one path only: the same current',310,480,{size:23,color:C.soft});
  text(x,'flows through every component',310,510,{size:23,color:C.soft});
  text(x,'supply voltage = sum of the voltages',310,545,{size:23,color:C.soft});
  const l=700,r=1160,t=110,b=430;
  wire(x,[[l,t],[r,t],[r,b],[l,b],[l,t]]);
  x.fillStyle='#fff'; x.fillRect(l+160,t-24,60,48); cell(x,l+190,t);
  wire(x,[[l+110,t],[l+110,b]]); wire(x,[[l+320,t],[l+320,b]]);
  x.fillStyle='#fff'; x.fillRect(l+84,246,52,60); lamp(x,l+110,276);
  x.fillStyle='#fff'; x.fillRect(l+294,246,52,60); lamp(x,l+320,276);
  x.fillStyle='#fff'; x.fillRect(l-26,210,52,60); meter(x,l,240,'A');
  text(x,'branches: the voltage across each',930,480,{size:23,color:C.soft});
  text(x,'branch equals the supply voltage',930,510,{size:23,color:C.soft});
  text(x,'total current = sum of branch currents',930,545,{size:23,color:C.soft});
  save(c,'sas-phys-series-parallel.png',dir); }
{ const W=1100,H=620; const [c,x]=make(W,H);
  text(x,'Prescribed Practical P1: voltage and current for a metal wire',550,40,{size:27,bold:true});
  const L=150,R=850,T=150,B=470;
  wire(x,[[L,T],[R,T],[R,B],[L,B],[L,T]]);
  x.fillStyle='#fff'; x.fillRect(L+120,T-26,70,52); cell(x,L+155,T,true,true);
  x.fillStyle='#fff'; x.fillRect(L+430,T-30,80,60); varres(x,L+470,T);
  x.fillStyle='#fff'; x.fillRect(R-26,280,52,60); meter(x,R,310,'A');
  x.fillStyle='#fff'; x.fillRect(420,B-20,180,40); line(x,420,B,600,B,{lw:8,color:'#b45309'});
  text(x,'metal test wire',510,B+42,{size:22,color:C.soft});
  wire(x,[[420,B],[420,B+110],[470,B+110]]); wire(x,[[550,B+110],[600,B+110],[600,B]]);
  meter(x,510,B+110,'V');
  text(x,'variable resistor',L+470,T-52,{size:22,color:C.soft});
  text(x,'ammeter in series',R+40,310,{size:22,color:C.soft,align:'left'});
  text(x,'voltmeter in parallel',680,B+110,{size:22,color:C.soft,align:'left'});
  save(c,'sas-phys-ohms-law-circuit.png',dir); }
{ const W=1200,H=620; const [c,x]=make(W,H);
  function axes(ox,oy,w,h,xl,yl,title){ line(x,ox,oy-h,ox,oy,{lw:3}); line(x,ox,oy,ox+w,oy,{lw:3});
    text(x,xl,ox+w/2,oy+52,{size:24,bold:true}); x.save(); x.translate(ox-52,oy-h/2); x.rotate(-Math.PI/2); text(x,yl,0,0,{size:24,bold:true}); x.restore();
    text(x,title,ox+w/2,oy-h-40,{size:26,bold:true}); text(x,'0',ox-16,oy+18,{size:20,color:C.soft}); }
  axes(140,440,400,300,'current / A','voltage / V','Metal wire at constant temperature');
  line(x,140,440,510,180,{color:C.blue,lw:4});
  [0.25,0.5,0.75,1].forEach(t=>K.electron(x,140+370*t,440-260*t,'x',7));
  text(x,'straight line through the origin:',340,536,{size:21,color:C.soft});
  text(x,'voltage is proportional to current',340,566,{size:21,color:C.soft});
  axes(740,440,400,300,'length of wire / cm','resistance / Ω','Resistance and length');
  line(x,740,440,1110,180,{color:C.blue,lw:4});
  [0.25,0.5,0.75,1].forEach(t=>K.electron(x,740+370*t,440-260*t,'x',7));
  text(x,'straight line through the origin:',940,536,{size:21,color:C.soft});
  text(x,'resistance is proportional to length',940,566,{size:21,color:C.soft});
  save(c,'sas-phys-vi-resistance-graphs.png',dir); }
};
