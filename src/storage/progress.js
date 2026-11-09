const PREFIX = "sindaewon-quiz:";

const KEYS = {
  wrongNotes: `${PREFIX}wrong-notes`,
  wrongGraduated: `${PREFIX}wrong-graduated`,
  bookmarks: `${PREFIX}bookmarks`,
  quizSession: `${PREFIX}quiz-session`,
  collection: `${PREFIX}collection-checklist`,
  exposure: `${PREFIX}exposure`,
  studyStats: `${PREFIX}study-stats`,
  questionStats: `${PREFIX}question-stats`,
  planProgress: `${PREFIX}plan-progress`,
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getWrongNotes() {
  return read(KEYS.wrongNotes, []);
}

/**
 * 오답 간격 복습: 틀리면 오늘 바로 다시 → 맞히면 1일 뒤 → 3일 뒤 → 한 번 더 맞히면 졸업.
 * 하루에 한 번만 단계가 오른다(같은 날 연달아 맞혀도 '아는 것'으로 치지 않음).
 */
export const WRONG_STAGES = 3;
const WRONG_GAPS = [0, 1, 3];

function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function addWrongNote(entry) {
  const list = getWrongNotes();
  const existing = list.findIndex((e) => e.questionId === entry.questionId);
  const missCount = (existing >= 0 ? list[existing].missCount || 1 : 0) + 1;
  const item = { ...entry, missCount, stage: 0, due: todayKey(), lastCorrect: null, updatedAt: Date.now() };
  if (existing >= 0) list.splice(existing, 1);
  list.unshift(item);
  write(KEYS.wrongNotes, list.slice(0, 800));
}

/** 오답노트 문항을 맞혔을 때. 반환: null(오답 아님) | {stage, due, graduated, same} */
export function markWrongCorrect(questionId) {
  const list = getWrongNotes();
  const i = list.findIndex((e) => e.questionId === questionId);
  if (i < 0) return null;
  const n = list[i];
  const today = todayKey();
  if (n.lastCorrect === today) return { stage: n.stage || 0, due: n.due, graduated: false, same: true };
  const stage = (n.stage || 0) + 1;
  if (stage >= WRONG_STAGES) {
    list.splice(i, 1);
    write(KEYS.wrongNotes, list);
    write(KEYS.wrongGraduated, (read(KEYS.wrongGraduated, 0) || 0) + 1);
    return { stage, due: null, graduated: true, same: false };
  }
  list[i] = { ...n, stage, due: addDays(today, WRONG_GAPS[stage]), lastCorrect: today, updatedAt: Date.now() };
  write(KEYS.wrongNotes, list);
  return { stage, due: list[i].due, graduated: false, same: false };
}

/** 오늘 복습할 오답 (due가 오늘 이전). 옛 기록은 due가 없으므로 바로 복습 대상. */
export function isWrongDue(n, today = todayKey()) {
  return !n.due || n.due <= today;
}

export function dueWrongNotes() {
  const today = todayKey();
  return getWrongNotes().filter((n) => isWrongDue(n, today));
}

/** 복습 우선순위: 오늘 차례 → 많이 틀린 것 → 오래된 것 */
export function wrongPriority(list = getWrongNotes()) {
  const today = todayKey();
  return [...list].sort(
    (a, b) =>
      Number(isWrongDue(b, today)) - Number(isWrongDue(a, today)) ||
      (b.missCount || 1) - (a.missCount || 1) ||
      (a.updatedAt || 0) - (b.updatedAt || 0)
  );
}

export function wrongGraduatedCount() {
  return read(KEYS.wrongGraduated, 0) || 0;
}

export function removeWrongNote(questionId) {
  write(
    KEYS.wrongNotes,
    getWrongNotes().filter((e) => e.questionId !== questionId)
  );
}

/** 날짜별 학습 계획 — 시작일과 완료한 단계("YYYY-MM-DD:stepId") */
export function getPlanProgress() {
  const data = read(KEYS.planProgress, null);
  if (data?.startDate) return { done: {}, ...data };
  const fresh = { startDate: todayKey(), done: {} };
  write(KEYS.planProgress, fresh);
  return fresh;
}

export function setPlanStepDone(key, done = true, result = null) {
  const data = getPlanProgress();
  if (done) data.done[key] = { at: Date.now(), ...(result || {}) };
  else delete data.done[key];
  write(KEYS.planProgress, data);
}

export function resetPlanStart(dateKey) {
  write(KEYS.planProgress, { startDate: dateKey, done: getPlanProgress().done });
}

export function getBookmarks() {
  return read(KEYS.bookmarks, []);
}

export function toggleBookmark(questionId) {
  const set = new Set(getBookmarks());
  if (set.has(questionId)) set.delete(questionId);
  else set.add(questionId);
  write(KEYS.bookmarks, [...set]);
  return set.has(questionId);
}

export function isBookmarked(questionId) {
  return getBookmarks().includes(questionId);
}

export function getQuizSession() {
  return read(KEYS.quizSession, null);
}

export function saveQuizSession(session) {
  write(KEYS.quizSession, session);
}

export function clearQuizSession() {
  localStorage.removeItem(KEYS.quizSession);
}

export function getCollectionChecklist() {
  return read(KEYS.collection, {});
}

export function toggleCollectionItem(id) {
  const map = getCollectionChecklist();
  map[id] = !map[id];
  write(KEYS.collection, map);
  return map[id];
}

export function getExposureCounts() {
  return read(KEYS.exposure, {});
}

export function recordExposure(questionId) {
  const map = getExposureCounts();
  map[questionId] = (map[questionId] || 0) + 1;
  write(KEYS.exposure, map);
}

export function recordExposures(ids) {
  const map = getExposureCounts();
  for (const id of ids) {
    map[id] = (map[id] || 0) + 1;
  }
  write(KEYS.exposure, map);
}

function normalizeQuestionStat() {
  return {
    attempts: 0,
    correct: 0,
    wrong: 0,
    unanswered: 0,
    lastSeenAt: 0,
    lastWrongAt: 0,
    lastCorrectAt: 0,
  };
}

export function getQuestionStats() {
  return read(KEYS.questionStats, {});
}

export function recordQuestionAttempt(questionId, { correct, unanswered } = {}) {
  const map = getQuestionStats();
  const stat = { ...normalizeQuestionStat(), ...(map[questionId] || {}) };
  const now = Date.now();

  stat.attempts += 1;
  stat.lastSeenAt = now;

  if (unanswered) {
    stat.unanswered = (stat.unanswered || 0) + 1;
  } else if (correct) {
    stat.correct = (stat.correct || 0) + 1;
    stat.lastCorrectAt = now;
  } else {
    stat.wrong = (stat.wrong || 0) + 1;
    stat.lastWrongAt = now;
  }

  map[questionId] = stat;
  write(KEYS.questionStats, map);
  return stat;
}

export function getStudyStats() {
  return read(KEYS.studyStats, {
    streak: 0,
    lastStudyDay: null,
    bestCombo: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    daily: {},
  });
}

export function recordStudySession({ answered, correct, bestCombo, countForToday = true }) {
  const stats = getStudyStats();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  if (countForToday) {
    const day = todayKey();
    if (stats.lastStudyDay === day) {
      // keep streak
    } else if (stats.lastStudyDay === yesterday) {
      stats.streak = (stats.streak || 0) + 1;
    } else {
      stats.streak = 1;
    }
    stats.lastStudyDay = day;
  }

  stats.totalAnswered = (stats.totalAnswered || 0) + answered;
  stats.totalCorrect = (stats.totalCorrect || 0) + correct;
  stats.bestCombo = Math.max(stats.bestCombo || 0, bestCombo || 0);

  if (countForToday) {
    const day = todayKey();
    if (!stats.daily) stats.daily = {};
    const d = stats.daily[day] || { answered: 0, correct: 0 };
    d.answered += answered;
    d.correct += correct;
    stats.daily[day] = d;
  }

  write(KEYS.studyStats, stats);
  return stats;
}

export function getTodayProgress(goal = 20) {
  const stats = getStudyStats();
  const day = todayKey();
  const answered = stats.daily?.[day]?.answered || 0;
  return {
    answered,
    goal,
    pct: Math.min(100, Math.round((answered / goal) * 100)),
    streak: stats.streak || 0,
  };
}
