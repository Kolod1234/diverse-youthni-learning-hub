import React, { useEffect, useMemo, useRef, useState } from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';
import BlockRenderer from './BlockRenderer';
import { BlockExpandedContext } from './BlockWrapper';
import { blocksToHtml } from './htmlSerializer';
import { DOCUMENT_TYPES, wrapDocument, objectFromTarget, documentObjects } from './documentObjects';

// Adjacent prose and objects form one continuous document. Specialised video,
// table and assessment editors keep their native controls and data model.
export default function FlowCanvas({ blocks, onChangeBlocks }) {
  const groups=[];
  blocks.forEach(block=>{
    const document=DOCUMENT_TYPES.has(block.type);
    const last=groups[groups.length-1];
    if(document && last?.document)last.blocks.push(block);
    else groups.push({document,blocks:[block],id:block.id});
  });
  return <div className="lesson-flow-canvas w-full min-w-0" data-lesson-layout="flow">
    <p className="mb-2 select-none text-xs text-slate-500">Double-click or double-tap text to edit. Click an object to move or resize it.</p>
    {groups.map(group=>group.document?
      <DocumentSurface key={group.id} blocks={group.blocks} onChange={html=>{
        const ids=new Set(group.blocks.map(b=>b.id));
        onChangeBlocks(prev=>{let inserted=false;return prev.flatMap(b=>{if(!ids.has(b.id))return [b];if(inserted)return [];inserted=true;return [{id:group.id,type:'legacy-html',data:{html}}];});});
      }}/>:<SpecialisedSurface key={group.id} block={group.blocks[0]} onChange={data=>onChangeBlocks(prev=>prev.map(b=>b.id===group.id?{...b,data}:b))}/>
    )}
    <style>{DOCUMENT_CSS}</style>
  </div>;
}

function DocumentSurface({blocks,onChange}) {
  const [editing,setEditing]=useState(false);
  const host=useRef(null);
  const pending=useRef(null);
  const lastTap=useRef(null);
  const html=useMemo(()=>wrapDocument(blocksToHtml(blocks)),[blocks]);
  const begin=(event,object=false)=>{
    if(editing)return;
    const target=event.target;
    if(target.closest('a,button,input,textarea,select'))return;
    if(object){
      const found=objectFromTarget(target,host.current);
      const objects=documentObjects(host.current);
      pending.current={object:objects.indexOf(found)};
    }else{
      const p=target.closest('p,h1,h2,h3,li,figcaption');
      pending.current={paragraph:p?Array.from(host.current.querySelectorAll('p,h1,h2,h3,li,figcaption')).indexOf(p):0};
    }
    event.preventDefault();setEditing(true);
  };
  useEffect(()=>{
    if(!editing)return;
    const editor=host.current?.querySelector('[contenteditable="true"]');
    if(!editor)return;
    editor.focus({preventScroll:true});
    if(pending.current?.object>=0)editor.dispatchEvent(new CustomEvent('lesson-select-object',{detail:{index:pending.current.object}}));
    else{
      const paragraph=editor.querySelectorAll('p,h1,h2,h3,li,figcaption')[pending.current?.paragraph||0]||editor;
      const range=document.createRange();range.selectNodeContents(paragraph);range.collapse(true);
      const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    }
    pending.current=null;
  },[editing]);
  return <section ref={host} className="lesson-document-surface min-w-0" aria-label="Lesson document">
    {editing&&<div className="flex items-center justify-between py-2 text-xs text-slate-500"><span>Editing lesson · use Save Lesson to keep changes</span><button type="button" className="rounded border bg-white px-3 py-1 text-slate-700" onClick={()=>setEditing(false)}>Done editing</button></div>}
    <div className="lesson-flow-prose" onDoubleClick={begin} onClick={e=>{if(!editing&&objectFromTarget(e.target,host.current))begin(e,true);}}
      onPointerUp={e=>{if(editing||e.pointerType!=='touch')return;const prev=lastTap.current;const now=Date.now();lastTap.current={at:now,x:e.clientX,y:e.clientY};if(prev&&now-prev.at<400&&Math.hypot(e.clientX-prev.x,e.clientY-prev.y)<24)begin(e);}}>
      {editing?<BlockExpandedContext.Provider value={true}><BlockRenderer block={{id:blocks[0].id,type:'legacy-html',data:{html}}} focused authoringTools objectTools onChange={data=>onChange(data.html)}/></BlockExpandedContext.Provider>:
        <div tabIndex={0} role="button" aria-label="Edit lesson text" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setEditing(true);}}} style={{touchAction:'manipulation'}}><MathJaxContent html={html}/></div>}
    </div>
  </section>;
}

function SpecialisedSurface({block,onChange}) {
  const [editing,setEditing]=useState(false);
  return <section className="group relative min-w-0" onDoubleClick={()=>setEditing(true)}>
    <button type="button" onClick={()=>setEditing(v=>!v)} className="absolute right-0 top-0 z-20 rounded border bg-white px-2 py-1 text-xs opacity-0 focus:opacity-100 group-hover:opacity-100">{editing?'Done':'Edit item'}</button>
    <BlockExpandedContext.Provider value={editing}><BlockRenderer block={block} focused={editing} authoringTools={editing} onChange={onChange}/></BlockExpandedContext.Provider>
  </section>;
}

const DOCUMENT_CSS = `
  .lesson-flow-prose { font-size:18px; line-height:1.75; color:#1e293b; font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  .lesson-flow-prose p { margin:0 0 1.1em; }
  .lesson-flow-prose h1,.lesson-flow-prose h2,.lesson-flow-prose h3 { font-family:ui-serif,Georgia,"Times New Roman",serif; color:#0f172a; letter-spacing:-.01em; line-height:1.25; }
  .lesson-flow-prose h1 { font-size:2.25rem; font-weight:700; margin:1.2em 0 .5em; }
  .lesson-flow-prose h2 { font-size:1.875rem; font-weight:700; margin:1.6em 0 .6em; }
  .lesson-flow-prose h3 { font-size:1.375rem; font-weight:700; margin:1.4em 0 .5em; }
  .lesson-flow-prose ul,.lesson-flow-prose ol { padding-left:1.4em; margin:0 0 1.1em; }
  .lesson-flow-prose ul { list-style-type:disc; }
  .lesson-flow-prose ol { list-style-type:decimal; }
  .lesson-flow-prose li { margin:.35em 0; }
  .lesson-flow-prose a { color:#4f46e5; text-decoration:underline; text-underline-offset:3px; }
  .lesson-flow-prose img { max-width:100%; height:auto; border-radius:12px; }
  .lesson-flow-prose blockquote { margin:1.4em 0; padding:.4em 1.2em; border-left:4px solid #4f46e5; background:#eef2ff; color:#312e81; border-radius:0 8px 8px 0; }
  .lesson-flow-prose [data-lesson-block="shape"], .lesson-flow-prose [data-lesson-object], .lesson-flow-prose figure, .lesson-flow-prose hr { cursor:pointer; }
  .lesson-flow-prose [data-lesson-block="shape"] svg { width:100%;height:100%; }
  .lesson-flow-prose [role="button"]:focus-visible { outline:2px solid #a5b4fc;outline-offset:4px; }
`;

