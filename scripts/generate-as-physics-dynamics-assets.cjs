const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(process.cwd(),'public','lesson-assets','as-physics');
fs.mkdirSync(OUT,{recursive:true});
const W=1800,H=1050;
const C={navy:'#0b1b32',blue:'#2563eb',teal:'#0f766e',orange:'#ea580c',red:'#dc2626',purple:'#7c3aed',slate:'#475569',light:'#f8fafc',line:'#cbd5e1',gold:'#f59e0b',green:'#16a34a'};
function canvas(title,subtitle){
 const c=createCanvas(W,H),x=c.getContext('2d'); x.fillStyle='#ffffff';x.fillRect(0,0,W,H);
 x.fillStyle=C.navy;x.font='700 58px Arial';x.fillText(title,70,82);
 x.fillStyle=C.slate;x.font='28px Arial';x.fillText(subtitle,70,126);
 x.strokeStyle='#dbe4ea';x.lineWidth=3;x.beginPath();x.moveTo(70,152);x.lineTo(W-70,152);x.stroke();
 return [c,x];
}
function panel(x,left,top,width,height,label,title,bg='#f8fafc'){
 x.fillStyle=bg;x.strokeStyle='#cbd5e1';x.lineWidth=3;x.beginPath();x.roundRect(left,top,width,height,24);x.fill();x.stroke();
 x.fillStyle=C.blue;x.font='700 28px Arial';x.fillText(label,left+28,top+46);
 x.fillStyle=C.navy;x.font='700 34px Arial';x.fillText(title,left+78,top+47);
}
function arrow(x,x1,y1,x2,y2,color,label,labelX,labelY){
 x.strokeStyle=color;x.fillStyle=color;x.lineWidth=8;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();
 const a=Math.atan2(y2-y1,x2-x1),s=22;x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-0.5),y2-s*Math.sin(a-0.5));x.lineTo(x2-s*Math.cos(a+0.5),y2-s*Math.sin(a+0.5));x.closePath();x.fill();
 if(label){x.font='700 26px Arial';x.fillText(label,labelX,labelY);}
}
function save(c,name){fs.writeFileSync(path.join(OUT,name),c.toBuffer('image/jpeg',{quality:0.94,progressive:true}));}

// Newton laws figure
{
 const [c,x]=canvas('Newton’s laws: identify the object and the resultant','Each arrow is a force acting on the labelled object; equal-and-opposite third-law forces act on different objects.');
 const gap=30,pw=(W-140-2*gap)/3,pt=190,ph=770;
 panel(x,70,pt,pw,ph,'A','First law','#eff6ff');
 panel(x,70+pw+gap,pt,pw,ph,'B','Second law','#ecfdf5');
 panel(x,70+2*(pw+gap),pt,pw,ph,'C','Third law','#fff7ed');
 // A
 let l=70;
 x.fillStyle='#94a3b8';x.fillRect(l+55,pt+540,pw-110,18);
 x.fillStyle='#dbeafe';x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(l+175,pt+390,190,145);x.strokeRect(l+175,pt+390,190,145);
 x.fillStyle=C.navy;x.font='700 28px Arial';x.fillText('trolley',l+225,pt+475);
 arrow(x,l+175,pt+455,l+75,pt+455,C.red,'12 N drag',l+70,pt+415);
 arrow(x,l+365,pt+455,l+465,pt+455,C.blue,'12 N drive',l+340,pt+415);
 arrow(x,l+270,pt+390,l+270,pt+270,C.teal,'N',l+290,pt+300);
 arrow(x,l+270,pt+535,l+270,pt+655,C.orange,'W = mg',l+295,pt+650);
 x.fillStyle=C.navy;x.font='26px Arial';x.fillText('ΣF = 0  →  a = 0',l+115,pt+735);
 // B
 l=70+pw+gap;
 x.fillStyle='#94a3b8';x.fillRect(l+55,pt+540,pw-110,18);
 x.fillStyle='#dcfce7';x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(l+175,pt+390,190,145);x.strokeRect(l+175,pt+390,190,145);
 x.fillStyle=C.navy;x.font='700 27px Arial';x.fillText('m = 4.0 kg',l+195,pt+475);
 arrow(x,l+175,pt+455,l+90,pt+455,C.red,'6 N',l+80,pt+415);
 arrow(x,l+365,pt+455,l+500,pt+455,C.blue,'18 N',l+385,pt+415);
 arrow(x,l+270,pt+390,l+270,pt+270,C.teal,'N',l+290,pt+300);
 arrow(x,l+270,pt+535,l+270,pt+655,C.orange,'W',l+295,pt+650);
 x.fillStyle=C.navy;x.font='24px Arial';x.fillText('Fᵣ = 18 − 6 = 12 N',l+95,pt+705);
 x.fillText('a = Fᵣ ÷ m = 3.0 m s⁻²',l+70,pt+747);
 // C
 l=70+2*(pw+gap);
 x.fillStyle='#fde68a';x.fillRect(l+70,pt+545,pw-140,18);
 x.fillStyle='#bfdbfe';x.beginPath();x.arc(l+180,pt+400,60,0,Math.PI*2);x.fill();
 x.fillStyle='#fecaca';x.beginPath();x.arc(l+pw-180,pt+400,60,0,Math.PI*2);x.fill();
 x.fillStyle=C.navy;x.font='700 28px Arial';x.fillText('A',l+170,pt+410);x.fillText('B',l+pw-190,pt+410);
 arrow(x,l+235,pt+430,l+355,pt+430,C.blue,'F on A by B',l+185,pt+350);
 arrow(x,l+pw-235,pt+470,l+pw-355,pt+470,C.red,'F on B by A',l+pw-355,pt+535);
 x.fillStyle=C.navy;x.font='24px Arial';x.fillText('same magnitude',l+155,pt+675);x.fillText('opposite directions',l+130,pt+715);x.fillText('different objects',l+150,pt+755);
 save(c,'newton-laws-force-models.jpg');
}
// Newton second-law graph
{
 const [c,x]=canvas('Resultant force and acceleration','Ideal schematic data for a constant mass of 2.5 kg: the gradient of F against a is the mass.');
 const L=230,R=1550,T=220,B=870;
 x.strokeStyle=C.navy;x.lineWidth=5;x.beginPath();x.moveTo(L,B);x.lineTo(R,B);x.moveTo(L,B);x.lineTo(L,T);x.stroke();
 x.fillStyle=C.navy;x.font='30px Arial';x.fillText('acceleration, a / m s⁻²',700,950);
 x.save();x.translate(85,620);x.rotate(-Math.PI/2);x.fillText('resultant force, Fᵣ / N',0,0);x.restore();
 for(let i=0;i<=4;i++){const px=L+i*(R-L)/4;x.strokeStyle='#dbe4ea';x.lineWidth=2;x.beginPath();x.moveTo(px,T);x.lineTo(px,B);x.stroke();x.fillStyle=C.slate;x.font='24px Arial';x.fillText(String(i),px-7,B+38);}
 for(let j=0;j<=5;j++){const val=j*2.5,py=B-j*(B-T)/5;x.strokeStyle='#dbe4ea';x.lineWidth=2;x.beginPath();x.moveTo(L,py);x.lineTo(R,py);x.stroke();x.fillStyle=C.slate;x.font='24px Arial';x.fillText(val.toFixed(val%1?1:0),L-70,py+8);}
 x.strokeStyle=C.blue;x.lineWidth=8;x.beginPath();x.moveTo(L,B);x.lineTo(R,T);x.stroke();
 for(let i=0;i<=4;i++){const px=L+i*(R-L)/4,py=B-(2.5*i/12.5)*(B-T);x.fillStyle=C.orange;x.beginPath();x.arc(px,py,12,0,Math.PI*2);x.fill();}
 x.fillStyle=C.navy;x.font='700 28px Arial';x.fillText('gradient = ΔFᵣ ÷ Δa = 10.0 ÷ 4.0 = 2.5 kg',620,260);
 x.fillStyle=C.teal;x.font='26px Arial';x.fillText('A straight line through the origin shows Fᵣ ∝ a when mass is constant.',505,1010);
 save(c,'newton-second-law-force-acceleration.jpg');
}
// Friction figure
{
 const [c,x]=canvas('Friction: decide direction from relative motion','Identify which way the contacting surfaces move, or would move, relative to one another.');
 panel(x,70,190,800,770,'A','Block sliding right','#eff6ff');
 panel(x,930,190,800,770,'B','Block on a slope','#fff7ed');
 // A
 x.fillStyle='#94a3b8';x.fillRect(130,690,680,24);
 for(let i=0;i<30;i++){x.fillStyle=i%2?'#64748b':'#94a3b8';x.beginPath();x.moveTo(130+i*23,690);x.lineTo(142+i*23,670);x.lineTo(153+i*23,690);x.fill();}
 x.fillStyle='#dbeafe';x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(330,500,270,165);x.strokeRect(330,500,270,165);
 x.fillStyle=C.navy;x.font='700 30px Arial';x.fillText('block',420,595);
 arrow(x,600,580,760,580,C.blue,'motion',665,535);
 arrow(x,600,620,760,620,C.blue,'applied force',620,660);
 arrow(x,330,620,170,620,C.red,'friction',175,575);
 arrow(x,465,500,465,360,C.teal,'normal N',490,395);
 arrow(x,465,665,465,835,C.orange,'weight W',490,820);
 x.fillStyle=C.slate;x.font='24px Arial';x.fillText('Friction acts left because the block slides right.',190,905);
 // B slope
 x.strokeStyle='#64748b';x.lineWidth=22;x.beginPath();x.moveTo(1000,790);x.lineTo(1640,470);x.stroke();
 x.save();x.translate(1320,620);x.rotate(-Math.atan2(320,640));x.fillStyle='#ffedd5';x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(-120,-150,240,150);x.strokeRect(-120,-150,240,150);x.restore();
 arrow(x,1320,560,1320,820,C.orange,'weight W',1345,800);
 arrow(x,1270,590,1170,390,C.teal,'normal N',1035,395);
 arrow(x,1275,645,1120,720,C.red,'friction up slope',955,760);
 arrow(x,1370,610,1515,535,C.slate,'sliding tendency',1385,500);
 x.fillStyle=C.slate;x.font='24px Arial';x.fillText('Friction acts up the plane because sliding would be down.',995,905);
 save(c,'friction-force-directions.jpg');
}
console.log('Generated dynamics JPEG assets in',OUT);