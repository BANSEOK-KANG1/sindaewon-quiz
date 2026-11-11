import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIBLE_VISUALS, VISUAL_BY_CARD, visualStep, visualCaption, visualFrame, moveVisualStep } from '../src/data/bible-visuals.js';
import { CORE_CARDS } from '../src/data/commute.js';
import { renderBibleVisual, visualThumbnail } from '../src/lib/bible-visual.js';

test('twelve original learning cards retain their identities, references and caption mappings',()=>{
 assert.equal(BIBLE_VISUALS.length,12);
 assert.deepEqual(BIBLE_VISUALS.map(v=>v.cardId),CORE_CARDS.map(c=>c.id));
 assert.equal(new Set(BIBLE_VISUALS.map(v=>v.image)).size,12);
 for(const v of BIBLE_VISUALS){
  assert.ok(v.title&&v.note&&v.reference&&v.sources.length);
  assert.equal(v.frames.length,v.steps.length);
  assert.equal(v.looks.length,v.steps.length);
  assert.ok(v.looks.every(look=>typeof look==='string'&&look.length>10));
  v.steps.forEach((caption,i)=>{
   assert.equal(visualStep(v,i),i);
   assert.equal(visualCaption(v,i),caption);
  });
  for(const source of v.sources)assert.equal(new URL(source.url).protocol,'https:');
 }
});
test('every artwork is a real local 1536 by 1024 PNG rather than a missing placeholder',()=>{
 for(const v of BIBLE_VISUALS){
  const bytes=readFileSync(new URL(`../public/${v.image}`,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',v.slug);
  assert.equal(bytes.readUInt32BE(16),v.width,v.slug);
  assert.equal(bytes.readUInt32BE(20),v.height,v.slug);
  assert.ok(bytes.length>100000,v.slug);
 }
});
test('every selected scene stays within the picture and invalid selections restore the overview',()=>{
 for(const v of BIBLE_VISUALS){
  for(const bad of [-1,NaN,99,'0',1.5]){
   assert.equal(visualStep(v,bad),-1);
   assert.deepEqual(visualFrame(v,bad),[0,0,1536,1024]);
   assert.equal(visualCaption(v,bad),v.steps.join(' / '));
  }
  v.steps.forEach((_,i)=>{
   const [x,y,w,h]=visualFrame(v,i);
   assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=v.width&&y+h<=v.height,v.slug);
  });
 }
});
test('four-panel and three-panel plates keep their story order and full-scene accounts stay whole',()=>{
 const visions=VISUAL_BY_CARD['스가랴:core-prophetic-visions'];
 assert.deepEqual(visions.frames,[[0,0,768,512],[768,0,768,512],[0,512,768,512],[768,512,768,512]]);
 const paul=VISUAL_BY_CARD['사도행전:core-paul-journeys'];
 assert.deepEqual(paul.frames.map(frame=>frame[0]),[0,512,1024]);
 for(const id of ['사무엘하:core-david-covenant','빌립보서:core-timothy-senders']){
  const v=VISUAL_BY_CARD[id];
  v.steps.forEach((_,i)=>assert.deepEqual(visualFrame(v,i),[0,0,1536,1024]));
 }
});
test('captions distinguish imagined scenes, metaphors, names, journeys and letter senders',()=>{
 assert.match(VISUAL_BY_CARD['사도행전:core-paul-journeys'].note,/전체 이동 경로/);
 assert.match(VISUAL_BY_CARD['빌립보서:core-timothy-senders'].note,/공동 집필 여부/);
 assert.match(VISUAL_BY_CARD['히브리서:core-faith-names'].note,/돌은 본문의 사물이 아니며/);
 assert.match(VISUAL_BY_CARD['창세기:1'].note,/이스라엘은 사람 이름, 브니엘은 장소 이름/);
 assert.match(VISUAL_BY_CARD['사무엘하:core-david-covenant'].note,/같은 사건의 병행 기록/);
});
test('readers open on a large first scene with one selected button and readable external captions',()=>{
 for(const v of BIBLE_VISUALS){
  const html=renderBibleVisual(v.cardId);
  assert.equal((html.match(/data-visual-step=/g)||[]).length,v.steps.length+1);
  assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
  assert.match(html,/<title[^>]*>.+<\/title>/);
  assert.match(html,/<desc[^>]*>.+<\/desc>/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/AI 일러스트/);
  assert.match(html,/bv-memory-line/);
  assert.match(html,/그림에서 볼 곳/);
  assert.match(html,/기억할 연결/);
  assert.match(html,/data-visual-direction="-1"[^>]+disabled/);
  assert.ok(html.includes(v.looks[0]));
  assert.ok(html.includes(v.image));
  const cropped=v.frames[0][2]!==v.width;
  assert.equal(html.includes('bv-scene-focused'),cropped);
  if(cropped)assert.ok(html.includes(`viewBox="${v.frames[0].join(' ')}"`));
  assert.match(visualThumbnail(v.cardId),/loading="lazy"/);
  assert.equal(visualThumbnail(v.cardId).includes('data:image'),false);
 }
});
test('scene navigation starts from the overview, stops at either end and never moves a reading card',()=>{
 for(const v of BIBLE_VISUALS){
  const last=v.steps.length-1;
  assert.equal(moveVisualStep(v,-1,1),0);
  assert.equal(moveVisualStep(v,-1,-1),-1);
  assert.equal(moveVisualStep(v,0,-1),0);
  assert.equal(moveVisualStep(v,last,1),last);
  for(let i=0;i<last;i++){
   assert.equal(moveVisualStep(v,i,1),i+1);
   assert.equal(moveVisualStep(v,i+1,-1),i);
  }
  assert.equal(moveVisualStep(v,99,1),0);
  assert.equal(moveVisualStep(v,0,'1'),0);
 }
});
test('browsing artwork never reads or writes learning records and unknown cards have no figure',()=>{
 globalThis.localStorage={getItem:()=>{throw Error('unexpected read');},setItem:()=>{throw Error('unexpected write');}};
 for(const v of BIBLE_VISUALS){renderBibleVisual(v.cardId);visualThumbnail(v.cardId);}
 assert.equal(renderBibleVisual('unrelated-card'),'');
 assert.equal(visualThumbnail('unrelated-card'),'');
});
