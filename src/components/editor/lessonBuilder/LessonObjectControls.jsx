import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { documentRoot, documentObjects, fitDocument, objectFromTarget, objectMode, setObjectMode } from './documentObjects';

const control = 'rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-indigo-50';
const directions = ['nw','n','ne','e','se','s','sw','w'];

// Selection chrome is portaled outside the editable DOM. It is never saved.
export default function LessonObjectControls({ editableRef }) {
  const selected = useRef(null);
  const drag = useRef(null);
  const [rect, setRect] = useState(null);
  const [revision, refresh] = useState(0);
  const measure = useCallback(() => {
    const node = selected.current;
    if (!node?.isConnected || !editableRef.current?.contains(node)) { selected.current = null; setRect(null); return; }
    const box = node.getBoundingClientRect();
    setRect({left:box.left,top:box.top,width:box.width,height:box.height});
  }, [editableRef]);
  const changed = useCallback(() => {
    const editor = editableRef.current;
    if (!editor) return;
    fitDocument(editor);
    editor.dispatchEvent(new Event('input', {bubbles:true}));
    refresh(n=>n+1);
    measure();
  }, [editableRef, measure]);

  useEffect(() => {
    const editor = editableRef.current;
    if (!editor) return;
    const choose = e => {
      const object = objectFromTarget(e.target, editor);
      selected.current = object;
      refresh(n=>n+1);
      measure();
    };
    const chooseRequested = e => {
      selected.current = documentObjects(editor)[e.detail.index] || null;
      selected.current = objectFromTarget(selected.current, editor);
      refresh(n=>n+1); measure();
    };
    const clear = e => {
      if (!editor.contains(e.target) && !e.target.closest?.('[data-object-controls],.lesson-authoring-tools')) { selected.current=null;setRect(null); }
    };
    const key = e => {
      if (e.key === 'Escape') {selected.current=null;setRect(null);}
    };
    const observer = new MutationObserver(measure);
    observer.observe(editor,{childList:true,subtree:true,attributes:true});
    const resize = new ResizeObserver(measure); resize.observe(editor);
    editor.addEventListener('click',choose);
    editor.addEventListener('lesson-select-object',chooseRequested);
    document.addEventListener('pointerdown',clear);
    document.addEventListener('keydown',key);
    window.addEventListener('scroll',measure,true);
    window.addEventListener('resize',measure);
    return () => {
      observer.disconnect(); resize.disconnect();
      editor.removeEventListener('click',choose);
      editor.removeEventListener('lesson-select-object',chooseRequested);
      document.removeEventListener('pointerdown',clear);
      document.removeEventListener('keydown',key);
      window.removeEventListener('scroll',measure,true);
      window.removeEventListener('resize',measure);
    };
  }, [editableRef,measure]);

  useEffect(() => {
    const move = e => {
      const d=drag.current;
      if (!d || e.pointerId!==d.pointerId) return;
      const dx=(e.clientX-d.x)/d.scale, dy=(e.clientY-d.y)/d.scale;
      if (Math.abs(dx)+Math.abs(dy)>3) d.moved=true;
      if (d.kind==='move') {
        if (d.mode==='free') {
          d.node.style.left=Math.max(0,Math.min(d.hostWidth-d.width,d.left+dx))/d.hostWidth*100+'%';
          d.node.style.top=Math.max(0,d.top+dy)+'px';
        } else d.node.style.transform='translate('+dx+'px,'+dy+'px) '+d.transform;
      } else {
        const maxWidth=d.mode==='free'?(d.kind.includes('w')?d.left+d.width:d.hostWidth-d.left):d.hostWidth;
        const width=Math.max(24,Math.min(maxWidth,d.width+(d.kind.includes('w')?-dx:d.kind.includes('e')?dx:0)));
        const height=Math.max(12,d.height+(d.kind.includes('n')?-dy:d.kind.includes('s')?dy:0));
        d.node.style.width=width/d.hostWidth*100+'%';
        d.node.style.height=height+'px';
        d.node.style.minHeight='0';
        d.node.style.maxWidth='100%';
        d.node.style.boxSizing='border-box';
        const media=d.node.querySelector('img,svg');
        if (media) {media.style.width='100%';media.style.height='100%';media.style.objectFit='contain';}
        if (d.mode==='free') {
          if(d.kind.includes('w')) d.node.style.left=Math.max(0,d.left+d.width-width)/d.hostWidth*100+'%';
          if(d.kind.includes('n')) d.node.style.top=Math.max(0,d.top+d.height-height)+'px';
        }
      }
      measure();
    };
    const cancel = () => {
      const d=drag.current; if(!d)return;
      drag.current=null;
      if(editableRef.current?.isConnected) editableRef.current.innerHTML=d.before;
      selected.current=null;setRect(null);
    };
    const up = e => {
      const d=drag.current;
      if(!d || e.pointerId!==d.pointerId)return;
      drag.current=null;
      if(!d.moved){d.node.style.transform=d.transform;measure();return;}
      if(d.kind==='move' && d.mode!=='free') {
        d.node.style.transform=d.transform;
        const previousPointer=d.node.style.pointerEvents;
        d.node.style.pointerEvents='none';
        const chrome=Array.from(document.querySelectorAll('[data-object-controls]'));
        chrome.forEach(el=>{el.style.visibility='hidden';});
        const hit=document.elementFromPoint(e.clientX,e.clientY);
        let range=document.caretRangeFromPoint?.(e.clientX,e.clientY);
        if(!range && document.caretPositionFromPoint){const p=document.caretPositionFromPoint(e.clientX,e.clientY);if(p){range=document.createRange();range.setStart(p.offsetNode,p.offset);range.collapse(true);}}
        chrome.forEach(el=>{el.style.visibility='';});
        d.node.style.pointerEvents=previousPointer;
        const editor=editableRef.current;
        if(d.mode==='inline' && range && editor.contains(range.startContainer) && !d.node.contains(range.startContainer) &&
          (d.node.matches('img,svg') || d.node.matches('[data-lesson-block="shape"]'))) {
          let node=d.node;
          if(node.tagName==='DIV') {const span=document.createElement('span');Array.from(node.attributes).forEach(a=>span.setAttribute(a.name,a.value));span.append(...node.childNodes);node.replaceWith(span);node=span;}
          range.insertNode(node);selected.current=node;
        } else {
          const anchor=hit?.closest('p,h1,h2,h3,ul,ol,figure');
          if(anchor && editor.contains(anchor) && !d.node.contains(anchor)) {
            if(d.mode==='inline' && e.clientY>anchor.getBoundingClientRect().top+anchor.getBoundingClientRect().height/2)anchor.after(d.node);
            else anchor.before(d.node);
          }
        }
      }
      changed();
    };
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
    window.addEventListener('pointercancel',cancel);
    window.addEventListener('blur',cancel);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);drag.current=null;};
  },[editableRef,changed,measure]);

  const start = (e,kind) => {
    const node=selected.current, editor=editableRef.current;
    if(!node || !editor || e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    const host=objectMode(node)==='free'?documentRoot(editor):node.parentElement;
    const r=host.getBoundingClientRect();
    const scale=r.width/(host.offsetWidth||r.width)||1;
    const box=node.getBoundingClientRect();
    drag.current={node,kind,pointerId:e.pointerId,x:e.clientX,y:e.clientY,scale,hostWidth:r.width/scale,
      width:node.offsetWidth||box.width/scale,height:node.offsetHeight||box.height/scale,left:parseFloat(node.style.left)/100*(r.width/scale)||0,
      top:parseFloat(node.style.top)||0,mode:objectMode(node),transform:node.style.transform,before:editor.innerHTML,moved:false};
  };
  const apply = fn => {if(selected.current){fn(selected.current);changed();}};
  const changeMode = mode => apply(node=>setObjectMode(node,editableRef.current,mode));
  const formatShape = (key,value) => apply(node=>{
    const shape=node.matches('[data-lesson-block="shape"]')?node:null;
    if(!shape)return;
    const line=/^(line|arrowLine)/.test(shape.dataset.shape || '');
    shape.querySelectorAll('path,rect,ellipse,circle,polygon,line,polyline').forEach(el=>el.setAttribute(key==='fill'&&line?'stroke':key,value));
    shape.setAttribute(key==='stroke-width'?'data-stroke-width':'data-'+key,value);
    if(key==='fill')shape.setAttribute('data-no-fill',value==='none'?'1':'0');
  });

  const node=selected.current;
  if(!rect || !node)return null;
  const mode=objectMode(node);
  const shape=node.matches('[data-lesson-block="shape"]');
  const rotation=parseFloat(node.style.transform.match(/rotate\(([-.\d]+)/)?.[1])||0;
  const toolbarTop=Math.max(8,Math.min(window.innerHeight-110,rect.top-90));
  return createPortal(<div data-object-controls="true" data-revision={revision} onPointerDown={e=>e.stopPropagation()}>
    <div style={{position:'fixed',left:rect.left,top:rect.top,width:rect.width,height:rect.height,border:'2px solid #4f46e5',pointerEvents:'none',zIndex:10000,boxSizing:'border-box'}}>
      {directions.map(direction=><button key={direction} type="button" aria-label={'Resize object '+direction} onPointerDown={e=>start(e,direction)} style={{position:'absolute',width:12,height:12,padding:0,border:'2px solid #4f46e5',borderRadius:3,background:'white',pointerEvents:'auto',touchAction:'none',left:direction.includes('w')?-7:direction.includes('e')?'calc(100% - 5px)':'calc(50% - 6px)',top:direction.includes('n')?-7:direction.includes('s')?'calc(100% - 5px)':'calc(50% - 6px)',cursor:direction+'-resize'}} />)}
    </div>
    <div role="toolbar" aria-label="Object position and size" style={{position:'fixed',left:Math.max(8,Math.min(rect.left,window.innerWidth-640)),top:toolbarTop,maxWidth:'calc(100vw - 16px)',zIndex:10001}} className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-white p-2 shadow-lg">
      <button type="button" className={control+' cursor-move'} style={{touchAction:'none'}} onPointerDown={e=>start(e,'move')} onKeyDown={e=>{
        const step=e.shiftKey?10:1,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
        if(!delta)return;e.preventDefault();apply(n=>{if(objectMode(n)!=='free')setObjectMode(n,editableRef.current,'free');const root=documentRoot(editableRef.current);n.style.left=Math.max(0,Math.min(100-(n.offsetWidth/root.offsetWidth*100),(parseFloat(n.style.left)||0)+delta[0]/root.offsetWidth*100))+'%';n.style.top=Math.max(0,(parseFloat(n.style.top)||0)+delta[1])+'px';});
      }}>Move object</button>
      <select aria-label="Object text wrapping" className={control} value={mode} onChange={e=>changeMode(e.target.value)}>
        <option value="inline">In line with text</option><option value="left">Wrap text · left</option><option value="right">Wrap text · right</option><option value="free">Free position</option>
      </select>
      <label className="text-xs">Rotate <input aria-label="Object rotation" className="w-14 rounded border p-1" type="number" min="-180" max="180" value={rotation} onChange={e=>apply(n=>{n.style.transform='rotate('+Math.max(-180,Math.min(180,Number(e.target.value)||0))+'deg)';})}/></label>
      <button type="button" className={control} onClick={()=>apply(n=>{if(objectMode(n)!=='free')setObjectMode(n,editableRef.current,'free');const layers=Array.from(documentRoot(editableRef.current).children).map(el=>Number(el.style.zIndex)||0);n.style.zIndex=String(Math.max(...layers,0)+1);})}>Bring forward</button>
      <button type="button" className={control} onClick={()=>apply(n=>{if(objectMode(n)!=='free')setObjectMode(n,editableRef.current,'free');n.style.zIndex='0';})}>Send backward</button>
      {shape&&<>
        <label className="text-xs">Colour <input aria-label="Object fill colour" type="color" value={node.dataset.fill?.startsWith('#')?node.dataset.fill:'#6366f1'} onChange={e=>formatShape('fill',e.target.value)}/></label>
        <label className="text-xs">Outline <input aria-label="Object outline colour" type="color" value={node.dataset.stroke?.startsWith('#')?node.dataset.stroke:'#1e293b'} onChange={e=>formatShape('stroke',e.target.value)}/></label>
        <label className="text-xs">Thickness <input aria-label="Object outline width" className="w-12 rounded border p-1" type="number" min="0" max="20" value={Number(node.dataset.strokeWidth)||0} onChange={e=>formatShape('stroke-width',String(Math.max(0,Math.min(20,Number(e.target.value)||0))))}/></label>
        <button type="button" className={control} onClick={()=>formatShape('fill','none')}>No fill</button>
      </>}
      <button type="button" className={control} onClick={()=>apply(n=>{n.remove();selected.current=null;setRect(null);})}>Delete object</button>
      <button type="button" className={control} onClick={()=>{selected.current=null;setRect(null);}}>Done</button>
    </div>
  </div>,document.body);
}
