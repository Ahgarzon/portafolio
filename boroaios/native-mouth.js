import * as THREE from './assets/three.module.min.js';
// The imported GLB has a prepared jaw bone but no weighted jaw vertices. Use a
// bounded local chin morph plus the existing dark mouth, leaving eyes/teeth intact.
export function attachMouth(model){const chin=[],mouth=[];let vertices=0;
 model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const g=mesh.geometry,p=g.attributes.position;g.computeBoundingBox();
  if(mesh.name.includes('shaded_mouth')||mesh.name.includes('shaded mouth')){mesh.geometry=g.clone();const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){a.setZ(i,a.getZ(i)+.22);a.setY(i,2.275+(a.getY(i)-2.285)*.75)}const delta=new Float32Array(a.count*3);for(let i=0;i<a.count;i++)delta[i*3+1]=(a.getY(i)-2.275)*.8;mesh.geometry.morphAttributes.position=[new THREE.BufferAttribute(delta,3)];mesh.geometry.morphTargetsRelative=true;mesh.updateMorphTargets();mesh.visible=false;mouth.push(mesh);return}
  if(g.boundingBox.min.y<2.0||g.boundingBox.max.y<2.7)return;
  const delta=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),w=(1-THREE.MathUtils.smoothstep(Math.abs(x),.12,.28))*(1-THREE.MathUtils.smoothstep(y,2.20,2.32))*THREE.MathUtils.smoothstep(z,.32,.49),lip=(1-THREE.MathUtils.smoothstep(Math.abs(x),.055,.13))*(1-THREE.MathUtils.smoothstep(Math.abs(y-2.225),.025,.065))*THREE.MathUtils.smoothstep(z,.35,.50);if(w>.01||lip>.01){delta[i*3+1]=-.045*w;delta[i*3+2]=.01*w-.18*lip;vertices++}}
  if(delta.some(v=>v!==0)){mesh.geometry=g.clone();mesh.geometry.morphAttributes.position=[new THREE.BufferAttribute(delta,3)];mesh.geometry.morphTargetsRelative=true;mesh.updateMorphTargets();chin.push(mesh)}
 });
 if(!chin.length||!mouth.length||!vertices)throw Error('Mouth articulation missing');
 return {vertices,chin,mouth,set(open){const value=THREE.MathUtils.clamp(open,0,1);for(const m of chin)m.morphTargetInfluences[0]=value;for(const m of mouth){m.visible=value>.025;m.morphTargetInfluences[0]=value}return value}};
}
