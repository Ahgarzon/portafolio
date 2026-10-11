// Usage: BORO_NODE_MODULES=<bundled node_modules> node browser-qa.cjs <baseURL> <reportDirectory>
const {createRequire}=require('node:module');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const dependency=process.env.BORO_NODE_MODULES?createRequire(path.join(process.env.BORO_NODE_MODULES,'package.json')):require;
const {chromium}=dependency('playwright');
const sharp=dependency('sharp');
const base=process.argv[2]||'http://127.0.0.1:8771/boroaios/';
const output=process.argv[3]||path.resolve('output/boro-builder-qa');
const report={base,widths:[],errors:[],checks:[],limitations:['Chromium emulation is not a physical iPhone/Safari or GPU performance certification.']};
let browser;
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS '+name)}
async function settle(page){await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto'});await page.locator('.visual').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#scene').dataset.character==='loaded');await page.waitForTimeout(200)}
async function state(page){return page.locator('#scene').evaluate(el=>({...el.dataset}))}
async function changedPixels(a,b){const x=await sharp(a).raw().toBuffer(),y=await sharp(b).raw().toBuffer();let changed=0;for(let i=0;i<x.length;i+=3)if(Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2])>30)changed++;return changed}
(async()=>{await fs.mkdir(output,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});
for(const width of [360,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:width>1000?1000:844},deviceScaleFactor:1,hasTouch:width<800});
  page.on('pageerror',e=>report.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url())});
  await page.goto(base,{waitUntil:'networkidle'});await settle(page);
  await check(width+' autonomous mascot, palm and brain motion',async()=>{
    const a=await state(page),imA=await page.locator('#scene canvas').screenshot();await page.waitForFunction(()=>Number(document.querySelector('#scene').dataset.build)>.2,{},{timeout:30000});
    const b=await state(page),imB=await page.locator('#scene canvas').screenshot();
    assert.notEqual(a.pose,b.pose);assert.notEqual(a.hand,b.hand);assert.notEqual(a.build,b.build);
    const pixels=await changedPixels(imA,imB);assert.ok(pixels>300,'scene pixels change without scrolling');
    report.widths.push({width,pixels,stateA:a,stateB:b});
    await fs.writeFile(path.join(output,'scene-'+width+'-a.png'),imA);await fs.writeFile(path.join(output,'scene-'+width+'-b.png'),imB);
  });
  await check(width+' pause freezes whole scene and resume restarts it',async()=>{
    await page.locator('#motion').click();await page.waitForTimeout(200);const a=await state(page);await page.waitForTimeout(500);const b=await state(page);
    assert.equal(a.frames,b.frames);assert.equal(a.pose,b.pose);assert.equal(a.hand,b.hand);assert.equal(b.status,'paused');
    await page.locator('#motion').click();await page.waitForTimeout(250);assert.ok(Number((await state(page)).frames)>Number(b.frames));
  });
  if(width===1440)await check('drag works while paused without restarting mascot time',async()=>{
    await page.locator('#motion').click();await page.waitForTimeout(200);const a=await state(page),box=await page.locator('#scene canvas').boundingBox();
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.75,box.y+box.height*.5,{steps:8});await page.mouse.up();await page.waitForTimeout(400);
    const b=await state(page);assert.notEqual(a.angle,b.angle);assert.equal(a.pose,b.pose);assert.equal(b.status,'paused');await page.locator('#motion').click();
  });
  await check(width+' six selections, grounded character and updated project copy',async()=>{
    for(let i=0;i<6;i++){
      await page.locator('[data-build="'+i+'"]').click();assert.equal((await state(page)).stage,String(i));
      assert.equal(await page.locator('[data-build="'+i+'"]').getAttribute('aria-pressed'),'true');
    }
    await page.locator('[data-build="1"]').click();assert.match(await page.locator('#capability-result').innerText(),/primera versión/);
    assert.match(await page.locator('.cap-grid article').nth(1).innerText(),/aplicación/);
    assert.ok(!(await page.locator('body').innerText()).includes('De tu idea a una página web.'));
  });
  await check(width+' no overflow at multiple page positions',async()=>{
    for(const selector of ['#inicio','#recorrido','#capacidades','#ejemplos','#planes','#contacto']){
      await page.locator(selector).scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),selector);
    }
  });
  await check(width+' examples, plan and contact only prepare a message',async()=>{
    for(const key of ['web','campana','rutina']){await page.locator('[data-example="'+key+'"]').click();assert.equal(await page.locator('[data-example="'+key+'"]').getAttribute('aria-selected'),'true')}
    await page.locator('[data-example="web"]').click();assert.match(await page.locator('#example-request').innerText(),/aplicación/);
    await page.locator('[data-plan="Personal / Emprendedores"]').click();assert.equal(await page.locator('#plan').inputValue(),'Personal / Emprendedores');
    await page.evaluate(()=>{window.open=url=>{window.__preparedURL=url;return null}});
    await page.locator('#name').fill('Prueba ficticia');await page.locator('#need').fill('Construir una aplicación de ejemplo');await page.locator('#contact-form button[type=submit]').click();
    assert.match(await page.evaluate(()=>window.__preparedURL),/^https:\/\/wa\.me\/573237451221\?text=/);
  });
  if(width===390)await check('mobile menu, touch targets and offscreen suspension',async()=>{
    await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false');
    for(const selector of ['#motion','[data-build="1"]','#menu'])assert.ok((await page.locator(selector).boundingBox()).height>=44);
    await settle(page);await page.locator('#contacto').scrollIntoViewIfNeeded();await page.waitForTimeout(250);const a=await state(page);await page.waitForTimeout(350);assert.equal(a.frames,(await state(page)).frames);
    for(let i=0;i<3;i++){await settle(page);await page.locator('#contacto').scrollIntoViewIfNeeded()}
    await settle(page);const b=await state(page);await page.waitForTimeout(300);assert.ok(Number((await state(page)).frames)>Number(b.frames));
  });
  await settle(page);await page.screenshot({path:path.join(output,'workshop-'+width+'.png')});await page.close();
}
await check('reduced motion is static until explicitly activated',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(base);await settle(p);await p.waitForTimeout(250);const a=await state(p);await p.waitForTimeout(300);assert.equal(a.frames,(await state(p)).frames);assert.equal(a.status,'paused');await p.locator('#motion').click();await p.waitForTimeout(300);assert.equal((await state(p)).status,'animating');await p.close();
});
await check('automatic construction advances through all six chapters',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:1000}});await p.goto(base);await settle(p);const seen=new Set();
 for(let i=0;i<6;i++){await p.waitForFunction(stage=>document.querySelector('#scene').dataset.stage===String(stage),i,{timeout:20000});seen.add((await state(p)).stage)}
 assert.equal(seen.size,6);await p.close();
});
await check('simulated visibility loss stops frames and resumes without time jumps',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base);await settle(p);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
 const a=await state(p);await p.waitForTimeout(350);assert.equal(a.frames,(await state(p)).frames);
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(250);assert.ok(Number((await state(p)).frames)>Number(a.frames));await p.close();
});
await check('original film decodes and old route preserves query and anchor',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base);await p.locator('#boro-film').evaluate(video=>{video.preload='metadata';video.load()});await p.waitForFunction(()=>document.querySelector('#boro-film').readyState>=1);
 const film=await p.locator('#boro-film').evaluate(v=>({duration:v.duration,w:v.videoWidth,h:v.videoHeight}));assert.equal(film.w,1280);assert.equal(film.h,720);assert.ok(film.duration>9&&film.duration<11);
 await p.goto(new URL('../jarvis3d/?test=boro#capacidades',base).href);await p.waitForURL(/\/boroaios\/\?test=boro#capacidades/);await p.close();
});
await check('WebGL context loss is honest and retains the interactive text',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base);await settle(p);await p.locator('#scene canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));assert.ok(await p.locator('.fallback-note').isVisible());assert.equal((await state(p)).status,'static');await p.locator('[data-build="4"]').click();assert.match(await p.locator('#capability-tag').innerText(),/COMPUTADOR/);await p.close();
});
await check('no-WebGL fallback keeps content and all capabilities usable',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args)}});await p.goto(base);await p.locator('.visual').scrollIntoViewIfNeeded();assert.ok(await p.locator('.fallback-note').isVisible());await p.locator('[data-build="1"]').click();assert.match(await p.locator('#capability-result').innerText(),/primera versión/);await p.locator('.visual').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(output,'fallback.png')});await p.close();
});
assert.deepEqual(report.errors,[]);await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log('REPORT '+output);
})().catch(async error=>{console.error(error);report.failure=String(error);await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));process.exitCode=1}).finally(async()=>{await browser?.close()});
