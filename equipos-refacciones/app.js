'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const state={families:[],category:'',query:'',application:'',sort:'catalog',quote:[]};
const storageKey='equipos-refacciones-selection-v1';
let toastTimer;
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function showDialog(id){const d=$('#'+id);if(!d.open)d.showModal()}
function closeDialog(id){const d=$('#'+id);if(d.open)d.close()}
function family(id){return state.families.find(p=>p.id===id)}
function models(p){return p.models?.length?p.models:p.codes}
function saveQuote(){try{sessionStorage.setItem(storageKey,JSON.stringify(state.quote))}catch{}document.querySelectorAll('.count').forEach(n=>n.textContent=state.quote.reduce((sum,item)=>sum+item.qty,0))}
function addToQuote(id,code,qty=1){
  const p=family(id);if(!p)throw new Error('Familia no encontrada.');
  if(!Number.isInteger(qty)||qty<1||qty>999)throw new Error('La cantidad debe ser un número entero entre 1 y 999.');
  if(!models(p).includes(code)&&code!=='Por definir')throw new Error('Código no encontrado en esta familia.');
  const same=state.quote.find(i=>i.id===id&&i.code===code);
  if(same&&same.qty+qty>999)throw new Error('La cantidad máxima por referencia es 999.');
  if(same)same.qty+=qty;else state.quote.push({id,code,qty});saveQuote();renderQuote();notify(`${code} agregado a tu cotización`);
  return {code,quantity:same?same.qty:qty,lines:state.quote.length};
}
function filterFamilies(query=state.query,category=state.category,application=state.application){
  const words=norm(query).trim().split(/\s+/).filter(Boolean);
  const list=state.families.filter(p=>(!category||p.category===category)&&(!application||p.application===application)&&words.every(w=>norm([p.title,p.category,p.description,p.sourceText,...p.codes].join(' ')).includes(w)));
  if(state.sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));return list;
}
function renderCategories(){const categories=[...new Set(state.families.map(p=>p.category))];$('#categories').innerHTML=['',...categories].map(c=>`<button data-category="${esc(c)}" class="${state.category===c?'active':''}" aria-pressed="${state.category===c}">${c?esc(c):'Todos los equipos'}</button>`).join('')}
function renderCatalog(){
  const list=filterFamilies();$('#results').textContent=`${list.length} ${list.length===1?'familia':'familias'} · ${state.families.length} en el catálogo`;
  $('#clear-filters').hidden=!(state.query||state.category||state.application);$('#product-grid').setAttribute('aria-busy','false');
  $('#product-grid').innerHTML=list.length?list.map(p=>{
    const codes=models(p);return `<article class="product-card"><button class="product-photo" data-detail="${p.id}" aria-label="Ver ${esc(p.title)}"><span class="photo-tag">${p.application.toUpperCase()}</span><img src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy" width="240" height="155"></button><div class="card-content"><p class="card-category">${esc(p.category)}</p><h3>${esc(p.title)}</h3><div class="card-specs">${p.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div><p class="card-code">${esc(codes[0]||'Consultar modelos')} ${codes.length>1?`· ${codes.length} referencias`:''}</p><div class="card-bottom"><button class="text-link" data-detail="${p.id}">Ver ficha</button><button class="add-family" data-detail="${p.id}">Cotizar</button></div></div></article>`;
  }).join(''):`<div class="empty"><h3>No encontramos equipos con esos filtros.</h3><p>Prueba con un código, una palabra más corta o explora todo el catálogo.</p><button class="button dark" data-reset>Ver todo el catálogo</button></div>`;renderCategories();
}
function resetFilters(){state.query='';state.category='';state.application='';$('#search').value='';$('#application').value='';renderCatalog()}
function openProduct(id){
 const p=family(id);if(!p)return;const codes=models(p);const query=norm(state.query);const match=codes.find(c=>query&&norm(c).includes(query));
 $('#product-detail').innerHTML=`<div class="detail-grid"><div><button class="detail-image-button" data-image="${p.images[0]}" data-alt="${esc(p.title)}" aria-label="Ampliar imagen de ${esc(p.title)}"><img id="detail-main-image" class="detail-main-image" src="${p.images[0]}" alt="${esc(p.title)}"></button><div class="detail-gallery">${p.images.map((image,index)=>`<button data-gallery="${image}" aria-label="Ver imagen ${index+1}"><img src="${image}" alt="" loading="lazy"></button>`).join('')}</div></div><div class="detail-copy"><p class="card-category">${esc(p.category)} · ${p.application}</p><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><div class="detail-specs">${p.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div><label class="detail-select" for="model-select">Selecciona la referencia<select id="model-select">${(codes.length?codes:['Por definir']).map(c=>`<option ${c===match?'selected':''}>${esc(c)}</option>`).join('')}</select></label><button class="button dark" id="add-selected" data-family="${p.id}">Agregar a cotización</button><p class="form-note">Precio y disponibilidad a cotizar. Confirma la compatibilidad en la ficha original.</p></div></div><div class="detail-docs"><details open><summary>Ficha técnica original · Página ${p.page}</summary><p class="source-caption">Capacidades, conexiones, materiales y condiciones de operación del catálogo VDE, septiembre de 2026.</p><button class="technical-scan" data-image="${p.scan}" data-alt="Ficha técnica original, página ${p.page}" aria-label="Ampliar ficha técnica"><img src="${p.scan}" alt="Ficha técnica original de ${esc(p.title)}, página ${p.page}" loading="lazy"></button><a class="text-link" href="assets/catalogo-tratamiento-agua-septiembre-2026.pdf#page=${p.page}" target="_blank" rel="noopener">Abrir página ${p.page} en el PDF</a></details></div>`;showDialog('product-dialog');
}
function renderQuote(){
 $('#quote-items').innerHTML=state.quote.length?state.quote.map((item,index)=>{const p=family(item.id);return `<div class="quote-row"><img src="${p.images[0]}" alt=""><div class="quote-row-info"><h3>${esc(p.title)}</h3><p>${esc(item.code)}</p></div><label><span class="sr-only">Cantidad de ${esc(item.code)}</span><input type="number" min="1" max="999" step="1" value="${item.qty}" data-quantity="${index}" aria-label="Cantidad de ${esc(item.code)}"></label><button class="remove-item" data-remove="${index}" aria-label="Quitar ${esc(item.code)}">×</button></div>`}).join(''):`<div class="empty"><h3>Tu lista está lista para empezar.</h3><p>Agrega equipos desde el catálogo y elige sus referencias.</p><button class="button dark" data-browse>Explorar catálogo</button></div>`;
 $('#quote-form').hidden=!state.quote.length;$('#quote-feedback').textContent='';
}
function openQuote(){renderQuote();showDialog('quote-dialog')}
function requestText(){
 const form=$('#quote-form');if(!state.quote.length)throw Error('Agrega al menos una referencia.');if(!form.reportValidity())return null;
 const d=new FormData(form);const lines=['SOLICITUD DE COTIZACIÓN','Equipos y Refacciones · Tratamiento de Agua','',`Nombre: ${String(d.get('name')).trim()}`,`Empresa: ${String(d.get('company')).trim()||'No indicada'}`,`Correo: ${String(d.get('email')).trim()}`,`Teléfono: ${String(d.get('phone')).trim()||'No indicado'}`,`Ciudad / estado: ${String(d.get('city')).trim()}`,'','EQUIPOS Y REFACCIONES'];
 state.quote.forEach((item,index)=>{const p=family(item.id);lines.push(`${index+1}. ${p.title}`,`   Referencia: ${item.code} | Cantidad: ${item.qty}`,`   Ficha: catálogo septiembre 2026, página ${p.page}`)});
 lines.push('','NOTAS DEL PROYECTO',String(d.get('notes')).trim()||'Sin notas adicionales.','','Solicito precio, disponibilidad, plazo de entrega y condiciones de compra.','Esta solicitud no confirma una compra ni un pago.');return lines.join('\n');
}
function downloadRequest(){const text=requestText();if(text===null)return;const blob=new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='solicitud-cotizacion-equipos.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#quote-feedback').textContent='Solicitud descargada. Puedes compartir el archivo con el vendedor. No se ha enviado automáticamente.'}
async function copyRequest(){const text=requestText();if(text===null)return;try{await navigator.clipboard.writeText(text);$('#quote-feedback').textContent='Solicitud copiada. Pégala en el chat o correo del vendedor para compartirla.'}catch{const a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.left='-9999px';$('#quote-form').append(a);a.select();const ok=document.execCommand('copy');a.remove();$('#quote-feedback').textContent=ok?'Solicitud copiada. Compártela con el vendedor.':'No pudimos copiar la lista. Usa Descargar solicitud.'}}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.classList.contains('quote-trigger'))openQuote();if(b.dataset.close)closeDialog(b.dataset.close);if(b.dataset.detail)openProduct(b.dataset.detail);
 if('category'in b.dataset){state.category=b.dataset.category;renderCatalog()}
 if('application'in b.dataset){state.application=b.dataset.application;$('#application').value=state.application;state.category='';state.query='';$('#search').value='';renderCatalog();$('#catalogo').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 if('reset'in b.dataset)resetFilters();if('browse'in b.dataset){closeDialog('quote-dialog');$('#catalogo').scrollIntoView()}
 if(b.id==='add-selected'){try{addToQuote(b.dataset.family,$('#model-select').value)}catch(err){notify(err.message)}}
 if('remove'in b.dataset){const i=Number(b.dataset.remove);if(Number.isInteger(i)&&i>=0&&i<state.quote.length){state.quote.splice(i,1);saveQuote();renderQuote()}}
 if(b.dataset.gallery){$('#detail-main-image').src=b.dataset.gallery;$('.detail-image-button').dataset.image=b.dataset.gallery}
 if(b.dataset.image){$('#full-image').src=b.dataset.image;$('#full-image').alt=b.dataset.alt||'';showDialog('image-dialog')}
});
document.addEventListener('change',e=>{if('quantity'in e.target.dataset){const i=Number(e.target.dataset.quantity);const value=Number(e.target.value);if(!Number.isInteger(value)||value<1||value>999){e.target.value=state.quote[i].qty;notify('Usa una cantidad entera entre 1 y 999.');return}state.quote[i].qty=value;saveQuote()}});
$('#search').addEventListener('input',e=>{state.query=e.target.value;renderCatalog()});$('#application').addEventListener('change',e=>{state.application=e.target.value;renderCatalog()});$('#sort').addEventListener('change',e=>{state.sort=e.target.value;renderCatalog()});$('#clear-filters').addEventListener('click',resetFilters);
$('#quote-form').addEventListener('submit',e=>{e.preventDefault();try{downloadRequest()}catch(err){$('#quote-feedback').textContent=err.message}});$('#copy-quote').addEventListener('click',()=>copyRequest());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#search').focus()}});
const whatsapp=window.SITE_CONFIG?.whatsapp;if(typeof whatsapp==='string'&&/^\d{10,15}$/.test(whatsapp)){$('#whatsapp-quote').disabled=false;$('#contact-note').textContent='WhatsApp abrirá un borrador con tu solicitud. Revísalo y pulsa Enviar para compartirlo.';$('#whatsapp-quote').addEventListener('click',()=>{const text=requestText();if(text!==null)window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')})}
function registerAgentTools(){
 const ctx=document.modelContext;if(!ctx?.registerTool)return;const lifecycle=new AbortController();
 const tools=[
 {name:'search_equipment_catalog',title:'Buscar equipos',description:'Busca referencias del catálogo y devuelve familias, códigos y página técnica; no envía datos.',inputSchema:{type:'object',properties:{query:{type:'string'},category:{type:'string'},application:{type:'string'}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Object.values(input).some(x=>typeof x!=='string'))throw Error('Los filtros deben ser texto.');return {results:filterFamilies(input.query||'',input.category||'',input.application||'').map(p=>({id:p.id,title:p.title,codes:models(p),page:p.page}))}}},
 {name:'stage_equipment_quote',title:'Agregar equipos a la lista',description:'Agrega referencias y cantidades a la lista local de cotización y abre la lista; no realiza compras ni envía solicitudes.',inputSchema:{type:'object',properties:{items:{type:'array',minItems:1,items:{type:'object',properties:{familyId:{type:'string'},code:{type:'string'},quantity:{type:'integer',minimum:1,maximum:999}},required:['familyId','code','quantity'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!Array.isArray(input?.items)||!input.items.length||input.items.length>100)throw Error('Indica entre 1 y 100 referencias.');const staged=JSON.parse(JSON.stringify(state.quote));for(const item of input.items){const p=family(item.familyId);if(!p||!models(p).includes(item.code)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>999)throw Error('Referencia o cantidad no válida.');const same=staged.find(i=>i.id===p.id&&i.code===item.code);if(same){if(same.qty+item.quantity>999)throw Error('Cantidad máxima excedida.');same.qty+=item.quantity}else staged.push({id:p.id,code:item.code,qty:item.quantity})}state.quote=staged;saveQuote();openQuote();return {lines:state.quote.length,items:state.quote.map(i=>({familyId:i.id,code:i.code,quantity:i.qty})),status:'prepared_locally'}}}
 ];for(const tool of tools){try{Promise.resolve(ctx.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
$('#year').textContent=new Date().getFullYear();$('#product-grid').innerHTML=Array.from({length:8},()=>'<div class="loading-card" aria-hidden="true"></div>').join('');
fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json()}).then(data=>{
 state.families=data.families;$('#model-count').textContent=data.modelCount;
 try{const stored=JSON.parse(sessionStorage.getItem(storageKey)||'[]');if(Array.isArray(stored))state.quote=stored.filter(i=>{const p=family(i?.id);return p&&(models(p).includes(i.code)||i.code==='Por definir')&&Number.isInteger(i.qty)&&i.qty>=1&&i.qty<=999}).slice(0,300)}catch{}
 saveQuote();renderCatalog();renderQuote();registerAgentTools();
}).catch(()=>{$('#catalog-error').hidden=false;$('#results').textContent='Catálogo no disponible';$('#product-grid').innerHTML='';$('#product-grid').setAttribute('aria-busy','false')});
