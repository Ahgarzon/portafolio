import * as THREE from './assets/three.module.min.js';
import {capabilities} from './capabilities.js?v=constructor11-20261012';
import {createComputerWorkshop} from './computer-workshop.js?v=constructor11-20261012';
import {createWorkshopPartner} from './workshop-partner.js?v=constructor11-20261012';
import {createIdeaScene} from './idea-scene.js?v=constructor11-20261012';
import {createSceneVoice} from './scene-voice.js?v=voice-supertonic3-m1-20261020';

// A real skinned character, computer and volumetric brain. No camera-facing mascot plane.
const RELEASE='constructor11-20261012',BUILD_SECONDS=8;
const host=document.querySelector('#scene'),visual=document.querySelector('.visual');
const motion=document.querySelector('#motion'),replay=document.querySelector('#replay-build');
const turn=document.querySelector('#turn-scene'),retry=document.querySelector('#retry-scene');
const actionLabel=document.querySelector('#builder-action'),note=document.querySelector('.fallback-note');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let paused=reduced.matches,visible=false,near=false,failed=false,loading=false,ready=false;
let frame=0,last=0,time=0,stage=0,stageAt=0,manualUntil=0,angle=-.20,angleGoal=-.20,tour=0;
let renderer,scene,camera,world,shop,model,mixer,partner,environment,abort,generation=0;
const nativePose=new Map();
let hasPlan=false,deliveryAt=0,completed=0,flags=[false,false,false,false],ideaScene,ideaValid=true,greetAt=-100,gazeX=0,gazeY=0;
const feedback=text=>{actionLabel.textContent=text;host.dataset.feedback=text};
function deliverIdea(){if(!ready)return false;hasPlan=true;deliveryAt=time;manualUntil=time+14;ideaScene.preview(true);ideaScene.deliver(time,!paused);feedback('Boro recibe la pieza y construye en el monitor');last=0;request();return true}
function greet(){if(!ready)return;greetAt=time;manualUntil=time+8;host.dataset.greet=String(Number(host.dataset.greet||0)+1);feedback('Boro te saluda');request()}
const ideaDemo={submit:deliverIdea,feedback};
const voice=createSceneVoice({button:document.querySelector('#listen-boro'),request,feedback});
document.querySelector('#write-idea')?.addEventListener('click',deliverIdea);
document.querySelector('#show-plan')?.addEventListener('click',greet);
host.dataset.release=RELEASE;host.dataset.status='waiting';
function sync(){motion.textContent=paused?'Activar movimiento':'Pausar movimiento';motion.setAttribute('aria-pressed',String(paused));for(const b of [motion,replay,turn,document.querySelector('#write-idea'),document.querySelector('#show-plan')])if(b)b.disabled=!ready;}
function selectStage(next){
  stage=next;stageAt=time;const c=capabilities[stage];
  document.querySelectorAll('[data-build]').forEach(b=>{const active=Number(b.dataset.build)===stage;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  for(const [id,text] of [['capability-tag',`0${stage+1} / ${c.name}`],['capability-request',c.request],['capability-result',c.result],['scene-caption',`0${stage+1} / ${c.caption}`]])document.getElementById(id).textContent=text;
  document.querySelector('.construction-progress span').style.transform=`scaleX(${(stage+1)/6})`;
  document.querySelectorAll('.scene-outputs span').forEach((el,i)=>el.textContent=c.cards[i]);host.dataset.stage=String(stage);request();
}
document.querySelectorAll('[data-build]').forEach(b=>b.addEventListener('click',()=>{manualUntil=time+24;selectStage(Number(b.dataset.build))}));
function dispose(){
  ideaScene?.dispose();ideaScene=undefined;
  nativePose.clear();
  voice.bind(null);
  if(!scene)return;const textures=new Set(),materials=new Set(),geometries=new Set();
  scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v)}});
  textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());environment?.dispose();renderer?.dispose();
}
function fallback(reason){
  generation++;failed=true;loading=false;ready=false;abort?.abort();cancelAnimationFrame(frame);frame=0;tour=0;
  host.dataset.status='static';host.dataset.reason=reason;document.body.classList.remove('has-webgl');
  host.dataset.character='unavailable';host.setAttribute('aria-busy','false');delete window.BoroWorkshop;
  note.hidden=false;note.querySelector('span').textContent='No pude cargar el 3D. Puedes escuchar a Boro, explorar sus capacidades o reintentar la escena.';
  actionLabel.textContent='Vista estática de Boro';host.querySelector('canvas')?.remove();dispose();scene=undefined;sync();
}
function resize(){
  if(!renderer||!camera)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,w<540?1.25:1.5));renderer.setSize(w,h,false);
  const a=w/h,half=Math.max(1.65,2.05/a);camera.left=-half*a;camera.right=half*a;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();request();
}
function paint(){
  if(!ready||failed)return;const interaction=ideaScene.beforePaint(time),greeting=time-greetAt>=0&&time-greetAt<2.5;
  // THREE may skip writing an unchanged track. Undo our previous additive pose
  // before sampling, otherwise a frozen gesture accumulates rotations per frame.
  for(const [bone,quaternion] of nativePose)bone.quaternion.copy(quaternion);
  mixer.setTime(greeting?6.2:interaction.poseTime??time);
  for(const name of ['head','hand_R']){const bone=model.getObjectByName(name);if(bone){if(!nativePose.has(bone))nativePose.set(bone,bone.quaternion.clone());else nativePose.get(bone).copy(bone.quaternion)}}world.rotation.y=angle;
  const head=model.getObjectByName('head');if(head){head.rotation.y+=gazeX*.13;head.rotation.x+=gazeY*.05;if(greeting){head.rotation.y-=.16;head.rotation.x+=paused?.07:Math.sin((time-greetAt)*Math.PI*2/2.5)*.07;const hand=model.getObjectByName('hand_R');if(hand)hand.rotation.z+=paused?.12:Math.sin((time-greetAt)*9)*.16}}
  const delivery=Math.min(1,Math.max(0,(time-deliveryAt)/2.2));
  const amount=interaction.amount??Math.min(1,Math.max(0,(time-stageAt)%BUILD_SECONDS/BUILD_SECONDS));shop.update(time,amount,stage);partner.update(time,0,0,false);scene.updateMatrixWorld(true);ideaScene.afterPaint(time);const speaking=voice.update();renderer.render(scene,camera);host.dataset.mouth=speaking.open.toFixed(3);host.dataset.speaking=String(speaking.active);host.dataset.lipSource=speaking.source;
  const bones={};model.traverse(o=>{if(o.isBone&&['head','forearm_L','forearm_R','hand_L','hand_R','tail_tip','foot_L','foot_R'].includes(o.name))bones[o.name]=o.getWorldPosition(new THREE.Vector3()).toArray().map(x=>+x.toFixed(5))});
  host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.status=paused?'paused':'animating';host.dataset.time=time.toFixed(3);host.dataset.angle=angle.toFixed(3);host.dataset.build=amount.toFixed(3);host.dataset.drawCalls=String(renderer.info.render.calls);
  host.dataset.hand=JSON.stringify([bones.hand_L,bones.hand_R]);host.dataset.pose=JSON.stringify(bones);host.dataset.character='loaded';
  host.dataset.delivery=hasPlan?delivery.toFixed(3):'idle';host.dataset.completed=String(completed);
  const label=voice.active?'Boro está hablando':greeting?'Boro te saluda':interaction.label??(paused?'Movimiento en pausa · puedes girar o escuchar a Boro':amount<.25?'Acerca una idea al monitor':amount<.75?'Boro conecta las piezas':'Toca Boro o arrastra la pieza al monitor');if(actionLabel.textContent!==label)actionLabel.textContent=label;
}
function render(now){
  frame=0;if(!ready||failed||!visible||document.hidden)return;
  const dt=last?Math.max(0,Math.min(.05,(now-last)/1000)):0;last=now;
  if(!paused){time+=dt;if(hasPlan&&time-deliveryAt>9){hasPlan=false;ideaScene.preview(true)}if(time>=manualUntil&&time-stageAt>=BUILD_SECONDS)selectStage((stage+1)%6)}
  if(tour>0){const delta=Math.min(tour,dt*Math.PI/3);angleGoal+=delta;tour-=delta;}
  angle+=(angleGoal-angle)*.18;paint();
  if(!paused||voice.active||tour>0||Math.abs(angleGoal-angle)>.0001)request();
}
function request(){if(ready&&!failed&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(render)}
async function start(){
  if(loading||ready)return;loading=true;failed=false;const token=++generation;host.dataset.status='loading';actionLabel.textContent='Cargando el taller 3D…';note.hidden=true;sync();
  host.setAttribute('aria-busy','true');
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Boro trabaja frente al computador. Tócalo para saludar o acerca la pieza al monitor para construir. Usa las flechas para girar; hay botones equivalentes.');host.append(canvas);
    scene=new THREE.Scene();world=new THREE.Group();scene.add(world);camera=new THREE.OrthographicCamera(-3,3,3,-3,.01,30);camera.position.set(0,3.5,7);camera.lookAt(0,1.4,0);
    scene.add(new THREE.HemisphereLight(0xeaf5ff,0x304859,2));
    for(const [x,y,z,color,power] of [[-3,4,5,0xffffff,2.3],[3,3,-2,0x80dfff,1.5]]){const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light)}
    const studio=new THREE.Scene();studio.background=new THREE.Color(0x647480);
    for(const [x,y,z,w,h] of [[-4,2,0,3,5],[4,1,0,2,5],[0,4,1,5,3],[0,1,4,4,3]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xe2edf0}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel)}
    const pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromScene(studio,.06);scene.environment=environment.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
    shop=createComputerWorkshop();world.add(shop.root);partner=createWorkshopPartner();world.add(partner.root,partner.transferRoot);partner.root.visible=false;partner.transferRoot.visible=false;shop.setChecklist(null);resize();
    const {GLTFLoader}=await import('./assets/three-addons/loaders/GLTFLoader.js');
    abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),45000);let gltf;
    try{
      const response=await fetch('./assets/boro-workstation-v10.glb',{signal:abort.signal});if(!response.ok)throw Error('model-http-'+response.status);
      const buffer=await response.arrayBuffer();if(buffer.byteLength<1000||buffer.byteLength>20000000)throw Error('model-size');
      gltf=await new GLTFLoader().parseAsync(buffer,new URL('./assets/',location.href).href);
    }finally{clearTimeout(timeout)}
    if(token!==generation)return;
    model=gltf.scene;model.rotation.y=Math.PI/4;model.position.set(-.75,0,-.05);world.add(model);
    let skins=0,bones=0;model.traverse(o=>{if(o.isSkinnedMesh){skins++;o.frustumCulled=false}if(o.isBone)bones++});
    if(!skins||bones<20||!gltf.animations.length)throw Error('missing-articulation');
    host.dataset.skins=String(skins);host.dataset.bones=String(bones);host.dataset.clip=gltf.animations[0].name;
    mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();voice.bind(model);
    partner.transferRoot.visible=false;ideaScene=createIdeaScene({host,world,camera,model,shop,partner,request,submit:ideaDemo.submit,feedback:ideaDemo.feedback});ideaScene.preview(ideaValid);if(hasPlan){ideaScene.deliver(time,!paused);ideaScene.progress(completed,4,time,false)}
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('webgl-context-lost')},{once:true});
    let pointer;
    canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false}});
    canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();gazeX=Math.max(-1,Math.min(1,(e.clientX-rect.left)/rect.width*2-1));gazeY=Math.max(-1,Math.min(1,(e.clientY-rect.top)/rect.height*2-1));request();if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!pointer.dragging&&Math.abs(dy)>Math.abs(dx)+5){pointer=undefined;return}if(Math.abs(dx)>5||pointer.dragging){pointer.dragging=true;canvas.setPointerCapture(e.pointerId);angleGoal+=dx*.008;pointer.x=e.clientX;pointer.y=e.clientY;tour=0;request()}});
    canvas.addEventListener('pointerup',e=>{if(pointer&&!pointer.dragging){const bounds=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);const hit=ray.intersectObjects([model,shop.monitor],true)[0];if(hit){let o=hit.object,isBoro=false;while(o){if(o===model)isBoro=true;o=o.parent}if(isBoro)greet();else deliverIdea()}}pointer=undefined});
    for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>pointer=undefined);
    canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();tour=0;angleGoal=e.key==='Home'?-.20:angleGoal+(e.key==='ArrowLeft'?-.25:.25);request()});
    ready=true;loading=false;host.dataset.reason='';host.setAttribute('aria-busy','false');document.body.classList.add('has-webgl');sync();resize();last=0;paint();request();
    // Read-only inspection data; this object has no PC, microphone or messaging access.
    window.BoroWorkshop={model,shop,partner,mixer,renderer,world,camera,scene,voice,release:RELEASE,paint,snapshot:()=>({...host.dataset}),sample(t){time=t;paint()}};
  }catch(error){if(token===generation)fallback(error.name==='AbortError'?'model-timeout':String(error.message).slice(0,80))}
}
motion.addEventListener('click',()=>{if(!ready)return;paused=!paused;last=0;sync();request()});
replay.addEventListener('click',()=>{if(!ready)return;time=0;stageAt=0;deliveryAt=0;manualUntil=8;hasPlan=false;ideaScene.preview(true);paused=false;last=0;sync();request()});
turn?.addEventListener('click',()=>{if(!ready)return;tour=Math.PI*2;last=0;request()});
retry?.addEventListener('click',()=>{if(!loading&&!ready)start()});
reduced.addEventListener('change',e=>{paused=e.matches;last=0;sync();request()});
new ResizeObserver(resize).observe(host);
new IntersectionObserver(entries=>{near=entries[0].isIntersecting;if(near&&!ready&&!failed)start()},{rootMargin:'200px'}).observe(visual);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request()}else{voice.stop();cancelAnimationFrame(frame);frame=0}},{threshold:.01}).observe(visual);
document.addEventListener('visibilitychange',()=>{if(document.hidden){voice.stop();cancelAnimationFrame(frame);frame=0}else{last=0;request()}});
sync();selectStage(0);
