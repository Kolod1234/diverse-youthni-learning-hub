const {createCanvas, registerFont} = require('canvas');
const fs = require('fs');
registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', {family:'DV'});
registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', {family:'DV', weight:'bold'});
const C = {ink:'#0f172a', grey:'#64748b', light:'#cbd5e1', blue:'#1d4ed8', red:'#dc2626', paper:'#ffffff', soft:'#475569'};
function make(w,h){ const c=createCanvas(w,h); const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.lineCap='round'; x.lineJoin='round'; return [c,x]; }
function save(c,name,dir){ fs.writeFileSync((dir||__dirname+'/out')+'/'+name, c.toBuffer('image/png')); }
function text(x,s,px,py,o={}){ x.save(); x.font=`${o.bold?'bold ':''}${o.size||26}px DV`; x.fillStyle=o.color||C.ink; x.textAlign=o.align||'center'; x.textBaseline=o.base||'middle'; x.fillText(s,px,py); x.restore(); }
function circle(x,cx,cy,r,o={}){ x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); if(o.fill){x.fillStyle=o.fill; x.fill();} if(o.stroke!==false){ x.strokeStyle=o.stroke||C.grey; x.lineWidth=o.lw||3; if(o.dash) x.setLineDash(o.dash); x.stroke(); x.setLineDash([]);} }
function line(x,x1,y1,x2,y2,o={}){ x.beginPath(); x.moveTo(x1,y1); x.lineTo(x2,y2); x.strokeStyle=o.color||C.ink; x.lineWidth=o.lw||3; if(o.dash) x.setLineDash(o.dash); x.stroke(); x.setLineDash([]); }
function arrowHead(x,x1,y1,x2,y2,o={}){ const a=Math.atan2(y2-y1,x2-x1), L=o.len||18; x.beginPath(); x.moveTo(x2,y2); x.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4)); x.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4)); x.closePath(); x.fillStyle=o.color||C.ink; x.fill(); }
function arrow(x,x1,y1,x2,y2,o={}){ line(x,x1,y1,x2,y2,o); arrowHead(x,x1,y1,x2,y2,o); }
function electron(x,px,py,type,s=9){ if(type==='x'){ line(x,px-s,py-s,px+s,py+s,{color:C.red,lw:3.5}); line(x,px-s,py+s,px+s,py-s,{color:C.red,lw:3.5}); } else { circle(x,px,py,s*0.8,{fill:C.blue,stroke:false}); } }
function shellPositions(cx,cy,r,n,first){
  const out=[]; if(n===0) return out;
  if(first){ const ang=n===1?[Math.PI]:[Math.PI,0]; ang.forEach(a=>out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])); return out; }
  const card=[-Math.PI/2,0,Math.PI/2,Math.PI]; const cnt=[0,0,0,0];
  for(let i=0;i<n;i++) cnt[i%4]++;
  const d=0.22;
  card.forEach((a,i)=>{ if(cnt[i]===1) out.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); if(cnt[i]===2){ out.push([cx+r*Math.cos(a-d),cy+r*Math.sin(a-d)]); out.push([cx+r*Math.cos(a+d),cy+r*Math.sin(a+d)]); } });
  return out;
}
function atom(x,cx,cy,sym,shells,o={}){
  shells.forEach((sh,i)=>{ circle(x,cx,cy,sh.r,{stroke:C.grey,lw:3}); const pos=shellPositions(cx,cy,sh.r,sh.e.length,sh.first!==undefined?sh.first:(i===0&&!o.outerOnly)); pos.forEach((p,j)=>electron(x,p[0],p[1],sh.e[j])); });
  text(x,sym,cx,cy+1,{size:o.symSize||34,bold:true});
}
function rep(t,n){ return Array(n).fill(t); }
function bracket(x,x1,y1,x2,y2,charge){ const t=16; x.strokeStyle=C.ink; x.lineWidth=4; x.beginPath(); x.moveTo(x1+t,y1); x.lineTo(x1,y1); x.lineTo(x1,y2); x.lineTo(x1+t,y2); x.stroke(); x.beginPath(); x.moveTo(x2-t,y1); x.lineTo(x2,y1); x.lineTo(x2,y2); x.lineTo(x2-t,y2); x.stroke(); if(charge) text(x,charge,x2+8,y1+4,{size:32,bold:true,align:'left'}); }
function title(x,s,w){ text(x,s,w/2,34,{size:30,bold:true}); }
module.exports={make,save,text,circle,line,arrow,arrowHead,electron,atom,rep,bracket,title,C};
