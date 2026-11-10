import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS } from '../src/data/book-notes/index.js';
import { ALL_READING_CARDS, READING_PATH, readingCards, sessionCards } from '../src/data/commute.js';

test('14 reading topics cover the canonical 66 books exactly once', () => {
  const names = READING_PATH.flatMap(d => d.books);
  assert.equal(READING_PATH.length, 14);
  assert.equal(names.length, 66);
  assert.equal(new Set(names).size, 66);
  assert.deepEqual([...names].sort(), BOOKS.map(b => b.n).sort());
});
test('all reading material has unique identities and nonempty content', () => {
  assert.equal(new Set(ALL_READING_CARDS.map(c => c.id)).size, ALL_READING_CARDS.length);
  for (const book of BOOKS) {
    const cards = readingCards(book);
    for (const card of cards) {
      assert.ok(card.title && card.lead && card.items.length, card.id);
      assert.ok(!JSON.stringify(card).includes('undefined'), card.id);
    }
    // Every existing teaching item survives the reformatting.
    const content = JSON.stringify(cards);
    for (const text of book.k || []) assert.ok(content.includes(text), `${book.n}: ${text}`);
    for (const text of book.p || []) for (const part of text.split(' — ')) assert.ok(content.includes(part), `${book.n}: ${part}`);
  }
});
test('short sessions resume accurately and handle invalid or final positions', () => {
  const book = BOOKS[0]; const cards = readingCards(book);
  for (const minutes of [3,5,10]) assert.equal(sessionCards(book.n,2,minutes).length,minutes);
  assert.equal(sessionCards(book.n,cards.length-1,10).length,1);
  assert.equal(sessionCards(book.n,-2,3)[0].index,0);
  assert.equal(sessionCards(book.n,9999,3)[0].index,0);
  assert.equal(sessionCards(book.n,NaN,123).length,3);
  assert.deepEqual(sessionCards('없는 책',0,3),[]);
});
test('opening a card does not mark it read; reading and bookmarking are independent', async () => {
  const map = new Map([['sindaewon-quiz:notes-progress','legacy-notes'], ['sindaewon-quiz:progress','legacy-quiz']]);
  globalThis.localStorage = {getItem:k=>map.get(k)??null, setItem:(k,v)=>map.set(k,v)};
  const s = await import('../src/storage/commute.js?test=normal');
  const book = BOOKS[0]; const cards = readingCards(book);
  s.rememberPosition(book.n,2);
  assert.equal(s.getReading().positions[book.n],2);
  assert.equal(s.getReading().read.length,0);
  s.toggleSaved(cards[2].id);
  assert.equal(s.getReading().read.length,0);
  s.finishReadingCard(cards[2],cards.length);
  s.finishReadingCard(cards[2],cards.length);
  assert.deepEqual(s.getReading().read,[cards[2].id]);
  assert.equal(s.getReading().positions[book.n],3);
  s.toggleSaved(cards[2].id);
  assert.deepEqual(s.getReading().saved,[]);
  assert.equal(s.getReading().read.length,1);
  s.finishReadingCard(cards.at(-1),cards.length);
  assert.equal(s.getReading().positions[book.n],0);
  assert.equal(map.get('sindaewon-quiz:notes-progress'),'legacy-notes');
  assert.equal(map.get('sindaewon-quiz:progress'),'legacy-quiz');
});
test('damaged or unavailable storage leaves the reader usable', async () => {
  let raw = '{invalid';
  globalThis.localStorage = {getItem:()=>raw,setItem:()=>{throw new Error('storage denied');}};
  const s = await import('../src/storage/commute.js?test=failed');
  assert.deepEqual(s.getReading().read,[]);
  raw=JSON.stringify({positions:{창세기:-3},read:{bad:true},saved:[null,7,'창세기:0','창세기:0'],minutes:0});
  assert.deepEqual(s.getReading().positions,{});
  assert.equal(s.getReading().minutes,3);
  assert.deepEqual(s.getReading().saved,['창세기:0']);
  s.readingPreference('large',true);
  assert.equal(s.readingSaveFailed(),true);
  assert.equal(s.getReading().large,true);
  s.rememberPosition('창세기',3);
  assert.equal(s.getReading().positions.창세기,3);
});
