import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIBLE_VISUALS, VISUAL_BY_CARD, visualStep, visualCaption } from '../src/data/bible-visuals.js';
import { CORE_CARDS } from '../src/data/commute.js';
import { renderBibleVisual, visualThumbnail } from '../src/lib/bible-visual.js';

test('each of the twelve existing core cards has one original illustration and its own references',()=>{
 assert.equal(BIBLE_VISUALS.length,12);
 assert.deepEqual(BIBLE_VISUALS.map(v=>v.cardId),CORE_CARDS.map(c=>c.id));
 assert.equal(new Set(BIBLE_VISUALS.map(v=>v.slug)).size,12);
 for(const visual of BIBLE_VISUALS){
  assert.ok(visual.title&&visual.note&&visual.reference&&visual.sources.length);
  assert.ok(visual.svg.includes('<title')&&visual.svg.includes('<desc'));
  assert.equal(visual.svg.includes('undefined'),false);
  assert.equal(/<script|<foreignObject|<image|onload=/i.test(visual.svg),false);
  for(const source of visual.sources) assert.equal(new URL(source.url).protocol,'https:');
 }
});
test('every selectable scene has a matching SVG group, including multi-scene lessons',()=>{
 for(const visual of BIBLE_VISUALS){
  const parts=[...visual.svg.matchAll(/data-visual-part="(\d+)"/g)].map(match=>Number(match[1]));
  assert.deepEqual(parts,visual.steps.map((_,i)=>i),visual.slug);
  visual.steps.forEach((caption,i)=>{
   assert.equal(visualStep(visual,i),i);
   assert.equal(visualCaption(visual,i),caption);
  });
  for(const invalid of [-1,NaN,99,'0',1.5]){
   assert.equal(visualStep(visual,invalid),-1);
   assert.equal(visualCaption(visual,invalid),visual.steps.join(' / '));
  }
 }
});
test('exports match live SVG sources so the Obsidian copies can use the same artwork',()=>{
 for(const visual of BIBLE_VISUALS){
  assert.equal(readFileSync(new URL(`../public/visuals/${visual.slug}.svg`,import.meta.url),'utf8').trim(),visual.svg);
 }
});
test('diagrams retain distinctions that would otherwise imply a false route or authorship',()=>{
 assert.match(VISUAL_BY_CARD['사도행전:core-paul-journeys'].note,/전체 이동 경로/);
 assert.match(VISUAL_BY_CARD['빌립보서:core-timothy-senders'].note,/공동 집필 여부/);
 assert.match(VISUAL_BY_CARD['히브리서:core-faith-names'].note,/연대순은 아닙니다/);
 const jacob=VISUAL_BY_CARD['창세기:1'];
 assert.match(jacob.svg,/이스라엘 = 사람 이름/);
 assert.match(jacob.svg,/브니엘 = 장소 이름/);
});
test('viewing and highlighting diagrams expose no learning-record writes',()=>{
 globalThis.localStorage={getItem:()=>{throw Error('unexpected read');},setItem:()=>{throw Error('unexpected write');}};
 for(const visual of BIBLE_VISUALS){
  const html=renderBibleVisual(visual.cardId);
  assert.equal((html.match(/data-visual-step=/g)||[]).length,visual.steps.length+1);
  assert.match(html,/data-visual-zoom/);
  assert.match(html,/aria-live="polite"/);
  assert.match(visualThumbnail(visual.cardId),/data:image\/svg\+xml/);
 }
 assert.equal(renderBibleVisual('unrelated-card'),'');
 assert.equal(visualThumbnail('unrelated-card'),'');
});
