import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BOOKS } from '../src/data/book-notes/index.js';
import { ALL_READING_CARDS, CARD_BY_ID } from '../src/data/commute.js';
import { BIBLEPROJECT_POSTERS, POSTER_BY_BOOK } from '../src/data/book-visuals.js';
import { BIBLE_SCENES, SCENE_BY_ID, scenesForCard } from '../src/data/bible-scenes.js';
import { renderBookPoster, renderReadingPoster, bindBookPosters, atlasUrl } from '../src/lib/book-visual.js';
import { renderSceneFigure } from '../src/lib/bible-scene.js';
import { bookFactRows } from '../src/views/book-visuals.js';

test('all 39 OT and 27 NT books have one correct official visual, including combined books',()=>{
 assert.equal(BOOKS.filter(b=>b.testament==='구약').length,39);
 assert.equal(BOOKS.filter(b=>b.testament==='신약').length,27);
 assert.equal(Object.keys(POSTER_BY_BOOK).length,66);
 assert.equal(BIBLEPROJECT_POSTERS.length,62);
 for(const book of BOOKS){
  assert.ok(POSTER_BY_BOOK[book.n]?.books.includes(book.n),book.n);
  assert.equal(decodeURIComponent(atlasUrl(book.n).split('/').at(-1)),book.n);
  for(const key of ['o','p','k','v']) assert.equal(bookFactRows(book,key).length,book[key].length);
 }
 for(const names of [['사무엘상','사무엘하'],['열왕기상','열왕기하'],['역대상','역대하'],['에스라','느헤미야'],['요한일서','요한이서','요한삼서']]){
  assert.ok(names.every(n=>POSTER_BY_BOOK[n]===POSTER_BY_BOOK[names[0]]));
 }
 assert.notEqual(POSTER_BY_BOOK['요한복음'],POSTER_BY_BOOK['요한일서']);
});

test('every borrowed asset exists locally, matches its downloaded hash and keeps the unmodified original',()=>{
 for(const item of [...BIBLEPROJECT_POSTERS,...BIBLE_SCENES]){
  assert.ok(item.image.startsWith('visuals/'));
  const bytes=readFileSync(new URL('../public/'+item.image,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.id);
  assert.ok(bytes.length>50000,item.id);
  assert.ok(item.width>=700&&item.height>=700,item.id);
  assert.equal(new URL(item.source).protocol,'https:');
 }
});

test('all 607 cards can open their book poster with visible owner attribution and no false fact-level claim',()=>{
 assert.equal(ALL_READING_CARDS.length,607);
 for(const card of ALL_READING_CARDS){
  const html=renderReadingPoster(card);
  assert.match(html,/책 전체의 그림 개요/);
  assert.match(html,/포스터 제작·저작권:/);
  assert.match(html,/https:\/\/www.bibleproject.com\//);
  assert.match(html,/공식 원본/);
  assert.ok(html.includes(POSTER_BY_BOOK[card.book].image));
  assert.match(renderReadingPoster(card,true),/^<details/);
 }
 assert.equal(renderBookPoster('missing'), '');
});

test('scene association is constrained to the correct book and specific lesson content',()=>{
 for(const card of ALL_READING_CARDS) for(const scene of scenesForCard(card)) assert.ok(scene.books.includes(card.book));
 assert.equal(scenesForCard({book:'히브리서',title:'모세와 놋뱀',items:[]}).length,0);
 assert.equal(scenesForCard({book:'마태복음',title:'변화산',items:['산 위의 예수']} ).length,0);
 assert.equal(scenesForCard({book:'사도행전',title:'바울의 첫 여행',items:['안디옥에서 출발']} ).length,0);
 assert.equal(scenesForCard({book:'민수기',title:'놋뱀',items:[]})[0].id,'dore-bronze-serpent');
 assert.ok(scenesForCard(CARD_BY_ID['사도행전:core-paul-journeys']).every(s=>s.id!=='dore-paul-crowd'));
 assert.equal(SCENE_BY_ID['dore-healing-many'].reference,'마태복음 4:23');
});

test('24 scene guides keep observation, fact, Bible reference and image source distinct',()=>{
 assert.equal(BIBLE_SCENES.length,24);
 for(const scene of BIBLE_SCENES){
  const html=renderSceneFigure(scene);
  assert.match(html,/그림에서 볼 곳/);assert.match(html,/기억할 사실/);
  assert.ok(html.includes(scene.reference));assert.ok(html.includes(scene.source));
  assert.match(html,/퍼블릭 도메인/);assert.match(html,/작가의 해석/);
 }
 assert.match(SCENE_BY_ID['dore-esther-king'].note,/실신을 기록하지/);
});

test('zoom shows the entire original at a larger size, resets scroll and leaves arrow scrolling inside image',()=>{
 const makeButton=width=>({dataset:{posterSize:String(width)},attributes:{},addEventListener(_,fn){this.click=fn;},setAttribute(k,v){this.attributes[k]=v;}});
 const buttons=[0,1800,3000].map(makeButton);
 const img={style:{}};const surface={scrollLeft:100,scrollTop:60,querySelector(){return img;},addEventListener(_,fn){this.keydown=fn;}};
 const hint={textContent:''};
 const figure={querySelector(selector){return selector==='.atlas-viewport'?surface:hint;},querySelectorAll(){return buttons;}};
 bindBookPosters({querySelectorAll(){return [figure];}});
 buttons[2].click();assert.equal(img.style.width,'3000px');assert.equal(surface.scrollLeft,0);assert.equal(surface.scrollTop,0);
 assert.deepEqual(buttons.map(b=>b.attributes['aria-pressed']),['false','false','true']);
 buttons[0].click();assert.equal(img.style.width,'100%');
 let stopped=false;surface.keydown({key:'ArrowRight',stopPropagation(){stopped=true;}});assert.ok(stopped);
});

test('art browsing does not modify reading progress or use cropped posters',()=>{
 for(const file of ['lib/book-visual.js','lib/bible-scene.js','views/book-visuals.js','views/bible-visuals.js']){
  const source=readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(source,/finishReadingCard|finishSession|localStorage|storage\/commute/);
 }
 for(const p of BIBLEPROJECT_POSTERS){
  const html=renderBookPoster(p.id);
  assert.match(html,/data-poster-size="3000"/);
  assert.doesNotMatch(html,/<canvas|<svg|clip-path/);
 }
});

test('a reading card can browse all related scenes without leaving the card or wrapping at either end', async()=>{
 const {renderSceneSequence,bindSceneSequences}=await import('../src/lib/bible-scene.js');
 const scenes=scenesForCard(CARD_BY_ID['출애굽기:0']);
 assert.equal(scenes.length,2);
 assert.equal(renderSceneSequence([]),'');
 assert.doesNotMatch(renderSceneSequence(scenes.slice(0,1)),/data-scene-direction/);
 const markup=renderSceneSequence(scenes);
 assert.equal((markup.match(/data-scene-choice=/g)||[]).length,2);
 assert.ok(markup.includes(scenes[0].source));
 const button=dataset=>({dataset,attributes:{},disabled:false,addEventListener(_,fn){this.click=fn;},setAttribute(k,v){this.attributes[k]=v;},focus(){this.focused=true;}});
 const choices=scenes.map((_,i)=>button({sceneChoice:String(i)}));
 const previous=button({sceneDirection:'-1'}), next=button({sceneDirection:'1'});
 const stage={innerHTML:''},position={textContent:''};
 const elements={'[data-scene-stage]':stage,'[data-scene-position]':position,'[data-scene-direction="-1"]':previous,'[data-scene-direction="1"]':next};
 const sequence={dataset:{sceneSequence:scenes.map(s=>s.id).join(',')},querySelector:s=>elements[s],querySelectorAll:s=>s==='[data-scene-choice]'?choices:[previous,next],addEventListener(_,fn){this.keydown=fn;}};
 bindSceneSequences({querySelectorAll:()=>[sequence]});
 next.click();assert.ok(stage.innerHTML.includes(scenes[1].source));assert.ok(next.disabled);assert.equal(previous.disabled,false);assert.equal(position.textContent,'2 / 2');
 next.click();assert.equal(position.textContent,'2 / 2');
 let stopped=false,prevented=false;
 sequence.keydown({key:'ArrowLeft',target:{closest:()=>choices[1]},stopPropagation(){stopped=true;},preventDefault(){prevented=true;}});
 assert.ok(stopped&&prevented);assert.ok(choices[0].focused);assert.ok(previous.disabled);assert.equal(position.textContent,'1 / 2');
 previous.click();assert.equal(position.textContent,'1 / 2');
 choices[1].click();assert.equal(choices[1].attributes['aria-pressed'],'true');assert.equal(choices[0].attributes['aria-pressed'],'false');
});

test('gallery searches round-trip through book and scene links, while external return targets are ignored',async()=>{
 const {readLibraryState,libraryUrl,libraryReturnUrl,withLibraryReturn}=await import('../src/lib/visual-navigation.js');
 const state={filter:'신약',term:'바울 & 동역자',page:2};
 const url=libraryUrl(state);
 assert.deepEqual(readLibraryState(new URLSearchParams(url.split('?')[1])),state);
 const book=withLibraryReturn('#/visuals/로마서?scene=example',url);
 const query=new URLSearchParams(book.split('?')[1]);
 assert.equal(query.get('scene'),'example');assert.equal(libraryReturnUrl(query.get('from')),url);
 for(const bad of ['https://example.com','javascript:alert(1)','#/quiz',null]) assert.equal(libraryReturnUrl(bad),'#/visuals');
 assert.deepEqual(readLibraryState(new URLSearchParams('filter=unknown&page=-3')),{filter:'전체',term:'',page:0});
 assert.equal(readLibraryState(new URLSearchParams('page=999999')).page,99);
 assert.equal(libraryReturnUrl('#/visuals?q=%22%3Cscript%3E'), '#/visuals?q=%22%3Cscript%3E');
});
