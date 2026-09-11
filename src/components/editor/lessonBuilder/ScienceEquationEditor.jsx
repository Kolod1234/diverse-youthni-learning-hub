import React, {useMemo, useState} from 'react';
import katex from 'katex';
import 'katex/contrib/mhchem';
import { SCIENCE_TEMPLATES, SCIENCE_SYMBOLS, templateLatex } from './scienceTemplates';

const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderEquation(latex, display) {
  if (!latex.trim()) throw new Error('Enter an equation or choose a template.');
  if (latex.length > 5000) throw new Error('Keep each equation below 5,000 characters.');
  const rendered = katex.renderToString(latex,{output:'mathml',displayMode:display,throwOnError:true,trust:false,maxExpand:1000,maxSize:20,strict:'ignore'});
  // Native MathML is self-contained in saved lessons and needs no font/CSS
  // download or equation editor runtime in the lesson player.
  return rendered.slice(rendered.indexOf('<math'),rendered.lastIndexOf('</math>')+7);
}
export function equationHtml(latex, display, templateData = {}) {
  const math = renderEquation(latex,display);
  const source = encodeURIComponent(JSON.stringify({...templateData,latex,display}));
  return `<span data-lesson-equation="${escape(source)}" contenteditable="false" tabindex="0" title="Double-click to edit equation" style="display:${display?'block':'inline-block'};max-width:100%;overflow-x:auto;vertical-align:middle;padding:4px;margin:${display?'12px 0':'0 3px'};font-family:Cambria Math,STIX Two Math,serif;font-size:1.1em">${math}</span>`;
}

export default function ScienceEquationEditor({initial, onInsert}) {
  const savedTemplate = SCIENCE_TEMPLATES.find(t=>t.id===initial?.templateId);
  const [selected,setSelected]=useState(savedTemplate || SCIENCE_TEMPLATES[0]);
  const [category,setCategory]=useState(savedTemplate?.category || 'Algebra');
  const [values,setValues]=useState(savedTemplate ? initial.values : {top:'x+1',bottom:'x-1'});
  const [matrix,setMatrix]=useState(savedTemplate && initial.matrix ? initial.matrix : [['a','b'],['c','d']]);
  const [advanced,setAdvanced]=useState(Boolean(initial && !savedTemplate));
  const [custom,setCustom]=useState(initial?.latex || '');
  const [display,setDisplay]=useState(initial?.display ?? false);
  const latex = advanced ? custom : templateLatex(selected,values,matrix);
  const preview = useMemo(()=>{try{return {html:renderEquation(latex,display)};}catch(e){return {error:e.message.replace(/^KaTeX parse error:\s*/, '')};}},[latex,display]);
  const choose = item => {setSelected(item);setValues(Object.fromEntries(item.fields.map(([key,,value])=>[key,value])));setAdvanced(false);};
  const resizeMatrix=(rows,cols)=>setMatrix(old=>Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>old[r]?.[c] ?? '0')));
  return <div className="science-equation-editor">
    <p>Choose a template, fill in its values and check the preview. Use Advanced entry to combine notation freely.</p>
    <div className="science-equation-layout">
      <div>
        <label>Subject<select aria-label="Equation subject" value={category} onChange={e=>setCategory(e.target.value)}>{[...new Set(SCIENCE_TEMPLATES.map(t=>t.category))].map(c=><option key={c}>{c}</option>)}</select></label>
        <div className="science-template-list" aria-label="Equation templates">{SCIENCE_TEMPLATES.filter(t=>t.category===category).map(item=><button type="button" key={item.id} aria-pressed={!advanced&&selected.id===item.id} onClick={()=>choose(item)}>{item.label}</button>)}</div>
      </div>
      <div className="science-equation-fields">
        <label className="science-checkbox"><input type="checkbox" checked={advanced} onChange={e=>{if(e.target.checked)setCustom(latex);setAdvanced(e.target.checked);}}/>Advanced entry (LaTeX)</label>
        {advanced ? <label>Equation<textarea aria-label="Equation source" value={custom} maxLength={5000} onChange={e=>setCustom(e.target.value)} rows={5} spellCheck={false}/></label> : <>
          <h3>{selected.label}</h3>
          {selected.fields.map(([key,label])=><label key={key}>{label}<input aria-label={label} value={values[key]??''} maxLength={1000} spellCheck={false} onChange={e=>setValues({...values,[key]:e.target.value})}/></label>)}
          {['matrix','determinant'].includes(selected.id) && <>
            <div className="science-matrix-size"><label>Rows<select aria-label="Matrix rows" value={matrix.length} onChange={e=>resizeMatrix(Number(e.target.value),matrix[0].length)}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label><label>Columns<select aria-label="Matrix columns" value={matrix[0].length} onChange={e=>resizeMatrix(matrix.length,Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></div>
            <div className="science-matrix" style={{gridTemplateColumns:`repeat(${matrix[0].length},minmax(45px,1fr))`}}>{matrix.flatMap((row,r)=>row.map((cell,c)=><input key={`${r}-${c}`} aria-label={`Row ${r+1}, column ${c+1}`} value={cell} maxLength={80} onChange={e=>setMatrix(old=>old.map((line,i)=>i===r?line.map((v,j)=>j===c?e.target.value:v):line))}/>))}</div>
          </>}
          {!selected.fields.length&&!['matrix','determinant'].includes(selected.id)&&<p>Turn on Advanced entry to adapt this equation.</p>}
        </>}
        <label className="science-checkbox"><input type="checkbox" checked={display} onChange={e=>setDisplay(e.target.checked)}/>Place on its own line</label>
        <div className="science-equation-preview" aria-label="Equation preview">{preview.error?<p role="alert">{preview.error}</p>:<div dangerouslySetInnerHTML={{__html:preview.html}}/>}</div>
        <details><summary>Symbols and notation help</summary><p>Fields accept plain values or notation such as x^2, x_1, \frac&#123;a&#125;&#123;b&#125; and \theta. Reaction fields support -&gt;, &lt;=&gt;, charges such as Fe^3+, states such as (aq), and conditions in square brackets.</p>{SCIENCE_SYMBOLS.map(([label,symbols])=><p key={label}><strong>{label}: </strong><code>{symbols}</code></p>)}</details>
        <button type="button" className="science-primary" disabled={Boolean(preview.error)} onClick={()=>onInsert({latex,display,html:equationHtml(latex,display,advanced?{}:{templateId:selected.id,values,matrix})})}>{initial?'Update equation':'Insert equation'}</button>
      </div>
    </div>
    <style>{SCIENCE_CSS}</style>
  </div>;
}

const SCIENCE_CSS=`
.science-equation-editor {width:100%;font:14px/1.5 system-ui,sans-serif;color:#334155;}
.science-equation-editor p {margin:0 0 12px;}
.science-equation-layout {display:grid;grid-template-columns:180px minmax(0,1fr);gap:20px;}
.science-equation-editor label {display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.science-equation-editor input,.science-equation-editor select,.science-equation-editor textarea {padding:7px 9px;border:1px solid #cbd5e1;border-radius:5px;background:white;color:#0f172a;min-width:0;width:100%;}
.science-equation-editor .science-checkbox {flex-direction:row;align-items:center;gap:8px;}
.science-checkbox input {width:auto;}
.science-template-list {display:flex;flex-direction:column;gap:5px;}
.science-template-list button {text-align:left;padding:8px;border:1px solid #e2e8f0;border-radius:5px;background:white;}
.science-template-list button[aria-pressed=true] {background:#eef2ff;border-color:#6366f1;color:#4338ca;}
.science-equation-fields h3 {font-weight:600;margin:0 0 10px;}
.science-equation-preview {padding:18px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;min-height:90px;overflow-x:auto;font-size:23px;margin:12px 0;}
.science-equation-preview [role=alert] {font:13px/1.5 system-ui;color:#b91c1c;}
.science-matrix {display:grid;gap:6px;margin:10px 0;}.science-matrix-size{display:flex;gap:12px;}
.science-primary {background:#4f46e5;color:white;padding:9px 15px;border-radius:6px;border:0;margin-top:14px;}.science-primary:disabled{opacity:.45;}
.science-equation-editor code {overflow-wrap:anywhere;font-size:12px;}.science-equation-editor summary{cursor:pointer;margin-bottom:8px;}
@media(max-width:650px){.science-equation-layout{grid-template-columns:1fr}.science-template-list{flex-direction:row;flex-wrap:wrap}.science-template-list button{font-size:12px;padding:5px}}
`;
