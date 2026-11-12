(() => {
 'use strict';
 const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
 const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
 const safeSet = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
 const theme = $('#theme');
 function setTheme(dark) { document.body.classList.toggle('dark',dark); theme.textContent=dark?'Modo claro':'Modo oscuro'; theme.setAttribute('aria-label',dark?'Cambiar a modo claro':'Cambiar a modo oscuro'); safeSet('kuka-lab-theme',dark?'dark':'light'); }
 setTheme(safeGet('kuka-lab-theme')==='dark'); theme.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark')));

 const layerData = [
  ['Unity: intención y visualización','Aquí están los modelos, sliders y secuencias de la celda. Conviene separar lo que el usuario solicita de la posición que realmente devuelve el equipo. La escena puede funcionar en un PC diferente al de control.'],
  ['RosBridge y ROS2: intercambio de mensajes','El cliente de Unity intercambia JSON por WebSocket con RosBridge. Dentro de ROS2 Humble, los nodos usan interfaces y nombres acordados. El servidor RosBridge pertenece al dominio DDS; un cliente WebSocket de Unity no necesita ser un nodo DDS.'],
  ['Driver: el adaptador específico de KUKA','Recibe consignas y lee el estado mediante la interfaz externa que admita ese controlador. Hay que comprobar familia, firmware, opciones y rama Humble. RosBridge no reemplaza este driver y el URDF no crea la conexión física.'],
  ['Controlador y brazo: ejecución y estado','El controlador ejecuta únicamente con las condiciones de habilitación y seguridad previstas. Sus mediciones regresan por driver, estado ROS2 y puente hasta Unity. La realimentación del mapa es un retorno lógico por esa cadena, no un socket directo de Unity a los motores.']
 ];
 $('#layers').innerHTML=layerData.map((x,i)=>`<button data-layer="${i}" class="${i===0?'selected':''}" aria-pressed="${i===0}"><span>0${i+1}</span><strong>${['Interfaz Unity','RosBridge / ROS2','Driver KUKA','Controlador / robot'][i]}</strong></button>`).join('');
 function showLayer(i) { $$('#layers button').forEach((b,n)=>{b.classList.toggle('selected',n===i);b.setAttribute('aria-pressed',String(n===i));}); $('#layer-detail').innerHTML=`<h3>${layerData[i][0]}</h3><p>${layerData[i][1]}</p>`; }
 $$('#layers button').forEach(b=>b.addEventListener('click',()=>showLayer(Number(b.dataset.layer)))); showLayer(0);

 const mapTabs=$$('[data-map]');
 function fitMap(frame) {try {if(frame.closest('[hidden]'))return;const doc=frame.contentDocument;if(doc&&doc.documentElement.scrollHeight>frame.clientHeight+2)frame.style.height=doc.documentElement.scrollHeight+'px';}catch{}}
 $$('.map-panel iframe').forEach(frame=>{frame.addEventListener('load',()=>{fitMap(frame);frame.contentDocument?.fonts?.ready.then(()=>fitMap(frame));});});
 function selectMap(kind,focus=false) { mapTabs.forEach(b=>{let yes=b.dataset.map===kind;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;if(yes&&focus)b.focus();}); ['simple','tecnico','archivos'].forEach(k=>{$('#map-'+k).hidden=k!==kind;});const frame=$('#map-'+kind+' iframe');if(frame.dataset.src&&!frame.getAttribute('src'))frame.src=frame.dataset.src;requestAnimationFrame(()=>fitMap(frame));$('#open-map').href='mapas/'+kind+'.html'; }
 mapTabs.forEach((b,i)=>{b.addEventListener('click',()=>selectMap(b.dataset.map));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectMap((e.key==='Home'||e.key==='End')?(e.key==='Home'?'simple':'archivos'):mapTabs[(i+(e.key==='ArrowLeft'?mapTabs.length-1:1))%mapTabs.length].dataset.map,true);}});});
 const modal=$('#scene-dialog'); $('#open-scene').addEventListener('click',()=>modal.showModal());$('#close-scene').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});

 const initialRobots=[{ip:'192.168.50.11',ns:'/kuka1',domain:30},{ip:'192.168.50.12',ns:'/kuka2',domain:30},{ip:'192.168.50.13',ns:'/kuka3',domain:30}];
 $('#robot-config').innerHTML=initialRobots.map((r,i)=>`<div class="robot-row"><div class="robot-name">KUKA ${i+1}<span>Instancia de ejemplo</span></div><div class="row-grid"><label class="field">IP del controlador<input id="ip-${i}" value="${r.ip}" inputmode="decimal" spellcheck="false" autocomplete="off"></label><label class="field">Namespace ROS<input id="ns-${i}" value="${r.ns}" spellcheck="false" autocomplete="off"></label><label class="field">Dominio driver<input id="domain-${i}" type="number" value="${r.domain}" min="0" max="101"></label></div></div>`).join('');
 let selectedRobot=0, cursor=-1;
 const stepLabels=['Unity expresa el objetivo','RosBridge recibe el mensaje','Los nodos se encuentran por DDS','El adaptador dirige la tarea','El backend prepara la ejecución','El extremo de control recibe la orden','El estado regresa a Unity'];
 function ipv4(v) {const a=v.trim().split('.');if(a.length!==4||a.some(n=>!/^\d{1,3}$/.test(n)||Number(n)>255))return null;return a.map(Number);}
 const sameIP=(a,b)=>a&&b&&a.every((n,i)=>n===b[i]);
 const domainOK=v=>Number.isInteger(Number(v))&&String(v).trim()!==''&&Number(v)>=0&&Number(v)<=101;
 function configuration() {return {pc:$('#pc-ip').value,domain:$('#ros-domain').value,bridge:$('#bridge-on').checked,backend:$('#backend').value,driver:$('#driver-ready').value,enabled:$('#enable-motion').checked,robots:initialRobots.map((_,i)=>({ip:$('#ip-'+i).value,ns:$('#ns-'+i).value.trim(),domain:$('#domain-'+i).value}))};}
 function diagnose(c) {
   const issues=[];const add=(robot,step,text)=>issues.push({robot,step,text});const pc=ipv4(c.pc);
   if(!c.bridge)add(-1,1,'RosBridge está apagado: el cliente de Unity no tiene ese punto de entrada.');
   if(!domainOK(c.domain))add(-1,2,'Elige un dominio entero entre 0 y 101 para este experimento conservador.');
   if(!pc)add(-1,5,'La IP del PC no tiene un formato IPv4 válido para el ejemplo.');
   c.robots.forEach((r,i)=>{
     const label='KUKA '+(i+1),ip=ipv4(r.ip);
     if(!domainOK(r.domain))add(i,2,label+': elige un dominio entero entre 0 y 101 para este experimento.');
     else if(domainOK(c.domain)&&Number(r.domain)!==Number(c.domain))add(i,2,label+': su driver está en otro dominio. No hay comunicación DDS directa con el coordinador sin un puente deliberado.');
     if(!/^\/[A-Za-z_][A-Za-z0-9_]*(\/[A-Za-z_][A-Za-z0-9_]*)*$/.test(r.ns))add(i,3,label+': usa un namespace como /kuka'+(i+1)+' en este ejemplo.');
     if(c.robots.some((other,j)=>j!==i&&Number(other.domain)===Number(r.domain)&&other.ns===r.ns))add(i,3,label+': el namespace se repite dentro del mismo dominio. En este diseño las rutas de órdenes deben distinguir cada robot.');
     if(!ip)add(i,5,label+': la dirección no tiene formato IPv4 válido.');
     else {
       if(pc&&sameIP(pc,ip))add(i,5,label+': PC y controlador repiten IP. Deben ser direcciones distintas.');
       if(pc&&!ip.slice(0,3).every((n,k)=>n===pc[k]))add(i,5,label+': está en otra subred /24 del ejemplo. Aquí no se ha modelado un router entre redes.');
       if(c.robots.some((other,j)=>j!==i&&sameIP(ip,ipv4(other.ip))))add(i,5,label+': otro controlador repite esa IP.');
       if(ip[3]===0||ip[3]===255)add(i,5,label+': en esta subred /24, termina la IP con un host entre 1 y 254.');
     }
   });
   if(c.backend==='hardware'&&c.driver!=='example')add(-1,4,'Hardware hipotético: falta confirmar driver, firmware e interfaz externa. Poner la IP no resuelve esa compatibilidad.');
   if(c.backend==='hardware'&&!c.enabled)add(-1,5,'Hardware hipotético: falta la habilitación prevista por el controlador. Una interfaz visual no sustituye esa condición.');
   return issues;
 }
 function robotIssues(issues) {return issues.filter(e=>e.robot===-1||e.robot===selectedRobot).sort((a,b)=>a.step-b.step);}
 function renderTrace(issues) {const first=robotIssues(issues)[0];$('#trace').innerHTML=stepLabels.map((s,i)=>`<li class="${i<cursor?'done ':''}${i===cursor?'current ':''}${i===cursor&&first&&first.step===i?'blocked':''}"><span class="step-dot">${i<cursor?'✓':i+1}</span><span>${s}</span></li>`).join('');}
 function refresh(reset=true) {
   if(reset){cursor=-1;$('#next-step').disabled=true;$('#next-step').textContent='Siguiente paso';$('#walk').disabled=false;$('#trace-note').textContent='Elige un escenario y recorre la ida y la vuelta de una orden.';}
   const c=configuration(),issues=diagnose(c),relevant=robotIssues(issues);
   let title=issues.length?'Hay condiciones pendientes':'Valores coherentes en el ejemplo';
   let message=issues.length?'Revisa estas condiciones antes de interpretar el recorrido.':'No se detectan contradicciones en los campos modelados. Esto no demuestra conexión física ni configuración completa de ROS2.';
   if(!relevant.length&&issues.length)message='El recorrido elegido tiene valores coherentes; otros equipos de la celda conservan condiciones pendientes.';
   $('#lab-status').innerHTML=`<div class="lab-state ${issues.length?'error':''}"><strong>${title}</strong><p>${message}</p>${issues.length?'<ul>'+issues.map(e=>'<li>'+e.text+'</li>').join('')+'</ul>':''}</div>`;
   $$('[data-robot]').forEach((b,i)=>{b.classList.toggle('selected',i===selectedRobot);b.setAttribute('aria-pressed',String(i===selectedRobot));});
   const r=c.robots[selectedRobot];$('#config-code').textContent='# Consultas ilustrativas; no envían movimiento\nsource /opt/ros/humble/setup.bash\nexport ROS_DOMAIN_ID='+c.domain+'\nros2 node list\nros2 action list -t\nros2 topic info '+r.ns+'/joint_states -v\n# El driver seleccionado declara dominio '+r.domain+'\n# Rutas propuestas: adaptar al driver real';
   renderTrace(issues);return {c,issues};
 }
 function advance() {
   const {c,issues}=refresh(false),r=c.robots[selectedRobot],bad=robotIssues(issues)[0];
   cursor=Math.min(cursor+1,6); renderTrace(issues);
   const notes=[
    'Objetivo didáctico dirigido a KUKA '+(selectedRobot+1)+'. No se envía ningún mensaje externo.',
    'El cliente usaría JSON sobre WebSocket hacia RosBridge. Este puerto de aplicación es distinto de los puertos del protocolo KUKA.',
    'En el ejemplo, RosBridge y los procesos que se comunican directamente usan el dominio '+c.domain+'. Unity por WebSocket no tiene que participar en DDS.',
    'La tarea se dirige a '+r.ns+'. Un adaptador debe mapearla a la interfaz del driver. Un nombre absoluto global como /Move requiere revisión antes de replicar.',
    c.backend==='sim'?'El backend elegido es simulación. Un plan virtual no acredita que un KUKA real pueda ejecutar esa orden.':'Se supone compatibilidad confirmada sólo para continuar el ejemplo. El modelo no ha comprobado opciones, firmware ni un driver físico.',
    c.backend==='sim'?'La orden alcanza el extremo virtual del ejemplo. Todavía no hay comunicación con un controlador físico.':'El ejemplo supone un controlador habilitado y una red coherente. La habilitación real y la seguridad se verifican en el laboratorio.',
    'La respuesta vuelve por la cadena inversa: extremo de control, driver, estado ROS2, RosBridge y Unity. En esta página es un recorrido lógico, sin mediciones ni movimiento reales.'
   ];
   const stop=bad&&cursor===bad.step;
   $('#trace-note').textContent=stop?'Recorrido detenido en el modelo. '+bad.text:notes[cursor];
   $('#walk').disabled=true;$('#next-step').disabled=Boolean(stop)||cursor===6;
   if(stop)$('#next-step').textContent='Revisa la condición indicada'; else if(cursor===6)$('#next-step').textContent='Recorrido completado';
 }
 function defaults() {$('#pc-ip').value='192.168.50.20';$('#ros-domain').value=30;$('#bridge-on').checked=true;$('#backend').value='sim';$('#driver-ready').value='unknown';$('#enable-motion').checked=false;initialRobots.forEach((r,i)=>{$('#ip-'+i).value=r.ip;$('#ns-'+i).value=r.ns;$('#domain-'+i).value=r.domain;});}
 function applyScenario() {defaults();selectedRobot=0;switch($('#scenario').value){case'domain':$('#domain-1').value=31;selectedRobot=1;break;case'ip':$('#pc-ip').value='192.168.50.11';break;case'namespace':$('#ns-1').value='/kuka1';selectedRobot=1;break;case'bridge':$('#bridge-on').checked=false;break;case'subnet':$('#ip-2').value='192.168.60.13';selectedRobot=2;break;case'hardware':$('#backend').value='hardware';break;}refresh();}
 $('#scenario').addEventListener('change',applyScenario);$('#reset-lab').addEventListener('click',()=>{$('#scenario').value='ok';defaults();selectedRobot=0;refresh();});
 $$('.lab-config input,.lab-config select:not(#scenario)').forEach(el=>el.addEventListener('input',()=>refresh()));
 $$('[data-robot]').forEach(b=>b.addEventListener('click',()=>{selectedRobot=Number(b.dataset.robot);refresh();}));
 $('#walk').addEventListener('click',()=>{cursor=-1;advance();});$('#next-step').addEventListener('click',advance);
 $('#copy-config').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#config-code').textContent);$('#copy-config').textContent='Copiado';setTimeout(()=>$('#copy-config').textContent='Copiar',1800);}catch{$('#copy-config').textContent='Selecciona y copia el texto';}});
 refresh();

 const controllerInfo={
  unknown:['PUNTO DE PARTIDA','Identificar antes de elegir','El nombre KUKA y el modelo visual no bastan. Para la fase física se necesitan modelo, controlador, sistema operativo, versión y opciones instaladas. Hoy se puede avanzar en el diseño virtual sin esos datos.'],
  kss:['RUTA CONDICIONADA','KSS: revisar RSI y la combinación exacta','La documentación comunitaria de Kroshu incluye una ruta RSI para KSS y combina, según configuración, EKI o mxAutomation para gestión de arranque/estado. Hay combinaciones ensayadas concretas; no es garantía para cualquier KR C o versión de KSS.'],
  iiqka:['SOPORTE OFICIAL ACOTADO','iiQKA.OS2 y RSI','La organización oficial kuka-ros documenta soporte para iiQKA.OS2 con RSI 6.0.0 o superior. Hay que seguir el setup del SDK, comprobar la rama Humble, el modelo y las opciones. El paquete de simulación de REZ3LIET no incorpora esa puesta en marcha.'],
  sunrise:['OTRA FAMILIA, OTRA RUTA','Sunrise / LBR: revisar FRI','Para sistemas Sunrise existe una ruta comunitaria basada en FRI. No se debe aplicar automáticamente la configuración de RSI para KSS. Se necesita la versión exacta del controlador y comprobar el soporte de esa combinación.']
 };
 function showController(){const d=controllerInfo[$('#controller-family').value];$('#controller-info').innerHTML=`<span class="support-tag">${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p>`;}
 $('#controller-family').addEventListener('change',showController);showController();

 const routeData=[
  ['Separar la interfaz del backend','Conservar modelos, sliders y tareas de Unity, pero definir un contrato de órdenes y estado por equipo. Distinguir siempre simulación de hardware.','Un objetivo dirigido a un solo robot y un estado de respuesta con origen explícito.'],
  ['Identificar el equipo y escoger el driver','Inventariar modelo, controlador, firmware, interfaces y opciones. Para esta guía, mantener Ubuntu 22.04 y ramas compatibles con ROS2 Humble.','Una combinación documentada y un plan de configuración y respaldo del controlador.'],
  ['Leer el estado de un robot real','Preparar la red y la interfaz externa. Comprobar que las posiciones vienen del equipo, no de Gazebo o de un backend mock.','Articulaciones y estado medidos con marcas de tiempo y fallos observables.'],
  ['Validar un movimiento individual','Con personal responsable en el laboratorio, utilizar un objetivo pequeño autorizado y condiciones de habilitación y parada física disponibles.','Aceptación, ejecución y finalización verificadas; reacción a desconexión definida.'],
  ['Conectar Unity a esa ruta validada','Adaptar el cliente al contrato del robot. Alinear articulaciones, unidades, TF, referencias base/herramienta, QoS y reloj real.','Ida y vuelta desde Unity y recuperación sin reproducir órdenes antiguas.'],
  ['Ampliar y coordinar la celda','Replicar con nombres y endpoints propios; después incorporar SCORBOT y banda con sus adaptadores, señales y referencias comunes.','Una orden no alcanza otro brazo. Se verifican dependencias, zonas compartidas y fallos.']
 ];
 let marks=[];try{const saved=JSON.parse(safeGet('kuka-lab-route')||'[]');if(Array.isArray(saved))marks=saved.filter(n=>Number.isInteger(n)&&n>=0&&n<6);}catch{}
 $('#route-list').innerHTML=routeData.map((r,i)=>`<article class="route-item"><span>0${i+1}</span><div><details${i===0?' open':''}><summary>${r[0]}</summary><p>${r[1]}</p><p class="evidence-line"><strong>Qué evidencia buscar:</strong> ${r[2]}</p></details><label class="toggle-row"><input type="checkbox" data-route="${i}" ${marks.includes(i)?'checked':''}><span>Incluir en mi preparación · no acredita una prueba realizada</span></label></div></article>`).join('');
 function progress(){const checks=$$('[data-route]:checked'),n=checks.length;$('#progress-number').textContent=n+' / 6';$('#progress').value=n;$('#progress-copy').textContent=n===6?'Las seis etapas quedaron marcadas para preparar. La validación real necesita evidencias del laboratorio.':n+' de 6 etapas marcadas para preparar; ninguna prueba física se certifica aquí.';safeSet('kuka-lab-route',JSON.stringify(checks.map(x=>Number(x.dataset.route))));}
 $$('[data-route]').forEach(x=>x.addEventListener('change',progress));$('#reset-route').addEventListener('click',()=>{$$('[data-route]').forEach(x=>x.checked=false);progress();});progress();
 $('#print-guide').addEventListener('click',()=>{const details=$$('details');const prev=details.map(d=>d.open);details.forEach(d=>d.open=true);const restore=()=>{details.forEach((d,i)=>d.open=prev[i]);window.removeEventListener('afterprint',restore);};window.addEventListener('afterprint',restore);window.print();});
 document.documentElement.dataset.ready='true';
})();
