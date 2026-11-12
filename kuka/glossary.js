(() => {
 'use strict';
 const panel=document.querySelector('#glossary');
 if(!panel)return;
 panel.addEventListener('toggle',()=>{document.querySelector('.glossary-state').textContent=panel.open?'Ocultar':'Consultar';});
 const search=document.querySelector('#glossary-search'), category=document.querySelector('#glossary-category');
 const rows=[...document.querySelectorAll('#glossary-rows tr')];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const indexed=rows.map(row=>({row,text:normalize(row.textContent+' '+row.dataset.aliases)}));
 function filter(){
  const words=normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  let visible=0;
  indexed.forEach(({row,text})=>{const show=(category.value==='all'||row.dataset.category===category.value)&&words.every(w=>text.includes(w));row.hidden=!show;if(show)visible++;});
  document.querySelector('#glossary-count').textContent='Mostrando '+visible+' de '+rows.length+' conceptos';
  document.querySelector('#glossary-empty').hidden=visible!==0;
 }
 search.addEventListener('input',filter);category.addEventListener('change',filter);
 document.querySelector('#glossary-reset').addEventListener('click',()=>{search.value='';category.value='all';filter();});
 document.querySelector('#glossary-close').addEventListener('click',()=>{panel.open=false;document.querySelector('#glossary-summary').focus();});
 document.querySelectorAll('a[href="#conceptos"]').forEach(a=>a.addEventListener('click',()=>{panel.open=true;}));
 filter();
})();
