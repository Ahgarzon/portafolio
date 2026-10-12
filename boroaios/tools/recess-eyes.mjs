// Anatomical correction requested by the owner. Pure geometry/material edit, no raster editing.
// Input is immutable V6; skin weights, joint hierarchy and baked animation remain unchanged.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const assets=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets');
const source=await fs.readFile(path.join(assets,'boro-workstation-v6.glb'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(sha(source)!=='5f3ae7adf643c08e1f31a0de89abf407bb671f96367d5aca16531fd88cb623f6')throw Error('V6 baseline changed; review before editing');
const size=source.readUInt32LE(12),j=JSON.parse(source.subarray(20,20+size));
const bin=Buffer.from(source.subarray(28+size,28+size+source.readUInt32LE(20+size)));
const corrected=[],used=new Set();
function attribute(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView];if(a.componentType!==5126||a.type!=='VEC3'||a.sparse)throw Error('Unexpected eye accessor');return {a,offset:(v.byteOffset||0)+(a.byteOffset||0),stride:v.byteStride||12}}
function read(ref,i){const o=ref.offset+i*ref.stride;return [0,4,8].map(d=>bin.readFloatLE(o+d))}
function write(ref,i,p){const o=ref.offset+i*ref.stride;p.forEach((v,k)=>bin.writeFloatLE(v,o+k*4))}
function bounds(ref){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<ref.a.count;i++){const p=read(ref,i);for(let k=0;k<3;k++){min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k])}}ref.a.min=min;ref.a.max=max;return {min,max}}
for(const sign of [-1,1]){
 const globe=j.nodes.find(n=>n.name==='Boro blue eye globe '+sign),p=j.meshes[globe.mesh].primitives[0];
 const ref=attribute(p.attributes.POSITION),old=bounds(ref),center=old.min.map((v,k)=>(v+old.max[k])/2);
 const angle=-sign*12*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),scale=[.8,.60,.28];
 for(const node of j.nodes){
  if(!['Boro blue eye globe ','Boro detailed blue iris ','Boro pupil ','Boro eye sparkle ','Boro eye sparkle small '].some(prefix=>node.name===prefix+sign))continue;
  for(const primitive of j.meshes[node.mesh].primitives){
   const pos=attribute(primitive.attributes.POSITION),nor=attribute(primitive.attributes.NORMAL);
   if(used.has(primitive.attributes.POSITION))throw Error('Shared eye geometry would be changed twice');used.add(primitive.attributes.POSITION);
   for(let i=0;i<pos.a.count;i++){
    const q=read(pos,i).map((v,k)=>v-center[k]);
    const rotated=[c*q[0]+s*q[2],q[1],-s*q[0]+c*q[2]];
    write(pos,i,rotated.map((v,k)=>v*scale[k]+center[k]-(k===2?.035:0)));
    const n=read(nor,i),transformed=[(c*n[0]+s*n[2])/scale[0],n[1]/scale[1],(-s*n[0]+c*n[2])/scale[2]],length=Math.hypot(...transformed);
    write(nor,i,transformed.map(v=>v/length));
   }
   corrected.push({name:node.name,bounds:bounds(pos),vertices:pos.a.count});
  }
 }
}
if(corrected.length!==10)throw Error('Eye assembly changed; expected five parts per eye');
const sclera=j.materials.find(m=>m.name==='Boro eye pearl sclera');
sclera.pbrMetallicRoughness.baseColorFactor=[.025,.035,.040,1];sclera.pbrMetallicRoughness.roughnessFactor=.70;
// Keep the native face unchanged: added eyelid rings/discs were visually rejected.
const binary=bin;
const provenance={...j.extras,release:'constructor7-20261012',eye_revision:'Owner correction: recessed 0.035 model units; depth 28%, width 80%, height 60%; outward cant reduced from 20 to 8 degrees; dark/subdued eye surround like the beaver reference. Same character, native face, joint hierarchy and animation. No added eyelid rings or discs.'};
j.extras=provenance;for(const scene of j.scenes||[])scene.extras=provenance;
const bytes=Buffer.from(JSON.stringify(j)),json=Buffer.alloc(Math.ceil(bytes.length/4)*4,32);bytes.copy(json);
const out=Buffer.alloc(28+json.length+binary.length);out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(binary.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);binary.copy(out,28+json.length);
await fs.writeFile(path.join(assets,'boro-workstation-v7.glb'),out);
const prior=JSON.parse(await fs.readFile(path.join(assets,'boro-workstation-v6.provenance.json'),'utf8'));
await fs.writeFile(path.join(assets,'boro-workstation-v7.provenance.json'),JSON.stringify({...prior,release:provenance.release,asset:'boro-workstation-v7.glb',bytes:out.length,sha256:sha(out),eye_revision:provenance.eye_revision,baseline_sha256:sha(source)},null,2)+'\n');
console.log(JSON.stringify({bytes:out.length,sha256:sha(out),eyeParts:corrected.length},null,2));
