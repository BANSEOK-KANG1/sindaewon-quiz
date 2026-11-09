/**
 * 전체 진도 모델 — 시험 준비 전체를 100%로 보고, 항목별로 얼마나 했는지 계산한다.
 * 항목 비중은 예상 소요 시간(분)이다. 사용자가 무엇을 할지 고르고, 화면은 남은 양과 페이스만 보여 준다.
 */
import { BOOKS, bookCards, bookMinutes } from "./book-notes/index.js";
import { TOPICS } from "./book-notes/topics.js";
import { GRAMMAR, TIPS } from "./english-notes.js";
import { INTERVIEW } from "./interview-cards.js";
import WORDS from "./vocab-300-words.json";
import { getExposureCounts, getQuestionStats, getWrongNotes, getTodayProgress } from "../storage/progress.js";
import { daysBetween, toDateKey } from "./daily-plan.js";
import { getNotesProgress } from "../storage/notes-progress.js";
import { getVocabState, getDeck } from "../storage/vocab-cards.js";

export const PACE_START = "2026-11-09";
export const PACE_END = "2026-11-27"; // 시험 전날까지 100%
export const EXAM_DATE = "2026-11-28";
export const OLD_TARGET = 700; // 옛 기출(00–14)은 가중치 높은 순으로 700문항이면 100%

const enc = encodeURIComponent;
const quizHref = (tags, subject, count = 20, extra = "") =>
  `#/quiz?auto=1&mode=study&unseen=1&seminary=chongshin&subject=${enc(subject)}&tags=${enc(tags)}&count=${count}${extra}`;

function attemptedSet() {
  const stats = getQuestionStats();
  const exposure = getExposureCounts();
  return (id) => Boolean(stats[id]?.attempts || exposure[id]);
}

function questionTrack(questions, { id, label, group, filter, perQ, href, note, cap }) {
  const tried = attemptedSet();
  let pool = questions.filter(filter);
  if (cap) {
    pool = [...pool].sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));
  }
  const total = cap ? Math.min(cap, pool.length) : pool.length;
  const done = Math.min(total, pool.filter((q) => tried(q.id)).length);
  return { id, label, group, unit: "문항", done, total, minutes: total * perQ, doneMinutes: done * perQ, href, note };
}

const has = (q, t) => (q.tags || []).includes(t);
const cs = (q) => q.seminary === "chongshin";

/** 항목별 진도 목록 */
export function buildTracks(questions) {
  const notes = getNotesProgress();
  const vocab = getVocabState().words;

  // 성경 66권 카드: 다 읽은 권 + 읽는 중인 권의 카드 위치
  let bookDoneMin = 0;
  let booksRead = 0;
  let bookTotalMin = 0;
  for (const b of BOOKS) {
    const m = bookMinutes(b);
    bookTotalMin += m;
    if (notes.read[b.n]) {
      bookDoneMin += m;
      booksRead += 1;
    } else if (notes.position[b.n]) {
      bookDoneMin += (m * notes.position[b.n]) / (bookCards(b).length - 1);
    }
  }

  const deckTrack = (id, label, group, items, perCard, href) => {
    const d = getDeck(id);
    const done = d.done ? items.length : Math.max(0, Math.min(items.length, d.max + 1));
    return { id, label, group, unit: "장", done, total: items.length, minutes: items.length * perCard, doneMinutes: done * perCard, href };
  };

  // 영어 단어: 한 번 본 단어 절반, 두 번 연속 안 단어(상자 2 이상) 나머지 절반
  const wordSeen = WORDS.filter((w) => vocab[w.no]).length;
  const wordKnown = WORDS.filter((w) => vocab[w.no]?.box >= 2).length;
  const wordUnits = (wordSeen + wordKnown) / 2;

  return [
    {
      id: "books", label: "성경 66권 핵심 카드", group: "성경", unit: "권",
      done: booksRead, total: BOOKS.length, minutes: bookTotalMin, doneMinutes: bookDoneMin,
      href: "#/notes", note: "읽던 권은 카드 위치만큼 반영",
    },
    deckTrack("topics", "주제별 핵심", "성경", TOPICS, 3, "#/topics"),
    questionTrack(questions, {
      id: "past-bible", label: "원문기출 성경 (2020–22)", group: "성경", perQ: 1.1,
      filter: (q) => cs(q) && q.subject === "성경" && has(q, "원문기출"),
      href: quizHref("원문기출", "성경", 25), note: "실제 시험 · 가장 중요",
    }),
    questionTrack(questions, {
      id: "bank", label: "2026 문제은행", group: "성경", perQ: 1.1,
      filter: (q) => cs(q) && q.subject === "성경" && has(q, "2026문제은행"),
      href: quizHref("2026문제은행", "성경", 30),
    }),
    questionTrack(questions, {
      id: "old", label: "옛 기출 (가중치 높은 순)", group: "성경", perQ: 1.0, cap: OLD_TARGET,
      filter: (q) => cs(q) && q.subject === "성경" && has(q, "00-14"),
      href: quizHref("기출,00-14", "성경", 30), note: `${OLD_TARGET}문항이면 100%`,
    }),
    {
      id: "words", label: "영어 단어 300", group: "영어", unit: "단어",
      done: Math.round(wordUnits), total: WORDS.length, minutes: WORDS.length * 0.6, doneMinutes: wordUnits * 0.6,
      href: "#/english/words", note: `본 단어 ${wordSeen} · 두 번 이상 안 단어 ${wordKnown}`,
    },
    questionTrack(questions, {
      id: "past-eng", label: "원문기출 영어 (2020–22)", group: "영어", perQ: 1.2,
      filter: (q) => cs(q) && q.subject === "영어" && has(q, "원문기출"),
      href: quizHref("원문기출", "영어", 15),
    }),
    deckTrack("grammar", "문법 포인트 카드", "영어", GRAMMAR, 1.5, "#/english/grammar"),
    questionTrack(questions, {
      id: "grammar-q", label: "문법 문제", group: "영어", perQ: 1.0,
      filter: (q) => cs(q) && q.subject === "영어" && has(q, "문법") && q.source === "grammar",
      href: quizHref("문법,신대원영어", "영어", 10),
    }),
    deckTrack("tips", "영어 유형별 요령", "영어", TIPS, 2, "#/english/tips"),
    deckTrack("interview", "면접 질문 카드", "면접", INTERVIEW, 3, "#/interview?start=1"),
  ];
}

/** 전체 % (소요 시간 가중) */
export function overall(tracks) {
  const total = tracks.reduce((n, t) => n + t.minutes, 0);
  const done = tracks.reduce((n, t) => n + Math.min(t.doneMinutes, t.minutes), 0);
  return { pct: total ? (done / total) * 100 : 0, totalMinutes: total, doneMinutes: done, leftMinutes: total - done };
}

export function wrongCount() {
  return getWrongNotes().length;
}

/* ───────── 페이스: 오늘 몇 % 하면 되는지 ───────── */

const PACE_KEY = "sindaewon-quiz:pace";

function readPace() {
  try {
    return { days: {}, last: null, ...JSON.parse(localStorage.getItem(PACE_KEY) || "{}") };
  } catch {
    return { days: {}, last: null };
  }
}

/**
 * 오늘 시작 시점 진도를 기억해 두고 (전날 마지막 기록 기준),
 * 남은 % ÷ 남은 날 = 오늘 목표를 낸다.
 */
export function pace(tracks) {
  const all = overall(tracks);
  const today = toDateKey();
  const totalDays = daysBetween(PACE_START, PACE_END) + 1;
  const dayIdx = Math.max(0, Math.min(totalDays - 1, daysBetween(PACE_START, today)));
  const daysLeft = Math.max(1, daysBetween(today < PACE_START ? PACE_START : today, PACE_END) + 1);

  const data = readPace();
  if (data.days[today] === undefined) {
    if (data.last && data.last.date < today) data.days[today] = Math.min(data.last.pct, all.pct);
    else {
      // 처음 여는 날: 오늘 푼 문항만큼 빼서 시작점을 어림한다
      const answered = getTodayProgress().answered || 0;
      data.days[today] = Math.max(0, all.pct - ((answered * 1.1) / all.totalMinutes) * 100);
    }
  }
  data.last = { date: today, pct: all.pct };
  try {
    localStorage.setItem(PACE_KEY, JSON.stringify(data));
  } catch {
    /* 무시 */
  }

  const startPct = data.days[today];
  const target = Math.max(0, (100 - startPct) / daysLeft);
  const doneToday = Math.max(0, all.pct - startPct);
  const idealEnd = Math.min(100, ((dayIdx + 1) / totalDays) * 100);
  return {
    ...all,
    today,
    totalDays,
    dayNo: dayIdx + 1,
    daysLeft,
    startPct,
    target,
    doneToday,
    remainingToday: Math.max(0, target - doneToday),
    todayRatio: target ? Math.min(100, (doneToday / target) * 100) : 100,
    idealEnd,
    ahead: all.pct - idealEnd,
    minutesPerDay: all.leftMinutes / daysLeft,
    targetMinutes: (target / 100) * all.totalMinutes,
  };
}

/** 그룹별로 가장 덜 한 항목을 추천 */
export function recommended(tracks) {
  const pick = new Set();
  for (const g of ["성경", "영어", "면접"]) {
    const list = tracks.filter((t) => t.group === g && t.done < t.total);
    if (!list.length) continue;
    list.sort((a, b) => a.done / a.total - b.done / b.total);
    pick.add(list[0].id);
  }
  return pick;
}
