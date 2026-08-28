import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "canvas";

const root="/app";
const rows=JSON.parse(fs.readFileSync(path.join(root,"scripts/as-math-svg-source.json"),"utf8"));
const outDir=path.join(root,"public/as-math-diagrams");
fs.mkdirSync(outDir,{recursive:true});

for(const row of rows){
  const vb=row.svg.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const width=vb?Math.ceil(Number(vb[3])):760;
  const height=vb?Math.ceil(Number(vb[4])):360;
  const scale=2;
  const pad=20;
  const canvas=createCanvas((width+pad*2)*scale,(height+pad*2)*scale);
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.scale(scale,scale);
  const dataUrl="data:image/svg+xml;base64,"+Buffer.from(row.svg).toString("base64");
  const img=await loadImage(dataUrl);
  ctx.drawImage(img,pad,pad,width,height);
  fs.writeFileSync(path.join(outDir,row.name),canvas.toBuffer("image/png",{compressionLevel:9}));
}
console.log(JSON.stringify({rendered:rows.length,outDir}));