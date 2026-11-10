import test from 'node:test';
import assert from 'node:assert/strict';
import { CORE_CARDS } from '../src/data/commute.js';
import { SPRINT_STAGES } from '../src/data/sprint.js';

const key = 'sindaewon-quiz:core-sprint:v1';
function storage(entries = []) {
  const map = new Map(entries);
  globalThis.localStorage = { getItem:k=>map.get(k)??null, setItem:(k,v)=>map.set(k,v) };
  return map;
}
test('three stages cover all twelve connections in order without overlap', () => {
  assert.deepEqual(SPRINT_STAGES.flatMap(s=>CORE_CARDS.slice(s.start,s.end)),CORE_CARDS);
});
test('a new round includes previously read cards and resumes independently of free reading', async () => {
  const lifetime = JSON.stringify({ read:CORE_CARDS.map(c=>c.id), saved:[CORE_CARDS[0].id], last:'요한복음' });
  const map = storage([['sindaewon-quiz:commute-reading:v1',lifetime],['sindaewon-quiz:progress','quiz']]);
  const s = await import('../src/storage/sprint.js?new');
  assert.equal(s.getSprint().active,false);
  s.openSprint();
  assert.deepEqual(s.getSprint().read,[]);
  assert.equal(s.getSprint().index,0);
  assert.equal(s.advanceSprint(CORE_CARDS[0].id).accepted,true);
  assert.equal(s.advanceSprint(CORE_CARDS[0].id).accepted,false,'stale callbacks do not advance twice');
  const refreshed = await import('../src/storage/sprint.js?refresh');
  refreshed.openSprint();
  assert.equal(refreshed.getSprint().index,1);
  assert.deepEqual(refreshed.getSprint().read,[CORE_CARDS[0].id]);
  assert.equal(map.get('sindaewon-quiz:commute-reading:v1'),lifetime);
  assert.equal(map.get('sindaewon-quiz:progress'),'quiz');
});
test('previous and rereading do not inflate progress; all twelve explicit acknowledgements are needed', async () => {
  storage();
  const s = await import('../src/storage/sprint.js?round');
  assert.equal(s.advanceSprint(CORE_CARDS[0].id).accepted,false,'opening is required');
  s.openSprint();
  s.advanceSprint(CORE_CARDS[0].id);
  s.previousSprintCard();
  assert.equal(s.getSprint().index,0);
  assert.equal(s.getSprint().read.length,1);
  s.advanceSprint(CORE_CARDS[0].id);
  assert.equal(s.getSprint().read.length,1);
  for (const card of CORE_CARDS.slice(1,-1)) {
    assert.deepEqual(s.advanceSprint(card.id),{accepted:true,completed:false});
  }
  assert.equal(s.sprintComplete(),false);
  assert.deepEqual(s.advanceSprint(CORE_CARDS.at(-1).id),{accepted:true,completed:true});
  assert.deepEqual(s.advanceSprint(CORE_CARDS.at(-1).id),{accepted:false,completed:false});
  s.openSprint();
  assert.equal(s.sprintComplete(),true,'reopening preserves the recap');
});
test('starting another round preserves lifetime reading, bookmarks and legacy quiz records', async () => {
  const records = [['sindaewon-quiz:commute-reading:v1','reading-and-bookmarks'],['sindaewon-quiz:progress','legacy']];
  const map = storage([...records,[key,JSON.stringify({active:true,index:11,read:CORE_CARDS.map(c=>c.id)})]]);
  const s = await import('../src/storage/sprint.js?restart');
  assert.equal(s.sprintComplete(),true);
  s.restartSprint();
  assert.deepEqual(s.getSprint(),{active:true,index:0,read:[]});
  for (const [k,v] of records) assert.equal(map.get(k),v);
});
test('corrupt, incomplete and unavailable storage cannot skip cards or break reading', async () => {
  const map = storage([[key,'{invalid']]);
  const s = await import('../src/storage/sprint.js?damaged');
  assert.deepEqual(s.getSprint(),{active:false,index:0,read:[]});
  map.set(key,JSON.stringify({active:true,index:9999,read:[null,'unknown',CORE_CARDS[0].id,CORE_CARDS[0].id,CORE_CARDS[2].id]}));
  assert.deepEqual(s.getSprint(),{active:true,index:1,read:[CORE_CARDS[0].id]});
  globalThis.localStorage = { getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');} };
  s.openSprint();
  assert.equal(s.sprintSaveFailed(),true);
  assert.equal(s.advanceSprint(CORE_CARDS[0].id).accepted,true);
  assert.equal(s.getSprint().index,1);
  s.restartSprint();
  assert.deepEqual(s.getSprint().read,[]);
});
