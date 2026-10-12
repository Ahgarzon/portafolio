import * as THREE from './assets/three.module.min.js';

// The visitor is represented by an articulated figure, not a photograph or an account.
export function createWorkshopPartner(){
 const root=new THREE.Group();root.position.set(1.96,0,1.0);root.rotation.y=-.65;
 const suit=new THREE.MeshStandardMaterial({color:0x477088,roughness:.7}),skin=new THREE.MeshStandardMaterial({color:0xd9ad8d,roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x152a3c,roughness:.6}),light=new THREE.MeshStandardMaterial({color:0x9ce7f0,emissive:0x214e59,roughness:.4});
 const mesh=(g,m,p,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
 const capsule=(r,l,m,p,x,y,z)=>mesh(new THREE.CapsuleGeometry(r,l,4,10),m,p,x,y,z);
 for(const x of [-.13,.13]){capsule(.09,.56,dark,root,x,.43,0);const boot=mesh(new THREE.BoxGeometry(.21,.12,.32),dark,root,x,.06,.06);boot.geometry.translate(0,0,.03)}
 const torso=new THREE.Group();torso.position.y=.85;root.add(torso);capsule(.23,.37,suit,torso,0,.28,0);
 const head=new THREE.Group();head.position.y=.9;torso.add(head);capsule(.17,.08,skin,head,0,0,0);
 const hair=mesh(new THREE.SphereGeometry(.176,16,10,0,Math.PI*2,0,1.65),dark,head,0,.045,0);hair.scale.z=1.03;
 for(const x of [-.06,.06])mesh(new THREE.SphereGeometry(.012,8,6),dark,head,x,.015,.166);
 const arms=[];
 for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.25,.55,0);torso.add(arm);capsule(.068,.26,suit,arm,0,-.17,0);const elbow=new THREE.Group();elbow.position.y=-.36;arm.add(elbow);capsule(.057,.24,skin,elbow,0,-.15,0);capsule(.065,.03,skin,elbow,0,-.32,0);arms.push({arm,elbow,side})}
 const card=mesh(new THREE.BoxGeometry(.34,.24,.025),light,root,-.22,1.05,.36);card.rotation.set(-.2,-.2,.1);
 const flight=mesh(new THREE.OctahedronGeometry(.065),light,new THREE.Group(),0,0,0); // Added outside the rotating figure.
 const transferRoot=new THREE.Group();transferRoot.add(flight);
 const start=new THREE.Vector3(),end=new THREE.Vector3(.84,2.18,.15);
 function update(t,delivery=0,completed=0,hasIdea=false){
  const giving=delivery>0&&delivery<1,reach=giving?Math.sin(Math.PI*delivery):0;
  torso.rotation.z=Math.sin(t*.8)*.012;head.rotation.y=-.22+Math.sin(t*.55)*.05;head.rotation.x=completed===4?-.10:Math.sin(t*.7)*.025;
  for(const {arm,elbow,side} of arms){arm.rotation.x=-.18-reach*.8;arm.rotation.z=side*(.10+reach*.16);elbow.rotation.x=-.25-reach*.9}
  card.visible=!hasIdea||giving;card.position.y=1.05+Math.sin(t*.9)*.008;
  root.updateMatrixWorld(true);card.getWorldPosition(start);root.parent?.worldToLocal(start);flight.position.lerpVectors(start,end,Math.min(1,delivery));flight.position.y+=Math.sin(Math.PI*delivery)*.45;flight.rotation.set(t,t*.7,0);flight.visible=giving;
 }
 update(0);return {root,transferRoot,update,head,arms,card};
}
