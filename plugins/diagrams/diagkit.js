/* diagkit.js — house-style diagram toolkit for A2 lesson visuals.
   Port of the matplotlib toolkit to node-canvas so diagrams are drawn at
   build time instead of being uploaded as base64.

   Coordinate convention: y measures UP from the bottom of the canvas.
   All conversion to canvas' top-down space happens inside Y(). */

const { createCanvas } = require('canvas');

const TEAL='#0f766e', BLUE='#1d4ed8', INDIGO='#4338ca', AMBER='#b45309',
      RED='#b91c1c', SLATE='#334155', TEXT='#24343d', GREY='#94a3b8',
      BG='#f8fafc';

const FILL = { [TEAL]:'#ecfdf5', [BLUE]:'#eff6ff', [INDIGO]:'#eef2ff',
               [AMBER]:'#fffbeb', [RED]:'#fee2e2', [SLATE]:'#f1f5f9',
               [GREY]:'#f1f5f9' };

// matplotlib fontsize is in points at dpi=100 -> pixels = pt * 100/72
const PT = 100/72;
const FAMILY = 'DejaVu Sans, Liberation Sans, Arial, sans-serif';
const LINESPACING = 1.35;

function fontStr(size, bold){ return `${bold?'bold ':''}${(size*PT).toFixed(2)}px ${FAMILY}`; }

class Diagram {
  constructor(w=760, h=456){
    this.w=w; this.h=h;
    this.cv=createCanvas(w,h);
    this.g=this.cv.getContext('2d');
    this.g.fillStyle=BG; this.g.fillRect(0,0,w,h);
    this.g.lineJoin='round'; this.g.lineCap='round';
    this.occupied=[];      // [x,y,w,h] rects in diagram coords
    this.warnings=[];
  }
  Y(y){ return this.h - y; }

  /* Register a drawn rect so caption()/audit() can reason about the layout. */
  claim(x,y,w,h,tag){ this.occupied.push({x,y,w,h,tag}); }
  static overlaps(a,b){
    return a.x < b.x+b.w && b.x < a.x+a.w && a.y < b.y+b.h && b.y < a.y+a.h;
  }
  /* Lowest edge of anything drawn so far (excluding the caption band). */
  lowestY(){
    return this.occupied.length ? Math.min(...this.occupied.map(r=>r.y)) : this.h;
  }
  /* Report layout faults instead of relying on the eye. */
  audit(){
    const faults=[...this.warnings];
    for(const r of this.occupied){
      if(r.x < 0 || r.y < 0 || r.x+r.w > this.w || r.y+r.h > this.h)
        faults.push(`offcanvas ${r.tag} [${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}]`);
    }
    for(let i=0;i<this.occupied.length;i++)
      for(let j=i+1;j<this.occupied.length;j++)
        if(Diagram.overlaps(this.occupied[i],this.occupied[j]))
          faults.push(`overlap ${this.occupied[i].tag} x ${this.occupied[j].tag}`);
    return faults;
  }

  lineHeight(size){ return size*PT*LINESPACING; }
  measure(text, size, bold){
    const g=this.g; g.font=fontStr(size,bold);
    const lines=String(text).split('\n');
    let wd=0; for(const l of lines) wd=Math.max(wd, g.measureText(l).width);
    return { w:wd, h:lines.length*this.lineHeight(size) };
  }
  static wrapChars(text, chars){
    const words=String(text).split(/\s+/).filter(Boolean);
    const out=[]; let cur='';
    for(const wd of words){
      if(!cur) { cur=wd; continue; }
      if((cur+' '+wd).length<=chars) cur+=' '+wd; else { out.push(cur); cur=wd; }
    }
    if(cur) out.push(cur);
    return out;
  }
  /* Wrap and shrink until the rendered text genuinely fits w x h pixels. */
  fit(w,h,text,size,bold=true,padx=16,pady=12,minsize=7.0){
    let best=null; let s=size;
    while(s>=minsize){
      const start=Math.max(8,String(text).length);
      for(let chars=start; chars>7; chars--){
        const t=Diagram.wrapChars(text,chars).join('\n');
        const m=this.measure(t,s,bold);
        if(m.w<=w-2*padx && m.h<=h-2*pady) return {text:t,size:s};
        if(m.w<=w-2*padx){ best={text:t,size:s}; break; }
      }
      s-=0.5;
    }
    return best || {text:Diagram.wrapChars(text,12).join('\n'), size:minsize};
  }

  _text(x,y,t,{size=11,colour=TEXT,bold=false,ha='center',va='center'}={}){
    const g=this.g; g.font=fontStr(size,bold); g.fillStyle=colour;
    const lines=String(t).split('\n'); const lh=this.lineHeight(size);
    const block=lines.length*lh;
    let top;
    if(va==='center') top=this.Y(y)-block/2;
    else if(va==='top') top=this.Y(y);
    else top=this.Y(y)-block;
    g.textBaseline='middle';
    g.textAlign = ha==='left' ? 'left' : ha==='right' ? 'right' : 'center';
    lines.forEach((ln,i)=> g.fillText(ln, x, top + lh*(i+0.5)));
  }
  roundRect(x,y,w,h,r){
    const g=this.g, Y=this.Y(y+h);
    r=Math.min(r,w/2,h/2);
    g.beginPath();
    g.moveTo(x+r,Y); g.lineTo(x+w-r,Y); g.quadraticCurveTo(x+w,Y,x+w,Y+r);
    g.lineTo(x+w,Y+h-r); g.quadraticCurveTo(x+w,Y+h,x+w-r,Y+h);
    g.lineTo(x+r,Y+h); g.quadraticCurveTo(x,Y+h,x,Y+h-r);
    g.lineTo(x,Y+r); g.quadraticCurveTo(x,Y,x+r,Y);
    g.closePath();
  }
  line(x1,y1,x2,y2,{colour=SLATE,lw=1.6,dashed=false}={}){
    const g=this.g; g.save(); if(dashed) g.setLineDash([7,5]);
    g.strokeStyle=colour; g.lineWidth=lw;
    g.beginPath(); g.moveTo(x1,this.Y(y1)); g.lineTo(x2,this.Y(y2)); g.stroke(); g.restore();
  }

  title(t,{y=null,size=17,colour=TEAL}={}){
    this._text(this.w/2, y===null? this.h-30 : y, t, {size,colour,bold:true});
  }
  box(x,y,w,h,label,colour=TEAL,size=12,bold=true,fill=null){
    const g=this.g;
    this.roundRect(x,y,w,h,10);
    g.fillStyle = fill || FILL[colour] || '#ffffff'; g.fill();
    g.strokeStyle=colour; g.lineWidth=1.8; g.stroke();
    const f=this.fit(w,h,label,size,bold);
    this._text(x+w/2,y+h/2,f.text,{size:f.size,colour,bold});
    this.claim(x,y,w,h,'box:'+String(label).slice(0,18));
  }
  note(x,y,w,h,label,colour=SLATE,size=11,fill='#ffffff'){
    const g=this.g;
    this.roundRect(x,y,w,h,8);
    g.fillStyle=fill; g.fill(); g.strokeStyle=colour; g.lineWidth=1.2; g.stroke();
    const f=this.fit(w,h,label,size,false);
    this._text(x+w/2,y+h/2,f.text,{size:f.size,colour:TEXT});
    this.claim(x,y,w,h,'note:'+String(label).slice(0,18));
  }
  arrow(p1,p2,colour=SLATE,lw=2.0,{dashed=false,rad=0,head=8}={}){
    const g=this.g;
    const x1=p1[0], y1=this.Y(p1[1]), x2=p2[0], y2=this.Y(p2[1]);
    const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L;
    const ax=x1+ux*2, ay=y1+uy*2, bx=x2-ux*2, by=y2-uy*2;
    g.save(); if(dashed) g.setLineDash([7,5]);
    g.strokeStyle=colour; g.fillStyle=colour; g.lineWidth=lw;
    g.beginPath(); g.moveTo(ax,ay);
    let angle=Math.atan2(by-ay,bx-ax);
    if(rad){
      const mx=(ax+bx)/2, my=(ay+by)/2;
      const cx=mx-(by-ay)*rad, cy=my+(bx-ax)*rad;
      g.quadraticCurveTo(cx,cy,bx,by);
      angle=Math.atan2(by-cy,bx-cx);
    } else g.lineTo(bx,by);
    g.stroke(); g.setLineDash([]);
    const head_w=head*0.55;
    g.beginPath();
    g.moveTo(bx,by);
    g.lineTo(bx-head*Math.cos(angle)+head_w*Math.sin(angle), by-head*Math.sin(angle)-head_w*Math.cos(angle));
    g.lineTo(bx-head*Math.cos(angle)-head_w*Math.sin(angle), by-head*Math.sin(angle)+head_w*Math.cos(angle));
    g.closePath(); g.fill(); g.restore();
  }
  label(x,y,t,colour=TEXT,size=11,{ha='center',bold=false,wrap=null,va='center'}={}){
    if(wrap) t=Diagram.wrapChars(t,wrap).join('\n');
    this._text(x,y,t,{size,colour,bold,ha,va});
  }
  fitlabel(x,y,w,t,colour=TEXT,size=11.5,bold=false,ha='center'){
    const f=this.fit(w,400,t,size,bold,0,0);
    this._text(x,y,f.text,{size:f.size,colour,bold,ha});
  }
  /* Captions sit in the bottom band. Rather than trusting hand-tuned
     coordinates across hundreds of diagrams, shrink and re-wrap until the
     block clears everything already drawn; record a warning if it cannot. */
  caption(t,{y=22,size=11.5,wrap=95}={}){
    const floor=this.lowestY();
    let s=size, w=wrap, block=null, txt=null;
    for(let guard=0; guard<40; guard++){
      txt=Diagram.wrapChars(t,w).join('\n');
      const m=this.measure(txt,s,false);
      block={x:(this.w-m.w)/2, y:y-m.h/2, w:m.w, h:m.h};
      const clearsTop    = block.y+block.h <= floor;
      const clearsBottom = block.y >= 0;
      const clearsSides  = block.w <= this.w-24;
      if(clearsTop && clearsBottom && clearsSides) break;
      if(!clearsSides || !clearsTop){ w=Math.round(w*1.08)+2; }   // wider lines = fewer rows
      if(w>150 || !clearsBottom){ w=wrap; s-=0.5; }
      if(s<7.5){ this.warnings.push(`caption did not fit above y=${Math.round(floor)}`); break; }
    }
    this._text(this.w/2,y,txt,{size:s,colour:SLATE});
    this.claim(block.x,block.y,block.w,block.h,'caption');
  }

  steps(items,{x=40,y0=380,w=680,rowh=34,gap=8,colour=TEAL,size=10.5,num=true}={}){
    let y=y0;
    items.forEach((t,i)=>{ this.box(x,y,w,rowh,num?`${i+1}.  ${t}`:t,colour,size); y-=rowh+gap; });
    return y;
  }
  chain(items,{y=250,x0=30,x1=730,h=64,colour=TEAL,size=10,arrowcol=null}={}){
    const n=items.length, gap=16, w=((x1-x0)-gap*(n-1))/n;
    items.forEach((t,i)=>{
      const x=x0+i*(w+gap);
      this.box(x,y,w,h,t,Array.isArray(colour)?colour[i]:colour,size);
      if(i<n-1) this.arrow([x+w,y+h/2],[x+w+gap,y+h/2],arrowcol||SLATE,1.8);
    });
    return w;
  }
  cards(items,{y0=360,x=40,w=680,rowh=52,gap=10,colour=INDIGO,size=10.5}={}){
    const g=this.g; let yy=y0;
    for(const pair of items){
      const head=pair[0], body=pair[1];
      this.roundRect(x,yy,w,rowh,8);
      g.fillStyle=FILL[colour]||'#ffffff'; g.fill();
      g.strokeStyle=colour; g.lineWidth=1.5; g.stroke();
      const f1=this.fit(w*0.42,rowh,head,size,true,12);
      this._text(x+12,yy+rowh/2,f1.text,{size:f1.size,colour,bold:true,ha:'left'});
      const f2=this.fit(w*0.56,rowh,body,size,false,12);
      this._text(x+w-12,yy+rowh/2,f2.text,{size:f2.size,colour:TEXT,ha:'right'});
      this.claim(x,yy,w,rowh,'card:'+String(head).slice(0,18));
      yy-=rowh+gap;
    }
    return yy;
  }
  twocol(left,right,{y0=360,rowh=46,gap=9,lc=BLUE,rc=AMBER,size=10,x=40,w=680,heads=null}={}){
    const cw=(w-20)/2;
    if(heads){
      this.label(x+cw/2,y0+rowh+6,heads[0],lc,11.5,{bold:true});
      this.label(x+cw+20+cw/2,y0+rowh+6,heads[1],rc,11.5,{bold:true});
    }
    let yy=y0;
    for(let i=0;i<left.length;i++){
      this.box(x,yy,cw,rowh,left[i],lc,size);
      this.box(x+cw+20,yy,cw,rowh,right[i],rc,size);
      yy-=rowh+gap;
    }
    return yy;
  }
  axesbox(x,y,w,h,{xlabel='',ylabel='',colour=SLATE}={}){
    this.line(x,y,x,y+h,{colour,lw:1.6});
    this.line(x,y,x+w,y,{colour,lw:1.6});
    if(xlabel) this.label(x+w/2,y-22,xlabel,SLATE,10.5,{bold:true});
    if(ylabel){
      const g=this.g; g.save(); g.translate(x-30,this.Y(y+h/2)); g.rotate(-Math.PI/2);
      g.font=fontStr(10.5,true); g.fillStyle=SLATE;
      g.textAlign='center'; g.textBaseline='middle'; g.fillText(ylabel,0,0); g.restore();
    }
  }
  plot(pts,{colour=SLATE,lw=1.8,dashed=false}={}){
    const g=this.g; g.save(); if(dashed) g.setLineDash([7,5]);
    g.strokeStyle=colour; g.lineWidth=lw; g.beginPath();
    pts.forEach((p,i)=> i? g.lineTo(p[0],this.Y(p[1])) : g.moveTo(p[0],this.Y(p[1])));
    g.stroke(); g.restore();
  }
  buffer(){ return this.cv.toBuffer('image/png'); }
}

function newSheet(t,size=14.5,w=760,h=456){
  const d=new Diagram(w,h); d.title(t,{size}); return d;
}

module.exports = { Diagram, newSheet, TEAL, BLUE, INDIGO, AMBER, RED, SLATE, TEXT, GREY, BG, FILL };
