import { BOOKS, BOOK_BY_NAME } from './book-notes/index.js';
import { CORE_READING_CARDS, CORE_READING_IDS } from './core-reading.js';

// Short reading cards retain the existing notes' wording and verse references.
const chunks = (items = [], size = 3) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
export function splitLabel(text, separator = ' — ') {
  const at = text.indexOf(separator);
  return at < 0 ? [text, ''] : [text.slice(0, at), text.slice(at + separator.length)];
}
const SPECIAL = {
  창세기: [
    { kind: 'journey', title: '아브라함의 네 장면', lead: '부르심에서 시작된 약속을 네 장으로 연결해 보세요.', items: [
      ['12장', '부르심', '고향을 떠나라는 부르심과 복의 약속'],
      ['15장', '횃불 언약', '아브람의 믿음을 의로 여기심'],
      ['17장', '이름과 할례', '아브람 → 아브라함, 언약의 표징인 할례'],
      ['22장', '여호와 이레', '이삭 대신 준비된 숫양'],
    ], takeaway: '12 부르심 → 15 횃불 → 17 할례 → 22 이삭', reference: '창세기 12:1–4 · 15:6, 17–18 · 17:5, 10–11 · 22:13–14' },
    { kind: 'compare', title: '야곱의 두 장소', lead: '꿈을 꾼 곳과 씨름한 곳을 나란히 기억하세요.', items: [
      ['28장', '벧엘', '사닥다리 꿈을 꾸고 그곳을 벧엘이라 부름'],
      ['32장', '브니엘', '얍복 나루를 건넌 뒤 씨름. 야곱은 이스라엘이라는 이름을 받고 그곳을 브니엘이라 부름'],
    ], takeaway: '이스라엘은 사람 이름 · 브니엘은 장소 이름', reference: '창세기 28:12, 19 · 32:22–30' },
  ],
};

export function readingCards(book) {
  const cards = [...(SPECIAL[book.n] || []), { kind: 'overview', title: `${book.n}, 한눈에`, lead: book.s, items: (book.o || []).map((t) => {
    const m = t.match(/^([\d–~\-·,\s]+장)\s*(.*)$/);
    return m ? [m[1], m[2]] : ['', t];
  }), reference: `${book.n} 전체 흐름` }];
  chunks(book.o).forEach((items, i) => cards.push({ kind: 'timeline', title: `이야기의 흐름 ${i + 1}`, lead: '어떤 일이 먼저 일어났는지 순서로 읽어 보세요.', items: items.map(t => {
    const m = t.match(/^([\d–~\-·,\s]+장)\s*(.*)$/);
    return m ? [m[1], m[2]] : ['', t];
  }) }));
  chunks(book.p).forEach((items, i) => cards.push({ kind: 'people', title: `인물과 역할 ${i + 1}`, lead: '이름 옆에 한 가지 역할을 붙여 기억하세요.', items: items.map(t => splitLabel(t)) }));
  chunks(book.k, 2).forEach((items, i) => cards.push({ kind: 'focus', title: `꼭 연결할 내용 ${i + 1}`, lead: '인물·사건·장소를 함께 읽으면 연결이 보입니다.', items }));
  chunks(book.v, 2).forEach((items, i) => cards.push({ kind: 'verses', title: `구절과 출처 ${i + 1}`, lead: '익숙한 구절이 어느 책, 어느 장에 있는지 함께 보세요.', items: items.map(t => splitLabel(t, '|')) }));
  // Append new material so existing numeric IDs, bookmarks and reading positions retain their meaning.
  cards.push(...CORE_READING_CARDS.filter(card => card.book === book.n));
  return cards.map((c, i) => ({ ...c, id: c.id || `${book.n}:${i}`, book: book.n, index: i }));
}

export const ALL_READING_CARDS = BOOKS.flatMap(readingCards);
export const CARD_BY_ID = Object.fromEntries(ALL_READING_CARDS.map(c => [c.id, c]));
export const CORE_CARDS = CORE_READING_IDS.map(id => CARD_BY_ID[id]);
export function nextCoreCard(read = [], afterId = null) {
  const seen = new Set(read);
  const offset = Math.max(0, CORE_CARDS.findIndex(card => card.id === afterId) + 1);
  return [...CORE_CARDS.slice(offset), ...CORE_CARDS.slice(0, offset)].find(card => !seen.has(card.id)) || null;
}
export const READING_PATH = [
  ['시작과 약속', ['창세기']],
  ['구원과 거룩', ['출애굽기', '레위기']],
  ['광야에서 약속의 땅으로', ['민수기', '신명기']],
  ['정착과 사사 시대', ['여호수아', '사사기', '룻기']],
  ['왕국의 시작과 분열', ['사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하']],
  ['포로에서 돌아오다', ['에스라', '느헤미야', '에스더']],
  ['기도와 지혜', ['욥기', '시편', '잠언', '전도서', '아가']],
  ['심판 속의 회복 약속', ['이사야', '예레미야', '예레미야애가', '에스겔', '다니엘']],
  ['열두 선지자의 목소리', ['호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔', '하박국', '스바냐', '학개', '스가랴', '말라기']],
  ['예수님의 삶과 말씀', ['마태복음', '마가복음', '누가복음', '요한복음']],
  ['복음이 퍼져 가는 길', ['사도행전']],
  ['교회에 보낸 편지', ['로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서']],
  ['믿음으로 살아가기', ['디모데전서', '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서', '베드로전서', '베드로후서']],
  ['사랑과 마지막 소망', ['요한일서', '요한이서', '요한삼서', '유다서', '요한계시록']],
].map(([title, books], i) => ({ day: i + 1, title, books }));

export function sessionCards(bookName, start, minutes) {
  const book = BOOK_BY_NAME[bookName];
  if (!book) return [];
  const cards = readingCards(book);
  const offset = Number.isInteger(start) && start >= 0 && start < cards.length ? start : 0;
  const length = [3, 5, 10].includes(minutes) ? minutes : 3;
  return cards.slice(offset, offset + length);
}
