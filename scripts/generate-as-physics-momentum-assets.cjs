const { createCanvas } = require('@napi-rs/canvas');
const fs=require('fs'),path=require('path');
const OUT=path.join(process.cwd(),'public','lesson-assets','as-physics');
fs.mkdirSync(OUT,{recursive:true});
const W=1800,H=1050,C={navy:'#0b1b32',blue:'#2563eb',teal:'#0f766e',orange:'#ea580c',red:'#dc2626',purple:'#7c3aed',slate:'#475569',light:'#f8fafc',line:'#cbd5e1',green:'#16a34a'};
function base(title,sub){const c=createCanvas(W,H),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle=C.navy;x.font='700 56px Arial';x.fillText(title,70,80);x.fillStyle=C.slate;x.font='28px Arial';x.fillText(sub,70,125);x.strokeStyle='#dbe4ea';x.lineWidth=3;x.beginPath();x.moveTo(70,152);x.lineTo(1730,152);x.stroke();return[c,x]}
function panel(x,l,t,w,h,label,title,bg){x.fillStyle=bg;x.strokeStyle=C.line;x.lineWidth=3;x.beginPath();x.roundRect(l,t,w,h,24);x.fill();x.stroke();x.fillStyle=C.blue;x.font='700 28px Arial';x.fillText(label,l+28,t+46);x.fillStyle=C.navy;x.font='700 34px Arial';x.fillText(title,l+78,t+47)}
function arrow(x,x1,y1,x2,y2,color,label,lx,ly){x.strokeStyle=color;x.fillStyle=color;x.lineWidth=9;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();const a=Math.atan2(y2-y1,x2-x1),s=24;x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-.5),y2-s*Math.sin(a-.5));x.lineTo(x2-s*Math.cos(a+.5),y2-s*Math.sin(a+.5));x.closePath();x.fill();if(label){x.font='700 27px Arial';x.fillText(label,lx,ly)}}
function cart(x,cx,cy,color,label){x.fillStyle=color;x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(cx-105,cy-70,210,120);x.strokeRect(cx-105,cy-70,210,120);x.fillStyle=C.navy;x.font='700 28px Arial';x.fillText(label,cx-42,cy);for(const dx of[-65,65]){x.fillStyle='#64748b';x.beginPath();x.arc(cx+dx,cy+67,18,0,Math.PI*2);x.fill()}}
function save(c,n){fs.writeFileSync(path.join(OUT,n),c.toBuffer('image/jpeg',{quality:.94,progressive:true}))}

// Momentum system before and after
{
 const[c,x]=base('Momentum conservation: define the system first','Arrows show signed velocities along one horizontal axis; external impulse is negligible during the short interaction.');
 panel(x,70,190,800,720,'A','Before collision','#eff6ff');panel(x,930,190,800,720,'B','After collision','#ecfdf5');
 x.strokeStyle='#94a3b8';x.lineWidth=14;x.beginPath();x.moveTo(130,690);x.lineTo(810,690);x.moveTo(990,690);x.lineTo(1670,690);x.stroke();
 cart(x,300,600,'#bfdbfe','m₁');cart(x,660,600,'#fed7aa','m₂');arrow(x,300,500,490,500,C.blue,'u₁',380,470);arrow(x,660,500,565,500,C.red,'u₂',585,470);
 cart(x,1100,600,'#bfdbfe','m₁');cart(x,1500,600,'#fed7aa','m₂');arrow(x,1100,500,1240,500,C.blue,'v₁',1160,470);arrow(x,1500,500,1625,500,C.orange,'v₂',1550,470);
 x.fillStyle=C.navy;x.font='700 31px Arial';x.fillText('total p before = m₁u₁ + m₂u₂',190,790);x.fillText('total p after = m₁v₁ + m₂v₂',1040,790);
 x.fillStyle=C.teal;x.font='700 32px Arial';x.fillText('m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',585,985);
 save(c,'momentum-system-before-after.jpg');
}
// Elastic versus inelastic
{
 const[c,x]=base('Momentum is conserved in both collision types','Kinetic energy distinguishes an elastic collision from an inelastic collision in an isolated system.');
 panel(x,70,190,800,720,'A','Elastic','#eff6ff');panel(x,930,190,800,720,'B','Inelastic','#fff7ed');
 x.strokeStyle='#94a3b8';x.lineWidth=14;x.beginPath();x.moveTo(130,680);x.lineTo(810,680);x.moveTo(990,680);x.lineTo(1670,680);x.stroke();
 cart(x,260,590,'#bfdbfe','1');cart(x,610,590,'#fed7aa','2');arrow(x,260,480,430,480,C.blue,'separate after impact',245,435);arrow(x,610,520,500,520,C.red,'',0,0);
 x.fillStyle=C.green;x.font='700 30px Arial';x.fillText('Σp before = Σp after',190,770);x.fillText('ΣEₖ before = ΣEₖ after',160,825);
 x.fillStyle='#cbd5e1';x.strokeStyle=C.navy;x.lineWidth=4;x.fillRect(1150,520,360,120);x.strokeRect(1150,520,360,120);x.fillStyle=C.navy;x.font='700 28px Arial';x.fillText('objects move together',1185,592);arrow(x,1510,580,1630,580,C.orange,'common velocity v',1340,475);
 x.fillStyle=C.green;x.font='700 30px Arial';x.fillText('Σp before = Σp after',1090,770);x.fillStyle=C.red;x.fillText('ΣEₖ after < ΣEₖ before',1050,825);
 x.fillStyle=C.slate;x.font='25px Arial';x.fillText('Lost kinetic energy is transferred to deformation, heating and sound.',955,880);
 save(c,'elastic-inelastic-collisions.jpg');
}
// Force-time and impulse
{
 const[c,x]=base('Impulse is the area under a force–time graph','The signed area gives change in momentum. Read the time axis in seconds before calculating.');
 panel(x,70,190,800,720,'A','Constant force','#eff6ff');panel(x,930,190,800,720,'B','Changing force','#f5f3ff');
 function axes(l){x.strokeStyle=C.navy;x.lineWidth=5;x.beginPath();x.moveTo(l+130,760);x.lineTo(l+700,760);x.moveTo(l+130,760);x.lineTo(l+130,300);x.stroke();x.fillStyle=C.navy;x.font='27px Arial';x.fillText('time / s',l+560,820);x.save();x.translate(l+65,590);x.rotate(-Math.PI/2);x.fillText('force / N',0,0);x.restore()}
 axes(70);axes(930);
 x.fillStyle='rgba(37,99,235,.22)';x.fillRect(200,450,420,310);x.strokeStyle=C.blue;x.lineWidth=8;x.strokeRect(200,450,420,310);x.fillStyle=C.blue;x.font='700 30px Arial';x.fillText('impulse = FΔt',300,620);
 x.fillStyle='rgba(124,58,237,.22)';x.beginPath();x.moveTo(1060,760);x.lineTo(1345,350);x.lineTo(1630,760);x.closePath();x.fill();x.strokeStyle=C.purple;x.lineWidth=8;x.stroke();x.fillStyle=C.purple;x.font='700 29px Arial';x.fillText('impulse = ½ × base × height',1115,625);
 x.fillStyle=C.teal;x.font='700 32px Arial';x.fillText('impulse J = area = Δp = mv − mu',590,985);
 save(c,'impulse-force-time-area.jpg');
}
// Impact time comparison
{
 const[c,x]=base('Increase collision time to reduce average force','For the same change in momentum, both curves have the same signed area but different peak forces.');
 const L=220,R=1580,T=220,B=830;x.strokeStyle=C.navy;x.lineWidth=5;x.beginPath();x.moveTo(L,B);x.lineTo(R,B);x.moveTo(L,B);x.lineTo(L,T);x.stroke();
 x.fillStyle=C.navy;x.font='30px Arial';x.fillText('contact time',720,915);x.save();x.translate(90,620);x.rotate(-Math.PI/2);x.fillText('contact force',0,0);x.restore();
 x.fillStyle='rgba(220,38,38,.16)';x.beginPath();x.moveTo(430,B);x.quadraticCurveTo(610,260,790,B);x.closePath();x.fill();x.strokeStyle=C.red;x.lineWidth=9;x.beginPath();x.moveTo(430,B);x.quadraticCurveTo(610,260,790,B);x.stroke();
 x.fillStyle='rgba(37,99,235,.16)';x.beginPath();x.moveTo(890,B);x.quadraticCurveTo(1190,510,1490,B);x.closePath();x.fill();x.strokeStyle=C.blue;x.lineWidth=9;x.beginPath();x.moveTo(890,B);x.quadraticCurveTo(1190,510,1490,B);x.stroke();
 x.fillStyle=C.red;x.font='700 28px Arial';x.fillText('short time, high peak force',380,245);x.fillStyle=C.blue;x.fillText('longer time, lower peak force',1020,480);
 x.fillStyle=C.teal;x.font='700 32px Arial';x.fillText('same impulse:  F̄Δt = Δp',650,990);
 save(c,'impact-time-force-comparison.jpg');
}
console.log('Generated momentum JPEG assets in',OUT);