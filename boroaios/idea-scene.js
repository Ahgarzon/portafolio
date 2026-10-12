import * as THREE from './assets/three.module.min.js';

// Accessible HTML handles sit on a real 3D piece. Only the handle captures touch.
export function createIdeaScene({host,world,camera,model,shop,partner,request,submit,feedback}){
 const piece=new THREE.Mesh(new THREE.BoxGeometry(.19,.19,.19),new THREE.MeshStandardMaterial({color:0x79d7ef,emissive:0x173b49,metalness:.25,roughness:.35}));world.add(piece);
 const token=document.createElement('button');token.id='idea-token';token.type='button';token.textContent='Tu idea ↗';token.setAttribute('aria-label','Entregar tu idea a Boro. Arrastra al monitor o pulsa este botón.');token.hidden=true;
 const target=document.createElement('span');target.id='idea-target';target.textContent='Suelta aquí';target.hidden=true;target.setAttribute('aria-hidden','true');host.append(token,target);
 const rest=new THREE.Vector3(),end=new THREE.Vector3(),hand=new THREE.Vector3(),point=new THREE.Vector3(),ray=new THREE.Raycaster(),plane=new THREE.Plane();
 const right=model.getObjectByName('hand_R'),head=model.getObjectByName('head');
 let valid=false,delivered=false,started=null,staticDelivery=false,done=0,total=4,nodAt=-100,drag=null,suppressClick=false;
 function projected(v){const p=v.clone().project(camera);return {x:(p.x+1)*host.clientWidth/2,y:(1-p.y)*host.clientHeight/2}}
 function origin(){partner.card.getWorldPosition(rest);world.worldToLocal(rest);return rest}
 function monitorPoint(){shop.brain.getWorldPosition(end);return end}
 function locate(el,v){const p=projected(v);el.style.transform=`translate(${Math.max(48,Math.min(host.clientWidth-48,p.x))}px,${Math.max(24,Math.min(host.clientHeight-24,p.y))}px) translate(-50%,-50%)`;return p}
 function inside(x,y){const r=host.getBoundingClientRect(),p=projected(monitorPoint());return Math.hypot(x-r.left-p.x,y-r.top-p.y)<Math.max(48,Math.min(78,host.clientWidth*.13))}
 function resetPiece(){piece.position.copy(origin());piece.scale.setScalar(1)}
 function preview(value){valid=value;delivered=false;started=null;staticDelivery=false;resetPiece();request()}
 function deliver(t,animate){drag=null;delivered=true;started=t;staticDelivery=!animate;token.hidden=true;target.hidden=true;host.dataset.ideaPhase=animate?'receiving':'ready';request()}
 function progress(n,t,clock,animate){done=n;total=t;nodAt=animate?clock:-100;request()}
 function clear(){valid=false;delivered=false;started=null;staticDelivery=false;done=0;drag=null;token.hidden=true;target.hidden=true;resetPiece();host.dataset.ideaPhase='empty';request()}
 function beforePaint(t){const elapsed=started===null?null:staticDelivery?5:t-started,active=elapsed!==null&&elapsed<4.5;
  return {poseTime:active?3.2+Math.min(1,elapsed/4.5)*3.3:null,amount:elapsed===null?null:active?Math.min(1,elapsed/4.5):1,label:active?(elapsed<1.2?'Boro recibe tu idea':'Boro conecta los siguientes pasos'):delivered?'Tu plan está listo para editar':null};
 }
 function afterPaint(t){
  const elapsed=started===null?null:staticDelivery?5:t-started,active=elapsed!==null&&elapsed<4.5;
  if(head&&t-nodAt>=0&&t-nodAt<1.1){head.rotation.x+=Math.sin((t-nodAt)*Math.PI*2/1.1)*.07;model.updateMatrixWorld(true)}
  piece.visible=valid&&!delivered||active;
  if(active){
   origin();right.getWorldPosition(hand);world.worldToLocal(hand);monitorPoint();world.worldToLocal(end);
   if(elapsed<1.2)piece.position.lerpVectors(rest,hand,THREE.MathUtils.smoothstep(elapsed/1.2,0,1));
   else {const k=THREE.MathUtils.smoothstep((elapsed-1.2)/3.3,0,1);piece.position.lerpVectors(hand,end,k);piece.position.y+=Math.sin(k*Math.PI)*.20;piece.scale.setScalar(1-k*.8)}
   host.dataset.ideaPhase=elapsed<1.2?'receiving':'building';
  }else if(delivered)host.dataset.ideaPhase='ready';else host.dataset.ideaPhase=valid?'preview':'empty';
  if(!drag&&!active&&!delivered)resetPiece();piece.rotation.set(t*.2,t*.5,0);piece.updateMatrixWorld(true);
  token.hidden=!valid||delivered;target.hidden=!drag;
  if(!token.hidden){piece.getWorldPosition(point);locate(token,point)}
  if(drag)locate(target,monitorPoint());
  host.dataset.ideaPiece=JSON.stringify(piece.getWorldPosition(point).toArray().map(v=>+v.toFixed(4)));host.dataset.ideaProgress=done+'/'+total;
 }
 token.addEventListener('click',e=>{if(suppressClick&&e.detail>0){suppressClick=false;return}suppressClick=false;submit()});
 token.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.stopPropagation();piece.getWorldPosition(point);plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),point);drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};token.setPointerCapture(e.pointerId);target.hidden=false;request()});
 token.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const r=host.getBoundingClientRect();if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(!drag.moved)return;
  ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);if(ray.ray.intersectPlane(plane,point))piece.position.copy(world.worldToLocal(point));target.classList.toggle('is-over',inside(e.clientX,e.clientY));request();
 });
 token.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved,hit=inside(e.clientX,e.clientY);drag=null;target.hidden=true;target.classList.remove('is-over');if(moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);if(hit)submit();else{resetPiece();feedback('Acerca «Tu idea» al centro del monitor o usa «Crear mi plan».')}}request()});
 for(const event of ['pointercancel','lostpointercapture'])token.addEventListener(event,()=>{if(drag){drag=null;target.hidden=true;resetPiece();request()}});
 clear();return {preview,deliver,progress,clear,beforePaint,afterPaint,dispose(){token.remove();target.remove();piece.removeFromParent();piece.geometry.dispose();piece.material.dispose()}};
}
