import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/three.module.min.js';
import {createWorkshopPartner} from '../workshop-partner.js';
import {createComputerWorkshop} from '../computer-workshop.js';

test('delivery articulates the visitor and ends at the workstation; boots remain grounded',()=>{
 const p=createWorkshopPartner(),world=new THREE.Group();world.add(p.root,p.transferRoot);world.rotation.y=.7;
 const legPositions=p.root.children.slice(0,4).map(o=>o.position.toArray());p.update(0,0,0,false);const rest=p.arms[0].elbow.rotation.x;
 p.update(1,.5,0,true);assert.notEqual(p.arms[0].elbow.rotation.x,rest);assert.equal(p.transferRoot.children[0].visible,true);assert.ok(p.transferRoot.children[0].position.toArray().every(Number.isFinite));
 p.update(2,1,4,true);assert.equal(p.transferRoot.children[0].visible,false);assert.equal(p.card.visible,false);assert.deepEqual(p.root.children.slice(0,4).map(o=>o.position.toArray()),legPositions);
});
test('each visible construction marker follows its own checklist flag, including uncheck',()=>{
 const s=createComputerWorkshop();s.setChecklist([false,true,false,true]);const markers=s.monitor.children.find(o=>o.isGroup&&o.children.length===4);
 assert.ok(markers);assert.deepEqual(markers.children.map(o=>o.scale.y),[1,1.8,1,1.8]);s.setChecklist([false,false,false,false]);assert.ok(markers.children.every(o=>o.scale.y===1));s.setChecklist(null);assert.equal(markers.visible,false);
});
