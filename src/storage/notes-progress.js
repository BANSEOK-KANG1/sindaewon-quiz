/** 권별 핵심 카드 읽기 기록 — 기기 안(localStorage)에만 저장한다. */
import { stepKey } from "../data/daily-plan.js";
import { getPlanProgress, setPlanStepDone } from "./progress.js";

const KEY = "sindaewon-quiz:notes-progress";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getNotesProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return { read: {}, position: {}, days: [], reviewed: 0, ...(data || {}) };
  } catch {
    return { read: {}, position: {}, days: [], reviewed: 0 };
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 저장 공간이 없으면 기록만 건너뛴다 */
  }
}

function touchDay(data) {
  const t = today();
  if (!data.days.includes(t)) data.days = [...data.days, t].slice(-60);
}

/** 읽던 카드 위치 기억 */
export function setCardPosition(book, index) {
  const data = getNotesProgress();
  data.position[book] = index;
  data.last = book;
  touchDay(data);
  save(data);
}

export function markBookRead(book, read = true) {
  const data = getNotesProgress();
  if (read) {
    const prev = data.read[book];
    data.read[book] = { at: Date.now(), times: (prev?.times || 0) + 1 };
  } else delete data.read[book];
  data.position[book] = 0;
  touchDay(data);
  save(data);
}

export function addReviewed(n = 1) {
  const data = getNotesProgress();
  data.reviewed = (data.reviewed || 0) + n;
  touchDay(data);
  save(data);
}

export function isBookRead(book) {
  return Boolean(getNotesProgress().read[book]);
}

/** 연속으로 카드를 본 날 수 (오늘 또는 어제까지 이어진 경우) */
export function notesStreak() {
  const days = new Set(getNotesProgress().days);
  const d = new Date();
  if (!days.has(today())) d.setDate(d.getDate() - 1);
  let n = 0;
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!days.has(k)) break;
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** 계획의 '핵심 읽기' 단계: 그 날 책을 모두 읽었으면 완료로 표시 (미리 읽은 책도 반영) */
export function syncReadSteps(plan) {
  const { read } = getNotesProgress();
  const { done } = getPlanProgress();
  for (const day of plan) {
    for (const s of day.steps) {
      if (s.kind !== "read") continue;
      const key = stepKey(day.date, s.id);
      const all = s.books.every((b) => read[b]);
      if (all && !done[key]) setPlanStepDone(key, true);
    }
  }
}

/** 읽기 단계에서 아직 안 읽은 첫 책 */
export function firstUnread(books) {
  const { read } = getNotesProgress();
  return books.find((b) => !read[b]) || books[0];
}
