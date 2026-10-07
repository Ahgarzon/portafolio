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
})();
