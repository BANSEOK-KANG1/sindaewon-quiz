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
  { seminary, subject, search, year, tag } = {}
) {
  return questions.filter((q) => {
    if (seminary && q.seminary !== seminary) return false;
    if (subject && q.subject !== subject) return false;
    if (year !== undefined && year !== null && year !== "") {
      const y = Number(year);
      if (q.year !== y) return false;
    }
    if (tag) {
      const tags = q.tags || [];
      if (!tags.includes(tag)) return false;
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
