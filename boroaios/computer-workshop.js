// The computer and its volumetric brain are independent from the native character rig.
import * as THREE from './assets/three.module.min.js';
import {mergeGeometries} from './assets/three-addons/utils/BufferGeometryUtils.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export function createComputerWorkshop(){
  const root=new THREE.Group(),computer=new THREE.Group();root.add(computer);
  const graphite=new THREE.MeshStandardMaterial({color:0x243846,metalness:.35,roughness:.4});
  const edge=new THREE.MeshStandardMaterial({color:0x426276,metalness:.45,roughness:.3});
  const cyan=new THREE.MeshBasicMaterial({color:0x69dfed});
  const dark=new THREE.MeshStandardMaterial({color:0x07101a,metalness:.3,roughness:.65});
  const geometries=[];
  function box(w,h,d,x,y,z,material=graphite,parent=computer){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh}
  // A cut-away worktop supports the rotated keyboard without passing through Boro.
  const deskShape=new THREE.Shape();[[-.86,.95],[1.65,.95],[1.65,-.45],[0,-.45],[0,.10],[-.86,.55]].forEach(([x,z],i)=>i?deskShape.lineTo(x,z):deskShape.moveTo(x,z));deskShape.closePath();
  for(const [depth,y,mat] of [[.075,1.424,graphite],[.012,1.436,edge]]){const g=new THREE.ExtrudeGeometry(deskShape,{depth,bevelEnabled:false});g.rotateX(Math.PI/2);const m=new THREE.Mesh(g,mat);m.position.y=y;computer.add(m)}
  for(const [x,z] of [[.05,-.36],[1.57,-.36],[-.75,.83],[1.57,.83]])box(.045,1.35,.045,x,.675,z);
  box(1.52,.035,.035,.81,.18,-.36,edge);
  const monitor=new THREE.Group();monitor.position.set(.84,2.18,-.22);monitor.rotation.y=-.16;computer.add(monitor);
  // Real monitor cavity. The brain occupies its depth, rather than floating beside a photo.
  box(1.54,.075,.72,0,.66,0,edge,monitor);box(1.54,.075,.72,0,-.66,0,edge,monitor);
  for(const x of [-.77,.77])box(.07,1.25,.72,x,0,0,edge,monitor);
  box(1.47,1.25,.035,0,0,-.38,dark,monitor);
  box(.14,.23,.12,.84,1.55,-.22);box(.7,.025,.37,.84,1.445,-.18,edge);
  const screenGlass=new THREE.Mesh(new THREE.PlaneGeometry(1.43,1.21),new THREE.MeshPhysicalMaterial({color:0x81d8ef,transparent:true,opacity:.045,metalness:.1,roughness:.2,depthWrite:false}));screenGlass.position.z=.37;monitor.add(screenGlass);
  const power=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),cyan);power.position.set(.66,-.66,.375);monitor.add(power);
  // Keyboard and independent key caps (one draw call) move under the typing hands.
  const keyboard=new THREE.Group();keyboard.position.set(-.20,1.45,.50);keyboard.rotation.set(-.08,Math.PI/4,0);computer.add(keyboard);
  box(1.23,.045,.43,0,0,0,dark,keyboard);
  const keys=new THREE.InstancedMesh(new THREE.BoxGeometry(.072,.013,.071),edge,60);keyboard.add(keys);
  const keyMatrix=new THREE.Matrix4(),keyPositions=[];
  for(let r=0;r<4;r++)for(let c=0;c<15;c++){const p=V(-.55+c*.079,.029,-.143+r*.09);keyPositions.push(p);keyMatrix.makeTranslation(...p.toArray());keys.setMatrixAt(r*15+c,keyMatrix)}
  keys.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const mouse=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),edge);mouse.scale.set(.08,.032,.13);mouse.position.set(1.21,1.47,.45);computer.add(mouse);
  // A screen-space builder cursor sits inside the same physical screen, below the brain.
  const cursor=new THREE.Mesh(new THREE.OctahedronGeometry(.035),cyan);cursor.position.set(-.55,-.45,.35);monitor.add(cursor);
  const framePoints=[V(-.73,-.62,.37),V(.73,-.62,.37),V(.73,.62,.37),V(-.73,.62,.37),V(-.73,-.62,.37)];
  monitor.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(framePoints),new THREE.LineBasicMaterial({color:0x60dbea,transparent:true,opacity:.45})));
  const transfer=new THREE.Mesh(new THREE.OctahedronGeometry(.035),cyan);computer.add(transfer);
  const transferStart=V(-.20,1.52,.50),transferControl=V(.1,1.95,.58),transferEnd=V();
  const progressBack=box(1.05,.018,.009,0,-.54,.35,edge,monitor);
  const progress=box(1.05,.02,.01,0,-.54,.36,cyan,monitor);
  const brain=new THREE.Group();brain.position.set(0,.02,-.015);brain.scale.setScalar(.44);monitor.add(brain);
  const shell=new THREE.MeshPhysicalMaterial({color:0x27687d,metalness:.25,roughness:.35,transparent:true,opacity:.27,depthWrite:false,side:THREE.DoubleSide});
  const brainPoint=(side,u,v)=>{const r=1+.055*Math.sin(u*7+v*2)+.04*Math.cos(v*9-u*3);return V(side*.37+.52*Math.sin(v)*Math.cos(u)*r,.84*Math.cos(v)*r,.60*Math.sin(v)*Math.sin(u)*r)};
  const neurons=[],foldGeometry=[];
  for(const side of [-1,1]){
    const g=new THREE.SphereGeometry(1,32,22),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.055*Math.sin(y*18+z*8)+.035*Math.sin(x*15-z*12);p.setXYZ(i,x*.52*r+side*.37,y*.84*r,z*.60*r)}
    g.computeVertexNormals();brain.add(new THREE.Mesh(g,shell));
    for(let row=0;row<9;row++){
      const v=.2+row/8*2.7;
      const points=Array.from({length:49},(_,k)=>{const u=k/48*Math.PI*2;return brainPoint(side,u,v+.10*Math.sin(u*5+row))});
      foldGeometry.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.012,4,false));
    }
    for(let j=0;j<36;j++){const u=j*2.39996,v=Math.acos(1-2*(j+.5)/36);neurons.push({target:brainPoint(side,u,v),region:Math.floor(j/6)})}
  }
  const folds=new THREE.Mesh(mergeGeometries(foldGeometry),new THREE.MeshBasicMaterial({color:0x66bdcd,transparent:true,opacity:.58}));brain.add(folds);foldGeometry.forEach(g=>g.dispose());
  const nodes=new THREE.InstancedMesh(new THREE.SphereGeometry(.037,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),neurons.length);brain.add(nodes);nodes.frustumCulled=false;nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const matrix=new THREE.Matrix4(),color=new THREE.Color(),position=new THREE.Vector3();
  const links=[],linkRegions=[];
  neurons.forEach((a,i)=>neurons.forEach((b,j)=>{if(j>i&&j%2===i%2&&a.target.distanceTo(b.target)<.48){links.push(...a.target.toArray(),...b.target.toArray());linkRegions.push(a.region)}}));
  const linkGeo=new THREE.BufferGeometry();linkGeo.setAttribute('position',new THREE.Float32BufferAttribute(links,3));const linkColors=new THREE.Float32BufferAttribute(new Float32Array(links.length),3);linkGeo.setAttribute('color',linkColors);brain.add(new THREE.LineSegments(linkGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.72})));
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.10,.06,.35,10),new THREE.MeshBasicMaterial({color:0x3e899c,transparent:true,opacity:.65}));stem.position.set(0,-.9,-.06);stem.rotation.x=-.2;brain.add(stem);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.48,.09,64),graphite);floor.position.y=-.045;root.add(floor);
  const floorLines=[];
  for(const radius of [2.38,2.15])for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;floorLines.push(radius*Math.cos(a),0,radius*Math.sin(a),radius*Math.cos(b),0,radius*Math.sin(b))}
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2;floorLines.push(.3*Math.cos(a),0,.3*Math.sin(a),2.37*Math.cos(a),0,2.37*Math.sin(a))}
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(floorLines,3)),new THREE.LineBasicMaterial({color:0x438899,transparent:true,opacity:.30})));
  const energy=new THREE.Mesh(new THREE.TorusGeometry(.1,.008,5,24),new THREE.MeshBasicMaterial({color:0x69dfed,transparent:true,opacity:.3}));energy.rotation.x=-Math.PI/2;energy.position.set(-.60,.007,.35);root.add(energy);
  let stage=0;
  function update(time,amount,chapter){
    stage=chapter;brain.rotation.y=Math.sin(time*.25)*.26;brain.rotation.z=Math.sin(time*.3)*.025;
    for(let i=0;i<neurons.length;i++){
      const n=neurons[i],active=n.region===stage,a=active?THREE.MathUtils.smoothstep(amount,(i%6)/14,.70+(i%6)/24):1;
      position.lerpVectors(V(-.8,-.75,.2),n.target,a);const s=active?1.3+Math.sin(time*3+i)*.16:.65;
      matrix.makeScale(s,s,s).setPosition(position);nodes.setMatrixAt(i,matrix);color.setHex(active?0xc9faff:0x286477);nodes.setColorAt(i,color);
    }
    nodes.instanceMatrix.needsUpdate=true;nodes.instanceColor.needsUpdate=true;
    for(let i=0;i<linkRegions.length;i++){const s=linkRegions[i]===stage?.18+amount*.82:.16;for(let j=0;j<2;j++)linkColors.setXYZ(i*2+j,.45*s,.84*s,.94*s)}linkColors.needsUpdate=true;
    progress.scale.x=Math.max(.015,amount);progress.position.x=-(1-amount)*.525;
    root.updateMatrixWorld(true);transferEnd.copy(cursor.position);monitor.localToWorld(transferEnd);computer.worldToLocal(transferEnd);
    const k=Math.min(1,amount*4),inverse=1-k;
    transfer.position.copy(transferStart).multiplyScalar(inverse*inverse).addScaledVector(transferControl,2*inverse*k).addScaledVector(transferEnd,k*k);transfer.visible=amount<.25;
    cursor.position.x=-.52+Math.sin(time*1.3)*.06;cursor.position.y=-.4+Math.cos(time*.9)*.04;cursor.rotation.y=time;
    for(let i=0;i<keyPositions.length;i++){position.copy(keyPositions[i]);if(i===Math.floor(time*7)%60)position.y-=.009;matrix.makeTranslation(...position.toArray());keys.setMatrixAt(i,matrix)}keys.instanceMatrix.needsUpdate=true;
    energy.scale.setScalar(1+(time*.55)%17);energy.material.opacity=.3;
  }
  return {root,computer,monitor,brain,keyboard,update,typingTargets:[V(-.03,1.52,.52),V(.35,1.52,.52)]};
}
