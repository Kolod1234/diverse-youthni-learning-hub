const K=require('./common.cjs'); const {make,save,text,circle,line,arrow,C}=K;
module.exports=function(dir){
{ const W=1650,H=820; const [c,x]=make(W,H); x.translate(300,0); const ink=C.ink;
  const fx=260, fy=470, fr=110;
  line(x,fx-120,fy+fr+15,fx+120,fy+fr+15,{lw:6,color:'#94a3b8'}); line(x,fx-100,fy+fr+15,fx-130,760,{lw:6,color:'#94a3b8'}); line(x,fx+100,fy+fr+15,fx+130,760,{lw:6,color:'#94a3b8'});
  x.fillStyle='#64748b'; x.fillRect(fx-18,670,36,90); x.fillRect(fx-50,755,100,14);
  x.beginPath(); x.moveTo(fx-16,670); x.quadraticCurveTo(fx-30,630,fx,595); x.quadraticCurveTo(fx+30,630,fx+16,670); x.closePath(); x.fillStyle='#60a5fa'; x.fill();
  text(x,'heat',fx+40,640,{size:26,align:'left'});
  x.save(); x.beginPath(); x.arc(fx,fy,fr,0,Math.PI*2); x.clip(); x.fillStyle='#bfdbfe'; x.fillRect(fx-fr,fy+10,2*fr,fr); x.restore();
  circle(x,fx,fy,fr,{stroke:ink,lw:4});
  x.fillStyle='#fff'; x.fillRect(fx-24,fy-fr-150,48,160); line(x,fx-24,fy-fr+8,fx-24,fy-fr-150,{lw:4}); line(x,fx+24,fy-fr+8,fx+24,fy-fr-150,{lw:4});
  x.fillStyle='#e2e8f0'; x.fillRect(fx-7,110,14,185); x.strokeStyle=ink; x.lineWidth=2; x.strokeRect(fx-7,110,14,185); circle(x,fx,300,11,{fill:C.red,stroke:ink,lw:2}); line(x,fx,295,fx,190,{color:C.red,lw:5});
  line(x,fx-24,215,fx+24,215,{lw:6,color:'#475569'});
  const sx=fx+24, sy=300, ex=1060, ey=580;
  const ang=Math.atan2(ey-sy,ex-sx), nx=-Math.sin(ang), ny=Math.cos(ang);
  const tube=(a,b,w,col,fill)=>{ x.beginPath(); x.moveTo(a[0]+nx*w,a[1]+ny*w); x.lineTo(b[0]+nx*w,b[1]+ny*w); x.lineTo(b[0]-nx*w,b[1]-ny*w); x.lineTo(a[0]-nx*w,a[1]-ny*w); x.closePath(); if(fill){x.fillStyle=fill; x.fill();} x.strokeStyle=col; x.lineWidth=4; x.stroke(); };
  const P=t=>[sx+(ex-sx)*t, sy+(ey-sy)*t];
  tube(P(0.3),P(0.82),46,ink,'#dbeafe');
  tube(P(0),P(1),13,ink,'#ffffff');
  const wi=P(0.76), wo=P(0.36);
  line(x,wi[0]+nx*48,wi[1]+ny*48,wi[0]+nx*48,wi[1]+ny*48+55,{lw:12,color:'#475569'}); arrow(x,wi[0]+nx*48,wi[1]+ny*48+120,wi[0]+nx*48,wi[1]+ny*48+62,{lw:4,color:C.blue});
  line(x,wo[0]-nx*48,wo[1]-ny*48,wo[0]-nx*48,wo[1]-ny*48-55,{lw:12,color:'#475569'}); arrow(x,wo[0]-nx*48,wo[1]-ny*48-62,wo[0]-nx*48,wo[1]-ny*48-120,{lw:4,color:C.blue});
  text(x,'cold water in',wi[0]+nx*48,wi[1]+ny*48+145,{size:24,color:C.blue});
  text(x,'water out',wo[0]-nx*48,wo[1]-ny*48-145,{size:24,color:C.blue});
  const bx=1010,by=600; x.fillStyle='#bfdbfe'; x.fillRect(bx,by+120,160,60); x.strokeStyle=ink; x.lineWidth=4; x.beginPath(); x.moveTo(bx,by); x.lineTo(bx,by+180); x.lineTo(bx+160,by+180); x.lineTo(bx+160,by); x.stroke();
  circle(x,ex+5,ey+70,6,{fill:'#60a5fa',stroke:false});
  const lab=(s,tx,ty,px,py,al)=>{ line(x,tx,ty,px,py,{lw:2,color:C.soft}); text(x,s,tx+(al==='right'?-10:10),ty,{size:25,align:al||'left'}); };
  lab('thermometer (bulb level with side arm)',fx+60,120,fx+8,150);
  lab('round-bottomed flask',fx-150,300,fx-75,390,'right');
  lab('salt solution',fx-150,520,fx-60,530,'right');
  lab('Liebig condenser',P(0.55)[0]+60,P(0.55)[1]-120,P(0.55)[0],P(0.55)[1]-40);
  lab('distillate',1190,660,1060,745,'left'); text(x,'(pure water)',1200,692,{size:22,color:C.soft,align:'left'});
  save(c,'sas-chem-simple-distillation.png',dir); }
{ const W=1200,H=420; const [c,x]=make(W,H); const R=120;
  const panel=(cx,cy,draw,label)=>{ x.save(); x.beginPath(); x.ellipse(cx,cy,R*0.78,R,0,0,Math.PI*2); x.clip(); x.strokeStyle='#1f2937'; x.lineWidth=4; draw(cx,cy); x.restore(); x.beginPath(); x.ellipse(cx,cy,R*0.78,R,0,0,Math.PI*2); x.strokeStyle='#94a3b8'; x.lineWidth=3; x.stroke(); text(x,label,cx,cy+R+40,{size:28,bold:true}); };
  const cys=190;
  panel(150,cys,(cx,cy)=>{ for(let i=-8;i<=9;i++){ x.beginPath(); x.moveTo(cx-120,cy+i*16+40); x.bezierCurveTo(cx-40,cy+i*16+40,cx-30,cy+i*16-30+Math.max(0,i)*6,cx,cy+i*16-30+Math.max(0,i)*6); x.bezierCurveTo(cx+30,cy+i*16-30+Math.max(0,i)*6,cx+40,cy+i*16+40,cx+120,cy+i*16+40); x.stroke(); } },'Arch');
  panel(450,cys,(cx,cy)=>{ for(let i=-8;i<=-4;i++){ x.beginPath(); x.moveTo(cx-120,cy+i*16); x.quadraticCurveTo(cx,cy+i*16-20,cx+120,cy+i*16); x.stroke(); }
    for(let k=0;k<6;k++){ const r=12+k*15; x.beginPath(); x.moveTo(cx-110,cy-r); x.lineTo(cx+10,cy-r); x.arc(cx+10,cy,r,-Math.PI/2,Math.PI/2); x.lineTo(cx-110,cy+r); x.stroke(); }
    for(let i=6;i<=9;i++){ x.beginPath(); x.moveTo(cx-120,cy+i*16); x.quadraticCurveTo(cx,cy+i*16+10,cx+120,cy+i*16); x.stroke(); } },'Loop');
  panel(750,cys,(cx,cy)=>{ for(let k=1;k<10;k++){ x.beginPath(); x.ellipse(cx,cy,k*13,k*15,0,0,Math.PI*2); x.stroke(); } },'Whorl');
  panel(1050,cys,(cx,cy)=>{ for(let k=0;k<5;k++){ const r=6+k*8; x.beginPath(); x.moveTo(cx-120,cy-42-r); x.lineTo(cx+25,cy-42-r); x.arc(cx+25,cy-42,r,-Math.PI/2,Math.PI/2); x.lineTo(cx-120,cy-42+r); x.stroke(); x.beginPath(); x.moveTo(cx+120,cy+42-r); x.lineTo(cx-25,cy+42-r); x.arc(cx-25,cy+42,r,-Math.PI/2,Math.PI/2,true); x.lineTo(cx+120,cy+42+r); x.stroke(); } for(let i=0;i<3;i++){ x.beginPath(); x.ellipse(cx,cy,95+i*14,125+i*14,0,0,Math.PI*2); x.stroke(); } },'Composite');
  save(c,'sas-chem-fingerprint-types.png',dir); }
};
