import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const root=new URL('../',import.meta.url),name='boro-intro-es-supertonic-m1';
const read=path=>fs.readFile(new URL(path,root),'utf8');

test('both public scene entry points use the same verified Supertonic3 M1 introduction',async()=>{
 for(const file of ['layered-workstation.js','scene-voice.js']) {
  const source=await read(file);
  assert.ok(source.includes('./assets/'+name+'.mp3'),file);
  assert.ok(!source.includes('boro-intro-es-mx-20261014.mp3'),file);
  assert.doesNotMatch(source,/speechSynthesis|getUserMedia|MediaRecorder/);
 }
});

test('existing M1 provenance binds exact MP3 bytes, model revision and distinct licenses',async()=>{
 const bytes=await fs.readFile(new URL('assets/'+name+'.mp3',root));
 const p=JSON.parse(await read('assets/'+name+'.provenance.json'));
 assert.equal(bytes.length,147689);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'27121fdee856506f08b47a048eaa9f47d3771ab40e9cefb0c44add0b0b576b6b');
 assert.equal(p.sha256,crypto.createHash('sha256').update(bytes).digest('hex'));
 assert.equal(p.engine,'supertonic3-M1');
 assert.equal(p.voice,'M1');assert.equal(p.language,'es');
 assert.equal(p.revision,'724fb5abbf5502583fb520898d45929e62f02c0b');
 assert.equal(p.generatedWithAI,true);assert.equal(p.modelLicense,'OpenRAIL-M');assert.equal(p.sdkLicense,'MIT');
 assert.match(await read('assets/Supertonic-LICENSE.txt'),/BigScience Open RAIL-M License/);
});

test('HTML credits and every importing entry point invalidate the old Mexican-voice module cache',async()=>{
 const html=await read('index.html');
 assert.ok(html.includes('assets/Supertonic-LICENSE.txt'));
 assert.ok(html.includes('Voz generada por IA · Supertonic 3 M1'));
 assert.ok(html.includes('layered-workstation.js?v=voice-supertonic3-m1-20261020'));
 assert.ok(!html.includes('Español de México'));
 assert.ok((await read('workstation-scene.js')).includes('scene-voice.js?v=voice-supertonic3-m1-20261020'));
});

test('older comparison catalogs are retained as dated history, not the current voice policy',async()=>{
 const catalog=await read('voces/index.html'),viable=await read('voces-viables/index.html');
 assert.ok(catalog.includes('Catálogo histórico del 16 de octubre de 2026'));
 assert.ok(viable.includes('Resultados históricos del 16 de octubre de 2026'));
 assert.ok(!catalog.includes('La voz que Boro usa hoy'));
 assert.ok(!viable.includes('Claude actual'));
 assert.equal((catalog.match(/<audio /g)||[]).length,6);
 assert.equal((viable.match(/<audio /g)||[]).length,3);
});
