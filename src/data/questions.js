import { getPastedQuestions } from "../storage/pasted-questions.js";

let cache = null;

function mergeWithPasted(base) {
  const pasted = getPastedQuestions();
  if (!pasted.length) return base;
  const seen = new Set(base.map((q) => q.question.replace(/\s+/g, " ").trim()));
  const merged = [...base];
  for (const q of pasted) {
    const key = q.question.replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(q);
  }
  return merged;
}

export async function loadQuestions() {
  if (cache) return cache;
  const res = await fetch("/data/questions.json");
  if (!res.ok) throw new Error("문제 데이터를 불러오지 못했습니다.");
  const data = await res.json();
  cache = mergeWithPasted(data.questions || []);
  return cache;
}

export function clearQuestionsCache() {
  cache = null;
}

export function filterQuestions(
  questions,
  { seminary, subject, search, year, tag, tags, tagsMode = "all" } = {}
) {
  const tagList = tags?.length ? tags : tag ? [tag] : [];
  return questions.filter((q) => {
    if (seminary && q.seminary !== seminary) return false;
    if (subject && q.subject !== subject) return false;
    if (year !== undefined && year !== null && year !== "") {
      const y = Number(year);
      if (q.year !== y) return false;
    }
    if (tagList.length) {
      const qTags = q.tags || [];
      const match =
        tagsMode === "any"
          ? tagList.some((t) => qTags.includes(t))
          : tagList.every((t) => qTags.includes(t));
      if (!match) return false;
    }
    if (search) {
      const s = search.trim().toLowerCase();
      if (
        s &&
        !q.question.toLowerCase().includes(s) &&
        !(q.explanation || "").toLowerCase().includes(s) &&
        !(q.tags || []).some((t) => String(t).toLowerCase().includes(s))
      ) {
        return false;
      }
    }
    return true;
  });
}

/** 토픽별 문항 수·학습 진행률·오답 수 집계 */
export function getTopicStats(questions, { tag, tags, tagsMode = "all", subject, seminary = "chongshin" } = {}, { exposure = {}, wrongIds = new Set() } = {}) {
  const pool = filterQuestions(questions, { seminary, subject, tag, tags, tagsMode });
  const total = pool.length;
  if (!total) return { total: 0, seen: 0, pct: 0, wrong: 0 };

  let seen = 0;
  let wrong = 0;
  for (const q of pool) {
    if (exposure[q.id]) seen += 1;
    if (wrongIds.has(q.id)) wrong += 1;
  }
  return {
    total,
    seen,
    pct: Math.round((seen / total) * 100),
    wrong,
  };
}

export function getYears(questions) {
  const set = new Set();
  for (const q of questions) {
    if (q.year != null && q.year !== "") set.add(q.year);
  }
  return [...set].sort((a, b) => b - a);
}

export function getQuestionById(questions, id) {
  return questions.find((q) => q.id === id);
}

export function countBySeminaryAndSubject(questions) {
  const counts = {};
  for (const q of questions) {
    if (!counts[q.seminary]) counts[q.seminary] = {};
    counts[q.seminary][q.subject] = (counts[q.seminary][q.subject] || 0) + 1;
  }
  return counts;
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
