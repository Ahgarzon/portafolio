(() => {
  const buttons=[...document.querySelectorAll('[data-audience]')];
  const variants=[...document.querySelectorAll('[data-audience-view]')];
  function setAudience(view,updateUrl=false){
    const audience=view==='perfil'?'perfil':'negocio';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.audience===audience)));
    variants.forEach(element=>{element.hidden=element.dataset.audienceView!==audience;});
    if(updateUrl){
      const url=new URL(location.href);
      if(audience==='perfil')url.searchParams.set('enfoque','perfil');else url.searchParams.delete('enfoque');
      history.replaceState(null,'',url.pathname+url.search+url.hash);
    }
  }
  buttons.forEach(button=>button.addEventListener('click',()=>setAudience(button.dataset.audience,true)));
  setAudience(new URL(location.href).searchParams.get('enfoque'));
  addEventListener('popstate',()=>setAudience(new URL(location.href).searchParams.get('enfoque')));

  const video=document.getElementById('angelReel');
  const control=document.querySelector('.reel-sound');
  if(!video||!control)return;
  function label(){
    const english=document.documentElement.lang==='en';
    const text=video.paused?(english?'▶ Watch demo':'▶ Ver demo'):(video.muted?(english?'🔇 Sound':'🔇 Sonido'):(english?'🔊 Sound':'🔊 Sonido'));
    control.textContent=text;
    control.setAttribute('aria-label',video.paused?(english?'Play Jarvis demo':'Reproducir demostración de Jarvis'):(video.muted?(english?'Enable sound':'Activar sonido'):(english?'Mute video':'Silenciar video')));
  }
  control.addEventListener('click',async()=>{
    if(video.paused){video.muted=false;try{await video.play();}catch{label();return;}}
    else video.muted=!video.muted;
    label();
  });
  ['play','pause','volumechange','ended'].forEach(event=>video.addEventListener(event,label));
  new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  label();
})();
