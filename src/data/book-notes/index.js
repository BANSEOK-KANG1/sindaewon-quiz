/**
 * 성경 66권 핵심 카드 — 짬짬이 읽는 1분 카드로 나눈다.
 * 한 권 = 한눈에 · 구조 · 인물 · 시험 포인트 · 구절(가리고 맞히기) · 셀프체크(뒤집기) · 완료
 */
import { OT_HISTORY } from "./ot-history.js";
import { OT_POETRY_PROPHETS } from "./ot-poetry-prophets.js";
import { NT_GOSPELS_ACTS } from "./nt-gospels-acts.js";
import { NT_LETTERS } from "./nt-letters.js";

export const BOOKS = [...OT_HISTORY, ...OT_POETRY_PROPHETS, ...NT_GOSPELS_ACTS, ...NT_LETTERS].map((b, i) => ({
  ...b,
  order: i,
  testament: i < 39 ? "구약" : "신약",
}));

export const BOOK_BY_NAME = Object.fromEntries(BOOKS.map((b) => [b.n, b]));

/** 묶음 순서 (목록 화면용) */
export const GROUPS = [...new Set(BOOKS.map((b) => `${b.testament}|${b.g}`))].map((key) => {
  const [testament, g] = key.split("|");
  return { key, testament, label: g, books: BOOKS.filter((b) => b.testament === testament && b.g === g) };
});

const split = (s) => {
  const i = s.indexOf("|");
  return [s.slice(0, i), s.slice(i + 1)];
};

/** 한 권을 카드 배열로 */
export function bookCards(book) {
  const cards = [{ type: "intro", title: "한눈에" }];
  if (book.o?.length) cards.push({ type: "list", title: "구조", items: book.o });
  if (book.p?.length) cards.push({ type: "people", title: "인물", items: book.p });
  if (book.k?.length) cards.push({ type: "list", title: "시험 포인트", items: book.k, accent: true });
  if (book.v?.length) cards.push({ type: "verses", title: "구절 · 어디일까?", items: book.v.map(split) });
  if (book.q?.length) cards.push({ type: "check", title: "셀프체크", items: book.q.map(split) });
  cards.push({ type: "done", title: "완료" });
  return cards;
}

/** 읽기 예상 시간 (분) — 항목 수 기준 */
export function bookMinutes(book) {
  const n = (book.o?.length || 0) + (book.p?.length || 0) + (book.k?.length || 0) + (book.v?.length || 0) + (book.q?.length || 0);
  return Math.max(2, Math.round(n * 0.35));
}

/** 짬짬이 복습용 카드 — 셀프체크 질문과 '이 구절은 어디?' 문제를 섞는다 */
export function reviewItems(books = BOOKS) {
  const items = [];
  for (const b of books) {
    for (const q of b.q || []) {
      const [question, answer] = split(q);
      items.push({ book: b.n, kind: "q", question, answer });
    }
    for (const v of b.v || []) {
      const [ref, text] = split(v);
      items.push({ book: b.n, kind: "v", question: `“${text}”`, answer: `${b.n} ${ref}` });
    }
  }
  return items;
}
