import {attachMouth} from './native-mouth.js?v=constructor11-20261012';
import {samplesToEnvelope,envelopeAt} from './speech-envelope.js?v=constructor11-20261012';
// A public, generated introduction only. Never records/requests a microphone.
export function createSceneVoice({button,request,feedback}){
 const audio=new Audio(new URL('./assets/boro-intro-es-mx-20261014.mp3',import.meta.url).href);audio.preload='none';let mouth,envelope,open=0,decoding=false;
 const sync=()=>{const playing=!audio.paused&&!audio.ended;button.textContent=playing?'Detener voz':'Escuchar a Boro';button.setAttribute('aria-pressed',String(playing));request()};
 for(const event of ['playing','pause','ended','timeupdate'])audio.addEventListener(event,sync);
 audio.addEventListener('error',()=>{feedback('No pude reproducir la muestra de voz. La animación sigue disponible.');sync()});
 async function decode(){if(envelope||decoding)return;decoding=true;try{const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)return;const bytes=await fetch(audio.src).then(r=>{if(!r.ok)throw Error('sample');return r.arrayBuffer()}),context=new Offline(1,1,16000),decoded=await context.decodeAudioData(bytes);envelope=samplesToEnvelope(decoded.getChannelData(0),decoded.sampleRate)}catch{}finally{decoding=false}}
 button.addEventListener('click',()=>{if(!audio.paused&&!audio.ended){audio.pause();return}audio.currentTime=0;audio.play().then(()=>{feedback('Esta es la voz de Boro. Para conversar, abre Boro AIOS.');decode()}).catch(()=>feedback('Pulsa de nuevo para permitir el audio en tu navegador.'))});
 return {audio,bind(model){mouth=model?attachMouth(model):null;open=0},stop(){audio.pause();open=0;mouth?.set(0);sync()},update(){const active=!audio.paused&&!audio.ended&&!audio.muted&&audio.readyState>=2,target=active?(envelope?envelopeAt(envelope,audio.currentTime):Math.max(0,.35+Math.sin(audio.currentTime*20)*.25)):0;open+=(target-open)*.55;mouth?.set(open);return {active,open,source:envelope?'decoded-audio-envelope':'playback-clock'}},get active(){return !audio.paused&&!audio.ended}};
}
