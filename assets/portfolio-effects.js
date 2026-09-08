(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(pointer: coarse)');
  const nav=document.getElementById('nav'),bar=document.getElementById('bar');
  let scrollFrame=0;
  function progress(){
    scrollFrame=0;nav.classList.toggle('scrolled',scrollY>40);
    const root=document.documentElement,max=root.scrollHeight-root.clientHeight;
    bar.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(progress);},{passive:true});
  progress();
  const glow=document.getElementById('glow');
  if(!mobile.matches&&!reduced.matches){
    let frame=0,px=0,py=0;
    addEventListener('mousemove',event=>{px=event.clientX;py=event.clientY;if(!frame)frame=requestAnimationFrame(()=>{frame=0;glow.style.opacity=1;glow.style.left=px+'px';glow.style.top=py+'px';});},{passive:true});
    addEventListener('mouseleave',()=>glow.style.opacity=0);
  }
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}
    }),{threshold:.1});
    document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
    const counters=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const element=entry.target,end=+element.dataset.count,pre=element.dataset.pre||'',suffix=element.dataset.suf||'';
      counters.unobserve(element);
      if(reduced.matches){element.textContent=pre+end+suffix;return;}
      let start;
      function step(now){start??=now;const p=Math.min((now-start)/1100,1);element.textContent=pre+Math.round((1-Math.pow(1-p,3))*end)+suffix;if(p<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    }),{threshold:.6});
    document.querySelectorAll('[data-count]').forEach(element=>counters.observe(element));
  }else{
    document.querySelectorAll('.reveal').forEach(element=>element.classList.add('in'));
    document.querySelectorAll('[data-count]').forEach(element=>{element.textContent=(element.dataset.pre||'')+element.dataset.count+(element.dataset.suf||'');});
  }
  // Same colored constellation, bounded work and no background loop on touch devices.
  const canvas=document.getElementById('net'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  let width,height,dpr,points=[],mx=-999,my=-999,animation=0,last=0;
  function staticMode(){return mobile.matches||reduced.matches;}
  function paint(move){
    ctx.clearRect(0,0,width,height);
    const link=150*dpr,link2=link*link;
    for(const p of points){if(move){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>width)p.vx*=-1;if(p.y<0||p.y>height)p.vy*=-1;}}
    for(let i=0;i<points.length;i++){
      const a=points[i];
      for(let j=i+1;j<points.length;j++){
        const b=points[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
        if(d2<link2){ctx.strokeStyle='rgba(120,150,255,'+(1-Math.sqrt(d2)/link)*.5+')';ctx.lineWidth=dpr*.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      const distance=Math.hypot(a.x-mx,a.y-my);
      if(distance<200*dpr){ctx.strokeStyle='rgba(53,226,255,'+(1-distance/(200*dpr))*.9+')';ctx.lineWidth=dpr*.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mx,my);ctx.stroke();}
      ctx.beginPath();ctx.arc(a.x,a.y,dpr*1.5,0,7);ctx.fillStyle='rgba(160,185,255,.85)';ctx.fill();
    }
  }
  function draw(now){animation=0;if(document.hidden||staticMode())return;if(now-last>=1000/30){paint(true);last=now;}animation=requestAnimationFrame(draw);}
  function sync(){if(animation)cancelAnimationFrame(animation);animation=0;if(!document.hidden&&!staticMode())animation=requestAnimationFrame(draw);else if(!document.hidden)paint(false);}
  function resize(){
    dpr=Math.min(devicePixelRatio||1,staticMode()?1:1.5);width=canvas.width=innerWidth*dpr;height=canvas.height=innerHeight*dpr;
    const count=Math.max(12,Math.min(staticMode()?24:64,Math.floor(innerWidth*innerHeight/16000)));
    points=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.44*dpr,vy:(Math.random()-.5)*.44*dpr}));
    paint(false);sync();
  }
  let resizeFrame=0;
  addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;resize();});},{passive:true});
  if(!mobile.matches){addEventListener('mousemove',event=>{mx=event.clientX*dpr;my=event.clientY*dpr;},{passive:true});addEventListener('mouseleave',()=>{mx=my=-999;});}
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',resize);mobile.addEventListener('change',resize);
  resize();
})();
