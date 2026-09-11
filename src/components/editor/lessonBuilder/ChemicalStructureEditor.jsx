import React, {useEffect, useRef, useState} from 'react';

const CHANNEL='lesson-chemistry-v1';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chemicalStructureHtml(ket, svg, description) {
  // An SVG image is inert; the editable KET document is stored separately so
  // reopening never needs to infer bonds and atoms from an image.
  const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  const source=encodeURIComponent(ket);
  return `<img data-lesson-chemical="${escape(source)}" src="${escape(image)}" alt="${escape(description||'Chemical structure')}" title="Double-click to edit chemical structure" style="display:inline-block;width:420px;max-width:100%;height:auto;vertical-align:middle;margin:8px" />`;
}
export default function ChemicalStructureEditor({initial, onInsert}) {
  const frame=useRef(null), serial=useRef(0), pending=useRef(null), onInsertRef=useRef(onInsert), initialRef=useRef(initial);
  onInsertRef.current=onInsert;
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('Loading chemical drawing tools…');
  const [description,setDescription]=useState(initial?.description||'Chemical structure');
  const descriptionRef=useRef(description);descriptionRef.current=description;
  const [example,setExample]=useState('');
  const send=(type,source)=>{
    const requestId=++serial.current;
    pending.current=requestId;setBusy(true);setMessage('');
    frame.current?.contentWindow?.postMessage({channel:CHANNEL,type,requestId,source},window.location.origin);
  };
  useEffect(()=>{
    const receive=event=>{
      if(event.origin!==window.location.origin || event.source!==frame.current?.contentWindow || event.data?.channel!==CHANNEL)return;
      const data=event.data;
      if(data.type==='ready'){
        setReady(true);
        if(initialRef.current?.ket){send('load',initialRef.current.ket);return;}
        setReady(true);setMessage('');return;
      }
      if(data.requestId!==pending.current)return;
      pending.current=null;setBusy(false);
      if(data.type==='error'){setMessage(data.message||'Could not process the structure.');return;}
      if(data.type==='loaded'){setReady(true);setMessage('');return;}
      if(data.type==='exported'){
        if(typeof data.ket!=='string'||typeof data.svg!=='string'||data.ket.length>2000000||data.svg.length>4000000){setMessage('The structure is too large to insert.');return;}
        onInsertRef.current({html:chemicalStructureHtml(data.ket,data.svg,descriptionRef.current)});
      }
    };
    window.addEventListener('message',receive);
    const timer=setTimeout(()=>setMessage(current=>current==='Loading chemical drawing tools…'?'The drawing tools are taking longer to load. Close and reopen this window to retry.':current),45000);
    return()=>{window.removeEventListener('message',receive);clearTimeout(timer);};
  },[]);
  useEffect(()=>{
    if(!busy)return;
    const timer=setTimeout(()=>{pending.current=null;setBusy(false);setMessage('The operation timed out. Your drawing is still here; try again.');},45000);
    return()=>clearTimeout(timer);
  },[busy]);
  return <div className="science-chemical-editor">
    <p>Choose bonds, atoms or rings in the drawing toolbar, then draw on the canvas. Use wedge and dashed bonds for stereochemistry, and arrows for reactions.</p>
    <div className="science-chemical-fields">
      <label>Description<input aria-label="Chemical structure description" value={description} maxLength={300} onChange={e=>setDescription(e.target.value)}/></label>
      <label>Starter structure<select aria-label="Starter structure" value={example} onChange={e=>setExample(e.target.value)}><option value="">Choose a starter</option><option value="C1=CC=CC=C1">Benzene</option><option value="C1CCCCC1">Cyclohexane</option><option value="CCO">Ethanol</option><option value="CC(=O)O">Ethanoic acid</option><option value="CC(=O)C">Propanone</option></select></label>
      <button type="button" disabled={!ready||busy||!example} onClick={()=>send('load',example)}>Load starter (replaces drawing)</button>
    </div>
    {message&&<p role="status">{message}</p>}
    <iframe ref={frame} title="Chemical structure drawing canvas" src="/chemistry-editor/index.html?disableMacromoleculesEditor=true" className="science-chemical-frame"/>
    <button type="button" className="science-primary" disabled={!ready||busy} onClick={()=>send('export')}>{busy?'Preparing structure…':initial?'Update structure':'Insert structure'}</button>
    <style>{`.science-chemical-editor{width:100%;font:14px/1.5 system-ui;color:#334155}.science-chemical-editor p{margin:0 0 10px}.science-chemical-fields{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-bottom:10px}.science-chemical-fields label{display:flex;flex-direction:column;gap:4px}.science-chemical-fields input,.science-chemical-fields select,.science-chemical-fields button{padding:7px;border:1px solid #cbd5e1;border-radius:5px;background:white}.science-chemical-frame{width:100%;height:min(580px,60vh);min-height:420px;border:1px solid #cbd5e1;border-radius:6px;background:white}.science-chemical-editor .science-primary{background:#4f46e5;color:white;padding:9px 15px;border:0;border-radius:6px;margin-top:12px}.science-chemical-editor button:disabled{opacity:.5}`}</style>
  </div>;
}
