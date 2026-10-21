// Static candidate or explicit read-only public QA. No microphone/authenticated API.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root=fileURLToPath(new URL('../../',import.meta.url));
const output=process.argv[2];
const publicMode=process.env.BORO_VOICE_PUBLIC_QA==='1';
if(!output || !process.env.BORO_PLAYWRIGHT_MODULES) throw Error('Provide a fresh output directory and existing BORO_PLAYWRIGHT_MODULES');
await fs.mkdir(output); // Never overwrite a prior run's receipt.
const {chromium}=createRequire(path.join(process.env.BORO_PLAYWRIGHT_MODULES,'package.json'))('playwright');
const report={checks:[],limits:['Real prerecorded MP3 playback and decoded envelope in local Chromium, not acoustic speaker identity or a physical iPhone/Safari test.','Visibility-change event is synthetic; offscreen scrolling, audio decoding and playback are real.','No microphone, authenticated Boro API, model inference, customer data or production publication.']};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try {
  const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(!name.startsWith('/boroaios/')) {res.writeHead(404).end();return;}
  const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(path.join(root,'boroaios')+path.sep)) {res.writeHead(403).end();return;}
  const bytes=await fs.readFile(file);
  res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','content-length':bytes.length,'cache-control':'no-store'});
  res.end(bytes);
 } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=publicMode?'https://angelszs.site':`http://127.0.0.1:${server.address().port}`;
report.origin=origin;
report.scope=publicMode?'Read-only published Boro introduction, no private API or deployment.':'Isolated local static candidate.';
let browser;
async function check(name,fn){const details=await fn();report.checks.push({name,passed:true,...details});console.log('PASS '+name);}
async function pageFor(viewport,{noWebGL=false}={}) {
 const context=await browser.newContext({viewport,hasTouch:viewport.width<800});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))requests.push(r.url());});
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  return url.origin===origin&&url.pathname.startsWith('/boroaios/')&&['GET','HEAD'].includes(route.request().method())?route.continue():route.abort();
 });
 await page.addInitScript(({noWebGL})=>{
  window.__micCalls=0;window.__qaHidden=false;
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__qaHidden});
  if(navigator.mediaDevices) navigator.mediaDevices.getUserMedia=async()=>{window.__micCalls++;throw Error('microphone forbidden by local QA');};
  if(noWebGL){const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};}
 },{noWebGL});
 await page.goto(origin+'/boroaios/');
 await page.waitForFunction(()=>window.BoroWorkshop && document.querySelector('#scene').getAttribute('aria-busy')==='false');
 return {page,context,errors,requests};
}
const playing=()=>{const a=BoroWorkshop.audio;return !a.paused&&a.readyState>=2&&a.currentTime>.1;};
const stopped=()=>BoroWorkshop.audio.paused&&Number(document.querySelector('#scene').dataset.mouth)===0;
try {
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 report.browserVersion=browser.version();
 for(const width of [360,1440]) {
  const {page,context,errors,requests}=await pageFor({width,height:width<800?844:1000});
  await check(width+' keeps layout and waits for an explicit audio gesture',async()=>{
   assert.equal(await page.evaluate(()=>BoroWorkshop.audio.paused),true);
   assert.equal(requests.length,0);
   assert.equal(await page.evaluate(()=>window.__micCalls),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);
   assert.match(await page.locator('footer').innerText(),/Voz generada por IA · Supertonic 3 M1/);
   assert.deepEqual(errors,[]);
  });
  await check(width+' plays the existing exact M1 MP3 and drives the mouth from decoded audio',async()=>{
   await page.locator('#listen-boro').click();
   await page.waitForFunction(playing);
   await page.waitForFunction(()=>document.querySelector('#scene').dataset.lipSource==='decoded-audio-envelope'&&Number(document.querySelector('#scene').dataset.mouth)>.03);
   const audio=await page.evaluate(()=>({src:BoroWorkshop.audio.currentSrc,duration:BoroWorkshop.audio.duration,time:BoroWorkshop.audio.currentTime}));
   assert.ok(audio.src.endsWith('/assets/boro-intro-es-supertonic-m1.mp3'));
   assert.ok(Number.isFinite(audio.duration)&&audio.duration>1);
   assert.ok(requests.length>0&&requests.every(url=>url.endsWith('/assets/boro-intro-es-supertonic-m1.mp3')));
   await page.screenshot({path:path.join(output,`m1-${width}.png`)});
   return {duration:audio.duration,observedPlaybackTime:audio.time};
  });
  await check(width+' stop and mute close the mouth without a second voice or microphone',async()=>{
   await page.locator('#listen-boro').click();await page.waitForFunction(stopped);
   const position=await page.evaluate(()=>BoroWorkshop.audio.currentTime);await page.waitForTimeout(250);
   assert.equal(await page.evaluate(()=>BoroWorkshop.audio.currentTime),position);
   await page.locator('#listen-boro').click();await page.waitForFunction(playing);
   await page.evaluate(()=>BoroWorkshop.audio.muted=true);
   await page.waitForFunction(()=>Number(document.querySelector('#scene').dataset.mouth)===0);
   await page.evaluate(()=>{BoroWorkshop.audio.pause();BoroWorkshop.audio.muted=false;});
   assert.equal(await page.evaluate(()=>window.__micCalls),0);
  });
  await check(width+' offscreen stops actual playback and return does not auto-resume',async()=>{
   await page.locator('#listen-boro').click();await page.waitForFunction(playing);
   await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForFunction(stopped);
   await page.locator('#listen-boro').scrollIntoViewIfNeeded();await page.waitForTimeout(350);
   assert.equal(await page.evaluate(()=>BoroWorkshop.audio.paused),true);
  });
  await check(width+' synthetic hide during a new play request prevents later revival',async()=>{
   await page.evaluate(()=>{document.querySelector('#listen-boro').click();window.__qaHidden=true;document.dispatchEvent(new Event('visibilitychange'));});
   await page.waitForFunction(stopped);
   await page.evaluate(()=>{window.__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});
   await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>BoroWorkshop.audio.paused),true);
   assert.equal(await page.evaluate(()=>window.__micCalls),0);assert.deepEqual(errors,[]);
  });
  await context.close();
 }
 const fallback=await pageFor({width:390,height:844},{noWebGL:true});
 await check('without WebGL the unchanged character and real M1 voice remain usable',async()=>{
  await fallback.page.waitForFunction(()=>document.querySelector('#scene').dataset.computer==='static');
  await fallback.page.locator('#listen-boro').click();await fallback.page.waitForFunction(playing);
  await fallback.page.waitForFunction(()=>Number(document.querySelector('#scene').dataset.mouth)>.03);
  await fallback.page.locator('#listen-boro').click();await fallback.page.waitForFunction(stopped);
  assert.deepEqual(fallback.errors,[]);
 });
 await check('the complete real introduction ends once and does not restart',async()=>{
  await fallback.page.evaluate(()=>{window.__completePlays=0;BoroWorkshop.audio.addEventListener('playing',()=>window.__completePlays++);});
  await fallback.page.locator('#listen-boro').click();await fallback.page.waitForFunction(playing);
  await fallback.page.waitForFunction(()=>BoroWorkshop.audio.ended&&Number(document.querySelector('#scene').dataset.mouth)===0,null,{timeout:25000});
  assert.equal(await fallback.page.locator('#listen-boro').innerText(),'Escuchar a Boro');
  await fallback.page.waitForTimeout(500);
  assert.equal(await fallback.page.evaluate(()=>window.__completePlays),1);
  assert.equal(await fallback.page.evaluate(()=>BoroWorkshop.audio.paused),true);
  return {duration:await fallback.page.evaluate(()=>BoroWorkshop.audio.duration),completePlayback:true};
 });
 await check('legacy scene voice uses the same M1 asset and stop never reopens playback',async()=>{
  await fallback.page.evaluate(async()=>{
   const {createSceneVoice}=await import('/boroaios/scene-voice.js?v=voice-supertonic3-m1-20261020');
   const button=document.createElement('button');button.id='legacy-voice-probe';button.textContent='Legacy voice probe';document.body.append(button);
   window.__legacyVoice=createSceneVoice({button,request(){},feedback(){}});
  });
  await fallback.page.locator('#legacy-voice-probe').click();
  await fallback.page.waitForFunction(()=>!__legacyVoice.audio.paused&&__legacyVoice.audio.currentTime>.1);
  assert.ok((await fallback.page.evaluate(()=>__legacyVoice.audio.currentSrc)).endsWith('/assets/boro-intro-es-supertonic-m1.mp3'));
  await fallback.page.evaluate(()=>__legacyVoice.stop());await fallback.page.waitForTimeout(500);
  assert.equal(await fallback.page.evaluate(()=>__legacyVoice.audio.paused),true);
  assert.equal(await fallback.page.evaluate(()=>window.__micCalls),0);
 });
 await fallback.context.close();report.passed=true;
} catch(error) {report.passed=false;report.failure=String(error.stack||error);throw error;}
finally {await browser?.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
