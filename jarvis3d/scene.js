import * as THREE from './assets/three.module.min.js';
const host=document.querySelector('#scene'),visual=document.querySelector('.visual'),motion=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let paused=reduced.matches,visible=false,failed=false,frame=0,phase=0,last=0,stage=0,build=0,angle=0,angleGoal=0,manualUntil=0,renderer;
const captions=['Cada gran proyecto empieza con una pieza.','El contexto conecta las piezas.','Tu idea empieza a tomar forma.'];
function button(){motion.textContent=paused?'Activar movimiento':'Pausar movimiento';motion.setAttribute('aria-pressed',String(paused))}
function fallback(){failed=true;cancelAnimationFrame(frame);document.body.classList.remove('has-webgl');document.querySelector('.fallback-note').hidden=false;host.querySelector('canvas')?.remove();motion.hidden=true}
button();
try {
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,80),world=new THREE.Group();scene.add(world);
 scene.add(new THREE.HemisphereLight(0xc8edff,0x16232e,3));
 const key=new THREE.DirectionalLight(0xf1e4d6,5);key.position.set(-3,7,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.04;scene.add(key);
 const rim=new THREE.DirectionalLight(0x39cfff,4);rim.position.set(3,4,-4);scene.add(rim);
 const fill=new THREE.PointLight(0x54e9ff,24);fill.position.set(3,2,3);scene.add(fill);
 const mat=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const armor=mat(0x344655,.85,.28),silver=mat(0x89949b,.85,.27),dark=mat(0x0c1821,.5,.36),fur=mat(0x66574d,0,.95),furLight=mat(0x9f8d77,0,.9),muzzle=mat(0xc6b6a0,0,.84),black=mat(0x060b10,.2,.27),white=mat(0xfff4dc,0,.22),cyan=new THREE.MeshStandardMaterial({color:0x75f0ff,emissive:0x05b5df,emissiveIntensity:2,metalness:.35,roughness:.25});
 const sphere=new THREE.SphereGeometry(1,24,18),cube=new THREE.BoxGeometry(1,1,1);
 function mesh(g,m,pos,scale,parent=world){const o=new THREE.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 const ball=(m,p,s,parent)=>mesh(sphere,m,p,s,parent);
 const box=(m,p,s,parent)=>mesh(cube,m,p,s,parent);
 function tube(points,r,m,parent=world){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,24,r,6,false),m,[0,0,0],[1,1,1],parent)}
 function ring(radius,r,m,p,rot,parent=world){const o=mesh(new THREE.TorusGeometry(radius,r,8,64),m,p,[1,1,1],parent);o.rotation.set(...rot);return o}
 // A small sculpted robotic beaver, built as an articulated character.
 const boro=new THREE.Group();boro.position.set(-1.05,0,.18);boro.rotation.y=.25;world.add(boro);
 const tail=ball(dark,[0,.65,-.7],[.58,.2,.94],boro);tail.rotation.x=.12;
 for(let i=-3;i<=3;i++){tube([[i*.13,.78,-.65],[i*.15,.78,-1.05],[i*.12,.72,-1.43]],.012,silver,boro)}
 for(let i=0;i<5;i++){tube([[-.4,.78-i*.015,-.65-i*.17],[0,.82-i*.018,-.7-i*.17],[.4,.78-i*.015,-.65-i*.17]],.009,armor,boro)}
 for(const x of [-.36,.36]){
  ball(dark,[x,.3,.17],[.3,.26,.43],boro);ball(silver,[x,.43,.1],[.24,.29,.28],boro);
  ball(armor,[x,.72,.03],[.25,.37,.25],boro);ball(silver,[x,.72,.23],[.2,.21,.10],boro);
  tube([[x-.18,.36,.46],[x,.38,.51],[x+.18,.36,.46]],.018,cyan,boro);
 }
 ball(dark,[0,1.12,0],[.53,.55,.36],boro);ball(armor,[0,1.45,0],[.66,.57,.39],boro);
 const chest=box(silver,[0,1.52,.32],[.7,.55,.14],boro);chest.rotation.z=Math.PI/4;chest.scale.set(.55,.55,.14);
 tube([[-.52,1.73,.25],[0,1.39,.46],[.52,1.73,.25]],.035,silver,boro);
 tube([[-.51,1.5,.32],[0,1.2,.4],[.51,1.5,.32]],.021,cyan,boro);
 tube([[-.4,1.17,.32],[0,.99,.37],[.4,1.17,.32]],.025,silver,boro);
 const arms=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.65,1.66,0);boro.add(arm);arms.push(arm);
  ball(silver,[0,0,0],[.29,.28,.3],arm);ring(.2,.025,cyan,[0,0,.265],[0,0,0],arm);
  ball(armor,[side*.04,-.34,.03],[.21,.3,.22],arm);ball(dark,[side*.08,-.58,.04],[.2,.17,.2],arm);
  ball(silver,[side*.08,-.73,.06],[.23,.23,.24],arm);
  for(let j=0;j<3;j++)ball(dark,[(j-1)*.11+side*.08,-.88,.16],[.062,.13,.09],arm);
  tube([[-.12,-.42,.22],[.02,-.52,.25],[.12,-.65,.23]],.018,cyan,arm);
 }
 const head=new THREE.Group();head.position.set(0,2.22,0);boro.add(head);
 ball(fur,[0,0,0],[.66,.63,.51],head);ball(furLight,[0,-.02,.22],[.59,.48,.41],head);
 for(const side of [-1,1]){ball(fur,[side*.49,.42,-.06],[.22,.23,.16],head);ball(dark,[side*.49,.43,.065],[.13,.14,.055],head)}
 // Cheek and crest tufts provide a deliberate sculpted, rather than photographic, fur style.
 for(let j=0;j<20;j++){
  const a=j/20*Math.PI*2,x=Math.cos(a)*.53,y=Math.sin(a)*.48;
  const tuft=mesh(new THREE.ConeGeometry(.13,.28,5),j%3?fur:furLight,[x,y,-.16],[1,1,.8],head);tuft.rotation.z=a-Math.PI/2;
 }
 for(let j=0;j<5;j++){const t=mesh(new THREE.ConeGeometry(.14,.33,5),furLight,[(j-2)*.15,.56,-.1],[1,1,.7],head);t.rotation.z=-.45}
 for(const side of [-1,1]){
  ball(dark,[side*.27,.08,.46],[.23,.23,.11],head);ball(white,[side*.27,.1,.525],[.17,.17,.065],head);
  ball(cyan,[side*.25,.1,.583],[.095,.11,.03],head);ball(black,[side*.245,.1,.607],[.048,.075,.019],head);ball(white,[side*.22,.14,.626],[.027,.033,.009],head);
  ball(muzzle,[side*.21,-.21,.53],[.28,.22,.24],head);
  for(let i=0;i<3;i++)ball(dark,[side*(.18+i*.07),-.18+(i%2)*.05,.75-i*.025],[.012,.012,.008],head);
  const brow=ball(fur,[side*.28,.3,.47],[.23,.065,.06],head);brow.rotation.z=-side*.14;
  const tooth=box(white,[side*.077,-.44,.66],[.145,.27,.11],head);tooth.rotation.x=-.12;
  // Rounded rectangular glasses with an open lens, preserving the bright eyes.
  tube([[side*.06,.29,.65],[side*.45,.29,.6],[side*.48,.23,.59],[side*.45,-.07,.64],[side*.06,-.07,.69],[side*.04,.05,.69],[side*.06,.29,.65]],.027,dark,head);
  tube([[side*.47,.23,.59],[side*.61,.26,.21],[side*.57,.26,-.2]],.027,dark,head);
  tube([[side*.58,.26,.18],[side*.6,.26,.35]],.022,cyan,head);
 }
 tube([[-.05,.18,.69],[0,.21,.72],[.05,.18,.69]],.025,dark,head);
 ball(black,[0,-.12,.79],[.135,.1,.09],head);ball(silver,[-.035,-.086,.87],[.035,.014,.008],head);
 // Circular workbench and a three-stage architecture assembled at Boro's hand.
 const platform=mesh(new THREE.CylinderGeometry(2.9,3,.14,80),dark,[.15,.02,0],[1,1,1]);
 ring(2.84,.013,cyan,[.15,.11,0],[Math.PI/2,0,0]);
 const gridMat=new THREE.LineBasicMaterial({color:0x345065,transparent:true,opacity:.45});
 for(let i=-5;i<=5;i++){tube([[-2,.102,i*.42],[2.3,.102,i*.42]],.005,gridMat);tube([[i*.42,.102,-2],[i*.42,.102,2]],.005,gridMat)}
 const blocks=[];
 const blocksMat=new THREE.MeshPhysicalMaterial({color:0x41869a,metalness:.55,roughness:.24,transparent:true,opacity:.84,clearcoat:1});
 const targets=[[.82,.39,.35],[1.47,.39,.35],[2.12,.39,.35],[.82,.39,-.3],[1.47,.39,-.3],[2.12,.39,-.3],[.82,1.02,.35],[1.47,1.02,.35],[2.12,1.02,.35],[1.47,1.65,.35],[1.47,1.02,-.3]];
 targets.forEach((p,i)=>{
  const g=new THREE.Group();world.add(g);box(blocksMat,[0,0,0],[.55,.55,.55],g);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.56,.56,.56)),new THREE.LineBasicMaterial({color:0x78ebff,transparent:true,opacity:.7}));g.add(edges);
  const loose=new THREE.Vector3(.6+(i%3)*.7,.42+Math.floor(i/3)*.6,-.4+(i%2)*.5);
  blocks.push({g,target:new THREE.Vector3(...p),loose,index:i});
 });
 const sparks=[];for(let i=0;i<12;i++){const o=ball(cyan,[0,0,0],[.025,.025,.025]);sparks.push(o)}
 const ringTool=ring(.25,.015,cyan,[.1,1.3,.6],[0,0,0]);
 let dragging=false,px=0;
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.isPrimary){dragging=true;px=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)}});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;angleGoal+=(e.clientX-px)*.006;angleGoal=THREE.MathUtils.clamp(angleGoal,-1.2,1.2);px=e.clientX;request()});
 renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
 function selectStage(next){stage=next;document.querySelectorAll('[data-build]').forEach(t=>{const active=Number(t.dataset.build)===stage;t.classList.toggle('active',active);t.setAttribute('aria-pressed',String(active))});document.querySelector('#scene-caption').textContent=captions[stage];if(paused)build=stage}
 document.querySelectorAll('[data-build]').forEach(b=>b.addEventListener('click',()=>{manualUntil=phase+24;selectStage(Number(b.dataset.build));request()}));
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(4.6,3.2,camera.aspect<.9?10.8:8.9);camera.lookAt(.1,1.27,0);camera.updateProjectionMatrix();request()}
 function render(t){frame=0;if(failed||!visible||document.hidden)return;const dt=Math.min((t-last)/1000||.016,.05);last=t;if(!paused){phase+=dt;if(phase> manualUntil){const automatic=Math.floor(phase/6)%3;if(automatic!==stage)selectStage(automatic)}build+=(stage-build)*Math.min(1,dt*3)}angle+=(angleGoal-angle)*.12;world.rotation.y=angle;
  boro.position.y=paused?0:Math.sin(phase*1.8)*.018;head.rotation.y=paused?.07:Math.sin(phase*.6)*.1+.07;
  arms[0].rotation.z=-.12;arms[1].rotation.z=.9+Math.sin(phase*2.5)*.12;arms[1].rotation.x=-.35;arms[0].rotation.x=Math.sin(phase*1.7)*.045;
  blocks.forEach(({g,target,loose,index})=>{const assemble=THREE.MathUtils.smoothstep(build,1,2);g.position.lerpVectors(loose,target,assemble);const active=build<.02?index===0:index<Math.ceil(1+build*5);g.visible=active;g.scale.setScalar(Math.min(1,Math.max(.05,1+build*5-index)));if(build<1.8&&!paused){g.position.y+=Math.sin(phase*1.5+index)*.05;g.rotation.y=Math.sin(phase*.7+index)*.07*(1-assemble)}else g.rotation.y=0;});
  sparks.forEach((o,i)=>{o.visible=stage>0&&!paused;const k=(phase*.4+i/12)%1;o.position.set(.05+k*1.5,1.3+Math.sin(k*Math.PI)*.6,.5+Math.sin(i)*.1);o.scale.setScalar(.015+Math.sin(k*Math.PI)*.018)});
  ringTool.visible=stage>0;ringTool.rotation.z=phase;renderer.render(scene,camera);host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.stage=String(stage);host.dataset.build=build.toFixed(2);if(!paused||Math.abs(angle-angleGoal)>.001)request();
 }
 function request(){if(!frame&&!failed&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
 motion.addEventListener('click',()=>{paused=!paused;button();request()});reduced.addEventListener('change',e=>{paused=e.matches;button();request()});
 new ResizeObserver(resize).observe(host);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=performance.now();request()}else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'60px'}).observe(visual);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{last=performance.now();request()}});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});document.body.classList.add('has-webgl');resize();
} catch(error){fallback()}
