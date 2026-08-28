import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root="/app";
const rows=JSON.parse(fs.readFileSync(path.join(root,"scripts/as-math-svg-source.json"),"utf8"));
const outDir=path.join(root,"public/as-math-diagrams");
fs.mkdirSync(outDir,{recursive:true});
for(const row of rows){
  const vb=row.svg.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const width=vb?Math.ceil(Number(vb[3])):760;
  await sharp(Buffer.from(row.svg),{density:192})
    .resize({width:width*2,withoutEnlargement:false})
    .flatten({background:"#ffffff"})
    .extend({top:40,bottom:40,left:40,right:40,background:"#ffffff"})
    .png({compressionLevel:9})
    .toFile(path.join(outDir,row.name));
}
console.log(JSON.stringify({rendered:rows.length,outDir}));