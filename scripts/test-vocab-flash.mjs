import test from 'node:test';
import assert from 'node:assert/strict';
import { FLASH_WORDS, FLASH_UNITS, phaseDuration } from '../src/data/vocab-flash.js';
import { createFlashClock } from '../src/lib/flash-clock.js';

const key = 'sindaewon-quiz:vocab-flash:v1';
function storage(entries = []) {
  const map = new Map(entries);
  globalThis.localStorage = { getItem:k=>map.get(k)??null, setItem:(k,v)=>map.set(k,v) };
  return map;
}
test('thirty ten-word units preserve all 300 words, meanings and examples in order', () => {
  assert.equal(FLASH_WORDS.length,300);
  assert.equal(FLASH_UNITS.length,30);
  assert.deepEqual(FLASH_UNITS.flatMap(unit=>unit.words),FLASH_WORDS);
  assert.equal(new Set(FLASH_WORDS.map(w=>w.no)).size,300);
  for (const unit of FLASH_UNITS) {
    assert.equal(unit.words.length,10);
    assert.ok(unit.theme);
    for (const word of unit.words) assert.ok(word.word && word.meaning && word.example);
  }
});
test('exposure is recorded only on reveal; interrupted rounds resume without affecting graded learning', async () => {
  const records = [['sindaewon-quiz:vocab-cards','original-srs'],['sindaewon-quiz:commute-reading:v1','original-reading'],['sindaewon-quiz:progress','original-quiz']];
  const map = storage(records);
  const s = await import('../src/storage/vocab-flash.js?resume');
  s.startFlash();
  assert.deepEqual(s.getFlash().seen,[]);
  assert.equal(s.advanceFlash(1),false);
  assert.equal(s.revealFlash(1),true);
  assert.equal(s.revealFlash(1),false);
  assert.equal(s.advanceFlash(1),true);
  assert.equal(s.advanceFlash(1),false);
  s.revealFlash(2);
  s.flashSpeed(5);
  const reloaded = await import('../src/storage/vocab-flash.js?reloaded');
  assert.equal(reloaded.getFlash().run.index,1);
  assert.equal(reloaded.getFlash().run.phase,'meaning');
  assert.equal(reloaded.getFlash().speed,5);
  assert.equal('playing' in reloaded.getFlash(),false);
  s.previousFlash(); s.revealFlash(1);
  assert.deepEqual(s.getFlash().seen,[1,2]);
  for (const [k,v] of records) assert.equal(map.get(k),v);
});
test('a round ends only after the last answer; repeat retains exposure but resets round position', async () => {
  storage();
  const s = await import('../src/storage/vocab-flash.js?complete');
  s.startFlash(29);
  for (const word of FLASH_UNITS[29].words) {
    assert.equal(s.getFlash().run.done,false);
    assert.equal(s.advanceFlash(word.no),false);
    s.revealFlash(word.no);
    assert.equal(s.getFlash().run.done,false);
    s.advanceFlash(word.no);
  }
  assert.equal(s.getFlash().run.done,true);
  assert.equal(s.advanceFlash(300),false);
  assert.equal(s.revealFlash(300),false);
  s.repeatFlash();
  assert.equal(s.getFlash().run.index,0);
  assert.equal(s.getFlash().run.phase,'word');
  assert.equal(s.getFlash().run.done,false);
  assert.deepEqual(s.getFlash().run.viewed,[]);
  assert.equal(s.getFlash().seen.length,10);
});
test('review membership stays fixed while marks change, and an empty review does not erase a round', async () => {
  storage();
  const s = await import('../src/storage/vocab-flash.js?review');
  s.startFlash(5);
  const original=s.getFlash().run;
  s.startFlash(5,true);
  assert.deepEqual(s.getFlash().run,original);
  s.markFlash(1);s.markFlash(300);
  s.startFlash(5,true);
  s.markFlash(1);s.markFlash(300);
  assert.deepEqual(s.getFlash().marked,[]);
  assert.deepEqual(s.getFlash().run.ids,[1,300]);
  s.revealFlash(1);s.advanceFlash(1);s.revealFlash(300);s.advanceFlash(300);
  s.repeatFlash();
  assert.equal(s.getFlash().run.kind,'review');
  assert.deepEqual(s.getFlash().run.ids,[1,300]);
  assert.equal(s.getFlash().run.index,0);
  s.startFlash(6);
  assert.deepEqual(s.getFlash().seen,[1,300]);
  assert.equal(s.getFlash().unit,6);
});
test('corrupt storage is constrained; denied storage still permits a full round in memory', async () => {
  const map=storage([[key,'{broken']]);
  const s=await import('../src/storage/vocab-flash.js?corrupt');
  assert.equal(s.getFlash().run,null);
  map.set(key,JSON.stringify({unit:999,speed:0,marked:[1,1,null,301],run:{kind:'review',ids:[1,1,300,999],index:999,phase:'meaning',done:true,viewed:[1]}}));
  assert.equal(s.getFlash().unit,0);
  assert.equal(s.getFlash().speed,3);
  assert.deepEqual(s.getFlash().marked,[1]);
  assert.deepEqual(s.getFlash().run.ids,[1,300]);
  assert.equal(s.getFlash().run.index,1);
  assert.equal(s.getFlash().run.phase,'word');
  assert.equal(s.getFlash().run.done,false);
  map.set(key,JSON.stringify({run:{kind:'unit',unit:0,index:9,viewed:[1,10],phase:'meaning',done:true}}));
  assert.equal(s.getFlash().run.index,1,'damaged progress returns to the first unanswered word');
  assert.equal(s.getFlash().run.done,false);
  globalThis.localStorage={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}};
  s.startFlash();
  assert.equal(s.flashSaveFailed(),true);
  for (const word of FLASH_UNITS[0].words) { s.revealFlash(word.no);s.advanceFlash(word.no); }
  assert.equal(s.getFlash().run.done,true);
});
test('every speed gives the answer one extra second', () => {
  for(const seconds of [2,3,5]) {
    assert.equal(phaseDuration('word',seconds),seconds*1000);
    assert.equal(phaseDuration('meaning',seconds),(seconds+1)*1000);
  }
  assert.equal(phaseDuration('meaning',999),4000);
});
test('pause, replacement and disposal reject already queued timer callbacks', () => {
  const callbacks=[];const cancelled=[];let calls=0;
  const clock=createFlashClock(()=>calls++,{schedule:(fn,ms)=>{callbacks.push({fn,ms});return callbacks.length-1;},cancel:id=>cancelled.push(id)});
  clock.start(3000);clock.start(4000);
  callbacks[0].fn();assert.equal(calls,0);
  assert.deepEqual(cancelled,[0]);
  callbacks[1].fn();assert.equal(calls,1);
  clock.start(2000);clock.stop();callbacks[2].fn();assert.equal(calls,1);
  clock.start(5000);clock.dispose();callbacks[3].fn();assert.equal(calls,1);
  clock.start(3000);assert.equal(callbacks.length,4);
});
