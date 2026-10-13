// Shared 2D character. One original RGBA texture, articulated SVG layers.
// No WebGL, microphone, network messages, canvas snapshots or accumulating poses.
let nextId=0;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,Number(x)||0));
export const PUPPET_VERSION='boro-layered-2-20261013';
export function createBoroPuppet(host,{imageURL,mouthImageURL=new URL('boro-layered-mouth-open-v1.png',new URL(imageURL,location.href)).href,bust=false,label='Boro, tu asistente personal'}={}){
 const id='boro-puppet-'+(++nextId),safe=String(imageURL).replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));
 const head='M285 45H742L760 244 737 293 687 334 626 375 572 412 518 435 460 411 405 378 345 340 280 310 260 250Z';
 const left='M114 625 158 607 236 668 231 721 204 797 182 865 161 948 132 993 102 1011 47 983 13 919 31 808 74 709Z';
 const right='M910 625 866 607 788 668 793 721 820 797 842 865 863 948 892 993 922 1011 977 983 1011 919 993 808 950 709Z';
 const use=(attributes='')=>`<use href="#${id}-texture" ${attributes}/>`;
 host.innerHTML=`<svg class="boro-puppet" viewBox="${bust?'210 18 605 700':'0 0 1024 1536'}" role="img" aria-label="${String(label).replace(/["<>]/g,'')}" focusable="false" xmlns="http://www.w3.org/2000/svg">
 <defs><image id="${id}-texture" href="${safe}" width="1024" height="1536"/>
 <clipPath id="${id}-head"><path d="${head}"/></clipPath>
 <clipPath id="${id}-left"><path d="${left}"/></clipPath><clipPath id="${id}-right"><path d="${right}"/></clipPath>
 <radialGradient id="${id}-mouth-edge"><stop offset="0" stop-color="white"/><stop offset=".72" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
 <mask id="${id}-mouth-patch" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect x="416" y="283" width="210" height="115" fill="url(#${id}-mouth-edge)"/></mask>
 <mask id="${id}-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/><path d="${head}" fill="black"/><path d="${left}" fill="black"/><path d="${right}" fill="black"/></mask>
 <clipPath id="${id}-teeth"><path d="M481 273 520 282 559 272 551 319Q540 333 522 330L499 330Q488 328 486 318Z"/></clipPath>
 <clipPath id="${id}-eyeL"><ellipse cx="442" cy="158" rx="23" ry="23"/></clipPath><clipPath id="${id}-eyeR"><ellipse cx="600" cy="158" rx="23" ry="23"/></clipPath>
 </defs>
 <g data-part="torso">${use(`mask="url(#${id}-body)"`)}</g>
 <g data-part="joints" opacity="0"><ellipse cx="180" cy="652" rx="48" ry="40" fill="#171b20"/><ellipse cx="844" cy="652" rx="48" ry="40" fill="#171b20"/></g>
 <g data-part="left">${use(`clip-path="url(#${id}-left)"`)}</g><g data-part="right">${use(`clip-path="url(#${id}-right)"`)}</g>
 <g data-part="head">${use(`clip-path="url(#${id}-head)"`)}
 <g data-part="mouth" opacity="0" mask="url(#${id}-mouth-patch)"><g data-part="jaw"><image href="${String(mouthImageURL).replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]))}" width="1024" height="1536"/></g></g>
 ${use(`clip-path="url(#${id}-teeth)"`)}
 <g data-part="blink" opacity="0"><g clip-path="url(#${id}-eyeL)">${use('transform="translate(0 33)"')}<path d="M424 163Q442 173 460 162" stroke="#352b27" stroke-width="3" fill="none"/></g><g clip-path="url(#${id}-eyeR)">${use('transform="translate(0 33)"')}<path d="M582 163Q600 173 618 162" stroke="#352b27" stroke-width="3" fill="none"/></g></g>
 </g></svg>`;
 const svg=host.querySelector('svg'),parts=Object.fromEntries([...svg.querySelectorAll('[data-part]')].map(e=>[e.dataset.part,e]));
 let active=true,pose={mouth:0,blink:0,right:0,left:0,head:0};
 const ready=Promise.all([imageURL,mouthImageURL].map(url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('Character texture unavailable'));img.src=url;}))).then(()=>{host.dataset.character='ready';}).catch(e=>{host.dataset.character='failed';throw e;});
 function render(time,{mouth=0,state='idle',gesture='',gestureTime=0,still=false,gaze=0}={}){
  if(!active)return;const t=Math.max(0,Number(time)||0),g=clamp((still&&gesture==='greet'?1.2:gestureTime)/2.8),wave=gesture==='greet'&&g<1?Math.sin(Math.PI*g):0;
  const working=state==='working'||gesture==='build',breath=still?0:Math.sin(t*1.6)*1.3;
  const right=wave*(-83+Math.sin(g*28)*10)+(working?-18-Math.sin(t*5)*2:still?0:Math.sin(t*.7)*.65);
  const left=working?20+Math.sin(t*5+1.5)*2:still?0:-Math.sin(t*.7)*.65;
  const headAngle=clamp(gaze,-1,1)*2+(still?0:Math.sin(t*.45)*.38)+wave*-2;
  const cycle=t%5.3,blink=still?0:cycle>4.95&&cycle<5.15?Math.sin((cycle-4.95)/.2*Math.PI):0;
  const open=clamp(mouth);parts.head.setAttribute('transform',`translate(0 ${breath}) rotate(${headAngle} 518 414)`);
  parts.left.setAttribute('transform',`rotate(${left} 180 652)`);parts.right.setAttribute('transform',`rotate(${right} 844 652)`);
  parts.joints.setAttribute('opacity',Math.abs(right)>4||Math.abs(left)>4?'1':'0');
  parts.blink.setAttribute('opacity',blink>.35?String(blink):'0');parts.mouth.setAttribute('opacity',open>.035?String(Math.min(1,open*6)):'0');
  const jawScale=.72+.28*Math.pow(open,.65);
  parts.jaw.setAttribute('transform',`translate(0 276) scale(1 ${jawScale}) translate(0 -276)`);
  pose={mouth:open,blink,right,left,head:headAngle};host.dataset.mouth=open.toFixed(3);host.dataset.pose=JSON.stringify(pose);host.dataset.state=state;
 }
 render(0,{still:true});
 return {ready,svg,render,snapshot:()=>({...pose,version:PUPPET_VERSION}),dispose(){active=false;host.replaceChildren();}};
}
