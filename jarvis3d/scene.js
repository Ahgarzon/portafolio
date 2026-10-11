import * as THREE from './assets/three.module.min.js';

const host = document.querySelector('#scene');
const visual = document.querySelector('.visual');
const motion = document.querySelector('#motion');
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const capabilities = [
  {name:'MEMORIA', short:'Ideas → contexto', request:'“Retomemos la idea que te conté ayer”.', result:'Notas, decisiones y pendientes conectados para continuar con contexto.', caption:'Conecta lo que importa.', cards:['IDEA GUARDADA','DECISIONES','PRÓXIMO PASO']},
  {name:'BÚSQUEDA', short:'Pregunta → fuentes', request:'“Encuentra lo que acordamos para este proyecto”.', result:'Recupera el contexto autorizado y contrasta información actual con sus fuentes.', caption:'Encuentra la conexión correcta.', cards:['TU PREGUNTA','CONTEXTO','FUENTES']},
  {name:'DOCUMENTOS', short:'Petición → propuesta', request:'“Prepara una propuesta con estas notas”.', result:'Organiza el contenido y prepara un Word, Excel o PDF para que lo revises.', caption:'Convierte conocimiento en un entregable.', cards:['TUS NOTAS','BORRADOR','TU REVISIÓN']},
  {name:'ARCHIVOS', short:'Archivo → respuesta', request:'“Resume este PDF y muéstrame las páginas clave”.', result:'Consulta tus archivos con referencias. Una lectura parcial se señala como tal.', caption:'Cada respuesta conserva su origen.', cards:['DOCUMENTO','PÁGINAS CLAVE','RESPUESTA']},
  {name:'COMPUTADOR', short:'Permiso → acción', request:'“Abre la carpeta del proyecto en mi computador”.', result:'Apoya acciones autorizadas en tu PC cuando está encendido, conectado y configurado.', caption:'Tu autorización conecta con la acción.', cards:['TU PERMISO','PC CONECTADO','ACCIÓN']},
  {name:'PROCESOS', short:'Herramientas → resultado', request:'“Conecta estas herramientas para dar seguimiento”.', result:'Diseña flujos a medida, con permisos, pruebas y revisión humana antes de acciones sensibles.', caption:'Las piezas trabajan juntas.', cards:['HERRAMIENTAS','PROCESO','RESULTADO']}
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
  document.querySelector('.construction-progress span').style.width = `${(stage+1)/6*100}%`;
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
  host.querySelector('canvas')?.remove(); motion.hidden = true;
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
  // Character is an identity-preserving rendered cutout; brain and connections are live 3D geometry.
  // Keep it facing the viewer during orbit; never present this asset as a skeletal 3D rig.
  const character = new THREE.Group();scene.add(character);
  const texture = new THREE.TextureLoader().load('./assets/boro-constructor.png',()=>{host.dataset.character='loaded';request()},undefined,()=>fallback());
  texture.colorSpace=THREE.SRGBColorSpace;
  const beaver = new THREE.Mesh(new THREE.PlaneGeometry(5.7,3.8),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  beaver.position.set(-1.55,1.95,.65); character.add(beaver);
  // Elliptical workbench, a holographic construction plane and the two brain hemispheres.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.32,.1,80),new THREE.MeshStandardMaterial({color:0x0b1925,metalness:.7,roughness:.45}));
  base.position.set(0,-.06,0);world.add(base);
  ring(3.22,.01,.7); ring(2.95,.015,.16);
  for(let i=-6;i<=6;i++) {
    const z=i*.42,half=Math.sqrt(Math.max(0,8.6-z*z));
    line([vector(-half,.02,z*.65),vector(half,.02,z*.65)],0x345363,.23);
  }
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
      const mesh=new THREE.Mesh(nodeGeometry,cyan.clone());brain.add(mesh);
      nodes.push({mesh,target,region:Math.floor(j/8),index:nodes.length});
    }
  }
  // Nearby neural paths rather than an unreadable all-to-all mesh.
  nodes.forEach((a,i)=>nodes.forEach((b,j)=>{
    if(j<=i||a.target.distanceTo(b.target)>.48||j%2!==i%2)return;
    const l=line([a.target,b.target],0x75d7ef,.25,brain);connections.push({line:l,region:a.region});
  }));
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
  const sparks=Array.from({length:18},()=>{const m=new THREE.Mesh(nodeGeometry,cyan);scene.add(m);return m});
  const hand=vector(.18,2.36,.8),destination=vector(1.12,2.28,0);
  const toolCurve=new THREE.CatmullRomCurve3([hand,vector(.6,2.65,.6),destination]);
  const beam=line(toolCurve.getPoints(40),0x85ecff,.5,scene);
  let dragging=false,px=0;
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(dragging){angleGoal=THREE.MathUtils.clamp(angleGoal+(e.clientX-px)*.005,-.45,.45);px=e.clientX;request()}});
  for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,()=>dragging=false);
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.position.set(0,3.35,camera.aspect<1?14.2:9.8);camera.lookAt(0,1.95,0);camera.updateProjectionMatrix();
    beaver.position.x=camera.aspect<1?-1:-1.55;
    beaver.scale.setScalar(camera.aspect<1?.9:1);
    cards.forEach(card=>card.visible=w>540);request();
  }
  function render(t) {
    frame=0;if(failed||!visible||document.hidden)return;
    // RAF timestamps can precede an observer callback in the same frame.
    const dt=Math.max(0,Math.min((t-last)/1000||.016,.05));last=t;
    if(!paused){phase+=dt;if(phase>=manualUntil&&phase-stageAt>=7)selectStage((stage+1)%6)}
    angle+=(angleGoal-angle)*.13;world.rotation.y=angle;
    const elapsed=phase-stageAt;
    const assembled=paused?1:Math.min(1,elapsed/2.7);
    brain.rotation.y=angle*.2+Math.sin(phase*.2)*.14;
    brain.position.y=2.28+(paused?0:Math.sin(phase*.8)*.025);
    beaver.quaternion.copy(camera.quaternion);
    beaver.position.y=(camera.aspect<1?1.78:1.95)+(paused?0:Math.sin(phase*1.1)*.018);
    beaver.rotation.z=paused?0:Math.sin(phase*.65)*.007;
    nodes.forEach(({mesh,target,region,index})=>{
      const current=region===stage;
      const a=current?THREE.MathUtils.smoothstep(assembled, (index%8)/16, .65+(index%8)/24):1;
      mesh.position.lerpVectors(vector(-.85,.02,.8),target,a);
      mesh.scale.setScalar(current?1.6+Math.sin(phase*2+index)*.18:.75);
      mesh.material.color.setHex(current?0xc2f5ff:0x3e7b90);
    });
    folds.forEach((fold,i)=>{fold.material.opacity=.28+(i%6===stage?.5:.12)});
    connections.forEach(c=>c.line.material.opacity=c.region===stage?.65:.12);
    cards.forEach((card,i)=>{card.quaternion.copy(camera.quaternion);card.position.y=cardPositions[i].y+(paused?0:Math.sin(phase*.65+i)*.035)});
    sparks.forEach((spark,i)=>{const k=(phase*.42+i/18)%1;spark.position.copy(toolCurve.getPoint(k));spark.scale.setScalar(.5+Math.sin(k*Math.PI)*.6);spark.visible=!paused});
    beam.material.opacity=paused?.18:.3+Math.sin(phase*2)*.14;
    renderer.render(scene,camera);
    host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.build=assembled.toFixed(2);host.dataset.angle=angle.toFixed(3);
    if(!paused||Math.abs(angleGoal-angle)>.001)request();
  }
  request=()=>{if(!frame&&!failed&&visible&&!document.hidden)frame=requestAnimationFrame(render)};
  motion.addEventListener('click',()=>{paused=!paused;syncButton();request()});
  reduced.addEventListener('change',e=>{paused=e.matches;syncButton();request()});
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=performance.now();request()}else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'40px'}).observe(visual);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{last=performance.now();request()}});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
  document.body.classList.add('has-webgl');selectStage(0);resize();
} catch(error) { fallback(); }
