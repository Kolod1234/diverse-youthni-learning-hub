// Runs inside the self-hosted, isolated Ketcher frame. Accept commands only
// from this frame's parent on the same origin; never post lesson data to '*'.
(() => {
  const channel = 'lesson-chemistry-v1';
  const send = message => window.parent.postMessage({channel,...message},window.location.origin);
  let announced = false;
  const timer = setInterval(()=>{
    if (!window.ketcher || announced) return;
    announced = true;
    clearInterval(timer);
    send({type:'ready'});
  },200);
  window.addEventListener('message',async event=>{
    if (event.origin!==window.location.origin || event.source!==window.parent || event.data?.channel!==channel) return;
    const {type,requestId,source}=event.data;
    try {
      if (!window.ketcher) throw new Error('The chemical drawing editor is still loading.');
      if (type==='load') {
        if (typeof source!=='string' || source.length>2000000) throw new Error('This structure is too large to open.');
        if(source) await window.ketcher.setMolecule(source);
        send({type:'loaded',requestId});
      } else if (type==='export') {
        const ket=await window.ketcher.getKet();
        const parsed=JSON.parse(ket);
        if (!parsed.root?.nodes?.length) throw new Error('Draw or open a structure before inserting it.');
        const image=await window.ketcher.generateImage(ket,{outputFormat:'svg',backgroundColor:'255, 255, 255'});
        const svg=await image.text();
        if (!svg.includes('<svg')) throw new Error('The structure image could not be generated.');
        send({type:'exported',requestId,ket,svg});
      }
    } catch(error) {
      send({type:'error',requestId,message:error.message || 'The chemical structure could not be processed.'});
    }
  });
})();
