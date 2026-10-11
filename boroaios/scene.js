import * as THREE from './assets/three.module.min.js';
import { BUILD_SECONDS, poseAt, deformPoint } from './character-motion.js?v=constructor3-20261011';

const host = document.querySelector('#scene');
const visual = document.querySelector('.visual');
const motion = document.querySelector('#motion');
const replay = document.querySelector('#replay-build');
host.dataset.release = 'constructor3-20261011';
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const capabilities = [
  {
    "name": "MEMORIA",
    "short": "Pendiente → aviso",
    "request": "“Recuérdame la cita de mañana y guarda esta idea”.",
    "result": "Guarda lo que quieres retomar y programa el aviso con la fecha que confirmes.",
    "caption": "Tus pendientes tienen un próximo paso.",
    "cards": [
      "TU IDEA",
      "RECORDATORIO",
      "SEGUIMIENTO"
    ]
  },
  {
    "name": "PROYECTOS DIGITALES",
    "short": "Idea → solución",
    "request": "“Ayúdame a construir una web o una aplicación para mi proyecto”.",
    "result": "Define contigo qué necesitas, construye una primera versión y la prueba contigo. El alcance, las integraciones y la publicación se acuerdan antes de ponerla en marcha.",
    "caption": "Webs, aplicaciones y soluciones para tu proyecto.",
    "cards": [
      "TU IDEA",
      "SOLUCIÓN",
      "PRIMERA VERSIÓN"
    ]
  },
  {
    "name": "DOCUMENTOS",
    "short": "Notas → entregable",
    "request": "“Arma la propuesta, la presentación y el Excel de este proyecto”.",
    "result": "Usa tus notas y archivos para crear entregables que puedas revisar, editar y compartir.",
    "caption": "Del conocimiento al trabajo entregado.",
    "cards": [
      "TUS ARCHIVOS",
      "PROPUESTA",
      "ENTREGABLES"
    ]
  },
  {
    "name": "CAMPAÑAS",
    "short": "Oferta → campaña",
    "request": "“Prepara una campaña para dar a conocer mi negocio”.",
    "result": "Define contigo el mensaje y las piezas, y ayuda a configurar la campaña en tu cuenta conectada. Tú apruebas el gasto.",
    "caption": "Dale visibilidad a lo que construyes.",
    "cards": [
      "TU OFERTA",
      "CONTENIDO",
      "CAMPAÑA"
    ]
  },
  {
    "name": "COMPUTADOR",
    "short": "Objetivo → tarea hecha",
    "request": "“Prepara mi PC y las herramientas para trabajar en este proyecto”.",
    "result": "Configura el entorno, organiza archivos y ejecuta pasos autorizados en tu computador encendido y conectado.",
    "caption": "De abrir un programa a completar el trabajo.",
    "cards": [
      "TU OBJETIVO",
      "HERRAMIENTAS",
      "TAREA HECHA"
    ]
  },
  {
    "name": "AUTOMATIZACIÓN",
    "short": "Rutina → flujo",
    "request": "“Registra cada solicitud y recuérdame hacer seguimiento”.",
    "result": "Conecta el formulario, la hoja de cálculo y los avisos; prueba contigo el flujo antes de activarlo.",
    "caption": "Las tareas repetitivas encuentran su ritmo.",
    "cards": [
      "SOLICITUD",
      "REGISTRO",
      "AVISO"
    ]
  }
];
let paused = reduced.matches, visible = false, failed = false, frame = 0;
let phase = 0, last = 0, stage = 0, stageAt = 0, manualUntil = 0, angle = 0, angleGoal = 0;
let renderer, request = () => {};
function syncButton() {
  motion.textContent = paused ? 'Activar movimiento' : 'Pausar movimiento';
  motion.setAttribute('aria-pressed', String(paused));
}
let updateCards = () => {};
function selectStage(next) {
  stage = next; stageAt = phase;
  const c = capabilities[stage];
  document.querySelectorAll('[data-build]').forEach(b => {
    const active = Number(b.dataset.build) === stage;
    b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#capability-tag').textContent = `0${stage+1} / ${c.name}`;
  document.querySelector('#capability-request').textContent = c.request;
  document.querySelector('#capability-result').textContent = c.result;
  document.querySelector('#scene-caption').textContent = `0${stage+1} / ${c.caption}`;
  document.querySelector('.construction-progress span').style.transform = `scaleX(${(stage+1)/6})`;
  host.dataset.stage = String(stage);
  document.querySelectorAll('.scene-outputs span').forEach((el,i)=>el.textContent=c.cards[i]);
  updateCards(c); request();
}
document.querySelectorAll('[data-build]').forEach(b => b.addEventListener('click', () => {
  manualUntil = phase + 24; selectStage(Number(b.dataset.build));
}));
function fallback() {
  failed = true; cancelAnimationFrame(frame); frame = 0;
  document.body.classList.remove('has-webgl');
  document.querySelector('.fallback-note').hidden = false;
  host.querySelector('canvas')?.remove(); motion.hidden = true; replay.hidden = true;
  host.dataset.status = 'static';
  document.querySelector('#builder-action').textContent='Vista estática de Boro';
}
syncButton();
try {
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden','true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  const world = new THREE.Group(); scene.add(world);
  scene.add(new THREE.HemisphereLight(0xc8edff,0x132033,2));
  const light = new THREE.DirectionalLight(0xa0eaff,3);light.position.set(2,5,6);scene.add(light);
  const cyan = new THREE.MeshBasicMaterial({color:0x8be8f5});
  const dim = new THREE.MeshBasicMaterial({color:0x285264});
  const nodeGeometry = new THREE.SphereGeometry(.036,8,6);
  const vector = (x,y,z) => new THREE.Vector3(x,y,z);
  function line(points, color, opacity, parent=world) {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const l = new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(l);return l;
  }
  function ring(radius,y,opacity) {
    const pts = Array.from({length:97},(_,i)=>vector(Math.cos(i/96*Math.PI*2)*radius,y,Math.sin(i/96*Math.PI*2)*radius*.65));
    return line(pts,0x64dfee,opacity);
  }
  // Identity-preserving articulated 2.5D mesh; not a volumetric reconstruction of the mascot.
  // Local vertex deformation moves the arm/head/tail independently, not just the whole image.
  const character = new THREE.Group();scene.add(character);
  const texture = new THREE.TextureLoader().load('./assets/boro-constructor.png',()=>{host.dataset.character='loaded';request()},undefined,()=>fallback());
  texture.colorSpace=THREE.SRGBColorSpace;
  const mobile = matchMedia('(max-width:760px)').matches;
  const beaverGeometry = new THREE.PlaneGeometry(5.7,3.8,mobile?64:96,mobile?48:64);
  const originalUV = beaverGeometry.attributes.uv;
  const puppetVertices = beaverGeometry.attributes.position;
  puppetVertices.setUsage(THREE.DynamicDrawUsage);
  const deformed = {}, handUV = {x:.752,y:.353}, handLocal = vector(0,0,0);
  const beaver = new THREE.Mesh(beaverGeometry,new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  beaver.frustumCulled=false;
  beaver.position.set(-1.55,1.95,.65); character.add(beaver);
  // Elliptical workbench, a holographic construction plane and the two brain hemispheres.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.32,.1,80),new THREE.MeshStandardMaterial({color:0x0b1925,metalness:.7,roughness:.45}));
  base.position.set(0,-.06,0);world.add(base);
  ring(3.22,.01,.7); ring(2.95,.015,.16);
  for(let i=-6;i<=6;i++) {
    const z=i*.42,half=Math.sqrt(Math.max(0,8.6-z*z));
    line([vector(-half,.02,z*.65),vector(half,.02,z*.65)],0x345363,.23);
  }
  // Grounded light-workshop: radial conduits, moving energy ring, contact shadow and build plinth.
  for(let i=0;i<16;i++) {
    const a=i/16*Math.PI*2;
    line([vector(Math.cos(a)*.8,.023,Math.sin(a)*.52),vector(Math.cos(a)*3.1,.023,Math.sin(a)*2.015)],0x477c91,.16);
  }
  const floorPulse=ring(1,.032,.4);
  const floorCore=ring(.62,.035,.65);floorCore.position.x=1.12;
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.72,.82,.12,48),new THREE.MeshStandardMaterial({color:0x183d4b,metalness:.8,roughness:.35}));
  plinth.position.set(1.12,.06,0);world.add(plinth);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128;
  const shadowContext=shadowCanvas.getContext('2d');
  const shadowGradient=shadowContext.createRadialGradient(128,64,0,128,64,108);
  shadowGradient.addColorStop(0,'rgba(0,0,0,.85)');shadowGradient.addColorStop(1,'rgba(0,0,0,0)');
  shadowContext.fillStyle=shadowGradient;shadowContext.fillRect(0,0,256,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.5,1.2),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.set(-1.8,.04,.6);scene.add(shadow);
  const brain = new THREE.Group();brain.position.set(1.12,2.28,0);world.add(brain);
  const nodes=[],connections=[],folds=[];
  // Lobed closed surface, split at the longitudinal fissure. Nodes assemble from the hand.
  function brainPoint(side,u,v) {
    const r=1+.065*Math.sin(u*7+v*2)+.04*Math.cos(v*9-u*3);
    return vector(side*(.19+.56*Math.sin(v)*Math.cos(u)*r),.88*Math.cos(v)*r,.69*Math.sin(v)*Math.sin(u)*r);
  }
  for(const side of [-1,1]) {
    const shellGeometry = new THREE.SphereGeometry(1,40,28);
    const positions=shellGeometry.attributes.position;
    for(let i=0;i<positions.count;i++) {
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const r=1+.055*Math.sin(y*18+z*8)+.035*Math.sin(x*15-z*12);
      positions.setXYZ(i,x*.53*r+side*.38,y*.84*r,z*.7*r);
    }
    shellGeometry.computeVertexNormals();
    const shell=new THREE.Mesh(shellGeometry,new THREE.MeshPhysicalMaterial({color:0x23667c,metalness:.3,roughness:.3,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}));
    brain.add(shell);
    // Convolutions: curved gyri wrap both lobes, with deliberately irregular paths.
    for(let row=0;row<10;row++) {
      const v=.2+row/9*2.7;
      const pts=Array.from({length:65},(_,k)=>{
        const u=k/64*Math.PI*2;
        const p=brainPoint(side,u,v+.11*Math.sin(u*5+row));p.x+=side*.2;return p;
      });
      const curve=new THREE.CatmullRomCurve3(pts);
      const fold=new THREE.Mesh(new THREE.TubeGeometry(curve,64,.014,4,false),new THREE.MeshBasicMaterial({color:row%3===0?0xabe7ee:0x418fa9,transparent:true,opacity:.65}));
      brain.add(fold);folds.push(fold);
    }
    for(let j=0;j<48;j++) {
      const u=j*2.39996,v=Math.acos(1-2*(j+.5)/48);
      const target=brainPoint(side,u,v);target.x+=side*.2;
      nodes.push({target,region:Math.floor(j/8),index:nodes.length});
    }
  }
  // Batch neurons and neural paths: one draw each, rather than hundreds of mobile draw calls.
  const neuronMesh=new THREE.InstancedMesh(nodeGeometry,new THREE.MeshBasicMaterial({color:0xffffff}),nodes.length);
  neuronMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);neuronMesh.frustumCulled=false;brain.add(neuronMesh);
  const neuronMatrix=new THREE.Matrix4(),neuronPosition=vector(0,0,0),neuronColor=new THREE.Color();
  const pathVertices=[];
  nodes.forEach((a,i)=>nodes.forEach((b,j)=>{
    if(j<=i||a.target.distanceTo(b.target)>.48||j%2!==i%2)return;
    connections.push({offset:pathVertices.length/3,region:a.region});pathVertices.push(...a.target.toArray(),...b.target.toArray());
  }));
  const paths=new THREE.BufferGeometry();paths.setAttribute('position',new THREE.Float32BufferAttribute(pathVertices,3));
  const pathColors=new THREE.Float32BufferAttribute(new Float32Array(pathVertices.length),3);pathColors.setUsage(THREE.DynamicDrawUsage);paths.setAttribute('color',pathColors);
  brain.add(new THREE.LineSegments(paths,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.65})));
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.11,.07,.48,12),new THREE.MeshBasicMaterial({color:0x387d91,transparent:true,opacity:.65}));
  stem.position.set(0,-.94,-.06);stem.rotation.x=-.3;brain.add(stem);
  const orbit=new THREE.Group();orbit.position.copy(brain.position);world.add(orbit);
  for(let j=0;j<2;j++) {
    const pts=Array.from({length:97},(_,i)=>vector(Math.cos(i/96*Math.PI*2)*(1.35+j*.15),0,Math.sin(i/96*Math.PI*2)*(1.05+j*.1)));
    const r=line(pts,0x6fe1ef,.32,orbit);r.rotation.z=j?.2:-.18;r.rotation.x=j?.25:-.25;
  }
  // Three floating output cards, using crisp CanvasTexture labels, change with each capability.
  const cards=[];
  function cardTexture(label,index) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=176;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#0c202e';ctx.fillRect(0,0,512,176);
    ctx.strokeStyle='#426d80';ctx.lineWidth=3;ctx.strokeRect(2,2,508,172);
    ctx.fillStyle='#73e6f8';ctx.fillRect(26,30,6,30);ctx.font='500 26px Inter, sans-serif';ctx.fillText('0'+(index+1),52,54);
    ctx.fillStyle='#f1f6fa';ctx.font='600 42px Inter, sans-serif';ctx.fillText(label,26,124,460);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
  const cardPositions=[vector(.15,3.61,.1),vector(2.32,3.31,.05),vector(2.45,1.1,.65)];
  cardPositions.forEach((p,i)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.5),new THREE.MeshBasicMaterial({map:cardTexture(capabilities[0].cards[i],i),transparent:true}));
    m.position.copy(p);world.add(m);cards.push(m);
    line([vector(1.12,2.28,0),p],0x4d91a3,.25);
  });
  updateCards=c=>cards.forEach((card,i)=>{card.material.map.dispose();card.material.map=cardTexture(c.cards[i],i);card.material.needsUpdate=true});
  document.fonts.ready.then(()=>{if(!failed){updateCards(capabilities[stage]);request()}});
  const sparks=Array.from({length:mobile?12:20},()=>{const m=new THREE.Mesh(nodeGeometry,cyan);scene.add(m);return m});
  const hand=vector(0,0,0),destination=vector(0,0,0),handInBrain=vector(0,0,0),mid=vector(0,0,0);
  const beam=line(Array.from({length:33},()=>vector(0,0,0)),0x85ecff,.5,scene);
  beam.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  beam.frustumCulled=false;
  const idea=new THREE.Mesh(new THREE.OctahedronGeometry(.095),new THREE.MeshBasicMaterial({color:0xddfbff,transparent:true}));scene.add(idea);
  const handRing=new THREE.Mesh(new THREE.TorusGeometry(.17,.009,6,32),new THREE.MeshBasicMaterial({color:0x84e9f7,transparent:true}));scene.add(handRing);
  const actionLabel=document.querySelector('#builder-action');
  let lastAction='';
  function curvePoint(k,out) {
    const inverse=1-k;
    out.copy(hand).multiplyScalar(inverse*inverse).addScaledVector(mid,2*inverse*k).addScaledVector(destination,k*k);
    return out;
  }
  let dragging=false,px=0;
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(dragging){angleGoal=THREE.MathUtils.clamp(angleGoal+(e.clientX-px)*.005,-.45,.45);px=e.clientX;request()}});
  for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,()=>dragging=false);
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.position.set(0,3.35,camera.aspect<1?13.2:9.8);camera.lookAt(0,1.95,0);camera.updateProjectionMatrix();
    beaver.position.x=camera.aspect<1?-.5:camera.aspect<1.5?-.9:-1.55;
    beaver.scale.setScalar(camera.aspect<1?.78:camera.aspect<1.5?.88:1);
    cards.forEach(card=>card.visible=w>540);request();
  }
  function render(t) {
    frame=0;if(failed||!visible||document.hidden)return;
    // RAF timestamps can precede an observer callback in the same frame.
    const dt=Math.max(0,Math.min((t-last)/1000||.016,.05));last=t;
    if(!paused){phase+=dt;if(phase>=manualUntil&&phase-stageAt>=BUILD_SECONDS)selectStage((stage+1)%6)}
    angle+=(angleGoal-angle)*.13;world.rotation.y=angle;
    const elapsed=phase-stageAt;
    const pose=poseAt(phase,elapsed);
    const assembled=pose.progress;
    brain.rotation.y=angle*.2+Math.sin(phase*.2)*.14;
    brain.position.y=2.28+Math.sin(phase*.8)*.025;
    beaver.quaternion.copy(camera.quaternion);
    beaver.position.y=.25+1.7*beaver.scale.x;
    for(let i=0;i<puppetVertices.count;i++) {
      deformPoint(originalUV.getX(i),1-originalUV.getY(i),pose,deformed);
      puppetVertices.setXYZ(i,(deformed.x-.5)*5.7,(.5-deformed.y)*3.8,0);
    }
    puppetVertices.needsUpdate=true;
    // Use exactly the same deformation for the emitting palm and the character mesh.
    deformPoint(handUV.x,handUV.y,pose,deformed);
    handLocal.set((deformed.x-.5)*5.7,(.5-deformed.y)*3.8,.03);
    scene.updateMatrixWorld(true);
    hand.copy(beaver.localToWorld(handLocal));
    destination.copy(brain.localToWorld(vector(0,.05,.12)));
    mid.copy(hand).lerp(destination,.5);mid.y+=.35;
    handInBrain.copy(brain.worldToLocal(hand.clone()));
    nodes.forEach(({target,region,index})=>{
      const current=region===stage;
      const a=current?THREE.MathUtils.smoothstep(assembled, (index%8)/16, .65+(index%8)/24):1;
      neuronPosition.lerpVectors(handInBrain,target,a);
      const scale=current?1.6+Math.sin(phase*2+index)*.18:.75;
      neuronMatrix.makeScale(scale,scale,scale).setPosition(neuronPosition);neuronMesh.setMatrixAt(index,neuronMatrix);
      neuronColor.setHex(current?0xc2f5ff:0x3e7b90);neuronMesh.setColorAt(index,neuronColor);
    });
    neuronMesh.instanceMatrix.needsUpdate=true;neuronMesh.instanceColor.needsUpdate=true;
    folds.forEach((fold,i)=>{fold.material.opacity=.28+(i%6===stage?.5:.12)});
    connections.forEach(c=>{const strength=c.region===stage?.12+assembled*.88:.18;pathColors.setXYZ(c.offset,.46*strength,.84*strength,.94*strength);pathColors.setXYZ(c.offset+1,.46*strength,.84*strength,.94*strength)});pathColors.needsUpdate=true;
    cards.forEach((card,i)=>{card.quaternion.copy(camera.quaternion);card.position.y=cardPositions[i].y+Math.sin(phase*.65+i)*.035});
    const building=pose.cycle>.9&&pose.cycle<5.7;
    sparks.forEach((spark,i)=>{const k=(phase*.65+i/sparks.length)%1;curvePoint(k,spark.position);spark.scale.setScalar(.5+Math.sin(k*Math.PI)*.7);spark.visible=building});
    const beamPositions=beam.geometry.attributes.position;
    for(let i=0;i<beamPositions.count;i++){curvePoint(i/(beamPositions.count-1),handLocal);beamPositions.setXYZ(i,handLocal.x,handLocal.y,handLocal.z)}
    beamPositions.needsUpdate=true;beam.material.opacity=building?.22+pose.place*.3:.05;
    // A visible construction piece travels from the actual palm into the brain.
    const transfer=THREE.MathUtils.smoothstep(pose.cycle,2.2,4.4);
    curvePoint(transfer,idea.position);idea.position.y+=.09*(1-transfer);
    idea.rotation.set(phase*.6,phase,0);idea.scale.setScalar((1.2+pose.place*.8)*(1-transfer*.45));idea.visible=pose.cycle<4.4;
    handRing.position.copy(hand);handRing.quaternion.copy(camera.quaternion);handRing.scale.setScalar(1+pose.place*.6);handRing.material.opacity=.3+pose.reach*.4;
    floorPulse.scale.setScalar(.8+(phase*.32)%2.3);floorPulse.material.opacity=.35*(1-((phase*.32)%2.3)/2.3);
    floorCore.material.opacity=.35+pose.place*.55;
    shadow.position.x=beaver.position.x-.2;shadow.scale.x=1+pose.breath*5;
    const action=paused?'Movimiento en pausa':pose.action;
    if(action!==lastAction){actionLabel.textContent=action;lastAction=action}
    renderer.render(scene,camera);
    host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.build=assembled.toFixed(2);host.dataset.angle=angle.toFixed(3);
    host.dataset.pose=[pose.arm,pose.head,pose.tail].map(x=>x.toFixed(3)).join(',');
    host.dataset.hand=[hand.x,hand.y,hand.z].map(x=>x.toFixed(3)).join(',');host.dataset.status=paused?'paused':'animating';
    host.dataset.drawCalls=String(renderer.info.render.calls);
    host.dataset.cycle=pose.cycle.toFixed(2);host.dataset.transfer=transfer.toFixed(2);
    if(!paused||Math.abs(angleGoal-angle)>.001)request();
  }
  request=()=>{if(!frame&&!failed&&visible&&!document.hidden)frame=requestAnimationFrame(render)};
  motion.addEventListener('click',()=>{paused=!paused;syncButton();request()});
  replay.addEventListener('click',()=>{paused=false;manualUntil=phase+BUILD_SECONDS;selectStage(stage);syncButton();last=performance.now();request()});
  reduced.addEventListener('change',e=>{paused=e.matches;syncButton();request()});
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=performance.now();request()}else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'40px'}).observe(visual);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{last=performance.now();request()}});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
  document.body.classList.add('has-webgl');selectStage(0);resize();
} catch(error) { fallback(); }
