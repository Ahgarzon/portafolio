const {createRequire}=require('node:module'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=createRequire(path.join(process.env.BORO_NODE_MODULES,'package.json'))('playwright');
const base=process.argv[2],output=process.argv[3],fixture=process.argv.includes('--fixture');
(async()=>{await fs.mkdir(output,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,fixture,checks:[],eyes:[],errors:[],limitations:['Visual review is required; geometry thresholds do not prove character fidelity.','Chromium does not certify physical Safari.']};
try{
 const p=await browser.newPage({viewport:{width:1100,height:900}});p.on('pageerror',e=>report.errors.push(String(e)));
 if(fixture)await p.route('**/boro-workstation-v6.glb',r=>r.fulfill({path:path.resolve('boroaios/assets/boro-workstation-v7.glb'),contentType:'model/gltf-binary'}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('.visual').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await p.waitForFunction(()=>window.BoroWorkshop,{},{timeout:60000});await p.locator('#motion').click();
 report.eyes=await p.evaluate(()=>{const c=BoroWorkshop,rows=[];c.model.traverse(o=>{if(!/^Boro[ _]blue[ _]eye[ _]globe[ _]/.test(o.name))return;const g=o.geometry;g.computeBoundingBox();rows.push({name:o.name,min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()})});return rows});
 assert.equal(report.eyes.length,2);for(const e of report.eyes){assert.ok(e.max[2]<.423,'eyes must be recessed');assert.ok(e.max[2]-e.min[2]<.04,'no protruding spherical globe');assert.ok(e.max[1]-e.min[1]>.08,'eye remains present and readable')}
 report.checks.push('both eye globes recessed and depth reduced');
 for(const [name,angle] of [['front',-1.18],['three-quarter',-.65],['profile',.42],['opposite',-2.78]]){
  await p.evaluate(a=>{const c=BoroWorkshop;c.sample(4.5);c.world.rotation.y=a;c.scene.updateMatrixWorld(true);c.renderer.render(c.scene,c.camera)},angle);
  await p.locator('#scene canvas').screenshot({path:path.join(output,name+'.png')});
 }
 await p.evaluate(()=>{BoroWorkshop.shop.root.visible=false}); // Inspection only: remove monitor occlusion.
 for(const [name,angle] of [['front-close',-1.18],['three-quarter-close',-.65],['profile-close',.42]]){
  await p.evaluate(a=>{const c=BoroWorkshop,V=c.model.position.constructor;c.sample(4.5);c.world.rotation.y=a;c.scene.updateMatrixWorld(true);const centers=[];c.model.traverse(o=>{if(!/^Boro[ _]blue[ _]eye[ _]globe[ _]/.test(o.name))return;o.skeleton.update();let v=new V();for(let i=0;i<o.geometry.attributes.position.count;i++)v.add(o.localToWorld(o.getVertexPosition(i,new V())));v.multiplyScalar(1/o.geometry.attributes.position.count);centers.push(v)});const target=centers[0].add(centers[1]).multiplyScalar(.5);target.y-=.09;c.camera.position.copy(target).add(new V(0,.04,4));c.camera.lookAt(target);const aspect=c.renderer.domElement.clientWidth/c.renderer.domElement.clientHeight;c.camera.left=-.55*aspect;c.camera.right=.55*aspect;c.camera.top=.55;c.camera.bottom=-.55;c.camera.updateProjectionMatrix();c.renderer.render(c.scene,c.camera)},angle);
  await p.locator('#scene canvas').screenshot({path:path.join(output,name+'.png')});
 }
 assert.deepEqual(report.errors,[]);report.checks.push('all-angle and facial close-up snapshots');report.passed=true;
}finally{await browser.close();await fs.writeFile(path.join(output,'eyes-report.json'),JSON.stringify(report,null,2))}
})().catch(e=>{console.error(e);process.exitCode=1});
