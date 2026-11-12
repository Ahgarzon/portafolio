(() => {
 'use strict';
 const player=document.querySelector('#guide-video'), toggle=document.querySelector('#video-toggle'), feedback=document.querySelector('#video-feedback');
 if(!player||!toggle)return;
 function reflect(){toggle.textContent=player.paused?'Reproducir video':'Pausar video';}
 toggle.addEventListener('click',async()=>{
  feedback.textContent='';
  if(player.paused){try{await player.play();}catch{feedback.textContent='No se pudo iniciar el video. Prueba los controles del reproductor o el enlace para abrirlo.';}}
  else player.pause();
 });
 player.addEventListener('play',reflect);player.addEventListener('pause',reflect);player.addEventListener('ended',reflect);
 player.addEventListener('error',()=>{feedback.textContent='No se pudo cargar el video. Puedes usar el enlace para abrirlo en otra pestaña.';});
 reflect();
})();
