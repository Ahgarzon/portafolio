// Correct the native eye bulges AND the added optics. No bitmap/texture edits.
import fs from 'node:fs/promises';import crypto from 'node:crypto';
const input=await fs.readFile(new URL('../assets/boro-workstation-v7.glb',import.meta.url)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');if(sha(input)!=='477f08f69183d06902f80b119079b18309eeb259aab454e2bfb03e2a86bbf423')throw Error('Reviewed V7 required');
const size=input.readUInt32LE(12),j=JSON.parse(input.subarray(20,20+size));let bin=Buffer.from(input.subarray(28+size,28+size+input.readUInt32LE(20+size)));
function ref(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView];return {a,offset:(v.byteOffset||0)+(a.byteOffset||0),stride:v.byteStride||12}}
function read(r,i){return [0,4,8].map(k=>bin.readFloatLE(r.offset+i*r.stride+k))}function write(r,i,p){p.forEach((v,k)=>bin.writeFloatLE(v,r.offset+i*r.stride+k*4))}
function bounds(r){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<r.a.count;i++)read(r,i).forEach((v,k)=>{min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v)});r.a.min=min;r.a.max=max}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const changes=[];
for(const n of j.nodes){if(n.mesh===undefined)continue;for(const p of j.meshes[n.mesh].primitives){const mat=j.materials[p.material];
 if(n.name==='Boro_continuous_reference_body'&&mat.name==='Boro warm graphite-grey fur'){
  const pos=ref(p.attributes.POSITION),nor=ref(p.attributes.NORMAL),colors=Buffer.alloc(pos.a.count*16),mask=[];let changed=0;
  for(let i=0;i<pos.a.count;i++){const v=read(pos,i),r=Math.hypot((Math.abs(v[0])-.202)/.145,(v[1]-2.545)/.108),m=(1-smooth(.45,1,r))*smooth(.20,.32,v[2]);mask[i]=m;
   if(m>.001){v[2]+=m*(Math.min(v[2],.385)-v[2]);write(pos,i,v);changed++}
   // Remove the duplicated cyan halo in the reconstructed fur, using native
   // vertex-color modulation with a smooth boundary. UVs/images are untouched.
   [1-m*.82,1-m*.82,1-m*.82,1].forEach((c,k)=>colors.writeFloatLE(c,i*16+k*4));
  }
  const idx=ref(p.indices),a=idx.a,view=j.bufferViews[a.bufferView],offset=(view.byteOffset||0)+(a.byteOffset||0),get=i=>a.componentType===5125?bin.readUInt32LE(offset+i*4):bin.readUInt16LE(offset+i*2),acc=Array.from({length:pos.a.count},()=>[0,0,0]);
  for(let k=0;k<a.count;k+=3){const ids=[get(k),get(k+1),get(k+2)],v=ids.map(i=>read(pos,i)),u=v[1].map((x,i)=>x-v[0][i]),w=v[2].map((x,i)=>x-v[0][i]),normal=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];for(const id of ids)for(let c=0;c<3;c++)acc[id][c]+=normal[c]}
  for(let i=0;i<mask.length;i++)if(mask[i]>.001){const len=Math.hypot(...acc[i]);if(len>1e-9)write(nor,i,acc[i].map(v=>v/len))}bounds(pos);
  const off=bin.length;bin=Buffer.concat([bin,colors]);const bufferView=j.bufferViews.push({buffer:0,byteOffset:off,byteLength:colors.length,target:34962})-1;p.attributes.COLOR_0=j.accessors.push({bufferView,componentType:5126,count:pos.a.count,type:'VEC4'})-1;changes.push({nativeEyeVertices:changed});
 }
 if(/^Boro (?:detailed blue iris|pupil|eye sparkle(?: small)?) [-1]+$/.test(n.name)){
  const pos=ref(p.attributes.POSITION),nor=ref(p.attributes.NORMAL),pts=Array.from({length:pos.a.count},(_,i)=>read(pos,i)),center=[0,1,2].map(k=>(Math.min(...pts.map(v=>v[k]))+Math.max(...pts.map(v=>v[k])))/2),scale=n.name.includes('iris')?[.95,.95,1]:n.name.includes('pupil')?[.82,.82,1]:[.40,.40,.40];
  for(let i=0;i<pts.length;i++){write(pos,i,pts[i].map((v,k)=>center[k]+(v-center[k])*scale[k]+(k===2?(n.name.includes('pupil')?.012:n.name.includes('sparkle')?.016:0):0)));const nn=read(nor,i).map((v,k)=>v/scale[k]),len=Math.hypot(...nn);write(nor,i,nn.map(v=>v/len))}bounds(pos);
  if(n.name.includes('iris')){
   const colors=Buffer.alloc(pos.a.count*16),rx=(pos.a.max[0]-pos.a.min[0])/2,ry=(pos.a.max[1]-pos.a.min[1])/2;
   for(let i=0;i<pos.a.count;i++){const v=read(pos,i),x=(v[0]-center[0])/rx,y=(v[1]-center[1])/ry,r=Math.hypot(x,y),t=smooth(.30,.43,r),variation=.90+.10*Math.sin(Math.atan2(y,x)*22);[.008+t*.025*variation,.012+t*.18*variation,.020+t*.32*variation,1].forEach((c,k)=>colors.writeFloatLE(c,i*16+k*4))}
   const off=bin.length;bin=Buffer.concat([bin,colors]);const bufferView=j.bufferViews.push({buffer:0,byteOffset:off,byteLength:colors.length,target:34962})-1;p.attributes.COLOR_0=j.accessors.push({bufferView,componentType:5126,count:pos.a.count,type:'VEC4'})-1;
  }
 }
}}
for(const m of j.materials){if(m.name.startsWith('Boro radial blue iris')){m.emissiveFactor=[0,0,0];Object.assign(m.pbrMetallicRoughness,{baseColorFactor:[.25,.7,1,1],metallicFactor:0,roughnessFactor:.55})}if(m.name==='Boro deep pupils')m.pbrMetallicRoughness.roughnessFactor=.72;if(m.name==='Boro eye catch light'){m.emissiveFactor=[0,0,0];m.pbrMetallicRoughness.roughnessFactor=.8}if(m.name==='Boro eye pearl sclera')m.pbrMetallicRoughness.baseColorFactor=[.025,.018,.013,1];if(m.name.startsWith('Clear smart optics'))m.pbrMetallicRoughness.baseColorFactor[3]=.015}
// Avoid a white studio reflection replacing the pupil: it is a dark aperture,
// not a polished metal bead. Preserve just the small offset catchlight.
j.materials.find(m=>m.name==='Boro deep pupils').extensions={KHR_materials_unlit:{}};j.extensionsUsed=[...new Set([...(j.extensionsUsed||[]),'KHR_materials_unlit'])];
// Pupil and iris share a single native surface, rather than intersecting spheres.
const pupil=j.materials.find(m=>m.name==='Boro deep pupils');pupil.alphaMode='BLEND';pupil.pbrMetallicRoughness.baseColorFactor=[0,0,0,0];
for(const m of j.materials.filter(m=>m.name.startsWith('Boro radial blue iris'))){m.extensions={KHR_materials_specular:{specularFactor:0}};m.pbrMetallicRoughness.baseColorFactor=[1,1,1,1];m.pbrMetallicRoughness.roughnessFactor=.78}j.extensionsUsed=[...new Set([...j.extensionsUsed,'KHR_materials_specular'])];
j.buffers[0].byteLength=bin.length;const provenance={...j.extras,release:'constructor10-20261012',eye_revision:'Native eye protrusions flattened into the face, duplicated cyan eye halo subdued with native vertex colors; iris surface contains its dark pupil without a reflective intersecting sphere, original glasses/rig/UVs/images retained.',visual_status:'Inspected in browser front/three-quarter/profile and mobile; owner acceptance and pixel-exact fidelity are not certified.'};j.extras=provenance;for(const s of j.scenes||[])s.extras=provenance;
const raw=Buffer.from(JSON.stringify(j)),json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);const out=Buffer.alloc(28+json.length+bin.length);out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(bin.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);bin.copy(out,28+json.length);
await fs.writeFile(new URL('../assets/boro-workstation-v10.glb',import.meta.url),out);await fs.writeFile(new URL('../assets/boro-workstation-v10.provenance.json',import.meta.url),JSON.stringify({...provenance,asset:'boro-workstation-v10.glb',sha256:sha(out),bytes:out.length,baseline_sha256:sha(input),changes},null,2));console.log(JSON.stringify({sha256:sha(out),bytes:out.length,changes}));
