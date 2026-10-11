import test from 'node:test';
import assert from 'node:assert/strict';
import {poseAt, deformPoint, BUILD_SECONDS} from '../character-motion.js';

test('palm moves independently while both boots stay on the ground',()=>{
  const a=poseAt(.2,.2),b=poseAt(3,3);
  const handA=deformPoint(.752,.353,a),handB=deformPoint(.752,.353,b);
  assert.ok(Math.hypot(handA.x-handB.x,handA.y-handB.y)>.08,'deliberate reach is visibly different from the resting pose');
  for(const [x,y] of [[.35,.94],[.60,.91]]){
    const p=deformPoint(x,y,b);assert.ok(Math.hypot(p.x-x,p.y-y)<.00001);
  }
});
test('head, tail and resting arm have independent local motion',()=>{
  const a=poseAt(.1,.1),b=poseAt(3,3);
  for(const [x,y] of [[.46,.07],[.12,.72],[.27,.60]]){
    const p=deformPoint(x,y,a),q=deformPoint(x,y,b);
    assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>.001);
  }
});
test('deterministic pose makes pause a true freeze, not a new pose',()=>{
  assert.deepEqual(poseAt(3.25,3.25),poseAt(3.25,3.25));
  assert.equal(poseAt(3.25,3.25).action,'Construye conexiones');
});
test('all mesh coordinates remain finite through repeated construction cycles',()=>{
  for(let t=0;t<BUILD_SECONDS*4;t+=.13){
    const pose=poseAt(t,t);assert.ok(pose.progress>=0&&pose.progress<=1);
    for(let x=0;x<=1;x+=.05)for(let y=0;y<=1;y+=.05){
      const p=deformPoint(x,y,pose);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      assert.ok(Math.abs(p.x-x)<.15&&Math.abs(p.y-y)<.15);
    }
  }
});
