/**
 * 영어 단어 카드 기록 — 간단한 상자(라이트너) 방식.
 * 알았어요: 상자 +1 → 1·2·4·7일 뒤 다시 / 헷갈려요: 상자 0, 오늘 다시.
 * 기기 안(localStorage)에만 저장한다.
 */
const KEY = "sindaewon-quiz:vocab-cards";
const GAPS = [0, 1, 2, 4, 7];
export const MASTERED_BOX = 3;

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getVocabState() {
  try {
    const raw = localStorage.getItem(KEY);
    return { words: {}, days: [], ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { words: {}, days: [] };
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 저장 실패는 무시 */
  }
}

export function gradeWord(no, knew) {
  const data = getVocabState();
  const cur = data.words[no] || { box: 0, seen: 0, miss: 0 };
  const box = knew ? Math.min(cur.box + 1, GAPS.length - 1) : 0;
  data.words[no] = {
    box,
    seen: cur.seen + 1,
    miss: cur.miss + (knew ? 0 : 1),
    due: todayKey(knew ? GAPS[box] : 0),
  };
  const t = todayKey();
  if (!data.days.includes(t)) data.days = [...data.days, t].slice(-60);
  save(data);
}

/** 오늘 다시 볼 단어 번호 (기한이 지난 것, 헷갈린 것 우선) */
export function dueWords() {
  const { words } = getVocabState();
  const t = todayKey();
  return Object.entries(words)
    .filter(([, w]) => w.due <= t)
    .sort((a, b) => a[1].box - b[1].box || b[1].miss - a[1].miss)
    .map(([no]) => Number(no));
}

export function vocabSummary(total = 300) {
  const { words } = getVocabState();
  const list = Object.values(words);
  return {
    seen: list.length,
    mastered: list.filter((w) => w.box >= MASTERED_BOX).length,
    due: dueWords().length,
    total,
  };
}

/** 문법·요령 카드 읽은 위치 */
const DECK_KEY = "sindaewon-quiz:english-decks";
export function getDeck(name) {
  try {
    const all = JSON.parse(localStorage.getItem(DECK_KEY) || "{}");
    return { pos: 0, max: -1, done: 0, ...(all[name] || {}) };
  } catch {
    return { pos: 0, max: -1, done: 0 };
  }
}
export function setDeck(name, pos, total) {
  try {
    const all = JSON.parse(localStorage.getItem(DECK_KEY) || "{}");
    const cur = { pos: 0, max: -1, done: 0, ...(all[name] || {}) };
    cur.pos = pos;
    cur.max = Math.max(cur.max, pos);
    if (pos >= total) {
      cur.done += 1;
      cur.pos = 0;
    }
    all[name] = cur;
    localStorage.setItem(DECK_KEY, JSON.stringify(all));
  } catch {
    /* 무시 */
  }
}
