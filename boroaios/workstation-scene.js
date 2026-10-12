import * as THREE from './assets/three.module.min.js';
import {capabilities} from './capabilities.js?v=constructor7-20261012';
import {createComputerWorkshop} from './computer-workshop.js?v=constructor7-20261012';

// A real skinned character, computer and volumetric brain. No camera-facing mascot plane.
const RELEASE='constructor7-20261012',BUILD_SECONDS=8;
const host=document.querySelector('#scene'),visual=document.querySelector('.visual');
const motion=document.querySelector('#motion'),replay=document.querySelector('#replay-build');
const turn=document.querySelector('#turn-scene'),retry=document.querySelector('#retry-scene');
const actionLabel=document.querySelector('#builder-action'),note=document.querySelector('.fallback-note');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let paused=reduced.matches,visible=false,near=false,failed=false,loading=false,ready=false;
let frame=0,last=0,time=0,stage=0,stageAt=0,manualUntil=0,angle=-.20,angleGoal=-.20,tour=0;
let renderer,scene,camera,world,shop,model,mixer,environment,abort,generation=0;
host.dataset.release=RELEASE;host.dataset.status='waiting';
function sync(){motion.textContent=paused?'Activar movimiento':'Pausar movimiento';motion.setAttribute('aria-pressed',String(paused));for(const b of [motion,replay,turn])if(b)b.disabled=!ready;}
function selectStage(next){
  stage=next;stageAt=time;const c=capabilities[stage];
  document.querySelectorAll('[data-build]').forEach(b=>{const active=Number(b.dataset.build)===stage;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  for(const [id,text] of [['capability-tag',`0${stage+1} / ${c.name}`],['capability-request',c.request],['capability-result',c.result],['scene-caption',`0${stage+1} / ${c.caption}`]])document.getElementById(id).textContent=text;
  document.querySelector('.construction-progress span').style.transform=`scaleX(${(stage+1)/6})`;
  document.querySelectorAll('.scene-outputs span').forEach((el,i)=>el.textContent=c.cards[i]);host.dataset.stage=String(stage);request();
}
document.querySelectorAll('[data-build]').forEach(b=>b.addEventListener('click',()=>{manualUntil=time+24;selectStage(Number(b.dataset.build))}));
function dispose(){
  if(!scene)return;const textures=new Set(),materials=new Set(),geometries=new Set();
  scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}});
  textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());environment?.dispose();renderer?.dispose();
}
function fallback(reason){
  generation++;failed=true;loading=false;ready=false;abort?.abort();cancelAnimationFrame(frame);frame=0;tour=0;
  host.dataset.status='static';host.dataset.reason=reason;document.body.classList.remove('has-webgl');
  host.dataset.character='unavailable';host.setAttribute('aria-busy','false');delete window.BoroWorkshop;
  note.hidden=false;note.querySelector('span').textContent='No se pudo mostrar el taller 3D. Puedes reintentarlo o explorar las capacidades.';
  actionLabel.textContent='Vista estática de Boro';host.querySelector('canvas')?.remove();dispose();scene=undefined;sync();
}
function resize(){
  if(!renderer||!camera)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,w<540?1.25:1.5));renderer.setSize(w,h,false);
  const a=w/h,half=Math.max(1.85,1.9/a);camera.left=-half*a;camera.right=half*a;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();request();
}
function paint(){
  if(!ready||failed)return;mixer.setTime(time);world.rotation.y=angle;
  const amount=Math.min(1,Math.max(0,(time-stageAt)%BUILD_SECONDS/BUILD_SECONDS));shop.update(time,amount,stage);scene.updateMatrixWorld(true);renderer.render(scene,camera);
  const bones={};model.traverse(o=>{if(o.isBone&&['head','forearm_L','forearm_R','hand_L','hand_R','tail_tip','foot_L','foot_R'].includes(o.name))bones[o.name]=o.getWorldPosition(new THREE.Vector3()).toArray().map(x=>+x.toFixed(5))});
  host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.status=paused?'paused':'animating';host.dataset.time=time.toFixed(3);host.dataset.angle=angle.toFixed(3);host.dataset.build=amount.toFixed(3);host.dataset.drawCalls=String(renderer.info.render.calls);
  host.dataset.hand=JSON.stringify([bones.hand_L,bones.hand_R]);host.dataset.pose=JSON.stringify(bones);host.dataset.character='loaded';
  const label=paused?'Movimiento en pausa':amount<.25?'Da forma a la idea':amount<.75?'Construye y conecta las piezas':'Revisa lo construido';if(actionLabel.textContent!==label)actionLabel.textContent=label;
}
function render(now){
  frame=0;if(!ready||failed||!visible||document.hidden)return;
  const dt=last?Math.max(0,Math.min(.05,(now-last)/1000)):0;last=now;
  if(!paused){time+=dt;if(time>=manualUntil&&time-stageAt>=BUILD_SECONDS)selectStage((stage+1)%6)}
  if(tour>0){const delta=Math.min(tour,dt*Math.PI/3);angleGoal+=delta;tour-=delta;}
  angle+=(angleGoal-angle)*.18;paint();
  if(!paused||tour>0||Math.abs(angleGoal-angle)>.0001)request();
}
function request(){if(ready&&!failed&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(render)}
async function start(){
  if(loading||ready)return;loading=true;failed=false;const token=++generation;host.dataset.status='loading';actionLabel.textContent='Cargando el taller 3D…';note.hidden=true;sync();
  host.setAttribute('aria-busy','true');
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Boro trabaja en su computador y construye un cerebro tridimensional. Usa las flechas izquierda y derecha para girar la vista.');host.append(canvas);
    scene=new THREE.Scene();world=new THREE.Group();scene.add(world);camera=new THREE.OrthographicCamera(-3,3,3,-3,.01,30);camera.position.set(0,3.5,7);camera.lookAt(0,1.4,0);
    scene.add(new THREE.HemisphereLight(0xeaf5ff,0x304859,2));
    for(const [x,y,z,color,power] of [[-3,4,5,0xffffff,2.3],[3,3,-2,0x80dfff,1.5]]){const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light)}
    const studio=new THREE.Scene();studio.background=new THREE.Color(0x647480);
    for(const [x,y,z,w,h] of [[-4,2,0,3,5],[4,1,0,2,5],[0,4,1,5,3],[0,1,4,4,3]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xe2edf0}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel)}
    const pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromScene(studio,.06);scene.environment=environment.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
    shop=createComputerWorkshop();world.add(shop.root);resize();
    const {GLTFLoader}=await import('./assets/three-addons/loaders/GLTFLoader.js');
    abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),45000);let gltf;
    try{
      const response=await fetch('./assets/boro-workstation-v7.glb',{signal:abort.signal});if(!response.ok)throw Error('model-http-'+response.status);
      const buffer=await response.arrayBuffer();if(buffer.byteLength<1000||buffer.byteLength>20000000)throw Error('model-size');
      gltf=await new GLTFLoader().parseAsync(buffer,new URL('./assets/',location.href).href);
    }finally{clearTimeout(timeout)}
    if(token!==generation)return;
    model=gltf.scene;model.rotation.y=Math.PI/4;model.position.set(-.75,0,-.05);world.add(model);
    let skins=0,bones=0;model.traverse(o=>{if(o.isSkinnedMesh){skins++;o.frustumCulled=false}if(o.isBone)bones++});
    if(!skins||bones<20||!gltf.animations.length)throw Error('missing-articulation');
    host.dataset.skins=String(skins);host.dataset.bones=String(bones);host.dataset.clip=gltf.animations[0].name;
    mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('webgl-context-lost')},{once:true});
    let pointer;
    canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false}});
    canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!pointer.dragging&&Math.abs(dy)>Math.abs(dx)+5){pointer=undefined;return}if(Math.abs(dx)>5||pointer.dragging){pointer.dragging=true;canvas.setPointerCapture(e.pointerId);angleGoal+=dx*.008;pointer.x=e.clientX;pointer.y=e.clientY;tour=0;request()}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>pointer=undefined);
    canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();tour=0;angleGoal=e.key==='Home'?-.20:angleGoal+(e.key==='ArrowLeft'?-.25:.25);request()});
    ready=true;loading=false;host.dataset.reason='';host.setAttribute('aria-busy','false');document.body.classList.add('has-webgl');sync();resize();last=0;paint();request();
    // Read-only inspection data; this object has no PC, microphone or messaging access.
    window.BoroWorkshop={model,shop,mixer,renderer,world,camera,scene,release:RELEASE,paint,snapshot:()=>({...host.dataset}),sample(t){time=t;paint()}};
  }catch(error){if(token===generation)fallback(error.name==='AbortError'?'model-timeout':String(error.message).slice(0,80))}
}
motion.addEventListener('click',()=>{if(!ready)return;paused=!paused;last=0;sync();request()});
replay.addEventListener('click',()=>{if(!ready)return;time=0;stageAt=0;manualUntil=8;paused=false;last=0;sync();request()});
turn?.addEventListener('click',()=>{if(!ready)return;tour=Math.PI*2;last=0;request()});
retry?.addEventListener('click',()=>{if(!loading&&!ready)start()});
reduced.addEventListener('change',e=>{paused=e.matches;last=0;sync();request()});
new ResizeObserver(resize).observe(host);
new IntersectionObserver(entries=>{near=entries[0].isIntersecting;if(near&&!ready&&!failed)start()},{rootMargin:'200px'}).observe(visual);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request()}else{cancelAnimationFrame(frame);frame=0}},{threshold:.01}).observe(visual);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{last=0;request()}});
sync();selectStage(0);
