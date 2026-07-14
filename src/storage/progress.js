const PREFIX = "sindaewon-quiz:";

const KEYS = {
  wrongNotes: `${PREFIX}wrong-notes`,
  bookmarks: `${PREFIX}bookmarks`,
  quizSession: `${PREFIX}quiz-session`,
  collection: `${PREFIX}collection-checklist`,
  exposure: `${PREFIX}exposure`,
  studyStats: `${PREFIX}study-stats`,
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

export function addWrongNote(entry) {
  const list = getWrongNotes();
  const existing = list.findIndex((e) => e.questionId === entry.questionId);
  const item = { ...entry, updatedAt: Date.now() };
  if (existing >= 0) list[existing] = item;
  else list.unshift(item);
  write(KEYS.wrongNotes, list.slice(0, 500));
}

export function removeWrongNote(questionId) {
  write(
    KEYS.wrongNotes,
    getWrongNotes().filter((e) => e.questionId !== questionId)
  );
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

export function recordStudySession({ answered, correct, bestCombo }) {
  const stats = getStudyStats();
  const day = todayKey();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  if (stats.lastStudyDay === day) {
    // keep streak
  } else if (stats.lastStudyDay === yesterday) {
    stats.streak = (stats.streak || 0) + 1;
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDay = day;
  stats.totalAnswered = (stats.totalAnswered || 0) + answered;
  stats.totalCorrect = (stats.totalCorrect || 0) + correct;
  stats.bestCombo = Math.max(stats.bestCombo || 0, bestCombo || 0);
  if (!stats.daily) stats.daily = {};
  const d = stats.daily[day] || { answered: 0, correct: 0 };
  d.answered += answered;
  d.correct += correct;
  stats.daily[day] = d;
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
